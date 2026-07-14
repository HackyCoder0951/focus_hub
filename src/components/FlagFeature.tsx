import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Inappropriate content",
  "Misinformation",
  "Other",
] as const;

interface FlagFeatureProps {
  postId: string;
  postOwnerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Report-a-post dialog. Writes to `content_flags` and notifies moderators. */
const FlagFeature = ({ postId, postOwnerId, open, onOpenChange }: FlagFeatureProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>("");

  const flagMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to report posts.");

      // Prevent duplicate flags from the same user.
      const existing = await unwrap(
        supabase
          .from("content_flags")
          .select("id")
          .eq("post_id", postId)
          .eq("flagged_by_user_id", user.id)
          .limit(1)
      );
      if (existing && existing.length > 0) return { duplicate: true };

      await unwrap(
        supabase.from("content_flags").insert({
          post_id: postId,
          flagged_by_user_id: user.id,
          reason,
        })
      );

      // Notify all admins and the post owner (except the reporter).
      const admins = await unwrap(
        supabase.from("user_roles").select("user_id").eq("role", "admin")
      );
      const recipients = [
        ...(admins?.map((row) => row.user_id) ?? []),
        postOwnerId,
      ].filter((uid): uid is string => Boolean(uid) && uid !== user.id);

      if (recipients.length > 0) {
        await unwrap(
          supabase.from("notifications").insert(
            recipients.map((uid) => ({
              user_id: uid,
              type: "flagged_post",
              data: {
                post_id: postId,
                flagged_by: user.id,
                reason,
                text: "A post you own or moderate was flagged by a user.",
              },
              is_read: false,
            }))
          )
        );
      }
      return { duplicate: false };
    },
    onSuccess: (result) => {
      if (result.duplicate) {
        toast.info("Already reported", {
          description: "You have already reported this post.",
        });
      } else {
        toast.success("Post reported", {
          description: "Thank you for reporting. Our team will review this post.",
        });
      }
      setReason("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this post</DialogTitle>
          <DialogDescription>
            Tell us why you are reporting this post. Reports are reviewed by
            moderators.
          </DialogDescription>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger aria-label="Report reason">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={flagMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => flagMutation.mutate()}
            disabled={!reason || flagMutation.isPending}
          >
            {flagMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagFeature;

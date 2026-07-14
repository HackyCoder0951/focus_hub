import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flag, Link as LinkIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ConfirmDialog";
import FlagFeature from "@/components/FlagFeature";
import { useAuth } from "@/contexts/AuthContext";
import { useDeletePost } from "../hooks/usePosts";
import { copyPostLink } from "./PostActions";
import type { FeedPost } from "../api/posts";

interface PostHeaderProps {
  post: FeedPost;
  onEdit: () => void;
  onPostUpdated?: () => void;
}

const PostHeader = ({ post, onEdit, onPostUpdated }: PostHeaderProps) => {
  const { user } = useAuth();
  const confirm = useConfirm();
  const deletePost = useDeletePost();
  const [reportOpen, setReportOpen] = useState(false);

  const isOwner = Boolean(user && user.id === post.user_id);
  const authorName = post.profiles?.full_name || "Unknown User";

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete post?",
      description: "This will remove the post from the feed for everyone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (confirmed) {
      deletePost.mutate(post.id, { onSuccess: onPostUpdated });
    }
  };

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url ?? undefined} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold leading-tight">
            <a
              href={`/app/profile?user_id=${post.user_id}`}
              className="text-primary hover:underline"
            >
              {authorName}
            </a>
          </h4>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Post options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => copyPostLink(post.id)}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          {!isOwner && (
            <DropdownMenuItem
              className="text-warning focus:text-warning"
              onClick={() => setReportOpen(true)}
            >
              <Flag className="mr-2 h-4 w-4" />
              Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FlagFeature
        postId={post.id}
        postOwnerId={post.user_id}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  );
};

export default PostHeader;

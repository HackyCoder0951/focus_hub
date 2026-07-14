import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import type { ChatWithDetails, ProfileOption } from "../types";
import { fetchProfileOptions } from "../api";
import { getInitials } from "../lib";
import { useChatAdmin } from "../hooks/useChatAdmin";

interface AddMemberDialogProps {
  chat: ChatWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ chat, open, onOpenChange }: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ProfileOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { addMember } = useChatAdmin(chat.id);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingUsers(true);
    fetchProfileOptions()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((error: Error) => {
        toast({
          title: "Error loading users",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const candidates = useMemo(() => {
    const memberIds = new Set(chat.chat_members.map((m) => m.user_id));
    const query = searchQuery.trim().toLowerCase();
    return users.filter(
      (u) =>
        !memberIds.has(u.id) &&
        (!query ||
          (u.full_name ?? "").toLowerCase().includes(query) ||
          (u.email ?? "").toLowerCase().includes(query))
    );
  }, [users, chat.chat_members, searchQuery]);

  const handleAdd = (userId: string) => {
    addMember.mutate(userId, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-60">
          <div className="space-y-1 pr-2">
            {loadingUsers ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Loading users...
              </p>
            ) : candidates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No users to add.
              </p>
            ) : (
              candidates.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{profile.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(profile.id)}
                    disabled={addMember.isPending}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

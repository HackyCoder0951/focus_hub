import { useState } from "react";
import { Check, Pencil, ShieldCheck, ShieldOff, UserMinus, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatWithDetails } from "../types";
import { getInitials } from "../lib";
import { useChatAdmin } from "../hooks/useChatAdmin";
import { AddMemberDialog } from "./AddMemberDialog";

interface GroupInfoDialogProps {
  chat: ChatWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onlineUserIds: Set<string>;
}

export function GroupInfoDialog({
  chat,
  open,
  onOpenChange,
  onlineUserIds,
}: GroupInfoDialogProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(chat.name ?? "");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const { renameGroup, removeMember, toggleAdmin } = useChatAdmin(chat.id);

  const isCurrentUserAdmin = chat.chat_members.some(
    (m) => m.user_id === user?.id && m.is_admin
  );

  const startEditing = () => {
    setNameInput(chat.name ?? "");
    setEditingName(true);
  };

  const handleNameSave = () => {
    if (!nameInput.trim()) return;
    renameGroup.mutate(nameInput.trim(), {
      onSuccess: () => setEditingName(false),
    });
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    const ok = await confirm({
      title: "Remove member?",
      description: `${name} will be removed from the group.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) removeMember.mutate(userId);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Group Info</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {editingName ? (
                <>
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    onClick={handleNameSave}
                    disabled={renameGroup.isPending || !nameInput.trim()}
                    aria-label="Save group name"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingName(false)}
                    aria-label="Cancel rename"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="flex-1 truncate text-lg font-semibold">{chat.name}</h2>
                  {isCurrentUserAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={startEditing}
                      aria-label="Rename group"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Members ({chat.chat_members.length})
              </h3>
              <ScrollArea className="max-h-64">
                <ul className="space-y-1 pr-2">
                  {chat.chat_members.map((member) => {
                    const isOnline =
                      !!member.user_id && onlineUserIds.has(member.user_id);
                    const isSelf = member.user_id === user?.id;
                    const name = member.profiles?.full_name ?? "Unknown";
                    return (
                      <li
                        key={member.id}
                        className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent/50"
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background",
                              isOnline ? "bg-success" : "bg-muted-foreground/40"
                            )}
                          />
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {name}
                          {isSelf && (
                            <span className="text-muted-foreground"> (you)</span>
                          )}
                        </span>
                        {member.is_admin && <Badge variant="secondary">Admin</Badge>}
                        {isCurrentUserAdmin && !isSelf && member.user_id && (
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground"
                              title={member.is_admin ? "Remove admin" : "Make admin"}
                              aria-label={member.is_admin ? "Remove admin" : "Make admin"}
                              disabled={toggleAdmin.isPending}
                              onClick={() =>
                                toggleAdmin.mutate({
                                  userId: member.user_id!,
                                  isAdmin: !member.is_admin,
                                })
                              }
                            >
                              {member.is_admin ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              title="Remove member"
                              aria-label="Remove member"
                              disabled={removeMember.isPending}
                              onClick={() => handleRemoveMember(member.user_id!, name)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </div>

            {isCurrentUserAdmin && (
              <Button size="sm" variant="outline" onClick={() => setAddMemberOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddMemberDialog chat={chat} open={addMemberOpen} onOpenChange={setAddMemberOpen} />
    </>
  );
}

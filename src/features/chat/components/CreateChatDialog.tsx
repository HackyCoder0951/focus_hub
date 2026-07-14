import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Search, User, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { createChat, fetchProfileOptions } from "../api";
import type { ProfileOption } from "../types";
import { getInitials } from "../lib";

interface CreateChatDialogProps {
  onChatCreated: (chatId: string) => void;
}

export function CreateChatDialog({ onChatCreated }: CreateChatDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<ProfileOption[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoadingUsers(true);
    fetchProfileOptions(user.id)
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
  }, [open, user]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        (u.full_name ?? "").toLowerCase().includes(query) ||
        (u.email ?? "").toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const toggleUser = (userId: string) => {
    if (isGroup) {
      setSelectedUserIds((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedUserIds((prev) => (prev.includes(userId) ? [] : [userId]));
    }
  };

  const resetForm = () => {
    setSelectedUserIds([]);
    setSearchQuery("");
    setGroupName("");
    setIsGroup(false);
  };

  const canCreate =
    selectedUserIds.length > 0 && (!isGroup || groupName.trim().length > 0);

  const handleCreate = async () => {
    if (!user || !canCreate) return;
    setCreating(true);
    try {
      const chat = await createChat({
        creatorId: user.id,
        memberIds: selectedUserIds,
        isGroup,
        name: groupName.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: qk.chat.list });
      resetForm();
      setOpen(false);
      onChatCreated(chat.id);
    } catch (error) {
      toast({
        title: "Error creating chat",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="New conversation">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={!isGroup ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsGroup(false);
                setSelectedUserIds((prev) => prev.slice(0, 1));
              }}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              Direct Message
            </Button>
            <Button
              variant={isGroup ? "default" : "outline"}
              size="sm"
              onClick={() => setIsGroup(true)}
              className="flex-1"
            >
              <Users className="mr-2 h-4 w-4" />
              Group Chat
            </Button>
          </div>

          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{isGroup ? "Select Members" : "Select User"}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-60 rounded-lg border">
            <div className="space-y-1 p-2">
              {loadingUsers ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Loading users...
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {searchQuery ? "No users found." : "No users available."}
                </p>
              ) : (
                filteredUsers.map((profile) => {
                  const isSelected = selectedUserIds.includes(profile.id);
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => toggleUser(profile.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                        isSelected ? "bg-accent" : "hover:bg-accent/50"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {profile.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {selectedUserIds.length > 0 && (
            <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
              {selectedUserIds.map((userId) => {
                const profile = users.find((u) => u.id === userId);
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted py-1 pl-1 pr-2 text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-28 truncate">{profile?.full_name}</span>
                    <button
                      type="button"
                      onClick={() => toggleUser(userId)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${profile?.full_name ?? "user"}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <Button onClick={handleCreate} disabled={!canCreate || creating} className="w-full">
            {creating ? "Creating..." : `Create ${isGroup ? "Group" : "Chat"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateChatDialog;

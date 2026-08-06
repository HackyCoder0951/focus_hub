import { useState } from "react";
import { Ban, CircleCheck, CircleMinus, MoreHorizontal, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAdminUsers, useRemoveUser, useUserStatusMutation } from "../hooks/useAdminUsers";
import type { AdminUser, UserStatus } from "../api/users";

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge variant="outline" className="bg-success/15 text-success border-success/30">
        active
      </Badge>
    );
  }
  if (status === "banned") {
    return <Badge variant="destructive">banned</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function MemberTypeBadge({ memberType }: { memberType: string | null }) {
  if (memberType === "alumni") return <Badge variant="secondary">Alumni</Badge>;
  if (memberType === "student") return <Badge variant="outline">Student</Badge>;
  return <span className="text-xs text-muted-foreground">—</span>;
}

interface StatusChange {
  status: UserStatus;
  title: string;
  description: (name: string) => string;
  confirmLabel: string;
  destructive: boolean;
}

const STATUS_CHANGES: Record<UserStatus, StatusChange> = {
  banned: {
    status: "banned",
    title: "Ban user",
    description: (name) => `${name} will be marked as banned on the platform.`,
    confirmLabel: "Ban user",
    destructive: true,
  },
  inactive: {
    status: "inactive",
    title: "Deactivate user",
    description: (name) => `${name}'s account will be marked as inactive.`,
    confirmLabel: "Deactivate",
    destructive: false,
  },
  active: {
    status: "active",
    title: "Activate user",
    description: (name) => `${name}'s account will be marked as active again.`,
    confirmLabel: "Activate",
    destructive: false,
  },
};

export function UserManagement() {
  const [memberType, setMemberType] = useState("all");
  const { data: users, isPending, isError } = useAdminUsers(memberType);
  const statusMutation = useUserStatusMutation();
  const removeUser = useRemoveUser();
  const confirm = useConfirm();

  const displayName = (user: AdminUser) => user.full_name || user.email;

  const handleStatusChange = async (user: AdminUser, status: UserStatus) => {
    const change = STATUS_CHANGES[status];
    const ok = await confirm({
      title: change.title,
      description: change.description(displayName(user)),
      confirmLabel: change.confirmLabel,
      destructive: change.destructive,
    });
    if (!ok) return;
    statusMutation.mutate({ id: user.id, status });
  };

  const handleRemove = async (user: AdminUser) => {
    const ok = await confirm({
      title: "Remove profile",
      description:
        `This permanently deletes ${displayName(user)}'s profile data from the platform. ` +
        "Note: the authentication account is not deleted, so the user may still be able to " +
        "sign in. Full account deletion requires a server-side admin endpoint.",
      confirmLabel: "Remove profile",
      destructive: true,
    });
    if (!ok) return;
    removeUser.mutate(user.id);
  };

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users and their status</CardDescription>
        </div>
        <Select value={memberType} onValueChange={setMemberType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Member type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="alumni">Alumni</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load users.</p>
        ) : !users || users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Registered users will appear here."
          />
        ) : (
          <div className="max-h-[540px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Member Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {displayName(user).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{displayName(user)}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <MemberTypeBadge memberType={user.member_type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open user actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status !== "banned" && (
                            <DropdownMenuItem onSelect={() => handleStatusChange(user, "banned")}>
                              <Ban className="mr-2 h-4 w-4" />
                              Ban
                            </DropdownMenuItem>
                          )}
                          {user.status !== "inactive" && (
                            <DropdownMenuItem
                              onSelect={() => handleStatusChange(user, "inactive")}
                            >
                              <CircleMinus className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          {user.status !== "active" && (
                            <DropdownMenuItem onSelect={() => handleStatusChange(user, "active")}>
                              <CircleCheck className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => handleRemove(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

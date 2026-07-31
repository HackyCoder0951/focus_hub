import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserListItem as UserListItemModel } from "../api/profile";

interface UserListItemProps {
  user: UserListItemModel;
  /** Optional trailing action (e.g. follow button). */
  action?: React.ReactNode;
}

/** Row for followers/following lists: avatar, name link, bio, optional action. */
export function UserListItem({ user, action }: UserListItemProps) {
  return (
    <li data-cy="user-list-item" className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-accent/40 animate-fade-in">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback>{user.full_name?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <Link
            to={`/app/profile?user_id=${user.id}`}
            className="block truncate font-semibold text-primary hover:underline"
          >
            {user.full_name || user.id}
          </Link>
          <div className="max-w-xs truncate text-xs text-muted-foreground">{user.bio || ""}</div>
        </div>
      </div>
      {action}
    </li>
  );
}

export default UserListItem;

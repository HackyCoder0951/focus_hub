import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowToggle } from "@/features/profile/hooks/useFollow";

const ProfileFollowButton = ({ profileUserId }: { profileUserId: string }) => {
  const { user } = useAuth();
  const { isFollowing, isPending, toggle } = useFollowToggle(profileUserId);

  if (!user || user.id === profileUserId) return null; // Don't show for self

  return (
    <Button onClick={toggle} disabled={isPending} variant={isFollowing ? "outline" : "default"}>
      {isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default ProfileFollowButton;

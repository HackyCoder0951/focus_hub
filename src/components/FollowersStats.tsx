import { useNavigate } from "react-router-dom";
import { useFollowStats } from "@/features/profile/hooks/useFollow";

/**
 * Clickable Followers / Following stat pills.
 * Navigates to the /app/followers and /app/following list pages.
 */
const FollowersStats = ({ profileUserId }: { profileUserId: string }) => {
  const navigate = useNavigate();
  const { data } = useFollowStats(profileUserId);

  return (
    <>
      <button
        type="button"
        className="rounded-lg px-4 py-2 text-center transition-colors hover:bg-accent"
        onClick={() => navigate(`/app/followers?user_id=${profileUserId}`)}
      >
        <div className="font-semibold">{data?.followers ?? 0}</div>
        <div className="text-xs text-muted-foreground">Followers</div>
      </button>
      <button
        type="button"
        className="rounded-lg px-4 py-2 text-center transition-colors hover:bg-accent"
        onClick={() => navigate(`/app/following?user_id=${profileUserId}`)}
      >
        <div className="font-semibold">{data?.following ?? 0}</div>
        <div className="text-xs text-muted-foreground">Following</div>
      </button>
    </>
  );
};

export default FollowersStats;

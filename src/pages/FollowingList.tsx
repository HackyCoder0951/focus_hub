import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/EmptyState";
import {
  useFollowingList,
  useMyFollowingIds,
  useToggleFollowUser,
} from "@/features/profile/hooks/useFollow";
import { UserListItem } from "@/features/profile/components/UserListItem";

const FollowingList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryUserId = new URLSearchParams(location.search).get("user_id");
  const userId = queryUserId || user?.id;

  const { data: following, isLoading } = useFollowingList(userId);
  const { data: myFollowingIds } = useMyFollowingIds();
  const toggleFollow = useToggleFollowUser();

  const isFollowing = (targetId: string) => (myFollowingIds ?? []).includes(targetId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 animate-fade-in">
      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Following</CardTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : !following || following.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Not following anyone yet"
              description="Users this person follows will show up here."
            />
          ) : (
            <ul className="space-y-1">
              {following.map((item) => (
                <UserListItem
                  key={item.id}
                  user={item}
                  action={
                    user && user.id !== item.id ? (
                      <Button
                        variant={isFollowing(item.id) ? "outline" : "default"}
                        size="sm"
                        disabled={
                          toggleFollow.isPending && toggleFollow.variables?.targetId === item.id
                        }
                        onClick={() =>
                          toggleFollow.mutate({ targetId: item.id, follow: !isFollowing(item.id) })
                        }
                      >
                        {toggleFollow.isPending && toggleFollow.variables?.targetId === item.id
                          ? "..."
                          : isFollowing(item.id)
                            ? "Following"
                            : "Follow"}
                      </Button>
                    ) : undefined
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowingList;

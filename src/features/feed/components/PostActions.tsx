import { Heart, MessageCircle, Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePostLiked, useToggleLike } from "../hooks/useLikes";
import type { FeedPost } from "../api/posts";

/** Copies the canonical post URL and toasts. Shared with PostHeader. */
export async function copyPostLink(postId: string) {
  await navigator.clipboard.writeText(`${window.location.origin}/app/post/${postId}`);
  toast.success("Link copied!", { description: "Post link copied to clipboard." });
}

interface PostActionsProps {
  post: FeedPost;
  commentsCount: number;
  onToggleComments: () => void;
}

const PostActions = ({ post, commentsCount, onToggleComments }: PostActionsProps) => {
  const { user } = useAuth();
  const { data: isLiked = false } = usePostLiked(post.id);
  const toggleLike = useToggleLike(post.id);

  const handleLike = () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to like posts.",
      });
      return;
    }
    toggleLike.mutate({ liked: isLiked });
  };

  return (
    <div className="mt-4 flex items-center justify-between border-t pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        aria-pressed={isLiked}
        className={cn(
          "flex items-center gap-2 transition-transform active:scale-90",
          isLiked && "text-destructive hover:text-destructive"
        )}
      >
        <Heart
          className={cn("h-4 w-4", isLiked && "animate-scale-in fill-current text-destructive")}
        />
        {post.likes_count ?? 0}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={onToggleComments}
      >
        <MessageCircle className="h-4 w-4" />
        {commentsCount}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => copyPostLink(post.id)}
      >
        <Share className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

export default PostActions;

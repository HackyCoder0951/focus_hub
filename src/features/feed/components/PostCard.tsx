import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";
import PostActions from "./PostActions";
import PostComments from "./PostComments";
import { useUpdatePost } from "../hooks/usePosts";
import { usePostComments } from "../hooks/useComments";
import type { FeedPost } from "../api/posts";

interface PostCardProps {
  post: FeedPost;
  onPostUpdated?: () => void;
}

const PostCard = ({ post, onPostUpdated }: PostCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(true);

  const updatePost = useUpdatePost();
  const { data: comments = [] } = usePostComments(post.id);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePost.mutate(
      { id: post.id, content: editContent },
      {
        onSuccess: () => {
          setEditing(false);
          onPostUpdated?.();
        },
      }
    );
  };

  return (
    <Card
      data-cy="post-card"
      className="animate-fade-in rounded-xl border bg-card shadow-elevation-sm transition-shadow hover:shadow-elevation-md"
    >
      <CardContent className="space-y-3 p-6">
        <PostHeader
          post={post}
          onEdit={() => {
            setEditContent(post.content);
            setEditing(true);
          }}
          onPostUpdated={onPostUpdated}
        />

        {editing ? (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              maxLength={1000}
              className="resize-none"
              disabled={updatePost.isPending}
              placeholder="What do you want to talk about?"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {editContent.length}/1000
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="submit"
                  disabled={updatePost.isPending || !editContent.trim()}
                >
                  {updatePost.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={updatePost.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            <PostMedia imageUrl={post.image_url} fileUrl={post.file_url} />
          </>
        )}

        <PostActions
          post={post}
          commentsCount={comments.length}
          onToggleComments={() => setShowComments((v) => !v)}
        />
        {showComments && <PostComments postId={post.id} />}
      </CardContent>
    </Card>
  );
};

export default PostCard;

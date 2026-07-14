import { useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAddComment,
  useDeleteComment,
  useMyLikedCommentIds,
  usePostComments,
  useToggleCommentLike,
  useUpdateComment,
} from "../hooks/useComments";
import type { CommentWithAuthor } from "../api/comments";

interface CommentItemProps {
  postId: string;
  comment: CommentWithAuthor;
  comments: CommentWithAuthor[];
  likedIds: string[];
  user: User | null;
  depth: number;
}

const CommentItem = ({ postId, comment, comments, likedIds, user, depth }: CommentItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const toggleLike = useToggleCommentLike(postId);
  const addReply = useAddComment(postId);

  const liked = likedIds.includes(comment.id);
  const likeCount = comment.comment_likes?.[0]?.count ?? 0;
  const isOwner = Boolean(user && user.id === comment.user_id);
  const busy =
    updateComment.isPending || deleteComment.isPending || addReply.isPending;

  const replies = comments.filter((c) => c.parent_id === comment.id);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    addReply.mutate(
      { content: replyContent.trim(), parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplying(false);
        },
      }
    );
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateComment.mutate(
      { id: comment.id, content: editContent },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <div className="mt-2 flex items-start gap-2 animate-fade-in">
      <Avatar className="h-7 w-7">
        <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
        <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 rounded-lg bg-muted px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">
            {comment.profiles?.full_name || "Unknown User"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        {editing ? (
          <form onSubmit={handleEdit} className="mt-1 flex flex-col gap-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={busy}
              className="w-full text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" type="submit" disabled={busy || !editContent.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-1 text-sm">{comment.content}</div>
        )}
        <div className="mt-1 flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => user && toggleLike.mutate({ commentId: comment.id, liked })}
            disabled={!user}
            className={cn(
              "transition-transform active:scale-90",
              liked && "text-destructive hover:text-destructive"
            )}
          >
            <span className="flex items-center gap-1">
              <Heart
                className={cn("h-3 w-3", liked && "animate-scale-in fill-current")}
              />
              <span>{likeCount}</span>
            </span>
          </Button>
          {user && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplying((v) => !v)}
              disabled={busy}
            >
              Reply
            </Button>
          )}
          {isOwner && !editing && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={busy}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteComment.mutate(comment.id)}
                disabled={busy}
              >
                Delete
              </Button>
            </>
          )}
        </div>
        {replying && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={busy}
              placeholder="Write a reply..."
              className="w-full text-sm"
            />
            <div className="flex flex-col gap-2">
              <Button size="sm" type="submit" disabled={busy || !replyContent.trim()}>
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setReplying(false)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        {replies.length > 0 && (
          <div className="pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                postId={postId}
                comment={reply}
                comments={comments}
                likedIds={likedIds}
                user={user}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface PostCommentsProps {
  postId: string;
}

/** Threaded comment list plus the "Add a comment..." composer. */
const PostComments = ({ postId }: PostCommentsProps) => {
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  const { data: comments = [] } = usePostComments(postId);
  const { data: likedIds = [] } = useMyLikedCommentIds(
    postId,
    comments.map((c) => c.id)
  );
  const addComment = useAddComment(postId);

  const topLevel = comments.filter((c) => !c.parent_id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentInput.trim()) return;
    addComment.mutate(
      { content: commentInput.trim() },
      {
        onSuccess: () => {
          setCommentInput("");
          commentInputRef.current?.focus();
        },
      }
    );
  };

  return (
    <div className="mt-3">
      {topLevel.length > 0 && (
        <div className="space-y-3">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              comments={comments}
              likedIds={likedIds}
              user={user}
              depth={0}
            />
          ))}
        </div>
      )}
      {user && (
        <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.user_metadata?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <input
            ref={commentInputRef}
            type="text"
            className="flex-1 rounded-full border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            disabled={addComment.isPending}
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            disabled={addComment.isPending || !commentInput.trim()}
          >
            Post
          </Button>
        </form>
      )}
    </div>
  );
};

export default PostComments;

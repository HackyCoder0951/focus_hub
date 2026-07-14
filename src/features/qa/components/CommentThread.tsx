import { useState, type FormEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { buildCommentTree, type CommentNode } from "../api/comments";
import { useAddComment, useAnswerComments, useDeleteComment } from "../hooks/useComments";

interface CommentThreadProps {
  answerId: number;
}

/** Comments for one answer: nested replies, add/reply/delete. */
export function CommentThread({ answerId }: CommentThreadProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useAnswerComments(answerId);
  const addComment = useAddComment(answerId);
  const [commentDraft, setCommentDraft] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }
    addComment.mutate(
      { body: commentDraft },
      { onSuccess: () => setCommentDraft("") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tree = buildCommentTree(comments ?? []);

  return (
    <div className="space-y-3">
      {tree.length > 0 && (
        <div className="space-y-2">
          {tree.map((node) => (
            <CommentItem key={node.id} node={node} answerId={answerId} />
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          className="h-8 rounded-full text-sm"
          disabled={addComment.isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={addComment.isPending || !commentDraft.trim()}
        >
          Post
        </Button>
      </form>
    </div>
  );
}

function CommentItem({ node, answerId }: { node: CommentNode; answerId: number }) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const addComment = useAddComment(answerId);
  const deleteComment = useDeleteComment(answerId);

  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const handleReply = (e: FormEvent) => {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    addComment.mutate(
      { body: replyDraft, parentCommentId: node.id },
      {
        onSuccess: () => {
          setReplyDraft("");
          setReplying(false);
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this comment?",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteComment.mutate(node.id);
  };

  return (
    <div className="flex items-start gap-2">
      <Avatar className="mt-0.5 h-6 w-6">
        <AvatarImage src={node.profiles?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {node.profiles?.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-muted px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-2 text-xs">
            <span className="font-medium">{node.profiles?.full_name || "Unknown User"}</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(node.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-sm">{node.body}</p>
        </div>

        <div className="mt-1 flex items-center gap-1">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setReplying((v) => !v)}
            >
              Reply
            </Button>
          )}
          {user?.id === node.user_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleteComment.isPending}
            >
              Delete
            </Button>
          )}
        </div>

        {replying && (
          <form onSubmit={handleReply} className="mt-1 flex items-center gap-2">
            <Input
              autoFocus
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="Write a reply..."
              maxLength={500}
              className="h-8 rounded-full text-sm"
              disabled={addComment.isPending}
            />
            <Button type="submit" size="sm" disabled={addComment.isPending || !replyDraft.trim()}>
              Post
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </form>
        )}

        {node.replies.length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-border pl-4">
            {node.replies.map((reply) => (
              <CommentItem key={reply.id} node={reply} answerId={answerId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

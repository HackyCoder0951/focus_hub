import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, MessageCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { AnswerWithAuthor } from "@/shared/types/db";
import type { VoteValue } from "../api/votes";
import { useAcceptAnswer, useDeleteAnswer, useUpdateAnswer } from "../hooks/useAnswers";
import { CommentThread } from "./CommentThread";
import { VotePill } from "./VotePill";

interface AnswerCardProps {
  answer: AnswerWithAuthor;
  questionId: number;
  questionOwnerId: string;
  score: number;
  userVote?: VoteValue;
  onVote: (direction: VoteValue) => void;
}

export function AnswerCard({
  answer,
  questionId,
  questionOwnerId,
  score,
  userVote,
  onVote,
}: AnswerCardProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const updateAnswer = useUpdateAnswer(questionId);
  const deleteAnswer = useDeleteAnswer(questionId);
  const acceptAnswer = useAcceptAnswer(questionId);

  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?.id === answer.user_id;
  const canAccept = user?.id === questionOwnerId && !answer.is_accepted;

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this answer?",
      description: "The answer and its comments will be permanently removed.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteAnswer.mutate(answer.id);
  };

  const handleSaveEdit = () => {
    if (!editBody.trim()) return;
    updateAnswer.mutate(
      { id: answer.id, body: editBody },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border bg-card p-4 animate-fade-in",
        answer.is_accepted && "border-success/40"
      )}
    >
      <VotePill score={score} userVote={userVote} onVote={onVote} />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={answer.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {answer.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{answer.profiles?.full_name || "Unknown User"}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
          </span>
          {answer.is_accepted && (
            <Badge variant="outline" className="gap-1 rounded-full border-success/40 text-success">
              <CheckCircle2 className="h-3 w-3" />
              Accepted
            </Badge>
          )}

          <span className="ml-auto flex items-center gap-1">
            {canAccept && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={() => acceptAnswer.mutate(answer.id)}
                disabled={acceptAnswer.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accept
              </Button>
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Answer actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditBody(answer.body);
                      setEditing(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editBody.trim() || updateAnswer.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{answer.body}</ReactMarkdown>
          </div>
        )}

        <div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {showComments ? "Hide comments" : "Comments"}
          </Button>
          {showComments && (
            <div className="mt-2 border-t pt-3">
              <CommentThread answerId={answer.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

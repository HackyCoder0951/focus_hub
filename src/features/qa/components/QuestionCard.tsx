import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, MessageCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import type { QaQuestion } from "../api/questions";
import type { VoteValue } from "../api/votes";
import { useDeleteQuestion, useUpdateQuestion } from "../hooks/useQuestionMutations";
import { VotePill } from "./VotePill";

interface QuestionCardProps {
  question: QaQuestion;
  score: number;
  userVote?: VoteValue;
  onVote: (direction: VoteValue) => void;
  onOpen: () => void;
  onTagClick?: (tag: string) => void;
}

export function QuestionCard({
  question,
  score,
  userVote,
  onVote,
  onOpen,
  onTagClick,
}: QuestionCardProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editBody, setEditBody] = useState(question.body);

  const isOwner = user?.id === question.user_id;

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this question?",
      description: "The question and all of its answers will be permanently removed.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteQuestion.mutate(question.id);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    updateQuestion.mutate(
      { id: question.id, title: editTitle, body: editBody },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <Card className="animate-fade-in transition-shadow hover:shadow-elevation-md">
      <CardContent className="flex gap-4 p-5">
        <VotePill score={score} userVote={userVote} onVote={onVote} />

        <div className="min-w-0 flex-1 space-y-2">
          {editing ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Question title"
              />
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Question details"
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editTitle.trim() || !editBody.trim() || updateQuestion.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <h3
                  className="min-w-0 flex-1 cursor-pointer font-semibold leading-snug hover:text-primary"
                  onClick={onOpen}
                >
                  {question.title}
                </h3>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        aria-label="Question actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(true)}>
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
              </div>

              <p className="line-clamp-2 cursor-pointer text-sm text-muted-foreground" onClick={onOpen}>
                {question.body}
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-sm text-muted-foreground">
            {question.category && (
              <Badge variant="outline" className="rounded-full text-xs">
                {question.category}
              </Badge>
            )}
            {question.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer rounded-full text-xs hover:bg-accent"
                onClick={() => onTagClick?.(tag)}
              >
                {tag}
              </Badge>
            ))}

            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {question.answer_count} {question.answer_count === 1 ? "answer" : "answers"}
            </span>
            {question.best_answer_id && (
              <span className="flex items-center gap-1 text-success">
                <CheckCircle2 className="h-4 w-4" />
                Answered
              </span>
            )}

            <span className="ml-auto flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {question.profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[10rem] truncate">
                {question.profiles?.full_name || "Unknown User"}
              </span>
              <span aria-hidden>·</span>
              <span title={new Date(question.created_at).toLocaleString()}>
                {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

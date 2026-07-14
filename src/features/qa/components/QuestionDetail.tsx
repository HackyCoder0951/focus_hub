import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessagesSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import type { QaQuestion } from "../api/questions";
import { useAnswers } from "../hooks/useAnswers";
import { useAnswerVote, useAnswerVotes } from "../hooks/useVotes";
import { AiAnswerCard } from "./AiAnswerCard";
import { AnswerCard } from "./AnswerCard";
import { AnswerForm } from "./AnswerForm";

interface QuestionDetailProps {
  question: QaQuestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Full question dialog: markdown body, AI answer, answers, answer form. */
export function QuestionDetail({ question, open, onOpenChange }: QuestionDetailProps) {
  const { data: answers, isLoading } = useAnswers(open ? question.id : null);
  const { scores, userVotes } = useAnswerVotes(open ? question.id : null);
  const { vote } = useAnswerVote(question.id);

  const sortedAnswers = [...(answers ?? [])].sort(
    (a, b) => Number(b.is_accepted) - Number(a.is_accepted)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6 text-left">{question.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{question.body}</ReactMarkdown>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {question.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {question.profiles?.full_name || "Unknown User"}
              </span>
              <span>
                {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
              </span>
              {question.category && (
                <Badge variant="outline" className="rounded-full">
                  {question.category}
                </Badge>
              )}
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <AiAnswerCard
            questionId={question.id}
            question={`${question.title}\n\n${question.body}`}
          />

          <div className="space-y-3">
            <h3 className="font-semibold">
              {sortedAnswers.length > 0
                ? `${sortedAnswers.length} ${sortedAnswers.length === 1 ? "Answer" : "Answers"}`
                : "Answers"}
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sortedAnswers.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="No answers yet"
                description="Be the first to answer this question."
                className="py-6"
              />
            ) : (
              <div className="space-y-3">
                {sortedAnswers.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    questionId={question.id}
                    questionOwnerId={question.user_id}
                    score={scores[answer.id] ?? 0}
                    userVote={userVotes[answer.id]}
                    onVote={(direction) => vote(answer.id, direction)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 font-semibold">Your Answer</h3>
            <AnswerForm questionId={question.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Loader2, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAiAnswer, useAiAnswerFeedback, useGenerateAiAnswer } from "../hooks/useAiAnswer";

interface AiAnswerCardProps {
  questionId: number;
  /** Full question text (title + body) sent to the generator. */
  question: string;
}

/** AI answer block: fetch, generate/regenerate and thumbs feedback. */
export function AiAnswerCard({ questionId, question }: AiAnswerCardProps) {
  const { data: aiAnswer, isLoading } = useAiAnswer(questionId);
  const generate = useGenerateAiAnswer(questionId);
  const feedback = useAiAnswerFeedback(questionId);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!aiAnswer?.answer_text) return;
    try {
      await navigator.clipboard.writeText(aiAnswer.answer_text);
      setCopied(true);
      toast({ title: "Copied!", description: "AI answer copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading AI answer...</span>
        </CardContent>
      </Card>
    );
  }

  if (!aiAnswer) {
    return (
      <Card className="border-2 border-dashed border-primary/30 bg-accent/40">
        <CardContent className="space-y-3 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
              AI answer
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Get an instant AI-generated answer to this question
          </p>
          <Button
            onClick={() => generate.mutate(question)}
            disabled={generate.isPending}
            size="sm"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Answer
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rating = aiAnswer.user_feedback_rating;

  return (
    <Card className="border-primary/30 bg-accent/40 animate-fade-in">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
              AI answer
            </Badge>
            <span className="text-xs text-muted-foreground">
              Generated {new Date(aiAnswer.created_at).toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="h-8 w-8"
            aria-label="Copy AI answer"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{aiAnswer.answer_text}</ReactMarkdown>
        </div>

        <div className="flex items-center justify-between border-t border-primary/20 pt-2">
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs text-muted-foreground">Was this helpful?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => feedback.mutate({ id: aiAnswer.id, rating: 1 })}
              disabled={feedback.isPending}
              className={cn("h-7 px-2", rating === 1 && "bg-accent text-primary")}
              aria-label="Mark AI answer helpful"
            >
              <ThumbsUp className="mr-1 h-3 w-3" />
              Yes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => feedback.mutate({ id: aiAnswer.id, rating: 0 })}
              disabled={feedback.isPending}
              className={cn("h-7 px-2", rating === 0 && "bg-accent text-primary")}
              aria-label="Mark AI answer not helpful"
            >
              <ThumbsDown className="mr-1 h-3 w-3" />
              No
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generate.mutate(question)}
            disabled={generate.isPending}
            className="h-7 px-2 text-xs"
          >
            {generate.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Regenerate"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

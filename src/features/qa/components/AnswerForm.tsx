import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAnswer } from "../hooks/useAnswers";

interface AnswerFormProps {
  questionId: number;
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const { user } = useAuth();
  const createAnswer = useCreateAnswer(questionId);
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to answer.",
        variant: "destructive",
      });
      return;
    }
    if (!body.trim()) return;
    createAnswer.mutate(body, { onSuccess: () => setBody("") });
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Write your answer..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-[120px]"
        disabled={createAnswer.isPending}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Markdown is supported.</p>
        <Button onClick={handleSubmit} disabled={!body.trim() || createAnswer.isPending}>
          {createAnswer.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Answer"
          )}
        </Button>
      </div>
    </div>
  );
}

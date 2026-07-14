import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Plus, Search, TrendingUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { QuestionCardSkeleton } from "@/components/skeletons";
import { QA_CATEGORIES } from "@/features/qa/api/questions";
import { AskQuestionDialog } from "@/features/qa/components/AskQuestionDialog";
import { QuestionCard } from "@/features/qa/components/QuestionCard";
import { QuestionDetail } from "@/features/qa/components/QuestionDetail";
import { useQuestions, type QaTab } from "@/features/qa/hooks/useQuestions";
import { useQuestionVote, useQuestionVotes } from "@/features/qa/hooks/useVotes";

const FILTER_CATEGORIES = ["All", ...QA_CATEGORIES];

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const QandA = () => {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tab, setTab] = useState<QaTab>("recent");
  const [askOpen, setAskOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const search = useDebouncedValue(searchInput);

  const { questions, isLoading } = useQuestions({ tab, category, search });
  const { scores, userVotes } = useQuestionVotes();
  const { vote } = useQuestionVote();

  const visibleQuestions = useMemo(
    () => (activeTag ? questions.filter((q) => q.tags.includes(activeTag)) : questions),
    [questions, activeTag]
  );

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId]
  );

  const emptyState =
    tab === "unanswered" ? (
      <EmptyState
        icon={HelpCircle}
        title="Every question has an answer"
        description="There are no unanswered questions right now — ask one of your own!"
        actionLabel="Ask Question"
        onAction={() => setAskOpen(true)}
      />
    ) : tab === "trending" ? (
      <EmptyState
        icon={TrendingUp}
        title="Nothing trending yet"
        description="Questions climb here as they collect votes and answers."
        actionLabel="Ask Question"
        onAction={() => setAskOpen(true)}
      />
    ) : (
      <EmptyState
        icon={HelpCircle}
        title="No questions found"
        description={
          search || activeTag || category !== "All"
            ? "Try adjusting your search or filters."
            : "Be the first to start the conversation."
        }
        actionLabel="Ask Question"
        onAction={() => setAskOpen(true)}
      />
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header (sticky so Ask Question stays reachable) */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-col items-start justify-between gap-4 bg-background/95 px-2 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Q&amp;A Community</h1>
          <p className="text-muted-foreground">Ask questions, share knowledge, learn together</p>
        </div>
        <Button onClick={() => setAskOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ask Question
        </Button>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CATEGORIES.map((c) => (
              <Badge
                key={c}
                variant={c === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setCategory(c)}
              >
                {c}
              </Badge>
            ))}
            {activeTag && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1 rounded-full"
                onClick={() => setActiveTag(null)}
              >
                #{activeTag}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs + question list */}
      <Tabs value={tab} onValueChange={(value) => setTab(value as QaTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">Loading questions...</p>
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
            </div>
          ) : visibleQuestions.length === 0 ? (
            emptyState
          ) : (
            visibleQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                score={scores[question.id] ?? 0}
                userVote={userVotes[question.id]}
                onVote={(direction) => vote(question.id, direction)}
                onOpen={() => setSelectedQuestionId(question.id)}
                onTagClick={(tag) => setActiveTag(tag)}
              />
            ))
          )}
        </div>
      </Tabs>

      <AskQuestionDialog open={askOpen} onOpenChange={setAskOpen} />

      {selectedQuestion && (
        <QuestionDetail
          question={selectedQuestion}
          open={selectedQuestionId != null}
          onOpenChange={(open) => !open && setSelectedQuestionId(null)}
        />
      )}
    </div>
  );
};

export default QandA;

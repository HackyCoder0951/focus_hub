import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoteValue } from "../api/votes";

interface VotePillProps {
  score: number;
  userVote?: VoteValue;
  onVote: (direction: VoteValue) => void;
  className?: string;
}

/** Vertical up/score/down pill used on question cards and answers. */
export function VotePill({ score, userVote, onVote, className }: VotePillProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center overflow-hidden rounded-full border bg-card",
        className
      )}
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        onClick={() => onVote(1)}
        className={cn(
          "flex h-8 w-9 items-center justify-center transition-colors hover:bg-accent hover:text-primary",
          userVote === 1 ? "bg-accent text-primary" : "text-muted-foreground"
        )}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="px-1 py-0.5 text-sm font-semibold tabular-nums" aria-label="Vote score">
        {score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        onClick={() => onVote(-1)}
        className={cn(
          "flex h-8 w-9 items-center justify-center transition-colors hover:bg-accent hover:text-primary",
          userVote === -1 ? "bg-accent text-primary" : "text-muted-foreground"
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, HelpCircle, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { QaStats } from "../api/profile";

interface QaStatsCardProps {
  stats?: QaStats;
  isLoading?: boolean;
}

export function QaStatsCard({ stats, isLoading }: QaStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex items-center gap-6 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-warning" />
          <div>
            <div className="text-sm font-semibold leading-none">{stats?.questionsAsked ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Questions</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-info" />
          <div>
            <div className="text-sm font-semibold leading-none">{stats?.answersGiven ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Answers</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <div>
            <div className="text-sm font-semibold leading-none">{stats?.acceptedAnswers ?? 0}</div>
            <div className="mt-1 text-xs text-muted-foreground">Accepted</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QaStatsCard;

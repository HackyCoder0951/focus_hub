import { formatDistanceToNow } from "date-fns";
import { Activity, FileUp, HelpCircle, MessageSquare, PenSquare, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivityItem, ActivityType } from "../api/profile";

const TYPE_CONFIG: Record<ActivityType, { icon: LucideIcon; tile: string; label: string }> = {
  post: { icon: PenSquare, tile: "bg-info/10 text-info", label: "Shared a post" },
  question: { icon: HelpCircle, tile: "bg-warning/10 text-warning", label: "Asked a question" },
  answer: { icon: MessageSquare, tile: "bg-success/10 text-success", label: "Answered a question" },
  file: { icon: FileUp, tile: "bg-accent text-accent-foreground", label: "Uploaded a file" },
};

interface ActivityTimelineProps {
  items?: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityTimeline({ items, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Posts, questions, answers and uploads will show up here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {items.map((item) => {
        const { icon: Icon, tile, label } = TYPE_CONFIG[item.type];
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", tile)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityTimeline;

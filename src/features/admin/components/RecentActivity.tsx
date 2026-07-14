import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  FileText,
  FolderUp,
  HelpCircle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useRecentActivity } from "../hooks/useRecentActivity";
import type { ActivityType } from "../api/activity";

const TYPE_META: Record<ActivityType, { icon: LucideIcon; tile: string }> = {
  post: { icon: FileText, tile: "bg-success/10 text-success" },
  question: { icon: HelpCircle, tile: "bg-info/10 text-info" },
  file: { icon: FolderUp, tile: "bg-warning/10 text-warning" },
  user: { icon: UserPlus, tile: "bg-primary/10 text-primary" },
};

export function RecentActivity() {
  const { data: items, isPending, isError } = useRecentActivity();

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform events</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load activity.</p>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="New posts, questions, uploads and signups will show up here."
          />
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const meta = TYPE_META[item.type];
              const Icon = meta.icon;
              return (
                <li key={item.key} className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tile}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

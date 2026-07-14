import { formatDistanceToNow } from "date-fns";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useFlaggedContent } from "../hooks/useFlaggedContent";
import type { FlagWithContent } from "../api/flags";

function StatusBadge({ status }: { status: string | null }) {
  if (status === "resolved") {
    return (
      <Badge variant="outline" className="bg-success/15 text-success border-success/30">
        resolved
      </Badge>
    );
  }
  return <Badge variant="secondary">{status ?? "dismissed"}</Badge>;
}

function reasonCounts(flags: FlagWithContent[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of flags) {
    const reason = item.flag.reason || "Other";
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function ReportsTab() {
  const { data: flags, isPending, isError } = useFlaggedContent("history");

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Resolved and dismissed flags</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load reports.</p>
        ) : !flags || flags.length === 0 ? (
          <EmptyState
            icon={History}
            title="No reports yet"
            description="Once flags are resolved or dismissed they show up here."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {reasonCounts(flags).map(([reason, count]) => (
                <Badge key={reason} variant="secondary" className="font-normal">
                  {reason} · {count}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {flags.map((item) => (
                <div
                  key={item.flag.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">{item.flag.reason || "No reason given"}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {item.post?.content || "Content unavailable"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reported by{" "}
                      {item.reporter
                        ? item.reporter.full_name || item.reporter.email
                        : "Unknown"}{" "}
                      · {formatDistanceToNow(new Date(item.flag.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <StatusBadge status={item.flag.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

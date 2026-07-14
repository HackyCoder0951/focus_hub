import { formatDistanceToNow } from "date-fns";
import { Flag, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmDialog";
import { useFlaggedContent, useResolveFlag } from "../hooks/useFlaggedContent";
import type { FlagWithContent } from "../api/flags";

function profileName(profile: { full_name: string | null; email: string } | null): string {
  if (!profile) return "Unknown";
  return profile.full_name || profile.email;
}

export function FlaggedContent() {
  const { data: flags, isPending, isError } = useFlaggedContent("pending");
  const resolveFlag = useResolveFlag();
  const confirm = useConfirm();

  const handleDismiss = (item: FlagWithContent) => {
    resolveFlag.mutate({ flag: item.flag, action: "dismiss" });
  };

  const handleRemove = async (item: FlagWithContent) => {
    const ok = await confirm({
      title: "Remove flagged content",
      description:
        "The flagged post will be hidden from the platform and the flag marked as resolved.",
      confirmLabel: "Remove content",
      destructive: true,
    });
    if (!ok) return;
    resolveFlag.mutate({ flag: item.flag, action: "remove" });
  };

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Flagged Content</CardTitle>
        <CardDescription>Open flags reported by users, awaiting review</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Failed to load flagged content.</p>
        ) : !flags || flags.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No open flags"
            description="Content reported by users will appear here for review."
          />
        ) : (
          <div className="space-y-4">
            {flags.map((item) => (
              <div key={item.flag.id} className="rounded-lg border p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="bg-warning/15 text-warning border-warning/30"
                  >
                    <Flag className="mr-1 h-3 w-3" />
                    {item.flag.reason || "No reason given"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.flag.created_at), { addSuffix: true })}
                  </span>
                </div>
                {item.post ? (
                  <p className="mb-2 line-clamp-2 text-sm">{item.post.content}</p>
                ) : (
                  <p className="mb-2 text-sm italic text-muted-foreground">
                    Flagged content is unavailable.
                  </p>
                )}
                <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Reported by {profileName(item.reporter)}</span>
                  {item.author && <span>• Author: {profileName(item.author)}</span>}
                  {item.post?.is_deleted && (
                    <span className="text-destructive">• Content already removed</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolveFlag.isPending}
                    onClick={() => handleDismiss(item)}
                  >
                    Dismiss
                  </Button>
                  {item.post && !item.post.is_deleted && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={resolveFlag.isPending}
                      onClick={() => handleRemove(item)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove content
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

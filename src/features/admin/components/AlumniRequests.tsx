import { formatDistanceToNow } from "date-fns";
import { GraduationCap, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAlumniRequests, useReviewAlumniRequest } from "../hooks/useAlumniRequests";
import type { AlumniRequestWithRequester } from "../api/alumniRequests";

function requesterName(requester: { full_name: string | null; email: string } | null): string {
  if (!requester) return "Unknown";
  return requester.full_name || requester.email;
}

export function AlumniRequests() {
  const { data: items, isPending, isError } = useAlumniRequests("pending");
  const reviewRequest = useReviewAlumniRequest();
  const confirm = useConfirm();

  const handleApprove = (item: AlumniRequestWithRequester) => {
    reviewRequest.mutate({ request: item.request, action: "approve" });
  };

  const handleReject = async (item: AlumniRequestWithRequester) => {
    const ok = await confirm({
      title: "Reject alumni request",
      description: `${requesterName(item.requester)}'s request to become alumni will be rejected.`,
      confirmLabel: "Reject request",
      destructive: true,
    });
    if (!ok) return;
    reviewRequest.mutate({ request: item.request, action: "reject" });
  };

  return (
    <Card className="rounded-xl shadow-elevation-sm animate-fade-in">
      <CardHeader>
        <CardTitle>Alumni Requests</CardTitle>
        <CardDescription>Pending requests to become a verified alumni</CardDescription>
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
          <p className="text-sm text-destructive">Failed to load alumni requests.</p>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No pending requests"
            description="Alumni verification requests will appear here for review."
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.request.id} className="rounded-lg border p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">
                    <UserCheck className="mr-1 h-3 w-3" />
                    {requesterName(item.requester)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.request.created_at), { addSuffix: true })}
                  </span>
                </div>
                <dl className="mb-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Graduation Year</dt>
                    <dd>{item.request.graduation_year ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Company</dt>
                    <dd>{item.request.company || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Designation</dt>
                    <dd>{item.request.designation || "—"}</dd>
                  </div>
                </dl>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={reviewRequest.isPending}
                    onClick={() => handleApprove(item)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={reviewRequest.isPending}
                    onClick={() => handleReject(item)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

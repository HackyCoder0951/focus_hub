import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { GraduationCap, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  useIncomingMentorshipRequests,
  useRespondToMentorship,
  useSentMentorshipRequests,
} from "@/features/mentorship/hooks/useMentorship";
import type { MentorshipConnectionWithProfiles } from "@/features/mentorship/api/mentorship";

function personName(person: { full_name: string | null; email: string } | null): string {
  if (!person) return "Unknown";
  return person.full_name || person.email;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") return <Badge variant="secondary">Accepted</Badge>;
  if (status === "declined") return <Badge variant="destructive">Declined</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

/** Student view: requests they've sent to alumni. */
function SentRequests() {
  const { data: items, isPending } = useSentMentorshipRequests();
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>My Mentorship Requests</CardTitle>
        <CardDescription>Requests you've sent to alumni</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No requests yet"
            description="Request mentorship from an alumnus in the Alumni Directory to get started."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.connection.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{personName(item.alumnus)}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested{" "}
                    {formatDistanceToNow(new Date(item.connection.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.connection.status} />
                  {item.connection.status === "accepted" && (
                    <Button size="sm" variant="outline" onClick={() => navigate("/app/chat")}>
                      Message
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

/** Alumni view: pending requests from students, with accept/decline. */
function IncomingRequests() {
  const { data: items, isPending } = useIncomingMentorshipRequests("pending");
  const respond = useRespondToMentorship();

  const handle = (item: MentorshipConnectionWithProfiles, action: "accept" | "decline") => {
    respond.mutate({ connection: item.connection, action });
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Mentorship Requests</CardTitle>
        <CardDescription>Students asking for your guidance</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No pending requests"
            description="When a student requests mentorship from you, it'll show up here."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.connection.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{personName(item.student)}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.connection.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {item.connection.message && (
                  <p className="text-sm text-muted-foreground">{item.connection.message}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" disabled={respond.isPending} onClick={() => handle(item, "accept")}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={respond.isPending}
                    onClick={() => handle(item, "decline")}
                  >
                    Decline
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

const Mentorship = () => {
  const { profile } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 animate-fade-in">
      {profile?.member_type === "alumni" ? (
        <IncomingRequests />
      ) : profile?.member_type === "student" ? (
        <SentRequests />
      ) : (
        <Card className="rounded-xl">
          <CardContent className="pt-6">
            <EmptyState
              icon={HeartHandshake}
              title="Not available"
              description="Mentorship is available for student and alumni accounts."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Mentorship;

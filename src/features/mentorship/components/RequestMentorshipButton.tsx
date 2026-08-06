import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { MentorshipConnectionWithProfiles } from "../api/mentorship";
import { useSendMentorshipRequest } from "../hooks/useMentorship";

interface RequestMentorshipButtonProps {
  alumniId: string;
  alumniName: string;
  /** The viewer's existing connection to this alumnus, if any. */
  existing?: MentorshipConnectionWithProfiles;
}

/** Directory row action: request mentorship, or show the connection's status. */
export function RequestMentorshipButton({
  alumniId,
  alumniName,
  existing,
}: RequestMentorshipButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sendRequest = useSendMentorshipRequest();
  const navigate = useNavigate();

  if (existing?.connection.status === "accepted") {
    return (
      <Button size="sm" variant="outline" onClick={() => navigate("/app/chat")}>
        Message
      </Button>
    );
  }

  if (existing?.connection.status === "pending") {
    return <Badge variant="outline">Requested</Badge>;
  }

  const handleSubmit = () => {
    sendRequest.mutate(
      { alumniId, message: message.trim() || null },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Request Mentorship
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request mentorship from {alumniName}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and say what you'd like guidance on (optional)"
          rows={4}
        />
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={sendRequest.isPending}>
            {sendRequest.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

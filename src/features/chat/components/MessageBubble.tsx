import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { MessageWithAuthor } from "@/shared/types/db";
import { getFileName, isImageUrl } from "../lib";

interface MessageBubbleProps {
  message: MessageWithAuthor;
  isOwn: boolean;
  /** Show the sender's name above the bubble (group chats, others only). */
  showSender: boolean;
}

export function MessageBubble({ message, isOwn, showSender }: MessageBubbleProps) {
  return (
    <div className={cn("flex animate-fade-in", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] space-y-1 rounded-2xl px-3.5 py-2 shadow-elevation-sm",
          isOwn
            ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground"
        )}
      >
        {showSender && !isOwn && (
          <p className="text-xs font-medium text-primary">
            {message.profiles?.full_name ?? "Unknown"}
          </p>
        )}

        {message.media_url &&
          (isImageUrl(message.media_url) ? (
            <a href={message.media_url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.media_url}
                alt="attachment"
                className="max-h-48 rounded-lg object-cover"
                loading="lazy"
              />
            </a>
          ) : (
            <a
              href={message.media_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                isOwn
                  ? "border-primary-foreground/20 hover:bg-primary-foreground/10"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              <FileText className="h-5 w-5 shrink-0 opacity-70" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {getFileName(message.media_url)}
              </span>
              <Download className="h-4 w-4 shrink-0 opacity-70" />
            </a>
          ))}

        {message.content && (
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        )}

        <p className="text-right text-[10px] opacity-70">
          {format(new Date(message.created_at), "p")}
        </p>
      </div>
    </div>
  );
}

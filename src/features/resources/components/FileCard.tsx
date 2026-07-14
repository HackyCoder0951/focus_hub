import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, Link as LinkIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize, type FileWithProfile } from "../lib/file-utils";
import { FileTypeIcon } from "./FileTypeIcon";

export interface FileCardProps {
  file: FileWithProfile;
  onPreview?: (file: FileWithProfile) => void;
  onEdit?: (file: FileWithProfile) => void;
  onDelete?: (file: FileWithProfile) => void;
  canManageFile?: boolean;
}

export async function copyFileLink(file: FileWithProfile) {
  try {
    await navigator.clipboard.writeText(file.file_url);
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Could not copy link");
  }
}

export function FileCard({ file, onPreview, onEdit, onDelete, canManageFile }: FileCardProps) {
  return (
    <Card className="group animate-fade-in rounded-xl transition-all duration-200 hover:border-primary/30 hover:shadow-elevation-md">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <FileTypeIcon fileType={file.file_type} fileName={file.file_name} />
          <div className="flex items-center gap-1">
            {file.is_public && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            {canManageFile && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">File actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(file)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(file)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="truncate text-sm font-semibold" title={file.file_name}>
            {file.file_name}
          </h3>
          {file.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{file.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.file_size)} &middot;{" "}
            {file.created_at ? new Date(file.created_at).toLocaleDateString() : ""}
          </p>
          {file.profiles && (
            <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage src={file.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="text-[8px]">
                  {file.profiles.full_name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{file.profiles.full_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 pt-1">
          {onPreview && (
            <Button size="sm" variant="ghost" onClick={() => onPreview(file)}>
              <Eye className="mr-1 h-4 w-4" />
              Preview
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-1 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => copyFileLink(file)}
            title="Copy share link"
          >
            <LinkIcon className="h-4 w-4" />
            <span className="sr-only">Copy share link</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FileCard;

import type { FileWithProfile } from "../lib/file-utils";
import { canPreviewFile } from "../lib/file-utils";
import { FileCard } from "./FileCard";

export interface FileGridProps {
  files: FileWithProfile[];
  currentUserId?: string;
  onPreview: (file: FileWithProfile) => void;
  onEdit: (file: FileWithProfile) => void;
  onDelete: (file: FileWithProfile) => void;
}

export function FileGrid({ files, currentUserId, onPreview, onEdit, onDelete }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => {
        const isOwner = !!currentUserId && file.user_id === currentUserId;
        return (
          <FileCard
            key={file.id}
            file={file}
            onPreview={canPreviewFile(file) ? onPreview : undefined}
            onEdit={isOwner ? onEdit : undefined}
            onDelete={isOwner ? onDelete : undefined}
            canManageFile={isOwner}
          />
        );
      })}
    </div>
  );
}

export default FileGrid;

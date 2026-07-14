import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import { formatFileSize, getFileKind, isTextLike, type FileWithProfile } from "../lib/file-utils";
import { FileTypeIcon } from "./FileTypeIcon";

interface FilePreviewDialogProps {
  file: FileWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({ file, open, onOpenChange }: FilePreviewDialogProps) {
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!open || !file || !isTextLike(file)) {
      setTextContent("");
      return;
    }
    let cancelled = false;
    setLoadingText(true);
    fetch(file.file_url)
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) setTextContent(text);
      })
      .catch(() => {
        if (!cancelled) setTextContent("Unable to load file content");
      })
      .finally(() => {
        if (!cancelled) setLoadingText(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, file]);

  const renderPreview = () => {
    if (!file) return null;
    const kind = getFileKind(file.file_type, file.file_name);

    if (kind === "image") {
      return (
        <div className="flex justify-center">
          <img
            src={file.file_url}
            alt={file.file_name}
            className="max-h-[70vh] max-w-full rounded-lg object-contain"
          />
        </div>
      );
    }

    if (kind === "video") {
      return (
        <div className="flex justify-center">
          <video controls className="max-h-[70vh] max-w-full rounded-lg" src={file.file_url}>
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (kind === "pdf") {
      return (
        <div className="h-[70vh] w-full">
          <iframe
            src={`${file.file_url}#toolbar=0`}
            className="h-full w-full rounded-lg border"
            title={file.file_name}
          />
        </div>
      );
    }

    if (isTextLike(file)) {
      return (
        <div className="h-[70vh] w-full overflow-auto">
          {loadingText ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : (
            <pre className="h-full overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
              {textContent}
            </pre>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <FileTypeIcon fileType={file.file_type} fileName={file.file_name} className="h-16 w-16" iconClassName="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{file.file_name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.file_size)} &bull; {file.file_type}
          </p>
        </div>
        <Button asChild>
          <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download File
          </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview: {file?.file_name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">{renderPreview()}</div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {file && (
            <Button asChild>
              <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewDialog;

import { useState, type ChangeEvent, type DragEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadFile } from "../hooks/useFiles";
import { formatFileSize } from "../lib/file-utils";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { user } = useAuth();
  const upload = useUploadFile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const isUploading = upload.isPending;
  const showSuccess = uploadedFileName !== null;

  const resetForm = () => {
    setSelectedFile(null);
    setDescription("");
    setIsPublic(false);
    setIsDragOver(false);
    setUploadedFileName(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !isUploading) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!user || !selectedFile) {
      toast.error("Upload failed", { description: "Please select a file to upload." });
      return;
    }
    upload.mutate(
      { file: selectedFile, description, isPublic, userId: user.id },
      {
        onSuccess: () => {
          setUploadedFileName(selectedFile.name);
          toast.success("File uploaded successfully!");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{showSuccess ? "Upload Successful!" : "Upload File"}</DialogTitle>
          <DialogDescription>
            {showSuccess
              ? "Your file is now available in Resources."
              : "Share a file with the community or keep it private."}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="space-y-6 animate-scale-in">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success">File uploaded successfully!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  "{uploadedFileName}" has been uploaded to your resources.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Upload Another File
              </Button>
              <Button className="flex-1" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                  isDragOver
                    ? "border-primary bg-accent/50"
                    : "border-border hover:border-primary/50 hover:bg-accent/30",
                  isUploading && "pointer-events-none opacity-60"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Select file"
                />
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag and drop a file here, or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">Any file type is supported</p>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="shrink-0">({formatFileSize(selectedFile.size)})</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove selected file</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your file..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                className="h-4 w-4 accent-primary"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isUploading}
              />
              <Label htmlFor="isPublic">Make file public</Label>
            </div>

            {isUploading && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 bg-[length:200%_100%]" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UploadDialog;

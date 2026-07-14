import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import type { FileWithProfile } from "../lib/file-utils";
import { useUpdateFileMeta } from "../hooks/useFiles";

interface EditFileDialogProps {
  file: FileWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFileDialog({ file, open, onOpenChange }: EditFileDialogProps) {
  const updateMeta = useUpdateFileMeta();
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open && file) {
      setDescription(file.description ?? "");
      setIsPublic(file.is_public ?? false);
    }
  }, [open, file]);

  const handleSave = () => {
    if (!file) return;
    updateMeta.mutate(
      { id: file.id, meta: { description, isPublic } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
          <DialogDescription>
            Update the description and visibility of "{file?.file_name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your file..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={updateMeta.isPending}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isPublic"
              className="h-4 w-4 accent-primary"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={updateMeta.isPending}
            />
            <Label htmlFor="edit-isPublic">Make file public</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMeta.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMeta.isPending}>
            {updateMeta.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditFileDialog;

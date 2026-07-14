import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FolderOpen, LayoutGrid, List, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ResourceCardSkeleton } from "@/components/skeletons";
import {
  DEFAULT_FILE_FILTERS,
  useDeleteFile,
  useFiles,
  type FileFiltersState,
  type FileScope,
} from "@/features/resources/hooks/useFiles";
import { canPreviewFile, type FileWithProfile } from "@/features/resources/lib/file-utils";
import { UploadDialog } from "@/features/resources/components/UploadDialog";
import { FilePreviewDialog } from "@/features/resources/components/FilePreviewDialog";
import { EditFileDialog } from "@/features/resources/components/EditFileDialog";
import { FileFilters } from "@/features/resources/components/FileFilters";
import { FileGrid } from "@/features/resources/components/FileGrid";
import { FileListRow } from "@/features/resources/components/FileListRow";

type ViewMode = "grid" | "list";

const Resources = () => {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [scope, setScope] = useState<FileScope>("all");
  const [filters, setFilters] = useState<FileFiltersState>(DEFAULT_FILE_FILTERS);
  const [view, setView] = useState<ViewMode>("grid");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileWithProfile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editFile, setEditFile] = useState<FileWithProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { files, isLoading } = useFiles(filters, scope);
  const deleteFileMutation = useDeleteFile();

  const handlePreview = (file: FileWithProfile) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleEdit = (file: FileWithProfile) => {
    setEditFile(file);
    setEditOpen(true);
  };

  const handleDelete = async (file: FileWithProfile) => {
    const ok = await confirm({
      title: "Delete File",
      description: `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteFileMutation.mutate(file);
  };

  const isOwner = (file: FileWithProfile) => !!user && file.user_id === user.id;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Share and discover useful files and documents</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Scope tabs + view toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={scope} onValueChange={(v) => setScope(v as FileScope)}>
          <TabsList>
            <TabsTrigger value="all">All files</TabsTrigger>
            <TabsTrigger value="mine">My files</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>
        </Tabs>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as ViewMode)}
          variant="outline"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <FileFilters value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      {/* Files */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FolderOpen}
              title="No files found"
              description="Try adjusting your filters, or upload the first file."
              actionLabel="Upload File"
              onAction={() => setUploadOpen(true)}
            />
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <FileGrid
          files={files}
          currentUserId={user?.id}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {files.map((file) => (
                <FileListRow
                  key={file.id}
                  file={file}
                  onPreview={canPreviewFile(file) ? handlePreview : undefined}
                  onEdit={isOwner(file) ? handleEdit : undefined}
                  onDelete={isOwner(file) ? handleDelete : undefined}
                  canManageFile={isOwner(file)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <FilePreviewDialog file={previewFile} open={previewOpen} onOpenChange={setPreviewOpen} />
      <EditFileDialog file={editFile} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
};

export default Resources;

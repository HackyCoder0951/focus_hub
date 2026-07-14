import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type {
  FileFiltersState,
  FileSortOption,
  FileTypeFilter,
  FileVisibilityFilter,
} from "../hooks/useFiles";

interface FileFiltersProps {
  value: FileFiltersState;
  onChange: (value: FileFiltersState) => void;
}

const TYPE_OPTIONS: { value: FileTypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "office", label: "Office" },
  { value: "text", label: "Text" },
  { value: "other", label: "Other" },
];

const VISIBILITY_OPTIONS: { value: FileVisibilityFilter; label: string }[] = [
  { value: "all", label: "All visibility" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const SORT_OPTIONS: { value: FileSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "size-desc", label: "Size (Largest)" },
  { value: "size-asc", label: "Size (Smallest)" },
];

export function FileFilters({ value, onChange }: FileFiltersProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1 md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files..."
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={value.type}
        onValueChange={(type) => onChange({ ...value, type: type as FileTypeFilter })}
      >
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.visibility}
        onValueChange={(visibility) =>
          onChange({ ...value, visibility: visibility as FileVisibilityFilter })
        }
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.sort}
        onValueChange={(sort) => onChange({ ...value, sort: sort as FileSortOption })}
      >
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default FileFilters;

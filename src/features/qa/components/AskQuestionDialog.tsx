import { useState, type KeyboardEvent } from "react";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { QA_CATEGORIES, normalizeTags } from "../api/questions";
import { useCreateQuestion } from "../hooks/useQuestionMutations";

const TITLE_MAX = 150;
const BODY_MAX = 2000;
const NO_CATEGORY = "general";

interface AskQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskQuestionDialog({ open, onOpenChange }: AskQuestionDialogProps) {
  const { user } = useAuth();
  const createQuestion = useCreateQuestion();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(NO_CATEGORY);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  const reset = () => {
    setTitle("");
    setBody("");
    setCategory(NO_CATEGORY);
    setTags([]);
    setTagDraft("");
  };

  const addTagsFromDraft = (draft: string) => {
    const next = normalizeTags([...tags, ...draft.split(",")]);
    setTags(next);
    setTagDraft("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagDraft.trim()) addTagsFromDraft(tagDraft);
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to ask a question.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim() || !body.trim()) return;

    createQuestion.mutate(
      {
        title,
        body,
        category: category === NO_CATEGORY ? null : category,
        tags: tagDraft.trim() ? normalizeTags([...tags, ...tagDraft.split(",")]) : tags,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Share what you're stuck on — the community and AI will help out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="qa-title">Title</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <Input
              id="qa-title"
              placeholder="What's your question? Be specific."
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createQuestion.isPending}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="qa-body">Details</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {body.length}/{BODY_MAX}
              </span>
            </div>
            <Textarea
              id="qa-body"
              placeholder="Provide more context about your question..."
              value={body}
              maxLength={BODY_MAX}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[120px]"
              disabled={createQuestion.isPending}
            />
            <p className="text-xs text-muted-foreground">Markdown is supported.</p>
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={createQuestion.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>General</SelectItem>
                {QA_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="qa-tags">Tags</Label>
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 rounded-full">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => removeTag(tag)}
                    className="rounded-full hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="qa-tags"
                className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={tags.length ? "Add another..." : "Add up to 5 tags (Enter or comma)"}
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagDraft.trim() && addTagsFromDraft(tagDraft)}
                disabled={createQuestion.isPending || tags.length >= 5}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createQuestion.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !body.trim() || createQuestion.isPending}
            >
              {createQuestion.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Question"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

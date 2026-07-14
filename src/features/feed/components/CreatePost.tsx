import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost } from "../hooks/usePosts";

export interface CreatePostHandle {
  /** Expands the composer and focuses the textarea (used by the feed EmptyState). */
  focus: () => void;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost = forwardRef<CreatePostHandle, CreatePostProps>(
  ({ onPostCreated }, ref) => {
    const { user, profile } = useAuth();
    const createPost = useCreatePost();

    const [expanded, setExpanded] = useState(false);
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({ focus: () => setExpanded(true) }));

    useEffect(() => {
      if (expanded) textareaRef.current?.focus();
    }, [expanded]);

    const avatarFallback =
      profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    const resetComposer = () => {
      setContent("");
      setImage(null);
      setImagePreview(null);
      setExpanded(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !content.trim()) return;
      createPost.mutate(
        { userId: user.id, content: content.trim(), image },
        { onSuccess: () => { resetComposer(); onPostCreated?.(); } }
      );
    };

    return (
      <Card className="rounded-xl shadow-elevation-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                onFocus={() => setExpanded(true)}
                className="flex-1 rounded-full bg-muted px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80"
              >
                Share something…
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 animate-fade-in space-y-3">
                <Textarea
                  ref={textareaRef}
                  placeholder="Share something…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                  className="min-h-[100px] resize-none border-0 p-0 text-base shadow-none focus-visible:ring-0"
                  disabled={createPost.isPending}
                />
                {imagePreview && (
                  <div className="relative h-32 w-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="create-post-image"
                      onChange={handleImageChange}
                      disabled={createPost.isPending}
                    />
                    <Button type="button" variant="ghost" size="sm" asChild>
                      <label htmlFor="create-post-image" className="cursor-pointer">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Photo
                      </label>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetComposer}
                      disabled={createPost.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="min-w-[80px]"
                      disabled={!content.trim() || createPost.isPending}
                    >
                      {createPost.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

CreatePost.displayName = "CreatePost";

export default CreatePost;

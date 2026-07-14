import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PostMediaProps {
  imageUrl?: string | null;
  fileUrl?: string | null;
}

const isRenderableMedia = (url: string) =>
  /\.(pdf|mp4|webm|ogg|jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);

/** Post image with a click-to-zoom lightbox, plus generic file attachments. */
const PostMedia = ({ imageUrl, fileUrl }: PostMediaProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!imageUrl && !fileUrl) return null;

  return (
    <div className="space-y-3">
      {imageUrl && (
        <>
          <button
            type="button"
            className="block w-full overflow-hidden rounded-lg border"
            onClick={() => setLightboxOpen(true)}
            aria-label="Open image preview"
          >
            <img
              src={imageUrl}
              alt="Post attachment"
              loading="lazy"
              className="max-h-96 w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-[1.01]"
            />
          </button>
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-4xl overflow-hidden p-2">
              <DialogTitle className="sr-only">Image preview</DialogTitle>
              <img
                src={imageUrl}
                alt="Post attachment"
                className="max-h-[80vh] w-full animate-scale-in rounded-md object-contain"
              />
            </DialogContent>
          </Dialog>
        </>
      )}
      {fileUrl && !isRenderableMedia(fileUrl) && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          Download attached file
        </a>
      )}
    </div>
  );
};

export default PostMedia;

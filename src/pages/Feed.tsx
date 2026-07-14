import { useEffect, useRef, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { PostCardSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import CreatePost, {
  type CreatePostHandle,
} from "@/features/feed/components/CreatePost";
import PostCard from "@/features/feed/components/PostCard";
import { usePostsInfinite } from "@/features/feed/hooks/usePosts";
import { useFeedRealtime } from "@/features/feed/hooks/useFeedRealtime";

const Feed = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const composerRef = useRef<CreatePostHandle>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useFeedRealtime();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    usePostsInfinite(debouncedSearch);
  const posts = data?.pages.flat() ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, posts.length]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
        <p className="text-sm text-muted-foreground">
          See what your community is sharing.
        </p>
      </div>

      {user && <CreatePost ref={composerRef} />}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">Loading posts...</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={debouncedSearch ? "No posts found" : "No posts yet"}
          description={
            !user
              ? "Sign in to see posts and share your thoughts."
              : debouncedSearch
                ? "Try a different search term."
                : "Be the first to share something with your community."
          }
          actionLabel={user && !debouncedSearch ? "Write a post" : undefined}
          onAction={() => composerRef.current?.focus()}
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {isFetchingNextPage && <PostCardSkeleton />}
          {hasNextPage ? (
            <div ref={sentinelRef} aria-hidden className="h-px" />
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              You're all caught up! 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import {
  PAGE_SIZE,
  createPost,
  fetchPostsPage,
  softDeletePost,
  updatePost,
  uploadPostImage,
} from "../api/posts";

/** Infinite feed, 10 posts per page, optional server-side content search. */
export function usePostsInfinite(search: string) {
  return useInfiniteQuery({
    queryKey: qk.posts.list({ search }),
    queryFn: ({ pageParam }) => fetchPostsPage({ pageParam, search }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      content: string;
      image?: File | null;
    }) => {
      const imageUrl = input.image ? await uploadPostImage(input.image) : null;
      await createPost({ userId: input.userId, content: input.content, imageUrl });
    },
    onSuccess: () => {
      toast.success("Post created!", {
        description: "Your post has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: qk.posts.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updatePost(id, content),
    onSuccess: () => {
      toast.success("Post updated");
      queryClient.invalidateQueries({ queryKey: qk.posts.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeletePost(id),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: qk.posts.all });
    },
  });
}

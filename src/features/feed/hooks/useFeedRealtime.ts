import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { qk } from "@/shared/lib/queryKeys";

const DEBOUNCE_MS = 500;

/**
 * Single realtime channel for the feed. Any change to posts, likes or
 * comments schedules a debounced invalidation of the whole `posts` cache
 * (feed pages, per-post comments and liked flags), replacing the old
 * refetch-everything-per-event approach.
 */
export function useFeedRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let timer: number | undefined;

    const scheduleInvalidate = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: qk.posts.all });
      }, DEBOUNCE_MS);
    };

    const channel = supabase
      .channel("feed-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        scheduleInvalidate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        scheduleInvalidate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        scheduleInvalidate
      )
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

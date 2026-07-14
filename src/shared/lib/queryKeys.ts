/**
 * Single source of truth for React Query cache keys.
 * Every hook must build its key from this factory so invalidation
 * stays consistent across features.
 */
export const qk = {
  posts: {
    all: ["posts"] as const,
    list: (filters?: { search?: string; saved?: boolean }) =>
      ["posts", "list", filters ?? {}] as const,
    comments: (postId: string) => ["posts", postId, "comments"] as const,
  },
  qa: {
    all: ["qa"] as const,
    questions: (filters?: { tab?: string; category?: string; search?: string }) =>
      ["qa", "questions", filters ?? {}] as const,
    question: (id: number | string) => ["qa", "question", String(id)] as const,
    answers: (questionId: number | string) => ["qa", String(questionId), "answers"] as const,
    aiAnswer: (questionId: number | string) => ["qa", String(questionId), "ai-answer"] as const,
    voteCounts: ["qa", "vote-counts"] as const,
  },
  chat: {
    all: ["chats"] as const,
    list: ["chats", "list"] as const,
    messages: (chatId: string) => ["chats", chatId, "messages"] as const,
    members: (chatId: string) => ["chats", chatId, "members"] as const,
  },
  files: {
    all: ["files"] as const,
    list: (filters?: Record<string, unknown>) => ["files", "list", filters ?? {}] as const,
  },
  profile: {
    detail: (userId: string) => ["profile", userId] as const,
    role: (userId: string) => ["profile", userId, "role"] as const,
    posts: (userId: string) => ["profile", userId, "posts"] as const,
    files: (userId: string) => ["profile", userId, "files"] as const,
    followStats: (userId: string) => ["profile", userId, "follow-stats"] as const,
    activity: (userId: string) => ["profile", userId, "activity"] as const,
  },
  notifications: {
    list: (userId: string) => ["notifications", userId] as const,
    unreadCount: (userId: string) => ["notifications", userId, "unread-count"] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    users: ["admin", "users"] as const,
    flags: (status?: string) => ["admin", "flags", status ?? "all"] as const,
    activity: ["admin", "activity"] as const,
    analytics: ["admin", "analytics"] as const,
  },
} as const;

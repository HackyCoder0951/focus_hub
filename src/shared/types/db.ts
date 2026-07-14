import type { Tables } from "@/integrations/supabase/types";

// Row aliases — use these instead of `any` for supabase data.
export type Profile = Tables<"profiles">;
export type Post = Tables<"posts">;
export type PostComment = Tables<"comments">;
export type Question = Tables<"questions">;
export type Answer = Tables<"answers">;
export type AnswerComment = Tables<"answer_comments">;
export type AiAnswer = Tables<"ai_answers">;
export type Chat = Tables<"chats">;
export type ChatMember = Tables<"chat_members">;
export type ChatMessage = Tables<"chat_messages">;
export type FileModel = Tables<"filemodels">;
export type Follower = Tables<"followers">;
export type ContentFlag = Tables<"content_flags">;
export type AppNotification = Tables<"notifications">;

// Common joined shapes
export type ProfileLite = Pick<Profile, "id" | "full_name" | "avatar_url">;

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, "full_name" | "avatar_url" | "email"> | null;
};

export type QuestionWithAuthor = Question & {
  profiles: ProfileLite | null;
  answer_count: number;
};

export type AnswerWithAuthor = Answer & {
  profiles: ProfileLite | null;
};

export type MessageWithAuthor = ChatMessage & {
  profiles: ProfileLite | null;
};

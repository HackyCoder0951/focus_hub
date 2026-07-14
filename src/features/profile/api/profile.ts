import { supabase } from "@/integrations/supabase/client";
import { unwrap, unwrapMaybe } from "@/shared/lib/supabase-helpers";
import type { FileModel, PostWithAuthor, Profile } from "@/shared/types/db";

/** profiles row plus the signup-metadata member type some rows carry. */
export type ProfileWithMemberType = Profile & { member_type?: string | null };

export async function fetchProfile(userId: string): Promise<ProfileWithMemberType | null> {
  return unwrapMaybe<ProfileWithMemberType>(
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  );
}

export async function fetchProfileRole(userId: string): Promise<string | null> {
  const row = await unwrapMaybe<{ role: string }>(
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle()
  );
  return row?.role ?? null;
}

export async function fetchUserPosts(userId: string): Promise<PostWithAuthor[]> {
  const data = await unwrap(
    supabase
      .from("posts")
      .select("*, profiles: profiles (full_name, avatar_url, email)")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
  );
  return (data ?? []) as unknown as PostWithAuthor[];
}

export async function fetchUserFiles(userId: string): Promise<FileModel[]> {
  const data = await unwrap(
    supabase
      .from("filemodels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );
  return data ?? [];
}

export interface FollowStats {
  followers: number;
  following: number;
}

export async function fetchFollowStats(userId: string): Promise<FollowStats> {
  const [followersRes, followingRes] = await Promise.all([
    supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  if (followersRes.error) throw followersRes.error;
  if (followingRes.error) throw followingRes.error;
  return {
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}

export async function fetchIsFollowing(viewerId: string, profileUserId: string): Promise<boolean> {
  const row = await unwrapMaybe<{ id: string }>(
    supabase
      .from("followers")
      .select("id")
      .eq("follower_id", viewerId)
      .eq("following_id", profileUserId)
      .maybeSingle()
  );
  return !!row;
}

export async function followUser(viewerId: string, targetId: string): Promise<void> {
  await unwrap(
    supabase.from("followers").insert({ follower_id: viewerId, following_id: targetId })
  );
}

export async function unfollowUser(viewerId: string, targetId: string): Promise<void> {
  await unwrap(
    supabase
      .from("followers")
      .delete()
      .eq("follower_id", viewerId)
      .eq("following_id", targetId)
  );
}

export type ActivityType = "post" | "question" | "answer" | "file";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  /** Main text for the timeline entry (post content, question title, ...). */
  title: string;
  created_at: string;
}

const ACTIVITY_LIMIT_PER_SOURCE = 10;
const ACTIVITY_LIMIT = 20;

/**
 * Merges the user's recent posts, questions, answers and files into a single
 * timeline sorted by created_at desc.
 */
export async function fetchProfileActivity(userId: string): Promise<ActivityItem[]> {
  const [posts, questions, answers, files] = await Promise.all([
    unwrap(
      supabase
        .from("posts")
        .select("id, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(ACTIVITY_LIMIT_PER_SOURCE)
    ),
    unwrap(
      supabase
        .from("questions")
        .select("id, title, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(ACTIVITY_LIMIT_PER_SOURCE)
    ),
    unwrap(
      supabase
        .from("answers")
        .select("id, body, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(ACTIVITY_LIMIT_PER_SOURCE)
    ),
    unwrap(
      supabase
        .from("filemodels")
        .select("id, file_name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(ACTIVITY_LIMIT_PER_SOURCE)
    ),
  ]);

  const items: ActivityItem[] = [
    ...(posts ?? []).map((p) => ({
      id: `post-${p.id}`,
      type: "post" as const,
      title: p.content,
      created_at: p.created_at,
    })),
    ...(questions ?? []).map((q) => ({
      id: `question-${q.id}`,
      type: "question" as const,
      title: q.title,
      created_at: q.created_at,
    })),
    ...(answers ?? []).map((a) => ({
      id: `answer-${a.id}`,
      type: "answer" as const,
      title: a.body,
      created_at: a.created_at,
    })),
    ...(files ?? []).map((f) => ({
      id: `file-${f.id}`,
      type: "file" as const,
      title: f.file_name,
      created_at: f.created_at,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, ACTIVITY_LIMIT);
}

export interface QaStats {
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
}

export async function fetchQaStats(userId: string): Promise<QaStats> {
  const [questionsRes, answersRes, acceptedRes] = await Promise.all([
    supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("answers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("answers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_accepted", true),
  ]);
  if (questionsRes.error) throw questionsRes.error;
  if (answersRes.error) throw answersRes.error;
  if (acceptedRes.error) throw acceptedRes.error;
  return {
    questionsAsked: questionsRes.count ?? 0,
    answersGiven: answersRes.count ?? 0,
    acceptedAnswers: acceptedRes.count ?? 0,
  };
}

export type UserListItem = Pick<Profile, "id" | "full_name" | "avatar_url" | "bio">;

async function fetchProfilesForIds(ids: string[]): Promise<UserListItem[]> {
  if (ids.length === 0) return [];
  const profiles = await unwrap(
    supabase.from("profiles").select("id, full_name, avatar_url, bio").in("id", ids)
  );
  // Preserve the original (recency) order of ids.
  return ids.map(
    (id) =>
      profiles?.find((p) => p.id === id) ?? {
        id,
        full_name: null,
        avatar_url: null,
        bio: null,
      }
  );
}

export async function fetchFollowersList(userId: string): Promise<UserListItem[]> {
  const rows = await unwrap(
    supabase
      .from("followers")
      .select("follower_id")
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
  );
  const ids = (rows ?? [])
    .map((row) => row.follower_id)
    .filter((id): id is string => !!id);
  return fetchProfilesForIds(ids);
}

export async function fetchFollowingList(userId: string): Promise<UserListItem[]> {
  const rows = await unwrap(
    supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
  );
  const ids = (rows ?? [])
    .map((row) => row.following_id)
    .filter((id): id is string => !!id);
  return fetchProfilesForIds(ids);
}

export async function fetchMyFollowingIds(userId: string): Promise<string[]> {
  const rows = await unwrap(
    supabase.from("followers").select("following_id").eq("follower_id", userId)
  );
  return (rows ?? [])
    .map((row) => row.following_id)
    .filter((id): id is string => !!id);
}

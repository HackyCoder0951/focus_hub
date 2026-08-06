import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast as sonner } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/shared/types/db";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { PROFILE_SELECT } from "@/features/profile/api/profile";
import {
  downloadJson,
  fetchAccountExport,
  updateProfileRow,
  uploadAvatar,
} from "../api/settingsApi";
import type { UserSettings } from "../api/settingsSchema";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

/**
 * Fresh profile row for the settings screens, seeded from the AuthContext
 * profile so the forms render instantly. Mutations below keep it in sync.
 */
export function useSettingsProfile() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: qk.profile.detail(user?.id ?? ""),
    queryFn: () =>
      unwrap<Profile>(
        supabase
          .from("profiles")
          .select(PROFILE_SELECT)
          .eq("id", user!.id)
          .single()
      ),
    enabled: !!user,
    initialData: profile ?? undefined,
  });
}

export interface ProfileFields {
  full_name: string;
  bio: string;
  website: string;
  location: string;
  /** Only meaningful once member_type is "alumni"; editable by the user post-verification. */
  company: string;
  designation: string;
}

export interface UpdateProfileInput {
  fields?: ProfileFields;
  /** When set, uploads to the `avatars` bucket and points avatar_url at it. */
  avatarFile?: File;
  /** When true, clears avatar_url. */
  removeAvatar?: boolean;
}

/** Updates profile fields and/or the avatar (upload preserved from the old page). */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<Profile> => {
      if (!user) throw new Error("You must be signed in");

      const update: TablesUpdate<"profiles"> = input.fields
        ? {
            full_name: input.fields.full_name.trim() || null,
            bio: input.fields.bio.trim() || null,
            website: input.fields.website.trim() || null,
            location: input.fields.location.trim() || null,
            company: input.fields.company.trim() || null,
            designation: input.fields.designation.trim() || null,
          }
        : {};
      if (input.avatarFile) {
        update.avatar_url = await uploadAvatar(user.id, input.avatarFile);
      } else if (input.removeAvatar) {
        update.avatar_url = null;
      }
      return updateProfileRow(user.id, update);
    },
    onSuccess: (row, variables) => {
      if (user) {
        queryClient.setQueryData(qk.profile.detail(user.id), row);
        void queryClient.invalidateQueries({
          queryKey: qk.profile.detail(user.id),
        });
      }
      // Nudge AuthContext to refetch the profile so the shell (avatar, name)
      // picks up the change without a page reload.
      void supabase.auth.refreshSession();

      const title = variables.avatarFile
        ? "Avatar updated"
        : variables.removeAvatar
          ? "Avatar removed"
          : "Profile updated";
      toast({ title, description: "Your changes have been saved." });
    },
    onError: (error) => {
      toast({
        title: "Profile update failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/**
 * Persists the merged notification + privacy preferences to the
 * `profiles.settings` JSONB column. Called on every toggle (auto-save)
 * with an optimistic cache update and a small "Saved" toast.
 */
export function useUpdatePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings): Promise<UserSettings> => {
      if (!user) throw new Error("You must be signed in");
      await unwrap(
        supabase
          .from("profiles")
          .update({ settings })
          .eq("id", user.id)
          .select("id")
      );
      return settings;
    },
    onMutate: async (settings) => {
      if (!user) return { previous: undefined };
      const key = qk.profile.detail(user.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Profile>(key);
      queryClient.setQueryData<Profile>(key, (old) =>
        old ? { ...old, settings } : old
      );
      return { previous };
    },
    onSuccess: () => {
      sonner.success("Saved", { duration: 1500 });
    },
    onError: (error, _settings, context) => {
      if (user && context?.previous) {
        queryClient.setQueryData(qk.profile.detail(user.id), context.previous);
      }
      toast({
        title: "Failed to save preferences",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      if (user) {
        void queryClient.invalidateQueries({
          queryKey: qk.profile.detail(user.id),
        });
      }
    },
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Verifies the current password (via signInWithPassword) before updating
 * to the new one. No page reload.
 */
export function useChangePassword() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: ChangePasswordInput) => {
      const email = user?.email;
      if (!email) throw new Error("You must be signed in");

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Password update failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/** Downloads the caller's profile, posts and file metadata as a JSON file. */
export function useExportData() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in");
      return fetchAccountExport(user.id);
    },
    onSuccess: (data) => {
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(data, `focus-hub-export-${date}.json`);
      toast({
        title: "Export ready",
        description: "Your data has been downloaded as JSON.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}

/** Signs the user out of every device (global scope). */
export function useSignOutEverywhere() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Signed out everywhere",
        description: "All of your sessions have been ended.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sign out failed",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}

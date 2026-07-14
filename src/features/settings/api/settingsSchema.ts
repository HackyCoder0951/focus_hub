import { z } from "zod";

/**
 * Typed schema for the `profiles.settings` JSONB column.
 * Every field has a default so a missing/partial/corrupt value
 * degrades gracefully to sensible defaults instead of crashing.
 */

export const notificationPrefsSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  mentions: z.boolean().default(true),
  comments: z.boolean().default(true),
  follows: z.boolean().default(false),
  messages: z.boolean().default(true),
});

export const privacyPrefsSchema = z.object({
  profilePublic: z.boolean().default(true),
  showEmail: z.boolean().default(false),
  showLocation: z.boolean().default(true),
  allowMessages: z.boolean().default(true),
});

export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
export type PrivacyPrefs = z.infer<typeof privacyPrefsSchema>;

export const defaultNotificationPrefs: NotificationPrefs =
  notificationPrefsSchema.parse({});
export const defaultPrivacyPrefs: PrivacyPrefs = privacyPrefsSchema.parse({});

const userSettingsSchema = z.object({
  notifications: notificationPrefsSchema
    .catch(defaultNotificationPrefs)
    .default(defaultNotificationPrefs),
  privacy: privacyPrefsSchema
    .catch(defaultPrivacyPrefs)
    .default(defaultPrivacyPrefs),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const defaultSettings: UserSettings = {
  notifications: defaultNotificationPrefs,
  privacy: defaultPrivacyPrefs,
};

/**
 * Safely parse the raw `profiles.settings` JSON into typed preferences.
 * Never throws: unknown shapes fall back to defaults, unknown keys are dropped.
 */
export function parseSettings(json: unknown): UserSettings {
  return userSettingsSchema.catch(defaultSettings).parse(json ?? {});
}

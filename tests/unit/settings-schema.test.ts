import { describe, it, expect } from "vitest";
import {
  parseSettings,
  defaultSettings,
  defaultNotificationPrefs,
  defaultPrivacyPrefs,
} from "@/features/settings/api/settingsSchema";

describe("parseSettings", () => {
  it("returns defaults for undefined/null input", () => {
    expect(parseSettings(undefined)).toEqual(defaultSettings);
    expect(parseSettings(null)).toEqual(defaultSettings);
  });

  it("returns defaults for an empty object", () => {
    expect(parseSettings({})).toEqual(defaultSettings);
  });

  it("merges partial notification prefs with defaults", () => {
    const result = parseSettings({ notifications: { email: false } });
    expect(result.notifications.email).toBe(false);
    expect(result.notifications.push).toBe(defaultNotificationPrefs.push);
    expect(result.privacy).toEqual(defaultPrivacyPrefs);
  });

  it("merges partial privacy prefs with defaults", () => {
    const result = parseSettings({ privacy: { showEmail: true } });
    expect(result.privacy.showEmail).toBe(true);
    expect(result.privacy.profilePublic).toBe(defaultPrivacyPrefs.profilePublic);
  });

  it("falls back to defaults when a section has the wrong shape entirely", () => {
    expect(parseSettings({ notifications: "not-an-object" })).toEqual(defaultSettings);
    expect(parseSettings({ privacy: 42 })).toEqual(defaultSettings);
  });

  it("never throws on malformed input", () => {
    expect(() => parseSettings("garbage")).not.toThrow();
    expect(() => parseSettings(12345)).not.toThrow();
    expect(() => parseSettings([1, 2, 3])).not.toThrow();
  });

  it("drops unknown keys rather than erroring", () => {
    const result = parseSettings({ notifications: { email: false, bogus: true } });
    expect(result.notifications).not.toHaveProperty("bogus");
  });
});

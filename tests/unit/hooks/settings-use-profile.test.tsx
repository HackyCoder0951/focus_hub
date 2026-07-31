import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";
import { queryResult } from "../../mocks/supabase";
import { qk } from "@/shared/lib/queryKeys";
import type { Profile } from "@/shared/types/db";

const toastMock = vi.fn();

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    auth: { refreshSession: vi.fn() },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "user@example.com" },
    profile: {
      id: "u1",
      email: "user@example.com",
      full_name: "Old Name",
      bio: "Old bio",
      website: null,
      location: null,
      member_type: "student",
    },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({ toast: toastMock }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { useUpdateProfile } = await import("@/features/settings/hooks/useSettings");

beforeEach(() => {
  toastMock.mockReset();
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
  supabaseMock.auth.refreshSession.mockReset();
});

describe("useUpdateProfile", () => {
  it("persists about fields and updates the profile detail cache used by the About tab", async () => {
    const queryClient = createTestQueryClient({ gcTime: 60_000 });
    const updatedProfile = {
      id: "u1",
      email: "user@example.com",
      full_name: "New Name",
      bio: "Updated bio",
      website: "https://example.com",
      location: "Pune",
      member_type: "alumni",
    } as Profile;
    const builder = queryResult(updatedProfile);
    supabaseMock.from.mockReturnValue(builder);

    queryClient.setQueryData(qk.profile.detail("u1"), {
      id: "u1",
      full_name: "Old Name",
      bio: "Old bio",
      member_type: "student",
    });

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    }

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({
      fields: {
        full_name: "  New Name  ",
        bio: "  Updated bio  ",
        website: "  https://example.com  ",
        location: "  Pune  ",
        member_type: "alumni",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(builder.update).toHaveBeenCalledWith({
      full_name: "New Name",
      bio: "Updated bio",
      website: "https://example.com",
      location: "Pune",
      member_type: "alumni",
    });
    expect(queryClient.getQueryData(qk.profile.detail("u1"))).toEqual(
      updatedProfile
    );
    expect(supabaseMock.auth.refreshSession).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Profile updated" })
    );
  });

  it("normalizes blank about fields to null before saving", async () => {
    const queryClient = createTestQueryClient({ gcTime: 60_000 });
    const builder = queryResult({ id: "u1" });
    supabaseMock.from.mockReturnValue(builder);

    function wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    }

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    result.current.mutate({
      fields: {
        full_name: "  ",
        bio: " ",
        website: "",
        location: "   ",
        member_type: "",
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(builder.update).toHaveBeenCalledWith({
      full_name: null,
      bio: null,
      website: null,
      location: null,
      member_type: "student",
    });
  });
});

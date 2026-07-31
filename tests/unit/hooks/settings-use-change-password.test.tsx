import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", email: "user@example.com" } }),
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: toastMock }));

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    auth: {
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { useChangePassword } = await import("@/features/settings/hooks/useSettings");

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  toastMock.mockReset();
  supabaseMock.auth.signInWithPassword.mockReset();
  supabaseMock.auth.updateUser.mockReset();
});

describe("useChangePassword", () => {
  it("shows a confirmation toast on success (SETTINGS-UPDATE-01)", async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabaseMock.auth.updateUser.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    result.current.mutate({ currentPassword: "oldpass123", newPassword: "newpassword1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Password updated" })
    );
    expect(supabaseMock.auth.updateUser).toHaveBeenCalledWith({ password: "newpassword1" });
  });

  it("verifies the current password first, and shows 'incorrect' on failure (SETTINGS-UPDATE-02)", async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      error: new Error("Invalid login credentials"),
    });

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    result.current.mutate({ currentPassword: "wrongpass", newPassword: "newpassword1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Password update failed",
        description: "Current password is incorrect",
      })
    );
    expect(supabaseMock.auth.updateUser).not.toHaveBeenCalled();
  });

  it("surfaces the updateUser error message when the password change itself fails", async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ error: null });
    supabaseMock.auth.updateUser.mockResolvedValue({
      error: { message: "Password too weak" },
    });

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    result.current.mutate({ currentPassword: "oldpass123", newPassword: "123" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Password too weak" })
    );
  });
});

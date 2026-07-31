import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { auth: { resetPasswordForEmail: vi.fn() } },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { default: ForgotPassword } = await import("@/pages/ForgotPassword");

beforeEach(() => {
  supabaseMock.auth.resetPasswordForEmail.mockReset();
});

describe("ForgotPassword page", () => {
  it("shows the Supabase error message for an email that isn't found (AUTH-RESET-01)", async () => {
    supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({
      error: new Error("Email not found"),
    });
    const user = userEvent.setup();
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText("Email not found")).toBeInTheDocument();
    expect(screen.queryByText("Check your spam folder or try again.")).not.toBeInTheDocument();
  });

  it("shows the success confirmation screen when the reset email is sent", async () => {
    supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText("Reset link sent successfully.")).toBeInTheDocument();
  });

  it("calls resetPasswordForEmail with the entered address", async () => {
    supabaseMock.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(supabaseMock.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/reset-password") })
    );
  });
});

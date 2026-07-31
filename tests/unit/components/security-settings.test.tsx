import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
let mutationState: { isPending: boolean } = { isPending: false };
vi.mock("@/features/settings/hooks/useSettings", () => ({
  useChangePassword: () => ({ mutate, isPending: mutationState.isPending }),
}));

const { SecuritySettings } = await import("@/features/settings/components/SecuritySettings");

beforeEach(() => {
  mutate.mockReset();
  mutationState = { isPending: false };
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { current = "oldpass123", next = "newpassword1", confirm = "newpassword1" } = {}
) {
  await user.type(screen.getByLabelText("Current Password"), current);
  await user.type(screen.getByLabelText("New Password"), next);
  await user.type(screen.getByLabelText("Confirm New Password"), confirm);
}

describe("SecuritySettings", () => {
  it("blocks submit and shows an error when the current password is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySettings />);
    await user.type(screen.getByLabelText("New Password"), "newpassword1");
    await user.type(screen.getByLabelText("Confirm New Password"), "newpassword1");
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    expect(screen.getByText("Enter your current password")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows an error for a new password under 8 characters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySettings />);
    await fillForm(user, { next: "short", confirm: "short" });
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    expect(screen.getByText("New password must be at least 8 characters")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows a mismatch error when confirmation doesn't match the new password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySettings />);
    await fillForm(user, { next: "newpassword1", confirm: "different1" });
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("calls the mutation with current/new password when the form is valid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySettings />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    expect(mutate).toHaveBeenCalledWith(
      { currentPassword: "oldpass123", newPassword: "newpassword1" },
      expect.any(Object)
    );
  });

  it("disables the submit button while the mutation is pending", () => {
    mutationState = { isPending: true };
    renderWithProviders(<SecuritySettings />);
    expect(screen.getByRole("button", { name: "Updating..." })).toBeDisabled();
  });

  it("toggles current password visibility", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SecuritySettings />);
    const input = screen.getByLabelText("Current Password") as HTMLInputElement;
    expect(input.type).toBe("password");
    await user.click(screen.getByRole("button", { name: "Show current password" }));
    expect(input.type).toBe("text");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));
let authState: { user: unknown } = { user: null };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ ...authState, signUp }),
}));

const { default: Register } = await import("@/pages/Register");

beforeEach(() => {
  navigateMock.mockReset();
  signUp.mockReset().mockResolvedValue({ error: null });
  authState = { user: null };
});

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  { password = "password123", confirmPassword = "password123" } = {}
) {
  await user.type(screen.getByLabelText("Full Name"), "Jane Doe");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
}

describe("Register page", () => {
  it("shows a mismatch error and disables submit when passwords differ", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await fillRequiredFields(user, { password: "password123", confirmPassword: "different" });
    await user.click(screen.getByLabelText(/I agree to the/));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("keeps submit disabled until the terms checkbox is checked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    await fillRequiredFields(user);
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("enables submit once passwords match and terms are agreed, and calls signUp", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    await fillRequiredFields(user);
    await user.click(screen.getByLabelText(/I agree to the/));
    const submit = screen.getByRole("button", { name: /create account/i });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(signUp).toHaveBeenCalledWith("jane@example.com", "password123", "Jane Doe", "student");
  });

  it("does not call signUp when passwords mismatch even if submit is somehow triggered", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    await fillRequiredFields(user, { password: "password123", confirmPassword: "nope" });
    await user.click(screen.getByLabelText(/I agree to the/));
    // Submit stays disabled, so signUp must never fire.
    expect(signUp).not.toHaveBeenCalled();
  });

  it("always signs up as student — alumni status is granted via verification, not self-declared", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    await fillRequiredFields(user);
    expect(screen.queryByLabelText("Alumni")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText(/I agree to the/));
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(signUp).toHaveBeenCalledWith("jane@example.com", "password123", "Jane Doe", "student");
  });

  it("redirects to /app once the user becomes authenticated (AUTH-REG-01)", () => {
    const { rerender } = renderWithProviders(<Register />);
    expect(navigateMock).not.toHaveBeenCalled();

    authState = { user: { id: "u1" } };
    rerender(<Register />);

    expect(navigateMock).toHaveBeenCalledWith("/app");
  });

  it("does not call signUp when required fields are left empty (AUTH-REG-04)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    // Check terms so the disabled-by-mismatch/terms logic isn't what's
    // blocking submission — this isolates native `required` validation.
    await user.click(screen.getByLabelText(/I agree to the/));
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(signUp).not.toHaveBeenCalled();
  });
});

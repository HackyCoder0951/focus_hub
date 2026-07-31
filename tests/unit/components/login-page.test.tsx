import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));
let authState: { user: unknown; isAdmin: boolean; loading: boolean } = {
  user: null,
  isAdmin: false,
  loading: false,
};
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ ...authState, signIn }),
}));

const { default: Login } = await import("@/pages/Login");

beforeEach(() => {
  navigateMock.mockReset();
  signIn.mockReset().mockResolvedValue({ error: null });
  authState = { user: null, isAdmin: false, loading: false };
});

describe("Login page", () => {
  it("calls signIn with the entered email and password on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith("test@example.com", "secret123");
  });

  it("does not redirect while there is no authenticated user", () => {
    renderWithProviders(<Login />);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("redirects a non-admin user to /app once authenticated", () => {
    authState = { user: { id: "u1" }, isAdmin: false, loading: false };
    renderWithProviders(<Login />);
    expect(navigateMock).toHaveBeenCalledWith("/app", { replace: true });
  });

  it("redirects an admin user to the admin dashboard", () => {
    authState = { user: { id: "u1" }, isAdmin: true, loading: false };
    renderWithProviders(<Login />);
    expect(navigateMock).toHaveBeenCalledWith("/app/admin/dashboard", { replace: true });
  });

  it("does not redirect while auth state is still loading", () => {
    authState = { user: { id: "u1" }, isAdmin: false, loading: true };
    renderWithProviders(<Login />);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput.type).toBe("text");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock, dismiss: vi.fn() }),
}));

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

function TestConsumer() {
  const { signIn, signUp, signOut } = useAuth();
  return (
    <div>
      <button onClick={() => signIn("test@example.com", "wrongpass")}>do-sign-in</button>
      <button onClick={() => signUp("test@example.com", "pass1234", "Test User", "student")}>
        do-sign-up
      </button>
      <button onClick={() => signOut()}>do-sign-out</button>
    </div>
  );
}

function renderAuth() {
  return renderWithProviders(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  toastMock.mockReset();
  navigateMock.mockReset();
  supabaseMock.auth.getSession.mockReset().mockResolvedValue({ data: { session: null } });
  supabaseMock.auth.onAuthStateChange
    .mockReset()
    .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  supabaseMock.auth.signInWithPassword.mockReset();
  supabaseMock.auth.signUp.mockReset();
  supabaseMock.auth.signOut.mockReset();
});

describe("AuthContext.signIn", () => {
  it("shows a welcome toast on success (AUTH-LOGIN-01)", async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-in"));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Welcome back!" })
    );
  });

  it("shows the Supabase error message on invalid credentials (AUTH-LOGIN-02)", async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      error: new Error("Invalid login credentials"),
    });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-in"));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sign in failed",
        description: "Invalid login credentials",
        variant: "destructive",
      })
    );
  });
});

describe("AuthContext.signUp", () => {
  it("shows a confirmation toast on success (AUTH-REG-01)", async () => {
    supabaseMock.auth.signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-up"));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Sign up successful!" })
    );
  });

  it("surfaces Supabase's duplicate-email error (AUTH-REG-02)", async () => {
    supabaseMock.auth.signUp.mockResolvedValue({
      error: new Error("User already registered"),
    });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-up"));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sign up failed",
        description: "User already registered",
        variant: "destructive",
      })
    );
  });

  it("passes full name and member type through as user metadata", async () => {
    supabaseMock.auth.signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-up"));
    expect(supabaseMock.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        password: "pass1234",
        options: expect.objectContaining({
          data: { full_name: "Test User", member_type: "student" },
        }),
      })
    );
  });
});

describe("AuthContext.signOut", () => {
  it("shows a confirmation toast and navigates home on success", async () => {
    supabaseMock.auth.signOut.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-out"));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Signed out" }));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows an error toast and does not navigate on failure", async () => {
    supabaseMock.auth.signOut.mockResolvedValue({ error: new Error("network down") });
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText("do-sign-out"));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Sign out failed", description: "network down" })
    );
    expect(navigateMock).not.toHaveBeenCalledWith("/");
  });
});

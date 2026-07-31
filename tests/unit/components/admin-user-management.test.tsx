import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const confirmMock = vi.fn();
vi.mock("@/components/ConfirmDialog", () => ({ useConfirm: () => confirmMock }));

const { UserManagement } = await import("@/features/admin/components/UserManagement");

const users = [
  {
    id: "u1",
    full_name: "Jane Doe",
    email: "jane@example.com",
    avatar_url: null,
    created_at: "2026-01-01T00:00:00Z",
    status: "active",
  },
];

beforeEach(() => {
  supabaseMock.from.mockReset().mockReturnValue(queryResult(users));
  confirmMock.mockReset();
});

describe("UserManagement", () => {
  it("bans a user after the confirm dialog is accepted (ADMIN-USER-01)", async () => {
    confirmMock.mockResolvedValue(true);
    const statusBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) =>
      table === "profiles" ? statusBuilder : queryResult(users)
    );
    // First call (initial fetch) needs the users list; override just for that.
    supabaseMock.from.mockReturnValueOnce(queryResult(users));

    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    await screen.findByText("Jane Doe");
    await user.click(screen.getByRole("button", { name: "Open user actions" }));
    await user.click(await screen.findByText("Ban"));

    expect(confirmMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ban user" })
    );
    expect(statusBuilder.update).toHaveBeenCalledWith({ status: "banned" });
  });

  it("does not change status when the confirm dialog is declined", async () => {
    confirmMock.mockResolvedValue(false);
    const statusBuilder = queryResult(null);
    supabaseMock.from
      .mockReturnValueOnce(queryResult(users))
      .mockImplementation(() => statusBuilder);

    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    await screen.findByText("Jane Doe");
    await user.click(screen.getByRole("button", { name: "Open user actions" }));
    await user.click(await screen.findByText("Ban"));

    expect(statusBuilder.update).not.toHaveBeenCalled();
  });

  it("does not show a 'Ban' action for an already-banned user (ADMIN-USER-02 is prevented via the UI, not an error message)", async () => {
    supabaseMock.from.mockReturnValueOnce(
      queryResult([{ ...users[0], status: "banned" }])
    );

    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    await screen.findByText("Jane Doe");
    await user.click(screen.getByRole("button", { name: "Open user actions" }));

    expect(screen.queryByText("Ban")).not.toBeInTheDocument();
  });
});

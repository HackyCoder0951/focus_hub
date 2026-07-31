import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "u1@example.com" },
    profile: { full_name: "Jane", avatar_url: null },
  }),
}));

const { createPost } = vi.hoisted(() => ({ createPost: vi.fn() }));
vi.mock("@/features/feed/api/posts", () => ({
  fetchPostsPage: vi.fn(),
  createPost,
  updatePost: vi.fn(),
  softDeletePost: vi.fn(),
  uploadPostImage: vi.fn(),
  PAGE_SIZE: 10,
}));

const { default: CreatePost } = await import("@/features/feed/components/CreatePost");

beforeEach(() => {
  createPost.mockReset().mockResolvedValue(undefined);
});

describe("CreatePost", () => {
  it("shows the collapsed composer by default", () => {
    renderWithProviders(<CreatePost />);
    expect(screen.getByText("Share something…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Post" })).not.toBeInTheDocument();
  });

  it("expands the composer and disables Post while content is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);

    await user.click(screen.getByText("Share something…"));
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("enables Post once content is typed and calls createPost with the trimmed content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);

    await user.click(screen.getByText("Share something…"));
    const textarea = screen.getByPlaceholderText("Share something…");
    await user.type(textarea, "  hello world  ");

    const submit = screen.getByRole("button", { name: "Post" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", content: "hello world" })
    );
  });

  it("does not submit whitespace-only content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    await user.click(screen.getByText("Share something…"));
    await user.type(screen.getByPlaceholderText("Share something…"), "   ");
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("caps content at 1000 characters (FEED-POST-04)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    await user.click(screen.getByText("Share something…"));
    const textarea = screen.getByPlaceholderText("Share something…") as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute("maxLength", "1000");

    await user.click(textarea);
    await user.paste("a".repeat(1005));
    expect(textarea.value).toHaveLength(1000);
  });

  it("collapses the composer again on Cancel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatePost />);
    await user.click(screen.getByText("Share something…"));
    await user.type(screen.getByPlaceholderText("Share something…"), "draft");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("button", { name: "Post" })).not.toBeInTheDocument();
  });
});

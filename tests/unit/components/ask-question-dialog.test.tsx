import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: toastMock }));

const { createQuestion } = vi.hoisted(() => ({ createQuestion: vi.fn() }));
vi.mock("@/features/qa/api/questions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/qa/api/questions")>();
  return { ...actual, createQuestion };
});

const { AskQuestionDialog } = await import("@/features/qa/components/AskQuestionDialog");

beforeEach(() => {
  createQuestion.mockReset().mockResolvedValue({ id: 1 });
  toastMock.mockReset();
});

describe("AskQuestionDialog", () => {
  it("disables Post Question while title and body are empty", () => {
    renderWithProviders(<AskQuestionDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Post Question" })).toBeDisabled();
  });

  it("stays disabled when only the title is filled in", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AskQuestionDialog open={true} onOpenChange={() => {}} />);
    await user.type(screen.getByLabelText("Title"), "How do I use hooks?");
    expect(screen.getByRole("button", { name: "Post Question" })).toBeDisabled();
  });

  it("enables submit once both title and body are filled, and creates the question", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(<AskQuestionDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText("Title"), "How do I use hooks?");
    await user.type(screen.getByLabelText("Details"), "I'm confused about useEffect.");

    const submit = screen.getByRole("button", { name: "Post Question" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(createQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        title: "How do I use hooks?",
        body: "I'm confused about useEffect.",
      })
    );
  });

  it("caps the title at 150 characters and the body at 2000 (QA-POST-04)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AskQuestionDialog open={true} onOpenChange={() => {}} />);

    const title = screen.getByLabelText("Title") as HTMLInputElement;
    const body = screen.getByLabelText("Details") as HTMLTextAreaElement;
    expect(title).toHaveAttribute("maxLength", "150");
    expect(body).toHaveAttribute("maxLength", "2000");

    await user.click(title);
    await user.paste("a".repeat(160));
    expect(title.value).toHaveLength(150);

    await user.click(body);
    await user.paste("b".repeat(2010));
    expect(body.value).toHaveLength(2000);
  });

  it("normalizes a trailing tag draft (not yet committed via Enter) into tags on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AskQuestionDialog open={true} onOpenChange={() => {}} />);

    await user.type(screen.getByLabelText("Title"), "Title");
    await user.type(screen.getByLabelText("Details"), "Body");
    await user.type(screen.getByPlaceholderText(/Add up to 5 tags/), "React");
    await user.click(screen.getByRole("button", { name: "Post Question" }));

    expect(createQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ["react"] })
    );
  });
});

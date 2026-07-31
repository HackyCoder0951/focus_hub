import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen } from "../../test-utils";

let currentUser: { id: string } | null = { id: "u1" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: currentUser }),
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: toastMock }));

const { createAnswer } = vi.hoisted(() => ({ createAnswer: vi.fn() }));
vi.mock("@/features/qa/api/answers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/qa/api/answers")>();
  return { ...actual, createAnswer };
});

const { AnswerForm } = await import("@/features/qa/components/AnswerForm");

beforeEach(() => {
  currentUser = { id: "u1" };
  createAnswer.mockReset().mockResolvedValue({ id: 1 });
  toastMock.mockReset();
});

describe("AnswerForm", () => {
  it("disables Post Answer while the body is empty (QA-ANSWER validation)", () => {
    renderWithProviders(<AnswerForm questionId={1} />);
    expect(screen.getByRole("button", { name: "Post Answer" })).toBeDisabled();
  });

  it("enables submit once text is entered and creates the answer (QA-ANSWER-01)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnswerForm questionId={1} />);

    await user.type(screen.getByPlaceholderText("Write your answer..."), "Try useEffect.");
    const submit = screen.getByRole("button", { name: "Post Answer" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(createAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ questionId: 1, userId: "u1", body: "Try useEffect." })
    );
  });

  it("clears the textarea after a successful submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnswerForm questionId={1} />);
    const textarea = screen.getByPlaceholderText("Write your answer...");
    await user.type(textarea, "An answer");
    await user.click(screen.getByRole("button", { name: "Post Answer" }));

    await screen.findByRole("button", { name: "Post Answer" }); // wait a tick for mutation settle
    expect((textarea as HTMLTextAreaElement).value).toBe("");
  });

  it("shows a sign-in prompt and does not submit when there is no user (QA-ANSWER-02)", async () => {
    currentUser = null;
    const user = userEvent.setup();
    renderWithProviders(<AnswerForm questionId={1} />);

    await user.type(screen.getByPlaceholderText("Write your answer..."), "An answer");
    await user.click(screen.getByRole("button", { name: "Post Answer" }));

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Authentication required" })
    );
    expect(createAnswer).not.toHaveBeenCalled();
  });

  it("does not submit whitespace-only content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnswerForm questionId={1} />);
    await user.type(screen.getByPlaceholderText("Write your answer..."), "   ");
    expect(screen.getByRole("button", { name: "Post Answer" })).toBeDisabled();
  });
});

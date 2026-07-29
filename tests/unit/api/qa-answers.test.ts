import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchAnswers, createAnswer, updateAnswer, deleteAnswer, acceptAnswer } = await import(
  "@/features/qa/api/answers"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchAnswers", () => {
  it("filters by question, accepted answers first, then oldest-first", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchAnswers(1);
    expect(builder.eq).toHaveBeenCalledWith("question_id", 1);
    expect(builder.order).toHaveBeenCalledWith("is_accepted", { ascending: false });
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("returns an empty array when there is no data", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchAnswers(1)).toEqual([]);
  });
});

describe("createAnswer", () => {
  it("inserts a trimmed body against the correct question/user", async () => {
    const builder = queryResult({ id: 1 });
    supabaseMock.from.mockReturnValue(builder);
    await createAnswer({ questionId: 1, userId: "u1", body: "  answer text  " });
    expect(builder.insert).toHaveBeenCalledWith({
      question_id: 1,
      user_id: "u1",
      body: "answer text",
    });
  });
});

describe("updateAnswer / deleteAnswer", () => {
  it("updates the trimmed body by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateAnswer({ id: 1, body: "  edited  " });
    expect(builder.update).toHaveBeenCalledWith({ body: "edited" });
    expect(builder.eq).toHaveBeenCalledWith("id", 1);
  });

  it("deletes by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await deleteAnswer(1);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", 1);
  });
});

describe("acceptAnswer", () => {
  it("clears other accepted answers, sets the target accepted, and syncs the question's best_answer_id", async () => {
    const answersBuilder = queryResult(null);
    const questionsBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) =>
      table === "questions" ? questionsBuilder : answersBuilder
    );

    await acceptAnswer({ questionId: 10, answerId: 5 });

    // First call: clear other accepted answers for this question.
    expect(answersBuilder.update).toHaveBeenNthCalledWith(1, { is_accepted: false });
    expect(answersBuilder.eq).toHaveBeenCalledWith("question_id", 10);
    expect(answersBuilder.neq).toHaveBeenCalledWith("id", 5);

    // Second call: set the target answer accepted.
    expect(answersBuilder.update).toHaveBeenNthCalledWith(2, { is_accepted: true });
    expect(answersBuilder.eq).toHaveBeenCalledWith("id", 5);

    // Third: sync questions.best_answer_id.
    expect(questionsBuilder.update).toHaveBeenCalledWith({ best_answer_id: 5 });
    expect(questionsBuilder.eq).toHaveBeenCalledWith("id", 10);
  });
});

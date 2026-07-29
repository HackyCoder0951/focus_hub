import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } = await import(
  "@/features/qa/api/questions"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchQuestions", () => {
  it("remaps joined answers count and tag names", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([
        {
          id: 1,
          profiles: { id: "u1", full_name: "A", avatar_url: null },
          answers: [{ count: 4 }],
          question_tags: [{ tag_name: "react" }, { tag_name: "ts" }],
        },
      ])
    );
    const result = await fetchQuestions();
    expect(result[0].answer_count).toBe(4);
    expect(result[0].tags).toEqual(["react", "ts"]);
  });

  it("defaults answer_count to 0 and tags to [] when the joins are empty", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ id: 1, profiles: null, answers: null, question_tags: null }])
    );
    const result = await fetchQuestions();
    expect(result[0].answer_count).toBe(0);
    expect(result[0].tags).toEqual([]);
  });

  it("does not apply a category filter for 'All' or when omitted", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchQuestions({ category: "All" });
    expect(builder.eq).not.toHaveBeenCalledWith("category", expect.anything());
  });

  it("applies a category filter when given a specific category", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchQuestions({ category: "React" });
    expect(builder.eq).toHaveBeenCalledWith("category", "React");
  });

  it("applies a sanitized title/body OR search filter", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchQuestions({ search: "how (to) fetch%" });
    expect(builder.or).toHaveBeenCalledWith("title.ilike.%how  to  fetch%,body.ilike.%how  to  fetch%");
  });

  it("orders by created_at descending", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchQuestions();
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("createQuestion", () => {
  it("inserts a trimmed title/body against the questions table", async () => {
    const questionBuilder = queryResult({ id: 42 });
    supabaseMock.from.mockImplementation((table: string) =>
      table === "questions" ? questionBuilder : queryResult(null)
    );

    await createQuestion({
      userId: "u1",
      title: "  My Question  ",
      body: "  Body text  ",
      category: "React",
      tags: [],
    });

    expect(questionBuilder.insert).toHaveBeenCalledWith({
      user_id: "u1",
      title: "My Question",
      body: "Body text",
      category: "React",
    });
  });

  it("links normalized tags after creating the question", async () => {
    const questionBuilder = queryResult({ id: 42 });
    const tagsBuilder = queryResult(null);
    const questionTagsBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "questions") return questionBuilder;
      if (table === "tags") return tagsBuilder;
      if (table === "question_tags") return questionTagsBuilder;
      return queryResult(null);
    });

    await createQuestion({
      userId: "u1",
      title: "Q",
      body: "B",
      category: null,
      tags: ["React", "react", "  TypeScript "],
    });

    expect(tagsBuilder.upsert).toHaveBeenCalledWith(
      [{ name: "react" }, { name: "typescript" }],
      { onConflict: "name", ignoreDuplicates: true }
    );
    expect(questionTagsBuilder.upsert).toHaveBeenCalledWith(
      [
        { question_id: 42, tag_name: "react" },
        { question_id: 42, tag_name: "typescript" },
      ],
      { onConflict: "question_id,tag_name", ignoreDuplicates: true }
    );
  });

  it("skips tag linking entirely when there are no tags", async () => {
    const questionBuilder = queryResult({ id: 42 });
    supabaseMock.from.mockImplementation((table: string) =>
      table === "questions" ? questionBuilder : queryResult(null)
    );

    await createQuestion({ userId: "u1", title: "Q", body: "B", category: null, tags: [] });
    expect(supabaseMock.from).not.toHaveBeenCalledWith("tags");
    expect(supabaseMock.from).not.toHaveBeenCalledWith("question_tags");
  });
});

describe("updateQuestion / deleteQuestion", () => {
  it("updates title/body trimmed, targeting the correct id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateQuestion({ id: 1, title: "  T  ", body: "  B  " });
    expect(builder.update).toHaveBeenCalledWith({ title: "T", body: "B" });
    expect(builder.eq).toHaveBeenCalledWith("id", 1);
  });

  it("deletes the question by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await deleteQuestion(1);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", 1);
  });
});

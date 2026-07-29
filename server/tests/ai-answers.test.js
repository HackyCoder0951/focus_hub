// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { queryResult } from "./mocks/supabaseClient.js";

const SECRET = "test-jwt-secret-not-for-production";

const { supabaseMock, groqCreateMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
  groqCreateMock: vi.fn(),
}));

vi.mock("../supabaseClient.js", () => ({ supabase: supabaseMock }));
vi.mock("groq-sdk", () => ({
  default: class Groq {
    chat = { completions: { create: groqCreateMock } };
  },
}));

const { default: app } = await import("../server.js");

function authHeader(claims = { sub: "user-1" }) {
  return `Bearer ${jwt.sign(claims, SECRET)}`;
}

beforeEach(() => {
  supabaseMock.from.mockReset();
  groqCreateMock.mockReset();
});

describe("POST /api/ai-answers/generate", () => {
  it("returns 401 when there is no Authorization header", async () => {
    const res = await request(app)
      .post("/api/ai-answers/generate")
      .send({ question: "What is React?", questionId: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", "Bearer garbage")
      .send({ question: "What is React?", questionId: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 400 when question is missing", async () => {
    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", authHeader())
      .send({ questionId: 1 });
    expect(res.status).toBe(400);
  });

  it("returns 400 when questionId is missing", async () => {
    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", authHeader())
      .send({ question: "What is React?" });
    expect(res.status).toBe(400);
  });

  it("generates an answer via Groq and stores it, returning 200", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "React is a UI library." } }],
      model: "llama-3.1-8b-instant",
      usage: { total_tokens: 42 },
    });
    supabaseMock.from.mockReturnValue(
      queryResult({ id: 1, answer_text: "React is a UI library." })
    );

    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", authHeader({ sub: "user-1" }))
      .send({ question: "What is React?", questionId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.aiAnswer.answer_text).toBe("React is a UI library.");
  });

  it("returns 500 when the Supabase insert fails", async () => {
    groqCreateMock.mockResolvedValue({
      choices: [{ message: { content: "answer" } }],
      model: "m",
      usage: {},
    });
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "insert failed" }));

    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", authHeader())
      .send({ question: "q", questionId: 1 });
    expect(res.status).toBe(500);
  });

  it("returns 500 when the Groq call throws", async () => {
    groqCreateMock.mockRejectedValue(new Error("groq down"));
    const res = await request(app)
      .post("/api/ai-answers/generate")
      .set("Authorization", authHeader())
      .send({ question: "q", questionId: 1 });
    expect(res.status).toBe(500);
  });
});

describe("GET /api/ai-answers/:id", () => {
  it("returns the answer when found", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ id: 1, answer_text: "hi" }));
    const res = await request(app).get("/api/ai-answers/1");
    expect(res.status).toBe(200);
    expect(res.body.aiAnswer.answer_text).toBe("hi");
  });

  it("returns null (not a 500) when the row is not found (PGRST116)", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "PGRST116" }));
    const res = await request(app).get("/api/ai-answers/999");
    expect(res.status).toBe(200);
    expect(res.body.aiAnswer).toBeNull();
  });

  it("returns 500 for a real database error", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "OTHER", message: "db down" }));
    const res = await request(app).get("/api/ai-answers/1");
    expect(res.status).toBe(500);
  });
});

describe("GET /api/ai-answers/question/:id", () => {
  it("returns the answer for a question when found", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ id: 1, question_id: 5 }));
    const res = await request(app).get("/api/ai-answers/question/5");
    expect(res.status).toBe(200);
    expect(res.body.aiAnswer.question_id).toBe(5);
  });

  it("returns null when no AI answer exists yet for the question", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "PGRST116" }));
    const res = await request(app).get("/api/ai-answers/question/999");
    expect(res.status).toBe(200);
    expect(res.body.aiAnswer).toBeNull();
  });
});

describe("PATCH /api/ai-answers/:id/feedback", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .patch("/api/ai-answers/1/feedback")
      .send({ user_feedback_rating: 5 });
    expect(res.status).toBe(401);
  });

  it("returns 400 when the rating is not a number", async () => {
    const res = await request(app)
      .patch("/api/ai-answers/1/feedback")
      .set("Authorization", authHeader())
      .send({ user_feedback_rating: "great" });
    expect(res.status).toBe(400);
  });

  it("updates the rating and returns 200 for a valid number", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ id: 1, user_feedback_rating: 5 }));
    const res = await request(app)
      .patch("/api/ai-answers/1/feedback")
      .set("Authorization", authHeader())
      .send({ user_feedback_rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.aiAnswer.user_feedback_rating).toBe(5);
  });

  it("returns 500 when the update errors", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "fail" }));
    const res = await request(app)
      .patch("/api/ai-answers/1/feedback")
      .set("Authorization", authHeader())
      .send({ user_feedback_rating: 1 });
    expect(res.status).toBe(500);
  });
});

describe("GET /api/ai-answers/", () => {
  it("returns the health-check style message", async () => {
    const res = await request(app).get("/api/ai-answers/");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/AI Answers API/);
  });
});

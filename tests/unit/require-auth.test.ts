import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { requireAuth } from "../../server/requireAuth.js";

const SECRET = "test-jwt-secret-not-for-production";

function makeRes() {
  const res: { statusCode?: number; body?: unknown; status: (n: number) => typeof res; json: (b: unknown) => typeof res } =
    {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
  return res;
}

describe("requireAuth middleware", () => {
  it("rejects requests with no Authorization header", () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req as never, res as never, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid/garbage token", () => {
    const req = { headers: { authorization: "Bearer not-a-real-token" } };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req as never, res as never, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an expired token", () => {
    const token = jwt.sign({ sub: "user-1" }, SECRET, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req as never, res as never, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a token signed with the wrong secret", () => {
    const token = jwt.sign({ sub: "user-1" }, "wrong-secret");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req as never, res as never, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a valid token, attaches the decoded user, and calls next()", () => {
    const token = jwt.sign({ sub: "user-1", email: "user@example.com" }, SECRET);
    const req: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req as never, res as never, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBeUndefined();
    expect((req.user as { sub: string }).sub).toBe("user-1");
  });
});

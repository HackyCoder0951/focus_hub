// @vitest-environment node
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../server.js";

describe("GET /api/health", () => {
  it("returns ok status with a timestamp", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeTruthy();
  });

  it("echoes back an x-request-id header when provided", async () => {
    const res = await request(app).get("/api/health").set("x-request-id", "req-123");
    expect(res.body.requestId).toBe("req-123");
  });

  it("returns a null requestId when no header is given", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.requestId).toBeNull();
  });
});

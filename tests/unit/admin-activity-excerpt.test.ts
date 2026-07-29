import { describe, it, expect } from "vitest";
import { excerpt } from "@/features/admin/api/activity";

describe("excerpt", () => {
  it("returns short text unchanged", () => {
    expect(excerpt("hello")).toBe("hello");
  });

  it("returns an empty string for falsy input", () => {
    expect(excerpt("")).toBe("");
  });

  it("truncates text longer than the max length and appends an ellipsis", () => {
    const text = "a".repeat(100);
    const result = excerpt(text, 80);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBe(81); // 80 chars + ellipsis
  });

  it("trims trailing whitespace before appending the ellipsis", () => {
    const text = `${"a".repeat(79)}   more text`;
    const result = excerpt(text, 80);
    expect(result).not.toMatch(/\s…$/);
  });

  it("respects a custom max length", () => {
    const result = excerpt("hello world", 5);
    expect(result).toBe("hello…");
  });

  it("does not truncate text exactly at the max length", () => {
    const text = "a".repeat(80);
    expect(excerpt(text, 80)).toBe(text);
  });
});

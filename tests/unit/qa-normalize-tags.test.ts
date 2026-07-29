import { describe, it, expect } from "vitest";
import { normalizeTags } from "@/features/qa/api/questions";

describe("normalizeTags", () => {
  it("lowercases and slugifies whitespace", () => {
    expect(normalizeTags(["React Hooks"])).toEqual(["react-hooks"]);
  });

  it("trims surrounding whitespace before slugifying", () => {
    expect(normalizeTags(["  typescript  "])).toEqual(["typescript"]);
  });

  it("collapses internal runs of whitespace into a single hyphen", () => {
    expect(normalizeTags(["a   b"])).toEqual(["a-b"]);
  });

  it("drops empty/whitespace-only tags", () => {
    expect(normalizeTags(["", "   ", "valid"])).toEqual(["valid"]);
  });

  it("deduplicates case/whitespace-equivalent tags", () => {
    expect(normalizeTags(["React", "react", " react "])).toEqual(["react"]);
  });

  it("truncates tags longer than 30 characters", () => {
    const long = "a".repeat(40);
    const result = normalizeTags([long]);
    expect(result[0]).toHaveLength(30);
  });

  it("caps the result at 5 tags", () => {
    const tags = ["a", "b", "c", "d", "e", "f", "g"];
    expect(normalizeTags(tags)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("returns an empty array for an empty input", () => {
    expect(normalizeTags([])).toEqual([]);
  });
});

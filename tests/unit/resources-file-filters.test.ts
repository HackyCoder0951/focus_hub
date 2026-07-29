import { describe, it, expect } from "vitest";
import { matchesType, sortFiles } from "@/features/resources/hooks/useFiles";
import type { FileWithProfile } from "@/features/resources/lib/file-utils";

function makeFile(overrides: Partial<FileWithProfile>): FileWithProfile {
  return {
    id: "1",
    user_id: "u1",
    file_name: "doc.txt",
    file_type: "text/plain",
    file_size: 100,
    is_public: true,
    description: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as FileWithProfile;
}

describe("matchesType", () => {
  it("matches everything for 'all'", () => {
    expect(matchesType(makeFile({ file_name: "a.zip" }), "all")).toBe(true);
  });

  it("matches images", () => {
    expect(matchesType(makeFile({ file_type: "image/png", file_name: "a.png" }), "image")).toBe(true);
    expect(matchesType(makeFile({ file_type: "image/png", file_name: "a.png" }), "video")).toBe(false);
  });

  it("groups doc/sheet/slides under 'office'", () => {
    expect(matchesType(makeFile({ file_type: null, file_name: "a.docx" }), "office")).toBe(true);
    expect(matchesType(makeFile({ file_type: null, file_name: "a.xlsx" }), "office")).toBe(true);
    expect(matchesType(makeFile({ file_type: null, file_name: "a.pptx" }), "office")).toBe(true);
  });

  it("groups text/code under 'text'", () => {
    expect(matchesType(makeFile({ file_type: null, file_name: "a.md" }), "text")).toBe(true);
    expect(matchesType(makeFile({ file_type: null, file_name: "a.ts" }), "text")).toBe(true);
  });

  it("classifies unrecognized kinds as 'other'", () => {
    expect(matchesType(makeFile({ file_type: "application/zip", file_name: "a.zip" }), "other")).toBe(true);
    expect(matchesType(makeFile({ file_type: "image/png", file_name: "a.png" }), "other")).toBe(false);
  });
});

describe("sortFiles", () => {
  const older = makeFile({ file_name: "b.txt", created_at: "2026-01-01T00:00:00Z", file_size: 10 });
  const newer = makeFile({ file_name: "a.txt", created_at: "2026-02-01T00:00:00Z", file_size: 50 });

  it("sorts newest first", () => {
    expect(sortFiles(older, newer, "newest")).toBeGreaterThan(0);
    expect(sortFiles(newer, older, "newest")).toBeLessThan(0);
  });

  it("sorts oldest first", () => {
    expect(sortFiles(older, newer, "oldest")).toBeLessThan(0);
  });

  it("sorts by name ascending", () => {
    expect(sortFiles(newer, older, "name-asc")).toBeLessThan(0); // "a.txt" < "b.txt"
  });

  it("sorts by name descending", () => {
    expect(sortFiles(newer, older, "name-desc")).toBeGreaterThan(0);
  });

  it("sorts by size descending", () => {
    expect(sortFiles(newer, older, "size-desc")).toBeLessThan(0);
  });

  it("sorts by size ascending", () => {
    expect(sortFiles(older, newer, "size-asc")).toBeLessThan(0);
  });

  it("treats missing file_size as 0", () => {
    const noSize = makeFile({ file_size: null });
    expect(() => sortFiles(noSize, newer, "size-desc")).not.toThrow();
  });
});

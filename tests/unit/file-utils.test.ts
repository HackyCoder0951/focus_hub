import { describe, it, expect } from "vitest";
import {
  getExtension,
  getFileKind,
  isTextLike,
  canPreviewFile,
  formatFileSize,
} from "@/features/resources/lib/file-utils";

describe("getExtension", () => {
  it("returns the lowercased extension", () => {
    expect(getExtension("Report.PDF")).toBe("pdf");
  });

  it("returns the lowercased whole name when there is no dot", () => {
    expect(getExtension("README")).toBe("readme");
  });

  it("returns empty string for null/undefined", () => {
    expect(getExtension(null)).toBe("");
    expect(getExtension(undefined)).toBe("");
  });
});

describe("getFileKind", () => {
  it("detects images by mime type", () => {
    expect(getFileKind("image/png", "photo.png")).toBe("image");
  });

  it("detects pdf by extension when mime is missing", () => {
    expect(getFileKind(null, "notes.pdf")).toBe("pdf");
  });

  it("detects office docs by extension", () => {
    expect(getFileKind(null, "essay.docx")).toBe("doc");
    expect(getFileKind(null, "budget.xlsx")).toBe("sheet");
    expect(getFileKind(null, "deck.pptx")).toBe("slides");
  });

  it("detects code files before falling back to text", () => {
    expect(getFileKind(null, "index.ts")).toBe("code");
  });

  it("falls back to other for unknown types", () => {
    expect(getFileKind("application/octet-stream", "binary.bin")).toBe("other");
  });
});

describe("isTextLike", () => {
  it("is true for text mime types", () => {
    expect(isTextLike({ file_type: "text/plain", file_name: "a" })).toBe(true);
  });

  it("is true for known text extensions even without a text mime", () => {
    expect(isTextLike({ file_type: null, file_name: "notes.md" })).toBe(true);
  });

  it("is false for unrelated files", () => {
    expect(isTextLike({ file_type: "image/png", file_name: "a.png" })).toBe(false);
  });
});

describe("canPreviewFile", () => {
  it("allows preview for images, video, pdf, and text-like files", () => {
    expect(canPreviewFile({ file_type: "image/png", file_name: "a.png" })).toBe(true);
    expect(canPreviewFile({ file_type: "video/mp4", file_name: "a.mp4" })).toBe(true);
    expect(canPreviewFile({ file_type: null, file_name: "a.pdf" })).toBe(true);
    expect(canPreviewFile({ file_type: null, file_name: "a.txt" })).toBe(true);
  });

  it("disallows preview for other file kinds", () => {
    expect(canPreviewFile({ file_type: "application/zip", file_name: "a.zip" })).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("returns 0 Bytes for falsy or non-positive input", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(null)).toBe("0 Bytes");
    expect(formatFileSize(undefined)).toBe("0 Bytes");
    expect(formatFileSize(-5)).toBe("0 Bytes");
  });

  it("formats bytes, KB, MB, and GB", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatFileSize(2 * 1024 * 1024 * 1024)).toBe("2 GB");
  });
});

import { describe, it, expect } from "vitest";
import { percent, getMonthRange } from "@/features/admin/api/stats";

describe("percent", () => {
  it("computes a positive percent increase", () => {
    expect(percent(150, 100)).toBe(50);
  });

  it("computes a negative percent decrease", () => {
    expect(percent(50, 100)).toBe(-50);
  });

  it("returns 0 when both current and previous are 0", () => {
    expect(percent(0, 0)).toBe(0);
  });

  it("returns 100 when previous is 0 and current is positive", () => {
    expect(percent(10, 0)).toBe(100);
  });

  it("rounds to the nearest integer", () => {
    expect(percent(103, 100)).toBe(3);
  });
});

describe("getMonthRange", () => {
  it("returns a start/end pair one calendar month apart for offset 0", () => {
    const { start, end } = getMonthRange(0);
    const startDate = new Date(start);
    const endDate = new Date(end);
    expect(startDate.getDate()).toBe(1);
    expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    const monthDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    expect(monthDiff).toBe(1);
  });

  it("shifts the range back for negative offsets", () => {
    const current = getMonthRange(0);
    const previous = getMonthRange(-1);
    expect(new Date(previous.start).getTime()).toBeLessThan(new Date(current.start).getTime());
    expect(new Date(previous.end).getTime()).toBe(new Date(current.start).getTime());
  });
});

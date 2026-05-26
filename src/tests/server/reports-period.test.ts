import { describe, it, expect } from "vitest";
import { periodPresets } from "@/server/reports/queries";

function ymd(d: Date): [number, number, number] {
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

describe("periodPresets", () => {
  it("2026-05-26 → 本月 = 2026-05-01 到 2026-06-01", () => {
    const p = periodPresets(new Date(2026, 4, 26));
    expect(ymd(p.month.start)).toEqual([2026, 5, 1]);
    expect(ymd(p.month.end)).toEqual([2026, 6, 1]);
    expect(p.month.label).toBe("2026 年 5 月");
  });

  it("2026-05-26 → 本季 = 2026 Q2（4-7 月）", () => {
    const p = periodPresets(new Date(2026, 4, 26));
    expect(ymd(p.quarter.start)).toEqual([2026, 4, 1]);
    expect(ymd(p.quarter.end)).toEqual([2026, 7, 1]);
    expect(p.quarter.label).toBe("2026 年 Q2");
  });

  it("2026-05-26 → 本年 = 2026-01-01 到 2027-01-01", () => {
    const p = periodPresets(new Date(2026, 4, 26));
    expect(ymd(p.year.start)).toEqual([2026, 1, 1]);
    expect(ymd(p.year.end)).toEqual([2027, 1, 1]);
    expect(p.year.label).toBe("2026 年度");
  });

  it("2026-05-26 → 上年 = 2025-01-01 到 2026-01-01", () => {
    const p = periodPresets(new Date(2026, 4, 26));
    expect(ymd(p.lastYear.start)).toEqual([2025, 1, 1]);
    expect(ymd(p.lastYear.end)).toEqual([2026, 1, 1]);
    expect(p.lastYear.label).toBe("2025 年度");
  });

  it("Q1（1 月）边界", () => {
    const p = periodPresets(new Date(2026, 0, 15));
    expect(ymd(p.quarter.start)).toEqual([2026, 1, 1]);
    expect(ymd(p.quarter.end)).toEqual([2026, 4, 1]);
    expect(p.quarter.label).toBe("2026 年 Q1");
  });

  it("Q4（12 月）边界，本月 end 跨年", () => {
    const p = periodPresets(new Date(2026, 11, 31));
    expect(ymd(p.month.start)).toEqual([2026, 12, 1]);
    expect(ymd(p.month.end)).toEqual([2027, 1, 1]);
    expect(ymd(p.quarter.start)).toEqual([2026, 10, 1]);
    expect(ymd(p.quarter.end)).toEqual([2027, 1, 1]);
  });
});

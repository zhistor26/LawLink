import { describe, expect, it } from "vitest";

import { ensureSaveFilename } from "@/lib/lazycat/ensure-save-filename";

describe("ensureSaveFilename", () => {
  it("保留已有后缀", () => {
    expect(ensureSaveFilename("LawLink-案件导出-active-20260627.xlsx")).toBe(
      "LawLink-案件导出-active-20260627.xlsx"
    );
  });

  it("无后缀时补默认扩展名", () => {
    expect(ensureSaveFilename("LawLink-案件导出", ".xlsx")).toBe("LawLink-案件导出.xlsx");
  });

  it("空名回退", () => {
    expect(ensureSaveFilename("  ", ".xlsx")).toBe("download.xlsx");
  });
});

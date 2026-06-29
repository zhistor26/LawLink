import { describe, it, expect } from "vitest";

import { normalizeLazyCatPath } from "@/lib/lazycat/open-file";
import { detectSpreadsheetKind } from "@/lib/lazycat/detect-import-header";
import { IMPORT_COLUMNS } from "@/lib/imports/matter-import";

describe("normalizeLazyCatPath", () => {
  it("去掉 diskRoot 前缀并保证前导斜杠", () => {
    expect(normalizeLazyCatPath("/_lzc/files/home/docs/demo.xlsx")).toBe("/docs/demo.xlsx");
    expect(normalizeLazyCatPath("docs/demo.xlsx")).toBe("/docs/demo.xlsx");
    expect(normalizeLazyCatPath("/docs/demo.xlsx")).toBe("/docs/demo.xlsx");
  });

  it("解码 URL 编码路径", () => {
    expect(normalizeLazyCatPath(encodeURIComponent("/docs/案件.xlsx"))).toBe("/docs/案件.xlsx");
  });

  it("去掉末尾单点", () => {
    expect(normalizeLazyCatPath("/docs/demo.xlsx.")).toBe("/docs/demo.xlsx");
  });
});

describe("detectSpreadsheetKind", () => {
  it("识别导入模板表头", () => {
    const headers = IMPORT_COLUMNS.map((c) => (c.required ? `${c.header}*` : c.header));
    expect(detectSpreadsheetKind(headers)).toBe("import");
  });

  it("识别案件报表表头", () => {
    expect(detectSpreadsheetKind(["收案ID", "标题", "主办律师"])).toBe("report");
    expect(detectSpreadsheetKind(["所内案号", "案件状态"])).toBe("report");
  });

  it("未知表头", () => {
    expect(detectSpreadsheetKind(["列A", "列B"])).toBe("unknown");
  });
});

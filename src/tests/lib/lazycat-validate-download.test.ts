import { describe, expect, it } from "vitest";

import { assertDownloadBinary } from "@/lib/lazycat/validate-download";

describe("assertDownloadBinary", () => {
  it("接受 ZIP/xlsx 魔数 PK", () => {
    const buf = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]).buffer;
    expect(() => assertDownloadBinary(buf, "LawLink-案件导入模板.xlsx")).not.toThrow();
  });

  it("拒绝裸 XML 片段（用户解压后误以为是坏文件）", () => {
    const xml = `<?xml version="1.0"?><cp:coreProperties><dc:creator>LawLink</dc:creator></cp:coreProperties>`;
    const buf = new TextEncoder().encode(xml).buffer;
    expect(() => assertDownloadBinary(buf, "LawLink-案件导入模板.xlsx")).toThrow(/XML 文本/);
  });

  it("拒绝 HTML 登录页", () => {
    const buf = new TextEncoder().encode("<!DOCTYPE html><html><body>login</body></html>").buffer;
    expect(() => assertDownloadBinary(buf, "demo.xlsx")).toThrow(/登录页面/);
  });

  it("拒绝 JSON 错误", () => {
    const buf = new TextEncoder().encode('{"error":"无权访问"}').buffer;
    expect(() => assertDownloadBinary(buf, "demo.xlsx")).toThrow(/JSON/);
  });
});

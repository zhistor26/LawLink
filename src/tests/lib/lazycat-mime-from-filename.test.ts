import { describe, expect, it } from "vitest";

import { mimeTypeFromFilename, normalizeDownloadBlob } from "@/lib/lazycat/mime-from-filename";

describe("normalizeDownloadBlob", () => {
  it("xlsx 被误标 zip 时改回 spreadsheet MIME", () => {
    const wrong = new Blob([new Uint8Array([0x50, 0x4b])], { type: "application/zip" });
    const fixed = normalizeDownloadBlob(wrong, "LawLink-案件导入模板.xlsx");
    expect(fixed.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });

  it("归档 zip 保持 application/zip", () => {
    const zip = new Blob([new Uint8Array([0x50, 0x4b])], { type: "application/zip" });
    const out = normalizeDownloadBlob(zip, "LawLink-归档包.zip");
    expect(out.type).toBe("application/zip");
  });

  it("mimeTypeFromFilename 识别 xlsx", () => {
    expect(mimeTypeFromFilename("a.XLSX")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });
});

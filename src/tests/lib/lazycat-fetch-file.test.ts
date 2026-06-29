import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchLazyCatFileAsFile } from "@/lib/lazycat/open-file";

describe("fetchLazyCatFileAsFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("从 /_lzc/files/home 拉取并构造 File", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: async () => new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    } as Response);

    const file = await fetchLazyCatFileAsFile("/docs/LawLink-案件.xlsx", "fallback.xlsx");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/_lzc/files/home/docs/LawLink-案件.xlsx",
      { credentials: "include" }
    );
    expect(file.name).toBe("LawLink-案件.xlsx");
    expect(file.size).toBe(3);
  });

  it("支持带 diskRoot 前缀的 deep link 路径", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["x"], { type: "application/octet-stream" })
    } as Response);

    await fetchLazyCatFileAsFile("/_lzc/files/home/import/demo.xlsx", "demo.xlsx");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/_lzc/files/home/import/demo.xlsx",
      expect.any(Object)
    );
  });

  it("HTTP 失败时抛出错误", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404
    } as Response);

    await expect(fetchLazyCatFileAsFile("/missing.xlsx", "missing.xlsx")).rejects.toThrow(
      "无法从网盘读取文件（404）"
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchAndDownload, triggerBlobDownload } from "@/lib/lazycat/save-blob";

describe("triggerBlobDownload", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("创建 blob 链 anchor 并触发 click（inject hook 点）", async () => {
    const clickSpy = vi.fn();
    let anchor: HTMLAnchorElement | null = null;
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === "a") {
        anchor = el as HTMLAnchorElement;
        el.click = clickSpy;
      }
      return el;
    });

    await triggerBlobDownload(new Blob(["hello"], { type: "text/plain" }), "LawLink-测试.txt");

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(anchor?.href).toContain("blob:mock-url");
    expect(anchor?.download).toBe("LawLink-测试.txt");
  });

  it("延迟 revokeObjectURL", async () => {
    vi.useFakeTimers();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:delayed");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    await triggerBlobDownload(new Blob(["x"]), "a.bin");
    expect(revokeSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(revokeSpy).toHaveBeenCalledWith("blob:delayed");
  });
});

describe("fetchAndDownload", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetch 成功时走 blob 下载链", async () => {
    const zipHead = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: new Headers({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }),
      arrayBuffer: async () => zipHead.buffer
    } as Response);

    const clickSpy = vi.fn();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:ok");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === "a") el.click = clickSpy;
      return el;
    });

    await fetchAndDownload("/api/demo/export", "demo.xlsx");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/demo/export",
      expect.objectContaining({ credentials: "include" })
    );
    expect(clickSpy).toHaveBeenCalled();
  });

  it("HTTP 失败时抛出可读错误", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "无权限" })
    } as Response);

    await expect(fetchAndDownload("/api/forbidden", "x.xlsx")).rejects.toThrow("无权限");
  });

  it("非 JSON 错误响应使用状态码", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      }
    } as Response);

    await expect(fetchAndDownload("/api/broken", "x.xlsx")).rejects.toThrow("下载失败（500）");
  });
});

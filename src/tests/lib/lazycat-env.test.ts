import { afterEach, describe, expect, it, vi } from "vitest";

import { isLazyCatPickerReady, isLazyCatRuntime } from "@/lib/lazycat/env";

describe("isLazyCatRuntime", () => {
  const originalHostname = window.location.hostname;

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname: originalHostname }
    });
    vi.restoreAllMocks();
  });

  function setHostname(hostname: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname }
    });
  }

  it("heiyu.space 域名视为懒猫运行时", () => {
    setHostname("your-box-name.heiyu.space");
    expect(isLazyCatRuntime()).toBe(true);
  });

  it("lazycat.cloud 域名视为懒猫运行时", () => {
    setHostname("dev.example.lazycat.cloud");
    expect(isLazyCatRuntime()).toBe(true);
  });

  it("localhost 无 inject 时返回 false", () => {
    setHostname("localhost");
    expect(isLazyCatRuntime()).toBe(false);
  });

  it("已注册 lzc-file-picker 时视为懒猫运行时", () => {
    setHostname("localhost");
    vi.spyOn(customElements, "get").mockReturnValue(class {} as CustomElementConstructor);
    expect(isLazyCatRuntime()).toBe(true);
  });
});

describe("isLazyCatPickerReady", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("inject hook 就绪时返回 true", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname: "your-box-name.heiyu.space" }
    });
    vi.spyOn(customElements, "get").mockReturnValue(class {} as CustomElementConstructor);
    expect(isLazyCatPickerReady()).toBe(true);
  });

  it("仅有域名、无 inject 时返回 false", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { hostname: "your-box-name.heiyu.space" }
    });
    vi.spyOn(customElements, "get").mockReturnValue(undefined);
    const proto = HTMLInputElement.prototype as unknown as { click?: { __lzcHooked?: boolean } };
    if (proto.click?.__lzcHooked) {
      delete proto.click.__lzcHooked;
    }
    expect(isLazyCatPickerReady()).toBe(false);
  });
});

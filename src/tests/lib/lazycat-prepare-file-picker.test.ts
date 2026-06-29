import { describe, expect, it, afterEach } from "vitest";
import {
  prepareLazyCatFilePickerOpen,
  releaseLazyCatFilePickerLock
} from "@/lib/lazycat/prepare-file-picker";

describe("prepareLazyCatFilePickerOpen", () => {
  afterEach(() => {
    releaseLazyCatFilePickerLock();
  });

  it("解除 body pointer-events 锁定", () => {
    document.body.style.pointerEvents = "none";
    prepareLazyCatFilePickerOpen();
    expect(document.body.style.pointerEvents).toBe("auto");
  });
});

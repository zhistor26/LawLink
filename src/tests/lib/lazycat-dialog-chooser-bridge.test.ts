import { describe, expect, it } from "vitest";
import { isLazyCatChooserEventTarget } from "@/lib/lazycat/dialog-chooser-bridge";

describe("dialog-chooser-bridge", () => {
  it("识别懒猫 inject 选择层上的点击目标", () => {
    const overlay = document.createElement("div");
    overlay.className = "lzc-open-save-chooser";
    const button = document.createElement("button");
    button.textContent = "从本地打开";
    overlay.appendChild(button);
    document.body.appendChild(overlay);

    expect(isLazyCatChooserEventTarget(button)).toBe(true);
    expect(isLazyCatChooserEventTarget(document.body)).toBe(false);

    overlay.remove();
  });
});

import { clearBodyPointerEvents } from "@/lib/ui/clear-body-pointer-events";
import { LAZYCAT_CHOOSER_SELECTOR } from "@/lib/lazycat/dialog-chooser-bridge";

/** Dialog 内打开懒猫文件选择前调用，解除 Radix 对 body 的 pointer-events 锁定 */
export function prepareLazyCatFilePickerOpen() {
  if (typeof document === "undefined") return;
  clearBodyPointerEvents();
  document.body.style.setProperty("pointer-events", "auto", "important");
  document.querySelectorAll(LAZYCAT_CHOOSER_SELECTOR).forEach((node) => {
    if (node instanceof HTMLElement) {
      node.removeAttribute("aria-hidden");
      node.removeAttribute("inert");
      node.style.setProperty("pointer-events", "auto", "important");
    }
  });
}

/** 选择完成或取消后可由 inject 触发；此处仅清除强制解锁 */
export function releaseLazyCatFilePickerLock() {
  if (typeof document === "undefined") return;
  document.body.style.removeProperty("pointer-events");
}

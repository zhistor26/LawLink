/** 懒猫微服 LPK 运行时检测（浏览器端） */

function hasLazyCatPickerInject(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (typeof customElements !== "undefined" && customElements.get("lzc-file-picker")) {
      return true;
    }
    const proto = HTMLInputElement.prototype as unknown as { click?: { __lzcHooked?: boolean } };
    if (proto.click?.__lzcHooked) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** 是否在懒猫微服 LPK 环境中运行 */
export function isLazyCatRuntime(): boolean {
  if (typeof window === "undefined") return false;
  if (hasLazyCatPickerInject()) return true;
  const host = window.location.hostname;
  return host.endsWith(".heiyu.space") || host.endsWith(".lazycat.cloud");
}

/** inject / lzc-file-picker 是否已就绪（可 hook 文件选择与保存） */
export function isLazyCatPickerReady(): boolean {
  return isLazyCatRuntime() && hasLazyCatPickerInject();
}

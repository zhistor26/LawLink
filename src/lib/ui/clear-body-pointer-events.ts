/** Radix Dialog / Dropdown 偶发残留 body/html 锁定，统一清理 */
export function clearBodyPointerEvents() {
  if (typeof document === "undefined") return;
  for (const node of [document.documentElement, document.body]) {
    if (!node) continue;
    node.style.pointerEvents = "";
    node.removeAttribute("aria-hidden");
    node.removeAttribute("inert");
  }
}

/** 懒猫 inject 文件选择层（挂在 body 上，在 Radix Dialog 之外） */
export const LAZYCAT_CHOOSER_SELECTOR = ".lzc-open-save-chooser";

export function isLazyCatChooserEventTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(LAZYCAT_CHOOSER_SELECTOR);
}

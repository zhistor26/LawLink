"use client";

import { useSyncExternalStore } from "react";

import { isLazyCatRuntime } from "@/lib/lazycat/env";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return isLazyCatRuntime();
}

function getServerSnapshot() {
  return false;
}

/** 懒猫 LPK 内 Dialog/Sheet 须 modal=false，否则 inject 文件选择层无法点击 */
export function useLazyCatNonModalDialogs(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

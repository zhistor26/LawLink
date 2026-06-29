"use client";

import { HardDrive } from "lucide-react";

import { isLazyCatRuntime } from "@/lib/lazycat/env";

/** @deprecated 全局 hint 已移至 AppShell；LazyCatFileTrigger 自带局部 hint */
export function LazyCatDriveHint() {
  if (!isLazyCatRuntime()) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive className="h-3.5 w-3.5 shrink-0" />
      点击后可从本地或懒猫网盘选择
    </p>
  );
}

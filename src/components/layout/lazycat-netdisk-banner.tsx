"use client";

import { HardDrive } from "lucide-react";

import { isLazyCatRuntime } from "@/lib/lazycat/env";

/** 懒猫 LPK 环境下顶栏一次性提示 */
export function LazyCatNetdiskBanner() {
  if (!isLazyCatRuntime()) return null;

  return (
    <div className="border-b border-border/60 bg-muted/30 px-4 py-1.5 text-center text-[11px] text-muted-foreground sm:px-6">
      <span className="inline-flex items-center justify-center gap-1.5">
        <HardDrive className="h-3.5 w-3.5 shrink-0" />
        文件操作支持本地与懒猫网盘（上传可选网盘，下载可保存至网盘）
      </span>
    </div>
  );
}

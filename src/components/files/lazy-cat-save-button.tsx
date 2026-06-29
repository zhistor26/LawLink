"use client";

import { useState, type ReactNode } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { fetchAndDownload } from "@/lib/lazycat/save-blob";
import { isLazyCatRuntime } from "@/lib/lazycat/env";
import { cn } from "@/lib/utils";

type LazyCatSaveButtonProps = Omit<ButtonProps, "onClick"> & {
  filename: string;
  fetchUrl?: string;
  getBlob?: () => Promise<Blob>;
  children: ReactNode;
  showHint?: boolean;
};

/** 通过 fetch→Blob→blob URL→a.download 触发 inject 保存对话框；禁止 href 直链 API */
export function LazyCatSaveButton({
  filename,
  fetchUrl,
  getBlob,
  children,
  showHint = true,
  disabled,
  className,
  variant = "outline",
  ...buttonProps
}: LazyCatSaveButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const lazyCat = isLazyCatRuntime();

  const onClick = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      if (getBlob) {
        const blob = await getBlob();
        const { triggerBlobDownload } = await import("@/lib/lazycat/save-blob");
        await triggerBlobDownload(blob, filename);
      } else if (fetchUrl) {
        await fetchAndDownload(fetchUrl, filename);
      } else {
        throw new Error("LazyCatSaveButton 需要 fetchUrl 或 getBlob");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "下载失败");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        disabled={disabled || downloading}
        className={cn("gap-1.5", className)}
        onClick={onClick}
        {...buttonProps}
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {children}
      </Button>
      {showHint && lazyCat && (
        <span className="text-[11px] text-muted-foreground">
          点击后可保存至本地或懒猫网盘
        </span>
      )}
    </div>
  );
}

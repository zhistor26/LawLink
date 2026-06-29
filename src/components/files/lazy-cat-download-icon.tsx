"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { fetchAndDownload } from "@/lib/lazycat/save-blob";
import { cn } from "@/lib/utils";

type LazyCatDownloadIconProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  url: string;
  filename: string;
};

/** 图标按钮下载（fetch→Blob→inject），禁止 href 直链 API */
export function LazyCatDownloadIcon({
  url,
  filename,
  className,
  title = "下载",
  disabled,
  ...props
}: LazyCatDownloadIconProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      title={title}
      disabled={disabled || loading}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground hover:bg-popover hover:text-primary disabled:opacity-50",
        className
      )}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (loading) return;
        setLoading(true);
        try {
          await fetchAndDownload(url, filename);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "下载失败");
        } finally {
          setLoading(false);
        }
      }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

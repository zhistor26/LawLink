"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { fetchAndDownload } from "@/lib/lazycat/save-blob";
import { cn } from "@/lib/utils";

type LazyCatDownloadLinkProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> & {
  url: string;
  filename: string;
  children: ReactNode;
};

/** 链接样式下载按钮（fetch→Blob→inject） */
export function LazyCatDownloadLink({
  url,
  filename,
  children,
  className,
  disabled,
  ...props
}: LazyCatDownloadLinkProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn("inline-flex items-center gap-1.5 text-left", className)}
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
      {loading ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> : null}
      {!loading && <Download className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </button>
  );
}

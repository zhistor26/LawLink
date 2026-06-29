"use client";

import type { ReactNode } from "react";

import { LazyCatSaveButton } from "@/components/files/lazy-cat-save-button";

type ArchiveExportButtonProps = {
  matterId: string;
  /** 用于下载文件名，如所内案号 */
  fileLabel?: string;
  className?: string;
  children: ReactNode;
};

/** 归档 ZIP 导出（fetch→Blob→inject） */
export function ArchiveExportButton({
  matterId,
  fileLabel,
  className,
  children
}: ArchiveExportButtonProps) {
  const safeLabel = fileLabel?.replace(/[\\/:*?"<>|]/g, "-").trim();
  const filename = safeLabel ? `LawLink-归档-${safeLabel}.zip` : `LawLink-归档包.zip`;

  return (
    <LazyCatSaveButton
      fetchUrl={`/api/archive/${matterId}/export`}
      filename={filename}
      variant="ghost"
      size="sm"
      showHint={false}
      className={className}
    >
      {children}
    </LazyCatSaveButton>
  );
}

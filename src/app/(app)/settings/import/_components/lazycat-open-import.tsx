"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { fetchLazyCatFileAsFile } from "@/lib/lazycat/open-file";
import {
  detectSpreadsheetKind,
  readFirstRowHeaders
} from "@/lib/lazycat/detect-import-header";

type LazyCatOpenImportProps = {
  onFile: (file: File) => void;
  onClearQuery?: () => void;
};

/** 处理网盘 deep link：/settings/import?file=%u → 拉取 xlsx → 预览 */
export function LazyCatOpenImport({ onFile, onClearQuery }: LazyCatOpenImportProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledRef = useRef<string | null>(null);
  const fileParam = searchParams.get("file");

  useEffect(() => {
    if (!fileParam) return;
    if (handledRef.current === fileParam) return;
    handledRef.current = fileParam;

    let cancelled = false;

    (async () => {
      try {
        const file = await fetchLazyCatFileAsFile(fileParam, "LawLink-案件导入.xlsx");
        if (cancelled) return;

        const headers = await readFirstRowHeaders(await file.arrayBuffer());
        const kind = detectSpreadsheetKind(headers);

        if (kind === "report") {
          toast.error("此为多表报表文件，请使用案件列表「导出 Excel」导出的可导入格式");
          router.replace("/settings/import");
          return;
        }

        if (kind === "unknown") {
          toast.warning("未能识别表头格式，将尝试按导入模板解析");
        }

        onFile(file);
        toast.success(`已从网盘打开：${file.name}`);

        if (onClearQuery) {
          onClearQuery();
        } else {
          router.replace("/settings/import");
        }
      } catch (error) {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : "从网盘打开文件失败");
        router.replace("/settings/import");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileParam, onClearQuery, onFile, router]);

  if (!fileParam) return null;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      正在从懒猫网盘加载文件…
    </div>
  );
}

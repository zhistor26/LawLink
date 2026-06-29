"use client";

import { Suspense, useCallback, useState, useTransition } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LazyCatFileTrigger } from "@/components/files/lazy-cat-file-trigger";
import { LazyCatSaveButton } from "@/components/files/lazy-cat-save-button";
import {
  parseMatterImportAction,
  commitMatterImportAction,
  type ImportPreview,
  type ImportResult
} from "@/server/imports/actions";
import { LazyCatOpenImport } from "./lazycat-open-import";

function MatterImportContent() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsing, startParse] = useTransition();
  const [importing, startImport] = useTransition();
  const [fileInputKey, setFileInputKey] = useState(0);

  const onFile = useCallback((file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    startParse(async () => {
      try {
        const p = await parseMatterImportAction(fd);
        setPreview(p);
      } catch (e) {
        setPreview(null);
        toast.error(e instanceof Error ? e.message : "解析失败");
      }
    });
  }, []);

  const doImport = () => {
    if (!preview) return;
    const valid = preview.rows.filter((r) => r.valid).map((r) => ({ rowNo: r.rowNo, raw: r.raw }));
    if (valid.length === 0) {
      toast.error("没有可导入的有效行");
      return;
    }
    startImport(async () => {
      try {
        const res = await commitMatterImportAction({ rows: valid });
        setResult(res);
        setPreview(null);
        setFileInputKey((k) => k + 1);
        toast.success(`导入完成：成功 ${res.succeeded.length}，失败 ${res.failed.length}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "导入失败");
      }
    });
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setFileName("");
    setFileInputKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      <LazyCatOpenImport onFile={onFile} />

      <section className="ll-surface rounded-lg border border-border p-5">
        <header className="mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <h2 className="text-lg">案件批量导入</h2>
        </header>
        <p className="mb-4 text-[12px] text-muted-foreground">
          下载模板填写后上传 → 预览校验 → 确认导入。支持从本地或懒猫网盘选择 .xlsx 文件。
          <span className="mt-1 block text-[11px] text-muted-subtle">
            案件列表「导出 Excel」可保存至网盘；网盘右键该文件可用 LawLink 打开并导入。
          </span>
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <LazyCatSaveButton
            filename="LawLink-案件导入模板.xlsx"
            fetchUrl="/fixtures/lawlink-matter-import-template.xlsx"
            showHint={false}
          >
            下载模板
          </LazyCatSaveButton>

          <LazyCatFileTrigger
            key={fileInputKey}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={parsing}
            onFiles={(files) => onFile(files[0])}
          >
            <Button disabled={parsing} className="gap-1.5">
              {parsing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              上传并预览
            </Button>
          </LazyCatFileTrigger>

          {fileName && <span className="pb-1 text-[12px] text-muted-foreground">{fileName}</span>}
        </div>
      </section>

      {preview && (
        <section className="ll-surface rounded-lg border border-border p-5">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-medium">
              预览
              <span className="ml-2 text-[12px] font-normal text-muted-foreground">
                共 {preview.total} 行 · 可导入{" "}
                <span className="text-emerald-700">{preview.validCount}</span> · 有误{" "}
                <span className={preview.total - preview.validCount > 0 ? "text-destructive" : ""}>
                  {preview.total - preview.validCount}
                </span>
              </span>
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={reset}>
                取消
              </Button>
              <Button
                size="sm"
                onClick={doImport}
                disabled={importing || preview.validCount === 0}
                className="gap-1.5"
              >
                {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                确认导入 {preview.validCount} 行
              </Button>
            </div>
          </header>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="whitespace-nowrap px-2 py-1.5 font-medium">行</th>
                  <th className="whitespace-nowrap px-2 py-1.5 font-medium">校验</th>
                  {preview.columns.map((c) => (
                    <th key={c.key} className="whitespace-nowrap px-2 py-1.5 font-medium">
                      {c.header}
                      {c.required && <span className="text-destructive">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr
                    key={r.rowNo}
                    className={r.valid ? "border-b border-border" : "border-b border-border bg-destructive/5"}
                  >
                    <td className="px-2 py-1.5 font-mono text-muted-foreground">{r.rowNo}</td>
                    <td className="px-2 py-1.5">
                      {r.valid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-destructive"
                          title={r.errors.join("；")}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span className="max-w-[220px] truncate">{r.errors.join("；")}</span>
                        </span>
                      )}
                    </td>
                    {preview.columns.map((c) => (
                      <td key={c.key} className="whitespace-nowrap px-2 py-1.5">
                        {r.raw[c.key] || <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {result && (
        <section className="ll-surface rounded-lg border border-border p-5">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-medium">
              导入结果 · 成功 <span className="text-emerald-700">{result.succeeded.length}</span> · 失败{" "}
              <span className={result.failed.length > 0 ? "text-destructive" : ""}>{result.failed.length}</span>
            </h3>
            <Button variant="ghost" size="sm" onClick={reset}>
              再导入一批
            </Button>
          </header>

          {result.succeeded.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-[12px] text-muted-foreground">成功创建：</p>
              <ul className="space-y-0.5 text-[12px]">
                {result.succeeded.map((s) => (
                  <li key={s.rowNo} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                    <span className="font-mono text-muted-foreground">第{s.rowNo}行</span>
                    <span className="font-mono">{s.internalCode}</span>
                    {s.firmCaseNo && <span className="font-mono text-muted-foreground">{s.firmCaseNo}</span>}
                    <span className="truncate">{s.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.failed.length > 0 && (
            <div>
              <p className="mb-1 text-[12px] text-destructive">失败行：</p>
              <ul className="space-y-0.5 text-[12px]">
                {result.failed.map((f) => (
                  <li key={f.rowNo} className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span className="font-mono">第{f.rowNo}行</span>
                    <span>{f.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function MatterImportView() {
  return (
    <Suspense fallback={null}>
      <MatterImportContent />
    </Suspense>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { audit } from "@/server/audit";
import { createMatterFromImportRow } from "@/server/imports/create-matter-from-import";
import {
  IMPORT_COLUMNS,
  validateRow,
  type RawRow
} from "@/lib/imports/matter-import";

async function requireManager() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL_LAWYER") {
    throw new Error("仅管理员 / 主任律师可批量导入案件");
  }
  return session;
}

/** Excel 单元格值 → 字符串（日期统一格式化为 YYYY-MM-DD） */
function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "object") {
    // 富文本 / 公式结果
    const obj = value as { result?: unknown; text?: unknown; richText?: { text: string }[] };
    if (obj.richText) return obj.richText.map((r) => r.text).join("");
    if (obj.text !== undefined) return String(obj.text);
    if (obj.result !== undefined) return String(obj.result);
    return "";
  }
  return String(value).trim();
}

/** 解析上传的 xlsx → [{ rowNo, raw }]，rowNo 为 Excel 行号（含表头，从 2 起） */
async function readSheet(file: File): Promise<{ rowNo: number; raw: RawRow }[]> {
  const buf = Buffer.from(await file.arrayBuffer());
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("文件中没有工作表");

  // 表头 → 列索引（去掉必填星号，匹配 IMPORT_COLUMNS.header）
  const headerByIndex = new Map<number, string>(); // colIndex → field key
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = cellToString(cell.value).replace(/\*$/, "").trim();
    const col = IMPORT_COLUMNS.find((c) => c.header === text);
    if (col) headerByIndex.set(colNumber, col.key);
  });
  if (headerByIndex.size === 0) {
    throw new Error("未识别到表头，请使用下载的模板填写");
  }

  const rows: { rowNo: number; raw: RawRow }[] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const raw: RawRow = {};
    let hasAny = false;
    for (const [colIndex, key] of headerByIndex) {
      const v = cellToString(row.getCell(colIndex).value);
      if (v) hasAny = true;
      raw[key] = v;
    }
    if (hasAny) rows.push({ rowNo: r, raw });
  }
  return rows;
}

export interface ImportPreviewRow {
  rowNo: number;
  raw: RawRow;
  errors: string[];
  valid: boolean;
}

export interface ImportPreview {
  columns: { key: string; header: string; required: boolean }[];
  rows: ImportPreviewRow[];
  total: number;
  validCount: number;
}

/** 解析 + 校验（不写库），返回预览表 */
export async function parseMatterImportAction(formData: FormData): Promise<ImportPreview> {
  await requireManager();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("缺少文件");

  const parsed = await readSheet(file);
  if (parsed.length === 0) {
    throw new Error("未读取到数据行（请在模板第 2 行起填写，并删除示例行）");
  }

  // 预取主办律师邮箱，用于校验
  const emails = [
    ...new Set(parsed.map((p) => (p.raw.ownerEmail ?? "").trim().toLowerCase()).filter(Boolean))
  ];
  const lawyers = emails.length
    ? await prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true } })
    : [];
  const knownEmails = new Set(lawyers.map((l) => l.email.toLowerCase()));

  const rows: ImportPreviewRow[] = parsed.map(({ rowNo, raw }) => {
    const { errors, normalized } = validateRow(raw);
    const errs = [...errors];
    if (normalized?.ownerEmail && !knownEmails.has(normalized.ownerEmail.toLowerCase())) {
      errs.push(`主办律师邮箱「${normalized.ownerEmail}」未匹配到用户`);
    }
    return { rowNo, raw, errors: errs, valid: errs.length === 0 };
  });

  return {
    columns: IMPORT_COLUMNS.map((c) => ({ key: c.key, header: c.header, required: c.required })),
    rows,
    total: rows.length,
    validCount: rows.filter((r) => r.valid).length
  };
}

export interface ImportResult {
  succeeded: { rowNo: number; internalCode: string; firmCaseNo: string | null; title: string }[];
  failed: { rowNo: number; error: string }[];
}

/** 确认导入：逐行事务、失败不阻断，返回成功/失败清单 */
export async function commitMatterImportAction(input: {
  rows: { rowNo: number; raw: RawRow }[];
}): Promise<ImportResult> {
  const session = await requireManager();
  const succeeded: ImportResult["succeeded"] = [];
  const failed: ImportResult["failed"] = [];

  for (const { rowNo, raw } of input.rows) {
    try {
      const { errors, normalized } = validateRow(raw);
      if (!normalized) throw new Error(errors.join("；") || "行校验失败");
      const m = await createMatterFromImportRow(normalized, session.user.id);
      succeeded.push({
        rowNo,
        internalCode: m.internalCode,
        firmCaseNo: m.firmCaseNo,
        title: m.title
      });
    } catch (e) {
      failed.push({ rowNo, error: e instanceof Error ? e.message : "导入失败" });
    }
  }

  await audit({
    userId: session.user.id,
    action: "MATTER_IMPORT",
    targetType: "Matter",
    detail: { succeeded: succeeded.length, failed: failed.length }
  });

  revalidatePath("/matters");
  return { succeeded, failed };
}

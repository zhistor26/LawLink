import { IMPORT_COLUMNS } from "@/lib/imports/matter-import";

export type SpreadsheetKind = "import" | "report" | "unknown";

const REPORT_MARKERS = ["收案ID", "所内案号", "案件编号", "程序类型"];

/** 根据首行表头判断 xlsx 是导入模板还是案件报表 */
export function detectSpreadsheetKind(headers: string[]): SpreadsheetKind {
  const normalized = headers.map((h) => h.replace(/\*$/, "").trim()).filter(Boolean);
  if (normalized.length === 0) return "unknown";

  const importHeaders = new Set(IMPORT_COLUMNS.map((c) => c.header));
  const importMatches = normalized.filter((h) => importHeaders.has(h)).length;
  const requiredMatches = IMPORT_COLUMNS.filter((c) => c.required).filter((c) =>
    normalized.includes(c.header)
  ).length;

  if (requiredMatches >= 4 || importMatches >= 6) {
    return "import";
  }

  if (REPORT_MARKERS.some((marker) => normalized.includes(marker))) {
    return "report";
  }

  if (normalized.includes("标题") && !normalized.includes("客户名称")) {
    return "report";
  }

  return "unknown";
}

/** 从 xlsx ArrayBuffer 读取首行表头（客户端预检用） */
export async function readFirstRowHeaders(buffer: ArrayBuffer): Promise<string[]> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.worksheets[0];
  if (!sheet) return [];
  const row = sheet.getRow(1);
  const headers: string[] = [];
  row.eachCell((cell) => {
    const value = cell.value;
    if (value === null || value === undefined) return;
    headers.push(String(value).trim());
  });
  return headers;
}

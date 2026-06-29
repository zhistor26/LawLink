import fs from "fs";
import path from "path";

import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import {
  detectSpreadsheetKind,
  readFirstRowHeaders
} from "@/lib/lazycat/detect-import-header";
import { IMPORT_COLUMNS } from "@/lib/imports/matter-import";
import { IMPORT_SHEET_NAME } from "@/server/imports/template";

const FIXTURE_PATH = path.join(process.cwd(), "fixtures", "lawlink-matter-import-demo-80.xlsx");
const PUBLIC_FIXTURE_PATH = path.join(
  process.cwd(),
  "public",
  "fixtures",
  "lawlink-matter-import-demo-80.xlsx"
);

async function loadFixture(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(buffer));
  return { buffer, wb, sheet: wb.getWorksheet(IMPORT_SHEET_NAME) ?? wb.worksheets[0] };
}

describe("lawlink-matter-import-demo-80.xlsx fixture", () => {
  it("fixtures 与 public/fixtures 均存在且内容一致", () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    expect(fs.existsSync(PUBLIC_FIXTURE_PATH)).toBe(true);
    expect(fs.readFileSync(FIXTURE_PATH).equals(fs.readFileSync(PUBLIC_FIXTURE_PATH))).toBe(true);
  });

  it("Sheet 名、表头与 80 行数据符合导入规范", async () => {
    const { wb, sheet } = await loadFixture(FIXTURE_PATH);
    expect(wb.getWorksheet(IMPORT_SHEET_NAME)).toBeTruthy();
    expect(sheet).toBeTruthy();

    const expectedHeaders = IMPORT_COLUMNS.map((c) => (c.required ? `${c.header}*` : c.header));
    const actualHeaders = sheet!.getRow(1).values as (string | undefined)[];
    const trimmed = actualHeaders.slice(1).map((v) => String(v ?? "").trim());
    expect(trimmed).toEqual(expectedHeaders);

    const dataRowCount = sheet!.rowCount - 1;
    expect(dataRowCount).toBe(80);
  });

  it("readFirstRowHeaders + detectSpreadsheetKind 识别为可导入包", async () => {
    const { buffer } = await loadFixture(FIXTURE_PATH);
    const arrayBuffer = Uint8Array.from(buffer).buffer;
    const headers = await readFirstRowHeaders(arrayBuffer);
    expect(detectSpreadsheetKind(headers)).toBe("import");
  });

  it("含 5 行故意错误数据（缺证件号、无效类型等）", async () => {
    const { sheet } = await loadFixture(FIXTURE_PATH);
    const clientNameCol = IMPORT_COLUMNS.findIndex((c) => c.key === "clientName") + 1;
    const names: string[] = [];
    sheet!.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      names.push(String(row.getCell(clientNameCol).value ?? ""));
    });

    expect(names.filter((n) => n.startsWith("错误-"))).toHaveLength(5);
    expect(names.some((n) => n.includes("缺证件号"))).toBe(true);
    expect(names.some((n) => n.includes("无效类型"))).toBe(true);
  });

  it("约 60+ 行「办理中」用于首程序推断验收", async () => {
    const { sheet } = await loadFixture(FIXTURE_PATH);
    const statusCol = IMPORT_COLUMNS.findIndex((c) => c.key === "status") + 1;
    let inProgress = 0;
    sheet!.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (String(row.getCell(statusCol).value ?? "") === "办理中") inProgress++;
    });
    expect(inProgress).toBeGreaterThanOrEqual(60);
  });
});

import fs from "fs";
import path from "path";

import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { IMPORT_SHEET_NAME } from "@/server/imports/template";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "fixtures",
  "lawlink-matter-import-template.xlsx"
);

describe("lawlink-matter-import-template.xlsx", () => {
  it("存在且为有效 xlsx（PK 头 + 双 sheet）", async () => {
    expect(fs.existsSync(TEMPLATE_PATH)).toBe(true);
    const buf = fs.readFileSync(TEMPLATE_PATH);
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf.byteLength).toBeGreaterThan(4096);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Buffer.from(buf));
    expect(wb.getWorksheet(IMPORT_SHEET_NAME)).toBeTruthy();
    expect(wb.getWorksheet("填写说明")).toBeTruthy();
    expect(wb.getWorksheet(IMPORT_SHEET_NAME)!.rowCount).toBeGreaterThanOrEqual(2);
  });
});

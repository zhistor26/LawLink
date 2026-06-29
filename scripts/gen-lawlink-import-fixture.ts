/**
 * 生成 fixtures/lawlink-matter-import-demo-80.xlsx（80 行民事导入演示包）
 * 运行：npm run fixture:import-demo
 */
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

import { IMPORT_COLUMNS } from "../src/lib/imports/matter-import";
import { IMPORT_SHEET_NAME } from "../src/server/imports/template";
import { civilCauses } from "../prisma/seeds/causes-civil";

const OUTPUT = path.join(process.cwd(), "fixtures", "lawlink-matter-import-demo-80.xlsx");
const PUBLIC_OUTPUT = path.join(
  process.cwd(),
  "public",
  "fixtures",
  "lawlink-matter-import-demo-80.xlsx"
);

const LEVEL3_CAUSES = civilCauses.filter((c) => c.level === 3).map((c) => c.name);

/** 确定性伪随机（Mulberry32） */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function padId(n: number): string {
  return String(110101199001010000 + n).slice(0, 18);
}

function padCredit(n: number): string {
  return `91110000MA${String(100000 + n).padStart(6, "0")}1A`;
}

type RowData = Record<string, string>;

function buildValidRow(rand: () => number, index: number, duplicateOf?: RowData): RowData {
  if (duplicateOf) {
    return {
      ...duplicateOf,
      opposingName: `相对方公司${index}`,
      opposingIdNumber: padCredit(index + 5000),
      cause: pick(rand, LEVEL3_CAUSES),
      claimAmount: String(Math.floor(rand() * 500000) + 10000)
    };
  }

  const isCompany = rand() > 0.4;
  const status =
    index <= 60
      ? "办理中"
      : pick(rand, ["办理中", "已结案", "已归档"]);
  return {
    clientName: isCompany ? `演示客户企业${index}` : `演示客户${index}`,
    clientIdNumber: isCompany ? padCredit(index) : padId(index),
    clientType: isCompany ? "企业" : "个人",
    opposingName: `相对方${index}`,
    opposingIdNumber: padCredit(index + 1000),
    opposingType: rand() > 0.5 ? "企业" : "个人",
    category: "民商诉讼",
    status,
    ownerEmail: "admin@lawlink.local",
    intakeDate: `2026-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    cause: pick(rand, LEVEL3_CAUSES),
    claimAmount: String(Math.floor(rand() * 800000) + 5000),
    clientPhone: `138${String(10000000 + index).slice(0, 8)}`,
    jurisdiction: pick(rand, ["北京市朝阳区", "上海市浦东新区", "广州市天河区", "深圳市南山区"])
  };
}

function buildErrorRows(): RowData[] {
  return [
    {
      clientName: "错误-缺证件号",
      clientIdNumber: "",
      opposingName: "相对方A",
      opposingIdNumber: padCredit(9001),
      category: "民商诉讼",
      status: "办理中"
    },
    {
      clientName: "错误-无效类型",
      clientIdNumber: padId(9002),
      opposingName: "相对方B",
      opposingIdNumber: padCredit(9002),
      category: "不存在类型",
      status: "办理中"
    },
    {
      clientName: "错误-无效状态",
      clientIdNumber: padId(9003),
      opposingName: "相对方C",
      opposingIdNumber: padCredit(9003),
      category: "民商诉讼",
      status: "暂停中"
    },
    {
      clientName: "错误-无效邮箱",
      clientIdNumber: padId(9004),
      opposingName: "相对方D",
      opposingIdNumber: padCredit(9004),
      category: "民商诉讼",
      status: "办理中",
      ownerEmail: "not-an-email"
    },
    {
      clientName: "错误-无效日期",
      clientIdNumber: padId(9005),
      opposingName: "相对方E",
      opposingIdNumber: padCredit(9005),
      category: "民商诉讼",
      status: "办理中",
      intakeDate: "2026/13/40"
    }
  ];
}

async function main() {
  const rand = mulberry32(20260626);
  const rows: RowData[] = [];
  const duplicateSources: RowData[] = [];

  for (let i = 1; i <= 75; i++) {
    const duplicate = i <= 10 && duplicateSources.length > 0 ? pick(rand, duplicateSources) : undefined;
    const row = buildValidRow(rand, i, duplicate);
    rows.push(row);
    if (i <= 10) duplicateSources.push(row);
  }

  rows.push(...buildErrorRows());

  const wb = new ExcelJS.Workbook();
  wb.creator = "LawLink";
  wb.created = new Date();

  const sheet = wb.addWorksheet(IMPORT_SHEET_NAME);
  sheet.columns = IMPORT_COLUMNS.map((c) => ({
    header: c.required ? `${c.header}*` : c.header,
    key: c.key,
    width: Math.max(12, c.header.length * 2 + 4)
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  for (const row of rows) {
    sheet.addRow(IMPORT_COLUMNS.reduce<Record<string, string>>((acc, c) => {
      acc[c.key] = row[c.key] ?? "";
      return acc;
    }, {}));
  }

  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.mkdirSync(path.dirname(PUBLIC_OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, buffer);
  fs.writeFileSync(PUBLIC_OUTPUT, buffer);

  const inProgress = rows.filter((r) => r.status === "办理中").length;
  console.log(`Wrote ${rows.length} rows → ${OUTPUT}`);
  console.log(`Copied → ${PUBLIC_OUTPUT}`);
  console.log(`办理中: ${inProgress}, 错误行: 5, 重复客户池: 10`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

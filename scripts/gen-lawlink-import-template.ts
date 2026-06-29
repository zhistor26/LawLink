/**
 * 生成 fixtures + public 下的案件导入模板 xlsx（与 API 同源逻辑）
 * 运行：npm run fixture:import-template
 */
import fs from "fs";
import path from "path";

import { buildMatterImportTemplate } from "../src/server/imports/template";

const OUTPUT = path.join(process.cwd(), "fixtures", "lawlink-matter-import-template.xlsx");
const PUBLIC_OUTPUT = path.join(
  process.cwd(),
  "public",
  "fixtures",
  "lawlink-matter-import-template.xlsx"
);

async function main() {
  const buffer = await buildMatterImportTemplate();
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error("模板不是有效 ZIP/xlsx（缺少 PK 头）");
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.mkdirSync(path.dirname(PUBLIC_OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, buffer);
  fs.writeFileSync(PUBLIC_OUTPUT, buffer);

  console.log(`Wrote template (${buffer.byteLength} bytes) → ${OUTPUT}`);
  console.log(`Copied → ${PUBLIC_OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * 灌入工作台展示用 demo 案件（复杂样本 + 开庭/期限/财务/收案）
 *
 * 用法：
 *   npm run seed:demo
 *   npm run seed:demo -- --force
 *   DEMO_OWNER_EMAIL=xiaozhiqaq@lazycat.local npm run seed:demo
 */
import { PrismaClient } from "@prisma/client";

import { seedShowcaseDemo } from "../prisma/seeds/v23-demo-matters";

const prisma = new PrismaClient();

seedShowcaseDemo(prisma)
  .catch((error) => {
    console.error("✗ Demo seed 失败：", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

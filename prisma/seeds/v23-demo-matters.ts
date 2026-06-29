/**
 * 工作台 / 案件列表 / 财务图表展示用 demo 数据。
 * 仅通过 SEED_DEMO_MATTERS=1 或 npm run seed:demo 触发，不绑 SEED_ON_START。
 */
import bcrypt from "bcryptjs";
import type { MatterCategory, PrismaClient } from "@prisma/client";

import { validateRow, type RawRow } from "../../src/lib/imports/matter-import";
import { createMatterFromImportRow } from "../../src/server/imports/create-matter-from-import";

const MARKER_KEY = "demo_showcase_v1";

function padId(n: number): string {
  return String(110101199001010000 + n).slice(0, 18);
}

function padCredit(n: number): string {
  return `91110000MA${String(100000 + n).padStart(6, "0")}1A`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function atHour(base: Date, hour: number, minute = 0): Date {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function buildDemoRows(ownerEmail: string): RawRow[] {
  return [
    {
      clientName: "北京华创智联科技有限公司",
      clientIdNumber: padCredit(1001),
      clientType: "企业",
      opposingName: "深圳前海供应链管理有限公司",
      opposingIdNumber: padCredit(2001),
      opposingType: "企业",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(45),
      cause: "买卖合同纠纷",
      claimAmount: "12800000",
      clientPhone: "13800138001",
      jurisdiction: "北京市朝阳区"
    },
    {
      clientName: "盛达国际物流股份有限公司",
      clientIdNumber: padCredit(1002),
      clientType: "企业",
      opposingName: "城建集团第三工程局",
      opposingIdNumber: padCredit(2002),
      opposingType: "企业",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(62),
      cause: "建设工程施工合同纠纷",
      claimAmount: "38500000",
      clientPhone: "13900139002",
      jurisdiction: "上海市浦东新区"
    },
    {
      clientName: "张明",
      clientIdNumber: padId(1003),
      clientType: "个人",
      opposingName: "李芳",
      opposingIdNumber: padId(2003),
      opposingType: "个人",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(18),
      cause: "离婚纠纷",
      claimAmount: "5600000",
      clientPhone: "13700137003",
      jurisdiction: "广州市天河区"
    },
    {
      clientName: "王某某",
      clientIdNumber: padId(1004),
      clientType: "个人",
      opposingName: "某市人民检察院（公诉）",
      opposingIdNumber: "—",
      opposingType: "企业",
      category: "刑事诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(30),
      cause: "合同诈骗罪",
      claimAmount: "",
      clientPhone: "13600136004",
      jurisdiction: "深圳市南山区"
    },
    {
      clientName: "绿源环保科技有限公司",
      clientIdNumber: padCredit(1005),
      clientType: "企业",
      opposingName: "某区生态环境局",
      opposingIdNumber: padCredit(9005),
      opposingType: "企业",
      category: "行政诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(25),
      cause: "行政处罚",
      claimAmount: "3200000",
      clientPhone: "13500135005",
      jurisdiction: "杭州市西湖区"
    },
    {
      clientName: "陈磊",
      clientIdNumber: padId(1006),
      clientType: "个人",
      opposingName: "星链互联网科技（北京）有限公司",
      opposingIdNumber: padCredit(2006),
      opposingType: "企业",
      category: "劳动仲裁",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(12),
      cause: "劳动合同纠纷",
      claimAmount: "286000",
      clientPhone: "13400134006",
      jurisdiction: "北京市海淀区"
    },
    {
      clientName: "汇信资本合伙企业",
      clientIdNumber: padCredit(1007),
      clientType: "企业",
      opposingName: "远洋贸易集团",
      opposingIdNumber: padCredit(2007),
      opposingType: "企业",
      category: "商事仲裁",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(40),
      cause: "国际货物买卖合同纠纷",
      claimAmount: "15600000",
      clientPhone: "13300133007",
      jurisdiction: "中国国际经济贸易仲裁委员会"
    },
    {
      clientName: "智云数据股份有限公司",
      clientIdNumber: padCredit(1008),
      clientType: "企业",
      opposingName: "—",
      opposingIdNumber: padCredit(8008),
      opposingType: "企业",
      category: "非诉项目",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(20),
      cause: "数据合规专项",
      claimAmount: "980000",
      clientPhone: "13200132008",
      jurisdiction: "北京市"
    },
    {
      clientName: "东方控股集团有限公司",
      clientIdNumber: padCredit(1009),
      clientType: "企业",
      opposingName: "—",
      opposingIdNumber: padCredit(9009),
      opposingType: "企业",
      category: "常年顾问",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(90),
      cause: "集团合规顾问",
      claimAmount: "1200000",
      clientPhone: "13100131009",
      jurisdiction: "上海市"
    },
    {
      clientName: "新锐生物医药有限公司",
      clientIdNumber: padCredit(1010),
      clientType: "企业",
      opposingName: "竞品制药公司",
      opposingIdNumber: padCredit(2010),
      opposingType: "企业",
      category: "法律专项",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(8),
      cause: "专利侵权维权",
      claimAmount: "2200000",
      clientPhone: "13000130010",
      jurisdiction: "苏州市"
    },
    {
      clientName: "赵建国",
      clientIdNumber: padId(1011),
      clientType: "个人",
      opposingName: "某房地产开发公司",
      opposingIdNumber: padCredit(2011),
      opposingType: "企业",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(5),
      cause: "房屋买卖合同纠纷",
      claimAmount: "890000",
      clientPhone: "13811138111",
      jurisdiction: "成都市武侯区"
    },
    {
      clientName: "蓝海餐饮管理公司",
      clientIdNumber: padCredit(1012),
      clientType: "企业",
      opposingName: "加盟商张某",
      opposingIdNumber: padId(2012),
      opposingType: "个人",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(15),
      cause: "特许经营合同纠纷",
      claimAmount: "450000",
      clientPhone: "13822238222",
      jurisdiction: "武汉市江汉区"
    },
    {
      clientName: "刘洋",
      clientIdNumber: padId(1013),
      clientType: "个人",
      opposingName: "某网络借贷平台",
      opposingIdNumber: padCredit(2013),
      opposingType: "企业",
      category: "民商诉讼",
      status: "已结案",
      ownerEmail,
      intakeDate: daysAgo(120),
      cause: "民间借贷纠纷",
      claimAmount: "150000",
      clientPhone: "13833338333",
      jurisdiction: "南京市鼓楼区"
    },
    {
      clientName: "恒信制造有限公司",
      clientIdNumber: padCredit(1014),
      clientType: "企业",
      opposingName: "设备供应商",
      opposingIdNumber: padCredit(2014),
      opposingType: "企业",
      category: "民商诉讼",
      status: "已归档",
      ownerEmail,
      intakeDate: daysAgo(400),
      cause: "产品质量纠纷",
      claimAmount: "760000",
      clientPhone: "13844448444",
      jurisdiction: "天津市滨海新区"
    },
    {
      clientName: "周婷",
      clientIdNumber: padId(1015),
      clientType: "个人",
      opposingName: "某医疗美容机构",
      opposingIdNumber: padCredit(2015),
      opposingType: "企业",
      category: "民商诉讼",
      status: "办理中",
      ownerEmail,
      intakeDate: daysAgo(3),
      cause: "医疗损害责任纠纷",
      claimAmount: "380000",
      clientPhone: "13855558555",
      jurisdiction: "重庆市渝中区"
    }
  ];
}

async function ensureColleague(
  prisma: PrismaClient,
  email: string,
  name: string
): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return existing.id;
  const passwordHash = await bcrypt.hash("DemoLawyer!2026", 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "LAWYER", active: true },
    select: { id: true }
  });
  return user.id;
}

async function resolveOwner(prisma: PrismaClient, preferredEmail: string) {
  let owner = await prisma.user.findFirst({
    where: { email: { equals: preferredEmail, mode: "insensitive" } },
    select: { id: true, email: true, name: true }
  });
  if (!owner) {
    owner = await prisma.user.findFirst({
      where: { role: "ADMIN", active: true },
      select: { id: true, email: true, name: true }
    });
  }
  if (!owner) {
    throw new Error("未找到可用用户，请先运行 prisma db seed 创建管理员");
  }
  return owner;
}

export async function seedShowcaseDemo(prisma: PrismaClient, options?: { force?: boolean; ownerEmail?: string }) {
  const force = options?.force ?? process.argv.includes("--force");
  const preferredEmail =
    options?.ownerEmail ?? process.env.DEMO_OWNER_EMAIL ?? "xiaozhiqaq@lazycat.local";

  const marker = await prisma.systemSetting.findUnique({ where: { key: MARKER_KEY } });
  if (marker && !force) {
    console.log(`- Demo 展示数据已存在（${MARKER_KEY}），跳过。加 --force 可重建。`);
    return;
  }

  if (marker && force) {
    const prev = marker.value as { matterIds?: string[]; intakeIds?: string[] } | null;
    if (prev?.matterIds?.length) {
      await prisma.matter.deleteMany({ where: { id: { in: prev.matterIds } } });
    }
    if (prev?.intakeIds?.length) {
      await prisma.intake.deleteMany({ where: { id: { in: prev.intakeIds } } });
    }
    await prisma.systemSetting.delete({ where: { key: MARKER_KEY } });
    console.log("- 已清除旧 demo 数据");
  }

  const owner = await resolveOwner(prisma, preferredEmail);
  console.log(`→ 主办律师：${owner.name} <${owner.email}>`);

  await ensureColleague(prisma, "zhang.lawyer@lawlink.local", "张慧律师");
  await ensureColleague(prisma, "li.lawyer@lawlink.local", "李强律师");

  const matterIds: string[] = [];
  const activeProcedureIds: string[] = [];

  for (const raw of buildDemoRows(owner.email)) {
    const { errors, normalized } = validateRow(raw);
    if (!normalized) {
      console.warn(`  ! 跳过无效行：${errors.join("；")}`);
      continue;
    }
    const matter = await createMatterFromImportRow(normalized, owner.id);
    matterIds.push(matter.id);
    if (matter.status === "IN_PROGRESS") {
      const proc = await prisma.matterProcedure.findFirst({
        where: { matterId: matter.id, order: 1 },
        select: { id: true }
      });
      if (proc) activeProcedureIds.push(proc.id);
    }
    console.log(`  ✓ ${matter.internalCode} ${matter.title}`);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const hearingPlans = [
    { procIdx: 0, dayOffset: 1, hour: 9, title: "一审开庭", room: "第三法庭" },
    { procIdx: 1, dayOffset: 3, hour: 14, title: "证据交换", room: "调解室 A" },
    { procIdx: 2, dayOffset: 5, hour: 10, title: "离婚案件开庭", room: "家事法庭" },
    { procIdx: 4, dayOffset: 6, hour: 15, title: "行政诉讼预备庭", room: "行政审判庭" }
  ];

  for (const plan of hearingPlans) {
    const procedureId = activeProcedureIds[plan.procIdx];
    if (!procedureId) continue;
    await prisma.hearing.create({
      data: {
        procedureId,
        title: plan.title,
        room: plan.room,
        startsAt: atHour(addDays(today, plan.dayOffset), plan.hour),
        judge: "王法官"
      }
    });
  }

  const deadlinePlans = [
    { procIdx: 0, dayOffset: 0, title: "举证期限届满", category: "EVIDENCE" as const },
    { procIdx: 1, dayOffset: 2, title: "上诉状提交截止", category: "APPEAL" as const },
    { procIdx: 3, dayOffset: 4, title: "取保候审申请补正", category: "CUSTOM" as const },
    { procIdx: 5, dayOffset: 6, title: "仲裁答辩期", category: "CUSTOM" as const },
    { procIdx: 8, dayOffset: 1, title: "顾问服务报告提交", category: "CUSTOM" as const }
  ];

  for (const plan of deadlinePlans) {
    const procedureId = activeProcedureIds[plan.procIdx];
    if (!procedureId) continue;
    await prisma.deadline.create({
      data: {
        procedureId,
        title: plan.title,
        category: plan.category,
        dueAt: atHour(addDays(today, plan.dayOffset), 17),
        basis: "demo showcase"
      }
    });
  }

  const feePlans = [
    { monthOffset: 0, received: 85000, receivable: 120000 },
    { monthOffset: 1, received: 62000, receivable: 90000 },
    { monthOffset: 2, received: 98000, receivable: 110000 },
    { monthOffset: 3, received: 45000, receivable: 80000 },
    { monthOffset: 4, received: 73000, receivable: 95000 },
    { monthOffset: 5, received: 56000, receivable: 70000 }
  ];

  for (let i = 0; i < feePlans.length; i++) {
    const plan = feePlans[i];
    const matterId = matterIds[i % matterIds.length];
    const occurredAt = new Date(now.getFullYear(), now.getMonth() - plan.monthOffset, 15);
    await prisma.feeEntry.create({
      data: {
        matterId,
        type: "RECEIVED",
        amount: plan.received,
        occurredAt,
        recordedById: owner.id,
        note: "demo 实收"
      }
    });
    await prisma.feeEntry.create({
      data: {
        matterId,
        type: "RECEIVABLE",
        amount: plan.receivable,
        occurredAt,
        recordedById: owner.id,
        note: "demo 应收"
      }
    });
  }

  const intakeIds: string[] = [];
  const intakeSeeds: {
    title: string;
    category: MatterCategory;
    claimAmount: number;
    description: string;
  }[] = [
    {
      title: "某新能源车企产品责任潜在诉讼咨询",
      category: "CIVIL_COMMERCIAL",
      claimAmount: 5000000,
      description: "客户收到消费者集体投诉，需评估是否进入诉讼及证据固定方案。"
    },
    {
      title: "跨境并购目标公司法律尽调（第二阶段）",
      category: "NON_LITIGATION",
      claimAmount: 680000,
      description: "买方委托对目标公司劳动、知识产权、环保合规进行补充尽调。"
    },
    {
      title: "员工股权激励纠纷前期评估",
      category: "LABOR_ARBITRATION",
      claimAmount: 420000,
      description: "核心技术人员就期权兑现争议，拟启动劳动仲裁。"
    }
  ];

  for (const seed of intakeSeeds) {
    const intake = await prisma.intake.create({
      data: {
        title: seed.title,
        category: seed.category,
        status: "PENDING_CONFIRMATION",
        description: seed.description,
        claimAmount: seed.claimAmount,
        receivedAt: addDays(now, -Math.floor(Math.random() * 5 + 1)),
        ownerUserId: owner.id,
        createdById: owner.id,
        jurisdiction: "北京市"
      },
      select: { id: true }
    });
    intakeIds.push(intake.id);
  }

  await prisma.systemSetting.upsert({
    where: { key: MARKER_KEY },
    create: {
      key: MARKER_KEY,
      value: {
        seededAt: new Date().toISOString(),
        ownerEmail: owner.email,
        matterIds,
        intakeIds
      }
    },
    update: {
      value: {
        seededAt: new Date().toISOString(),
        ownerEmail: owner.email,
        matterIds,
        intakeIds
      }
    }
  });

  console.log(
    `\n✓ Demo 展示数据就绪：${matterIds.length} 案件 · ${intakeIds.length} 待确认收案 · ${hearingPlans.length} 近期开庭 · ${deadlinePlans.length} 近 7 日期限`
  );
}

/** prisma/seed 兼容入口 */
export async function seedV23DemoMatters(prisma: PrismaClient) {
  await seedShowcaseDemo(prisma);
}

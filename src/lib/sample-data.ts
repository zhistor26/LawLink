import type { ConflictHit, IntakeSummary, MatterSummary } from "@/types/domain";

export const dashboardStats = [
  { title: "办理中案件", value: 18 },
  { title: "待确认收案", value: 5 },
  { title: "本周开庭/期限", value: 7 },
  { title: "本月实收", value: 286000 }
];

export const intakes: IntakeSummary[] = [
  {
    id: "I-2026-001",
    title: "某建设工程合同纠纷咨询",
    clientName: "上海青石建设有限公司",
    opponentName: "华东置业集团有限公司",
    matterType: "LITIGATION",
    causeOfAction: "建设工程施工合同纠纷",
    status: "PENDING_CONFIRMATION",
    receivedAt: "2026-05-18",
    owner: "叶森",
    conflictSeverity: "HIGH"
  },
  {
    id: "I-2026-002",
    title: "股权转让专项法律服务",
    clientName: "杭州明远科技有限公司",
    opponentName: "自然人股东王某",
    matterType: "NON_LITIGATION",
    causeOfAction: "股权转让",
    status: "INTAKE",
    receivedAt: "2026-05-20",
    owner: "陈律师",
    conflictSeverity: "LOW"
  }
];

export const matters: MatterSummary[] = [
  {
    id: "M-2026-015",
    caseNumber: "(2026)沪0105民初1288号",
    title: "青石建设诉华东置业建设工程合同纠纷",
    clientName: "上海青石建设有限公司",
    matterType: "LITIGATION",
    status: "IN_PROGRESS",
    causeOfAction: "建设工程施工合同纠纷",
    court: "上海市长宁区人民法院",
    owner: "叶森",
    nextAction: "提交补充证据目录",
    nextActionAt: "2026-05-25",
    receivable: 180000,
    received: 120000
  },
  {
    id: "M-2026-011",
    caseNumber: "LL-2026-N-011",
    title: "明远科技股权转让专项",
    clientName: "杭州明远科技有限公司",
    matterType: "NON_LITIGATION",
    status: "IN_PROGRESS",
    causeOfAction: "股权转让",
    owner: "陈律师",
    nextAction: "审阅交易文件第二稿",
    nextActionAt: "2026-05-27",
    receivable: 80000,
    received: 40000
  },
  {
    id: "M-2026-006",
    caseNumber: "(2026)浙0106民初992号",
    title: "劳动争议仲裁后一审",
    clientName: "林某",
    matterType: "LITIGATION",
    status: "CLOSED",
    causeOfAction: "劳动合同纠纷",
    court: "杭州市西湖区人民法院",
    owner: "叶森",
    nextAction: "整理归档材料",
    nextActionAt: "2026-05-30",
    receivable: 30000,
    received: 30000
  }
];

export const conflictHits: ConflictHit[] = [
  {
    id: "C-001",
    query: "华东置业集团有限公司",
    matchedMatter: "M-2025-041 建设工程价款纠纷",
    matchedParty: "华东置业集团有限公司",
    role: "既有客户",
    severity: "BLOCKING",
    basis: "拟收案相对方与历史案件客户名称完全一致"
  },
  {
    id: "C-002",
    query: "王某",
    matchedMatter: "M-2024-018 股东损害公司债权人利益责任纠纷",
    matchedParty: "王某",
    role: "历史相对方",
    severity: "MEDIUM",
    basis: "姓名一致，需补充身份证号或手机号确认是否同一主体"
  }
];

export const scheduleItems = [
  { date: "2026-05-25", title: "提交补充证据目录", matter: "青石建设诉华东置业" },
  { date: "2026-05-28", title: "第一次开庭", matter: "劳动争议仲裁后一审" },
  { date: "2026-05-30", title: "归档期限", matter: "劳动争议仲裁后一审" }
];

export const stageTemplate = [
  "咨询与收案",
  "冲突检索",
  "委托手续",
  "立案/应诉",
  "证据交换",
  "开庭",
  "裁判/调解",
  "结案归档"
];

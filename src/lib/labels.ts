import type { ConflictSeverity, MatterStatus, MatterType, UserRole } from "@/types/domain";

export const matterTypeLabels: Record<MatterType, string> = {
  LITIGATION: "诉讼案件",
  NON_LITIGATION: "非诉项目",
  LEGAL_COUNSEL: "常年顾问",
  SPECIAL_PROJECT: "专项法律服务"
};

export const matterStatusLabels: Record<MatterStatus, string> = {
  INTAKE: "待收案",
  PENDING_CONFIRMATION: "待确认",
  IN_PROGRESS: "办理中",
  CLOSED: "已结案",
  ARCHIVED: "已归档"
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "管理员",
  PRINCIPAL_LAWYER: "负责人律师",
  LAWYER: "经办律师",
  ASSISTANT: "助理",
  FINANCE: "财务"
};

export const conflictSeverityLabels: Record<ConflictSeverity, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  BLOCKING: "阻断"
};

export const statusColors: Record<MatterStatus, string> = {
  INTAKE: "default",
  PENDING_CONFIRMATION: "processing",
  IN_PROGRESS: "blue",
  CLOSED: "green",
  ARCHIVED: "purple"
};

export const severityColors: Record<ConflictSeverity, string> = {
  LOW: "green",
  MEDIUM: "gold",
  HIGH: "orange",
  BLOCKING: "red"
};

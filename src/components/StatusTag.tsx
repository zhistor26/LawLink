import { Tag } from "antd";
import { conflictSeverityLabels, matterStatusLabels, severityColors, statusColors } from "@/lib/labels";
import type { ConflictSeverity, MatterStatus } from "@/types/domain";

export function MatterStatusTag({ status }: { status: MatterStatus }) {
  return <Tag color={statusColors[status]}>{matterStatusLabels[status]}</Tag>;
}

export function ConflictSeverityTag({ severity }: { severity: ConflictSeverity }) {
  return <Tag color={severityColors[severity]}>{conflictSeverityLabels[severity]}</Tag>;
}

import { Button, Card, Input, Table } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ConflictSeverityTag, MatterStatusTag } from "@/components/StatusTag";
import { matterTypeLabels } from "@/lib/labels";
import { intakes } from "@/lib/sample-data";

export default function IntakesPage() {
  return (
    <AppShell>
      <PageHeader
        title="收案管理"
        subtitle="先登记线索和基础事实，完成冲突检索与负责人确认后再转正式案件。"
        actions={[
          <Input.Search key="search" placeholder="搜索客户、相对方、案由" allowClear />,
          <Button key="new" type="primary">
            新建收案
          </Button>
        ]}
      />
      <Card>
        <Table
          rowKey="id"
          dataSource={intakes}
          columns={[
            { title: "编号", dataIndex: "id", width: 120 },
            { title: "收案事项", dataIndex: "title" },
            { title: "客户", dataIndex: "clientName" },
            { title: "相对方", dataIndex: "opponentName" },
            { title: "类型", dataIndex: "matterType", render: (value) => matterTypeLabels[value] },
            { title: "案由/事项", dataIndex: "causeOfAction" },
            { title: "冲突", dataIndex: "conflictSeverity", render: (value) => <ConflictSeverityTag severity={value} /> },
            { title: "状态", dataIndex: "status", render: (value) => <MatterStatusTag status={value} /> },
            { title: "负责人", dataIndex: "owner" }
          ]}
        />
      </Card>
    </AppShell>
  );
}

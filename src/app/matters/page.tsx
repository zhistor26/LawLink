import { Button, Card, Input, Progress, Table } from "antd";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { MatterStatusTag } from "@/components/StatusTag";
import { matterTypeLabels } from "@/lib/labels";
import { matters } from "@/lib/sample-data";

export default function MattersPage() {
  return (
    <AppShell>
      <PageHeader
        title="案件管理"
        subtitle="正式案件以诉讼为主，兼容非诉、顾问和专项项目模板。"
        actions={[
          <Input.Search key="search" placeholder="搜索案号、客户、案件名称" allowClear />,
          <Button key="new" type="primary">
            从收案转入
          </Button>
        ]}
      />
      <Card>
        <Table
          rowKey="id"
          dataSource={matters}
          columns={[
            { title: "案号", dataIndex: "caseNumber", width: 180 },
            {
              title: "案件名称",
              dataIndex: "title",
              render: (text, record) => <Link href={`/matters/${record.id}`}>{text}</Link>
            },
            { title: "客户", dataIndex: "clientName" },
            { title: "类型", dataIndex: "matterType", render: (value) => matterTypeLabels[value] },
            { title: "状态", dataIndex: "status", render: (value) => <MatterStatusTag status={value} /> },
            { title: "下一动作", dataIndex: "nextAction" },
            {
              title: "收款进度",
              render: (_, record) => (
                <Progress
                  percent={Math.round((record.received / record.receivable) * 100)}
                  size="small"
                  status="active"
                />
              )
            }
          ]}
        />
      </Card>
    </AppShell>
  );
}

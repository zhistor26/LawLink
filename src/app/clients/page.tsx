import { Button, Card, Table } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { matters } from "@/lib/sample-data";

export default function ClientsPage() {
  return (
    <AppShell>
      <PageHeader title="客户管理" subtitle="统一管理个人、企业客户及其历史咨询和案件。" actions={<Button type="primary">新建客户</Button>} />
      <Card>
        <Table
          rowKey="clientName"
          dataSource={matters}
          columns={[
            { title: "客户名称", dataIndex: "clientName" },
            { title: "最近事项", dataIndex: "title" },
            { title: "负责人", dataIndex: "owner" },
            { title: "应收", dataIndex: "receivable", render: (value) => `¥${value.toLocaleString()}` },
            { title: "实收", dataIndex: "received", render: (value) => `¥${value.toLocaleString()}` }
          ]}
        />
      </Card>
    </AppShell>
  );
}

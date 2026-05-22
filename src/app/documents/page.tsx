import { Button, Card, Table, Tag } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

const documents = [
  { id: "D-001", name: "民事起诉状.docx", matter: "青石建设诉华东置业", category: "诉讼文书", version: 2 },
  { id: "D-002", name: "证据目录.xlsx", matter: "青石建设诉华东置业", category: "证据", version: 1 },
  { id: "D-003", name: "委托代理合同.pdf", matter: "明远科技股权转让专项", category: "委托手续", version: 1 }
];

export default function DocumentsPage() {
  return (
    <AppShell>
      <PageHeader
        title="材料库"
        subtitle="案件材料默认私有存储，按案件、阶段、类型、标签和版本管理。"
        actions={<Button type="primary">上传材料</Button>}
      />
      <Card>
        <Table
          rowKey="id"
          dataSource={documents}
          columns={[
            { title: "文件名", dataIndex: "name" },
            { title: "关联案件", dataIndex: "matter" },
            { title: "分类", dataIndex: "category", render: (value) => <Tag>{value}</Tag> },
            { title: "版本", dataIndex: "version", render: (value) => `v${value}` }
          ]}
        />
      </Card>
    </AppShell>
  );
}

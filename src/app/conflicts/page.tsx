import { Button, Card, Form, Input, Select, Table } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ConflictSeverityTag } from "@/components/StatusTag";
import { conflictHits } from "@/lib/sample-data";

export default function ConflictsPage() {
  return (
    <AppShell>
      <PageHeader title="利益冲突检索" subtitle="接案前先查客户、相对方、第三人、关联公司和历史案件关系。" />
      <div className="two-column">
        <Card title="检索条件">
          <Form layout="vertical">
            <Form.Item label="主体名称">
              <Input placeholder="输入客户、相对方、第三人或关联公司" />
            </Form.Item>
            <Form.Item label="主体身份">
              <Select
                options={[
                  { label: "客户", value: "client" },
                  { label: "相对方", value: "opponent" },
                  { label: "第三人", value: "thirdParty" },
                  { label: "关联方", value: "related" }
                ]}
              />
            </Form.Item>
            <Button type="primary" block>
              执行检索
            </Button>
          </Form>
        </Card>
        <Card title="规则策略">
          <p>阻断：拟收案相对方与历史客户完全一致。</p>
          <p>高风险：关联公司、实际控制人或关键联系人命中。</p>
          <p>中风险：姓名或简称命中但身份信息不足。</p>
        </Card>
      </div>
      <Card title="命中结果" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          dataSource={conflictHits}
          columns={[
            { title: "检索词", dataIndex: "query" },
            { title: "命中案件", dataIndex: "matchedMatter" },
            { title: "命中主体", dataIndex: "matchedParty" },
            { title: "历史身份", dataIndex: "role" },
            { title: "风险等级", dataIndex: "severity", render: (value) => <ConflictSeverityTag severity={value} /> },
            { title: "命中依据", dataIndex: "basis" }
          ]}
        />
      </Card>
    </AppShell>
  );
}

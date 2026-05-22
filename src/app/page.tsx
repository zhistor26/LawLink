import { Button, Card, List, Statistic, Table, Tag } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { MatterStatusTag } from "@/components/StatusTag";
import { dashboardStats, matters, scheduleItems } from "@/lib/sample-data";
import { matterTypeLabels } from "@/lib/labels";

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        title="工作台"
        subtitle="把收案、冲突、案件节点和钱款状态放在一个入口。"
        actions={<Button type="primary">新建收案</Button>}
      />

      <div className="metric-grid">
        {dashboardStats.map((item) => (
          <Card key={item.title}>
            <Statistic title={item.title} value={item.value} prefix={item.title.includes("实收") ? "¥" : undefined} />
          </Card>
        ))}
      </div>

      <div className="two-column">
        <Card title="重点案件">
          <Table
            rowKey="id"
            dataSource={matters}
            pagination={false}
            columns={[
              { title: "案件", dataIndex: "title" },
              { title: "类型", dataIndex: "matterType", render: (value) => matterTypeLabels[value] },
              { title: "状态", dataIndex: "status", render: (value) => <MatterStatusTag status={value} /> },
              { title: "下一动作", dataIndex: "nextAction" },
              { title: "负责人", dataIndex: "owner" }
            ]}
          />
        </Card>

        <Card title="本周提醒">
          <List
            dataSource={scheduleItems}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.title} description={item.matter} />
                <Tag color="blue">{item.date}</Tag>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </AppShell>
  );
}

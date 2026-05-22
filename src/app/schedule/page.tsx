import { Button, Card, List, Tag } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { scheduleItems } from "@/lib/sample-data";

export default function SchedulePage() {
  return (
    <AppShell>
      <PageHeader
        title="日程提醒"
        subtitle="集中查看开庭、期限、任务、收费和归档提醒；第一版预留 iCal 订阅。"
        actions={<Button>生成 iCal 订阅地址</Button>}
      />
      <Card>
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
    </AppShell>
  );
}

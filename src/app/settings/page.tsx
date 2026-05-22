import { Card, Descriptions, Tag } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="系统设置" subtitle="配置角色权限、冲突规则、案件模板、存储和导出策略。" />
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="部署模式">单个律师/团队/律所自部署</Descriptions.Item>
          <Descriptions.Item label="权限模型">
            <Tag>管理员</Tag>
            <Tag>负责人律师</Tag>
            <Tag>经办律师</Tag>
            <Tag>助理</Tag>
            <Tag>财务</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="冲突规则">完全一致、关联方命中、模糊命中、历史相对方命中</Descriptions.Item>
          <Descriptions.Item label="文件存储">本地私有存储，预留 S3 兼容存储</Descriptions.Item>
        </Descriptions>
      </Card>
    </AppShell>
  );
}

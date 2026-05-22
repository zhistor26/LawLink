import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography } from "antd";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f7fb",
        padding: 24
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Typography.Title level={2} style={{ marginBottom: 4 }}>
          LawLink
        </Typography.Title>
        <Typography.Paragraph type="secondary">登录你的自部署案件管理系统</Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="邮箱" required>
            <Input prefix={<MailOutlined />} placeholder="admin@lawlink.local" />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input.Password prefix={<LockOutlined />} placeholder="输入部署时配置的初始密码" />
          </Form.Item>
          <Button type="primary" block>
            登录
          </Button>
        </Form>
      </Card>
    </main>
  );
}

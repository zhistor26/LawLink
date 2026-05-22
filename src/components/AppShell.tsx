"use client";

import {
  AuditOutlined,
  BankOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const { Header, Sider, Content } = Layout;

const navItems = [
  { key: "/", icon: <DashboardOutlined />, label: <Link href="/">工作台</Link> },
  { key: "/intakes", icon: <AuditOutlined />, label: <Link href="/intakes">收案管理</Link> },
  { key: "/matters", icon: <FolderOpenOutlined />, label: <Link href="/matters">案件管理</Link> },
  { key: "/clients", icon: <TeamOutlined />, label: <Link href="/clients">客户管理</Link> },
  { key: "/conflicts", icon: <SafetyCertificateOutlined />, label: <Link href="/conflicts">冲突检索</Link> },
  { key: "/schedule", icon: <CalendarOutlined />, label: <Link href="/schedule">日程提醒</Link> },
  { key: "/documents", icon: <FileDoneOutlined />, label: <Link href="/documents">材料库</Link> },
  { key: "/finance", icon: <WalletOutlined />, label: <Link href="/finance">财务台账</Link> },
  { key: "/reports", icon: <BankOutlined />, label: <Link href="/reports">统计报表</Link> },
  { key: "/settings", icon: <SettingOutlined />, label: <Link href="/settings">系统设置</Link> }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const selectedKey = navItems.find((item) => item.key !== "/" && pathname.startsWith(item.key))?.key ?? "/";

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0" width={232}>
        <div className="app-logo">
          <span className="logo-mark">L</span>
          <span>LawLink</span>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={navItems} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Typography.Text strong>开源自部署律师案件管理系统</Typography.Text>
          <Typography.Text type="secondary">单所/团队私有部署</Typography.Text>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}

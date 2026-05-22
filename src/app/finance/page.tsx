import { Card, Statistic, Table } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { matters } from "@/lib/sample-data";

export default function FinancePage() {
  const receivable = matters.reduce((sum, matter) => sum + matter.receivable, 0);
  const received = matters.reduce((sum, matter) => sum + matter.received, 0);

  return (
    <AppShell>
      <PageHeader title="财务台账" subtitle="记录合同金额、应收、实收、退款、成本、开票备注和分成。" />
      <div className="metric-grid">
        <Card>
          <Statistic title="应收合计" value={receivable} prefix="¥" />
        </Card>
        <Card>
          <Statistic title="实收合计" value={received} prefix="¥" />
        </Card>
        <Card>
          <Statistic title="待收金额" value={receivable - received} prefix="¥" />
        </Card>
        <Card>
          <Statistic title="回款率" value={Math.round((received / receivable) * 100)} suffix="%" />
        </Card>
      </div>
      <Card>
        <Table
          rowKey="id"
          dataSource={matters}
          columns={[
            { title: "案件", dataIndex: "title" },
            { title: "客户", dataIndex: "clientName" },
            { title: "应收", dataIndex: "receivable", render: (value) => `¥${value.toLocaleString()}` },
            { title: "实收", dataIndex: "received", render: (value) => `¥${value.toLocaleString()}` },
            { title: "待收", render: (_, record) => `¥${(record.receivable - record.received).toLocaleString()}` }
          ]}
        />
      </Card>
    </AppShell>
  );
}

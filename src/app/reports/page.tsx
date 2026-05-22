import { Card, Col, Row, Statistic } from "antd";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageHeader title="统计报表" subtitle="第一版提供案件数量、类型、负责人、收入和工作负载的基础统计。" />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="诉讼案件占比" value={72} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="平均结案周期" value={96} suffix="天" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="归档完成率" value={83} suffix="%" />
          </Card>
        </Col>
      </Row>
    </AppShell>
  );
}

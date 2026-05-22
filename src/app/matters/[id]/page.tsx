import { Button, Card, Descriptions, List, Tabs, Tag, Timeline } from "antd";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { MatterStatusTag } from "@/components/StatusTag";
import { matterTypeLabels } from "@/lib/labels";
import { matters, stageTemplate } from "@/lib/sample-data";

export default function MatterDetailPage({ params }: { params: { id: string } }) {
  const matter = matters.find((item) => item.id === params.id);

  if (!matter) {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        title={matter.title}
        subtitle={`${matter.caseNumber} · ${matter.clientName}`}
        actions={[
          <Button key="export">导出归档清单</Button>,
          <Button key="edit" type="primary">
            编辑案件
          </Button>
        ]}
      />

      <Tabs
        defaultActiveKey="basic"
        items={[
          {
            key: "basic",
            label: "基本信息",
            children: (
              <Card>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="案件类型">{matterTypeLabels[matter.matterType]}</Descriptions.Item>
                  <Descriptions.Item label="案件状态">
                    <MatterStatusTag status={matter.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="案由">{matter.causeOfAction}</Descriptions.Item>
                  <Descriptions.Item label="管辖机构">{matter.court ?? "未登记"}</Descriptions.Item>
                  <Descriptions.Item label="负责人">{matter.owner}</Descriptions.Item>
                  <Descriptions.Item label="下一动作">{matter.nextAction}</Descriptions.Item>
                </Descriptions>
              </Card>
            )
          },
          {
            key: "parties",
            label: "当事人信息",
            children: (
              <Card>
                <List
                  dataSource={["客户：" + matter.clientName, "相对方：华东置业集团有限公司", "第三人：监理单位"]}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </Card>
            )
          },
          {
            key: "plan",
            label: "代理方案",
            children: <Card>记录案件目标、争议焦点、证据策略、谈判空间和风险提示。</Card>
          },
          {
            key: "documents",
            label: "诉讼文档",
            children: <Card>文档库将按起诉材料、证据、庭审材料、裁判文书、归档材料分类。</Card>
          },
          {
            key: "hearings",
            label: "开庭信息",
            children: <Card>展示开庭时间、地点、承办法官、准备事项和庭后跟进。</Card>
          },
          {
            key: "timeline",
            label: "大事记",
            children: (
              <Card>
                <Timeline
                  items={[
                    { children: "完成收案冲突检索" },
                    { children: "签署委托代理合同" },
                    { children: matter.nextAction }
                  ]}
                />
              </Card>
            )
          },
          {
            key: "judgement",
            label: "裁判结果",
            children: <Card>登记判决、调解、裁定、执行和履行情况。</Card>
          },
          {
            key: "preserve",
            label: "财产保全",
            children: <Card>登记保全申请、担保、裁定、查封冻结和解除情况。</Card>
          },
          {
            key: "evidence",
            label: "证据",
            children: <Card>管理证据目录、证明目的、原件状态、质证意见。</Card>
          },
          {
            key: "team",
            label: "团队协作",
            children: (
              <Card>
                {stageTemplate.map((stage) => (
                  <Tag key={stage}>{stage}</Tag>
                ))}
              </Card>
            )
          },
          {
            key: "related",
            label: "关联案件",
            children: <Card>展示同客户、同相对方、同集团或同事实背景下的关联事项。</Card>
          },
          {
            key: "fees",
            label: "费用",
            children: (
              <Card>
                应收 ¥{matter.receivable.toLocaleString()}，实收 ¥{matter.received.toLocaleString()}。
              </Card>
            )
          }
        ]}
      />
    </AppShell>
  );
}

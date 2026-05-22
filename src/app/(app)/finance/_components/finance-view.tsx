"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Coins,
  TrendingUp,
  Percent,
  Receipt
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const feeTypeLabel = {
  RECEIVABLE: "应收",
  RECEIVED: "实收",
  REFUND: "退款",
  COST: "成本",
  COMMISSION: "分成"
} as const;

const feeTypeColor: Record<keyof typeof feeTypeLabel, string> = {
  RECEIVABLE: "#FBBF24",
  RECEIVED: "#4ADE80",
  REFUND: "#F87171",
  COST: "#FB923C",
  COMMISSION: "#9B7BF7"
};

type Entry = {
  id: string;
  type: keyof typeof feeTypeLabel;
  amount: { toString(): string };
  occurredAt: Date;
  payerOrPayee: string | null;
  note: string | null;
  matter: { id: string; internalCode: string; title: string };
  beneficiaryUser: { id: string; name: string } | null;
  recordedBy: { id: string; name: string };
};

type Props = {
  entries: Entry[];
  monthly: { month: string; received: number; receivable: number }[];
  stats: {
    monthlyReceived: number;
    monthlyReceivable: number;
    yearlyReceived: number;
    personalMonthly: number;
    personalYearly: number;
  };
};

const TYPE_FILTERS: ("ALL" | keyof typeof feeTypeLabel)[] = [
  "ALL",
  "RECEIVED",
  "RECEIVABLE",
  "COST",
  "COMMISSION",
  "REFUND"
];

export function FinanceView({ entries, monthly, stats }: Props) {
  const [typeFilter, setTypeFilter] = useState<"ALL" | keyof typeof feeTypeLabel>("ALL");

  const filtered = entries.filter((e) => typeFilter === "ALL" || e.type === typeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Wallet className="h-5 w-5 text-primary" />
          财务总览
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全所收付流水 + 个人创收 + 月度趋势
        </p>
      </header>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="本月实收"
          value={stats.monthlyReceived}
          icon={<Coins className="h-3.5 w-3.5" />}
          color="#4ADE80"
        />
        <StatCard
          label="本月应收"
          value={stats.monthlyReceivable}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          color="#FBBF24"
        />
        <StatCard
          label="本年实收"
          value={stats.yearlyReceived}
          icon={<Receipt className="h-3.5 w-3.5" />}
          color="#5B8DEF"
        />
        <StatCard
          label="我的本月分成"
          value={stats.personalMonthly}
          icon={<Percent className="h-3.5 w-3.5" />}
          color="#9B7BF7"
        />
        <StatCard
          label="我的本年分成"
          value={stats.personalYearly}
          icon={<Percent className="h-3.5 w-3.5" />}
          color="#9B7BF7"
        />
      </div>

      {/* 月度趋势图 */}
      <section className="rounded-xl border border-border bg-card/40">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">近 6 个月趋势</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-3 rounded-full"
                style={{ backgroundColor: "#5B8DEF", boxShadow: "0 0 8px #5B8DEF" }}
              />
              实收
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-3 rounded-full"
                style={{ backgroundColor: "#4FD1C5", boxShadow: "0 0 8px #4FD1C5" }}
              />
              应收
            </span>
          </div>
        </header>
        <div className="p-3" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="finance-received" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5B8DEF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="finance-receivable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4FD1C5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4FD1C5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: 12
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="receivable"
                name="应收"
                stroke="#4FD1C5"
                strokeWidth={1.5}
                fill="url(#finance-receivable)"
              />
              <Area
                type="monotone"
                dataKey="received"
                name="实收"
                stroke="#5B8DEF"
                strokeWidth={2}
                fill="url(#finance-received)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 流水 */}
      <section className="rounded-xl border border-border bg-card/40">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            收付流水{" "}
            <span className="text-muted-foreground">({filtered.length})</span>
          </h2>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
          >
            <SelectTrigger className="h-8 w-32 bg-background/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "ALL" ? "全部" : feeTypeLabel[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </header>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted-foreground">没有匹配的记录</p>
        ) : (
          <ul className="divide-y divide-border max-h-[640px] overflow-y-auto">
            {filtered.map((e) => {
              const color = feeTypeColor[e.type];
              return (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-popover/40">
                  <span
                    className="inline-flex h-6 min-w-12 items-center justify-center rounded-md border px-2 text-[10px] font-medium"
                    style={{ borderColor: `${color}50`, color }}
                  >
                    {feeTypeLabel[e.type]}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm tabular text-foreground">
                        {formatCurrency(Number(e.amount))}
                      </span>
                      {e.beneficiaryUser && (
                        <Badge variant="secondary" className="text-[10px]">
                          → {e.beneficiaryUser.name}
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/matters/${e.matter.id}`}
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
                    >
                      <span className="font-mono">{e.matter.internalCode}</span>
                      <span>·</span>
                      <span className="truncate">{e.matter.title}</span>
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-muted-foreground tabular">
                      {new Date(e.occurredAt).toLocaleDateString("zh-CN")}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      录入：{e.recordedBy.name}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border bg-card/40 p-4"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span style={{ color }}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular text-foreground">
        {formatCurrency(value, { compact: true })}
      </div>
    </div>
  );
}

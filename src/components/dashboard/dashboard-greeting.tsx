"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ConflictSearchButton } from "./conflict-search-button";
import type { ScheduleItem } from "@/server/dashboard/actions";

function getGreeting(hour: number) {
  if (hour < 6) return "夜深了";
  if (hour < 11) return "早安";
  if (hour < 13) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

const typeMeta = {
  deadline: { icon: AlertTriangle, color: "text-amber-600" },
  hearing: { icon: Calendar, color: "text-primary" },
  task: { icon: Clock, color: "text-primary" }
};

/** v0.44：仪表盘顶部问候区 + 右侧今日日程摘要 */
export function DashboardGreeting({
  name,
  summary,
  todaySchedule
}: {
  name: string;
  summary: { todayDeadlineCount: number; weekHearingCount: number; nearTermCount: number };
  todaySchedule?: ScheduleItem[];
}) {
  const router = useRouter();
  const today = new Date();
  const greeting = getGreeting(today.getHours());
  const dateLabel = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
      className="flex items-start justify-between gap-6 py-3"
    >
      {/* 左侧：问候 + 统计 + 按钮 */}
      <div className="flex flex-col gap-4">
        <span className="text-xs text-muted-foreground">{dateLabel}</span>

        <div>
          <h1 className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.1] tracking-tight">
            {greeting}
            {name && <span className="text-foreground/85">，{name}</span>}
            <span className="text-muted-foreground/50">。</span>
          </h1>
          <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-muted-foreground">
            今天有 <Num>{summary.todayDeadlineCount}</Num> 件事需处理；本周开庭{" "}
            <Num>{summary.weekHearingCount}</Num> 场；近期期限 <Num>{summary.nearTermCount}</Num> 项。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => router.push("/matters?tab=intake&new=1")}
            className="h-9 gap-1.5 px-4 shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            新建收案
          </Button>
          <ConflictSearchButton />
        </div>
      </div>

      {/* 右侧：今日日程摘要 */}
      {todaySchedule && todaySchedule.length > 0 && (
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="rounded-lg border border-border bg-card p-3">
            <h3 className="mb-2 text-[12px] font-medium text-muted-foreground">
              今日日程
            </h3>
            <ul className="space-y-1.5">
              {todaySchedule.slice(0, 4).map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                return (
                  <li key={item.id}>
                    {item.matterId ? (
                      <Link
                        href={`/matters/${item.matterId}`}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px] transition-colors hover:bg-muted"
                      >
                        <Icon className={meta.color} style={{ width: 12, height: 12 }} strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        <span className="shrink-0 font-mono text-[10px] tabular text-muted-foreground">
                          {item.time ?? "—"}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 px-1.5 py-1 text-[12px]">
                        <Icon className={meta.color} style={{ width: 12, height: 12 }} strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.title}</span>
                        <span className="shrink-0 font-mono text-[10px] tabular text-muted-foreground">
                          {item.time ?? "—"}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </motion.section>
  );
}

function Num({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[1.15rem] font-medium tabular text-foreground"
      style={{ letterSpacing: "-0.02em" }}
    >
      {children}
    </span>
  );
}

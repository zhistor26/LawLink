import { getSession } from "@/lib/auth/session";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ScheduleList } from "@/components/dashboard/schedule-list";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MyWeeklyCard } from "@/components/dashboard/my-weekly-card";
import { ConflictSearchButton } from "@/components/dashboard/conflict-search-button";
import {
  getDashboardKpis,
  getDashboardRevenueTrend,
  getDashboardCategoryDistribution,
  getDashboardSchedule
} from "@/server/dashboard/actions";
import { getLawyerWeeklyDigest } from "@/server/reports/weekly";

export default async function DashboardPage() {
  const session = await getSession();

  const [kpis, revenueTrend, categoryDistribution, scheduleItems, weekly] = await Promise.all([
    getDashboardKpis(),
    getDashboardRevenueTrend(),
    getDashboardCategoryDistribution(),
    getDashboardSchedule(),
    session?.user
      ? getLawyerWeeklyDigest({
          userId: session.user.id,
          userName: session.user.name ?? "我"
        })
      : Promise.resolve(null)
  ]);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  return (
    <div className="space-y-5 pb-8">
      {/* v0.43：细问候条（替代原「今日焦点」HeroBlock） */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-medium tracking-tight">
          你好，{session?.user?.name ?? "律师"}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{dateLabel}</span>
          <ConflictSearchButton />
        </div>
      </header>

      <KpiCards data={kpis} />

      {/* 主区：近期日程（大）+ 待我处理 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ScheduleList data={scheduleItems} />
        </div>
        <div className="lg:col-span-2">
          <AlertsList />
        </div>
      </div>

      {weekly && <MyWeeklyCard digest={weekly} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart data={revenueTrend} />
        </div>
        <div className="lg:col-span-2">
          <CategoryChart data={categoryDistribution} />
        </div>
      </div>
    </div>
  );
}

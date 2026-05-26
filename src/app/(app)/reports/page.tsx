import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getReportData, periodPresets } from "@/server/reports/queries";
import { ReportsView } from "./_components/reports-view";

type PeriodKey = "month" | "quarter" | "year" | "lastYear";

const VALID_KEYS: PeriodKey[] = ["month", "quarter", "year", "lastYear"];

function parsePeriodKey(raw: string | undefined): PeriodKey {
  if (raw && (VALID_KEYS as string[]).includes(raw)) return raw as PeriodKey;
  return "year";
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: { period?: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  // 仅 ADMIN / PRINCIPAL_LAWYER 可看（律所核心数据）
  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL_LAWYER") {
    redirect("/");
  }

  const periodKey = parsePeriodKey(searchParams.period);
  const presets = periodPresets();
  const period = presets[periodKey];
  const data = await getReportData(period);

  return (
    <ReportsView
      periodKey={periodKey}
      periodLabel={period.label}
      data={data}
      presetLabels={{
        month: presets.month.label,
        quarter: presets.quarter.label,
        year: presets.year.label,
        lastYear: presets.lastYear.label
      }}
    />
  );
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { audit } from "@/server/audit";
import { periodPresets } from "@/server/reports/queries";
import { buildReportWorkbook } from "@/server/reports/export-xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = ["month", "quarter", "year", "lastYear"] as const;
type PeriodKey = (typeof VALID)[number];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL_LAWYER") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("period") ?? "year";
  const periodKey: PeriodKey = (VALID as readonly string[]).includes(raw)
    ? (raw as PeriodKey)
    : "year";
  const period = periodPresets()[periodKey];

  let buf: Buffer;
  try {
    buf = await buildReportWorkbook(period);
  } catch (err) {
    console.error("[reports/export] 生成失败：", err);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }

  await audit({
    userId: session.user.id,
    action: "REPORT_EXPORT",
    targetType: "Report",
    targetId: periodKey,
    detail: { periodLabel: period.label, periodKey, bytes: buf.byteLength }
  });

  const filename = `lawlink-report-${periodKey}-${period.start.toISOString().slice(0, 10)}.xlsx`;
  const arr = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return new NextResponse(arr, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Length": String(buf.byteLength),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  });
}

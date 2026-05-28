/**
 * v0.27: 律所资料并入服务中心。
 * /firm-resources 保留兼容旧链接，自动跳转到 /service-center?tab=firm-files
 * 同时透传 category / q / includeOld 等 query 参数。
 */
import { redirect } from "next/navigation";

export default function FirmResourcesPage({
  searchParams
}: {
  searchParams: { category?: string; q?: string; includeOld?: string };
}) {
  const next = new URLSearchParams();
  next.set("tab", "firm-files");
  if (searchParams.category) next.set("category", searchParams.category);
  if (searchParams.q) next.set("q", searchParams.q);
  if (searchParams.includeOld) next.set("includeOld", searchParams.includeOld);
  redirect(`/service-center?${next.toString()}`);
}

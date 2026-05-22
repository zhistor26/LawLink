import { listScheduleItems } from "@/server/schedule/actions";
import { ScheduleView } from "./_components/schedule-view";

export default async function SchedulePage() {
  // 默认拉未来 90 天
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const to = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const items = await listScheduleItems({ from: now, to });

  return <ScheduleView items={items} />;
}

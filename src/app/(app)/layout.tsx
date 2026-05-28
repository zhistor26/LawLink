import { AppShell } from "@/components/layout/app-shell";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { listActiveBanners } from "@/server/announcements/actions";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // v0.27: 顶部公告 banner —— 仅登录后获取，未登录走 (auth) 段不走此 layout
  const session = await getSession();
  const banners = session?.user ? await listActiveBanners() : [];

  return (
    <AppShell banner={banners.length > 0 ? <AnnouncementBanner banners={banners} /> : null}>
      {children}
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isLazyCatRuntime } from "@/lib/lazycat/env";

type Props = {
  children: React.ReactNode;
};

/**
 * 懒猫微服环境：优先走 inject + 本组件双保险建立 session，成功则跳转首页。
 * 桥接失败时回退显示邮箱密码表单（本地开发或未注入 Header 时）。
 */
export function LazyCatAutoLogin({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lazyCat = isLazyCatRuntime();
  const [showPasswordForm, setShowPasswordForm] = useState(!lazyCat);

  useEffect(() => {
    if (!lazyCat || showPasswordForm) return;

    let cancelled = false;

    async function bootstrap() {
      try {
        const sessionRes = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store"
        });
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session?.user) {
            goHome();
            return;
          }
        }

        const bridgeRes = await fetch("/api/auth/lazycat-bridge", {
          credentials: "include",
          cache: "no-store"
        });
        if (bridgeRes.ok) {
          goHome();
          return;
        }
      } catch {
        /* 网络或桥接失败，回退密码登录 */
      }

      if (!cancelled) setShowPasswordForm(true);
    }

    function goHome() {
      const target = searchParams.get("callbackUrl") || "/";
      router.replace(target);
      router.refresh();
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [lazyCat, router, searchParams, showPasswordForm]);

  if (lazyCat && !showPasswordForm) {
    return (
      <div
        className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">正在使用懒猫微服账号登录，请稍候…</p>
      </div>
    );
  }

  return <>{children}</>;
}

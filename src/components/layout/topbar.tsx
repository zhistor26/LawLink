"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Search,
  ChevronDown,
  Plus,
  LogOut,
  User,
  Settings as SettingsIcon,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConflictDialog } from "@/components/conflict-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  ADMIN: "系统管理员",
  PRINCIPAL_LAWYER: "主办律师",
  LAWYER: "经办律师",
  ASSISTANT: "助理",
  FINANCE: "财务"
};

export function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conflictOpen, setConflictOpen] = useState(false);
  const user = session?.user;
  const displayName = user?.name ?? "";
  const roleLabel = user?.role ? (roleLabels[user.role] ?? user.role) : "";
  const initial = displayName ? displayName.charAt(0) : "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-2.5 px-7",
        "border-b border-hairline bg-background/70 backdrop-blur-xl"
      )}
      style={{ borderBottomColor: "hsl(var(--hairline))" }}
    >
      {/* 搜索 */}
      <button
        className={cn(
          "group flex h-8 w-72 items-center gap-2 px-3 text-left",
          "rounded-md border border-hairline bg-card/40 text-sm text-muted-foreground",
          "transition-colors hover:border-border hover:bg-card hover:text-foreground"
        )}
        aria-label="全局搜索 (Cmd+K)"
      >
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
        <span className="flex-1 truncate">搜索案件、客户、材料...</span>
        <kbd className="hidden h-5 items-center gap-0.5 rounded border border-hairline bg-muted/60 px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* 工具按钮组 */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setConflictOpen(true)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px]",
            "border border-hairline bg-card/40 text-foreground/80",
            "transition-all hover:border-border hover:bg-card hover:text-foreground"
          )}
          title="利益冲突检索"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" strokeWidth={1.8} />
          利益冲突
        </button>

        <Button
          size="sm"
          onClick={() => router.push("/matters?tab=intake&new=1")}
          className="h-8 gap-1.5 px-3 text-[13px] shadow-ll-low"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          新建收案
        </Button>

        <div className="mx-0.5 h-4 w-px" style={{ background: "hsl(var(--hairline))" }} />

        <ThemeToggle />

        <button
          type="button"
          onClick={() =>
            toast.info("通知中心", {
              description: "邮件 / 站内消息推送将在 V1.5 上线"
            })
          }
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-md",
            "border border-hairline bg-card/40 text-muted-foreground",
            "transition-colors hover:border-border hover:bg-card hover:text-foreground"
          )}
          aria-label="通知"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
        </button>
      </div>

      {/* 用户 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex h-8 items-center gap-2 rounded-md pl-1 pr-2.5",
              "border border-hairline bg-card/40 transition-colors",
              "hover:border-border hover:bg-card"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/12 text-[11px] font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium">{displayName || "..."}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {displayName ? `${displayName} · ${roleLabel}` : "加载中..."}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              个人信息
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" />
              偏好设置
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: "/login" });
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConflictDialog open={conflictOpen} onOpenChange={setConflictOpen} />
    </header>
  );
}

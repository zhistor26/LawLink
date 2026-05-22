"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, ChevronDown, Plus, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
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

const roleLabels: Record<string, string> = {
  ADMIN: "系统管理员",
  PRINCIPAL_LAWYER: "主办律师",
  LAWYER: "经办律师",
  ASSISTANT: "助理",
  FINANCE: "财务"
};

export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name ?? "";
  const roleLabel = user?.role ? (roleLabels[user.role] ?? user.role) : "";
  const initial = displayName ? displayName.charAt(0) : "?";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/60 px-8 backdrop-blur-xl">
      {/* 搜索框 */}
      <button
        className="group flex h-9 w-80 items-center gap-2 rounded-md border border-border bg-card/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground"
        aria-label="全局搜索 (Cmd+K)"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">搜索案件、客户、材料...</span>
        <kbd className="hidden h-5 items-center gap-0.5 rounded border border-border bg-popover px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <Button size="sm" className="h-9 gap-1.5 shadow-[0_0_24px_-6px_rgba(91,141,239,0.45)]">
        <Plus className="h-4 w-4" />
        新建收案
      </Button>

      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/40 text-muted-foreground transition-colors hover:border-input hover:text-foreground"
        aria-label="通知"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-9 items-center gap-2 rounded-md border border-border bg-card/40 px-2 transition-colors hover:border-input">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{displayName || "..."}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
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
    </header>
  );
}

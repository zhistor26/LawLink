import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Scale, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "登录 — LawLink"
};

export default function LoginPage() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2">
      {/* 左侧：品牌区 */}
      <div className="hidden flex-col justify-between lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/40">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">LawLink</div>
            <div className="text-xs text-muted-foreground">律师案件管理系统</div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            把精力放在案件本身，
            <br />
            <span className="text-primary">而不是表格里。</span>
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <Feature icon={<ShieldCheck className="h-4 w-4" />}>
              数据自托管，附件可选加密，不依赖第三方 SaaS
            </Feature>
            <Feature icon={<Sparkles className="h-4 w-4" />}>
              覆盖收案、冲突检索、多程序串接、财务分成、归档全流程
            </Feature>
            <Feature icon={<Scale className="h-4 w-4" />}>
              规范案由库（民商事 / 刑事 / 行政）从源头消除字符串歧义
            </Feature>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          MIT 协议 · 开源自部署 ·{" "}
          <span className="font-mono text-foreground/60">v0.1.0</span>
        </div>
      </div>

      {/* 右侧：登录表单 */}
      <div className="ll-glass flex flex-col justify-center rounded-2xl p-8 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            用你的工作邮箱登录
          </p>
        </div>

        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex h-40 items-center justify-center text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

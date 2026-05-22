export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ll-page-bg relative min-h-screen overflow-hidden">
      {/* 背景装饰：左上角光晕 + 右下角光晕 */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#9B7BF7]/10 blur-3xl" />

      {/* 微弱噪点纹理（用 SVG 噪声叠加） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}

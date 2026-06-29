import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

function hasLazyCatUser(req: NextRequest): boolean {
  return process.env.LAZYCAT_AUTH === "1" && !!req.headers.get("x-hc-user-id");
}

/**
 * 全站默认要求登录。
 * `matcher` 显式排除 /login、/api/auth/*、静态资源等公开路径。
 * 懒猫微服模式下，ingress 已注入 X-HC-User-ID 时放行（session 由 getSession / bridge 解析）。
 */
export default withAuth({
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (token) return true;
      if (hasLazyCatUser(req)) return true;
      return false;
    }
  }
});

export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除：
     *   /login            登录页本身
     *   /api/auth         NextAuth 路由
     *   /api/health       健康检查
     *   /_next/*          Next 内部资源
     *   静态文件（.png .ico .svg 等）
     */
    "/((?!login|api/auth|api/health|fixtures|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|xlsx|zip)).*)"
  ]
};

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./options";
import {
  isLazyCatAuthEnabled,
  resolveLazyCatUserFromHeaders,
  toSessionUser
} from "./lazycat";

/**
 * Server Component / Server Action 中读取当前 session。
 * 未登录返回 null。
 * 懒猫微服模式下，若尚无 JWT cookie，会尝试从 X-HC-User-ID Header 解析用户。
 */
export async function getSession() {
  const session = await getServerSession(authOptions);
  if (session?.user) return session;

  if (isLazyCatAuthEnabled()) {
    const user = await resolveLazyCatUserFromHeaders();
    if (user) {
      const u = toSessionUser(user);
      return {
        user: {
          ...u,
          image: u.avatar ?? undefined
        },
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      };
    }
  }

  return null;
}

/**
 * 要求登录，未登录强制跳 /login。
 * 在 Server Component / Server Action 中使用。
 */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

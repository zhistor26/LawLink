import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import {
  isLazyCatAuthEnabled,
  resolveLazyCatUserFromHeaders,
  toSessionUser
} from "@/lib/auth/lazycat";

export const dynamic = "force-dynamic";

/**
 * 懒猫微服免密登录桥接：ingress 注入 X-HC-User-ID 后，本接口签发 NextAuth JWT cookie。
 * 由 inject 脚本或登录页客户端调用。
 */
export async function GET() {
  if (!isLazyCatAuthEnabled()) {
    return NextResponse.json({ error: "lazycat auth disabled" }, { status: 404 });
  }

  const user = await resolveLazyCatUserFromHeaders();
  if (!user) {
    return NextResponse.json({ error: "missing lazycat user header" }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "NEXTAUTH_SECRET not configured" }, { status: 500 });
  }

  const sessionUser = toSessionUser(user);
  const token = await encode({
    token: {
      sub: user.id,
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      role: sessionUser.role,
      avatar: sessionUser.avatar ?? null
    },
    secret,
    maxAge: 12 * 60 * 60
  });

  const secure = process.env.NODE_ENV === "production";
  const cookieName = secure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const res = NextResponse.json({
    ok: true,
    user: { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email }
  });

  res.cookies.set(cookieName, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60
  });

  return res;
}

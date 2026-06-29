import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveUserMock, encodeMock } = vi.hoisted(() => ({
  resolveUserMock: vi.fn(),
  encodeMock: vi.fn().mockResolvedValue("mock-session-jwt")
}));

vi.mock("next-auth/jwt", () => ({
  encode: encodeMock
}));

vi.mock("@/lib/auth/lazycat", () => ({
  isLazyCatAuthEnabled: vi.fn(() => true),
  resolveLazyCatUserFromHeaders: resolveUserMock,
  toSessionUser: (user: { id: string; name: string; email: string }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: "LAWYER",
    avatar: null
  })
}));

import { GET } from "@/app/api/auth/lazycat-bridge/route";

describe("GET /api/auth/lazycat-bridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret-for-bridge-route";
  });

  it("缺少微服用户 Header 时返回 401", async () => {
    resolveUserMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("解析到用户后签发 session cookie", async () => {
    resolveUserMock.mockResolvedValue({
      id: "user-1",
      name: "zhangsan",
      email: "zhangsan@lazycat.local",
      role: "LAWYER",
      avatar: null
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.user.email).toBe("zhangsan@lazycat.local");

    const cookie = res.cookies.get("next-auth.session-token");
    expect(cookie?.value).toBe("mock-session-jwt");
    expect(cookie?.httpOnly).toBe(true);
    expect(encodeMock).toHaveBeenCalled();
  });
});

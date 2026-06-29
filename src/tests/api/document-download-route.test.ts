import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { document: { findFirst: vi.fn() } }
}));

vi.mock("@/lib/storage", () => ({ storage: { readFile: vi.fn() } }));
vi.mock("@/lib/storage/crypto", () => ({ decryptBuffer: vi.fn() }));
vi.mock("@/server/audit", () => ({ audit: vi.fn() }));

import { GET } from "@/app/api/documents/[id]/download/route";

describe("GET /api/documents/[id]/download", () => {
  it("params 为空 id 时返回 400", async () => {
    const res = await GET(new Request("http://localhost/api/documents/x/download"), {
      params: Promise.resolve({ id: "" })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/无效/);
  });

  it("未登录返回 401", async () => {
    const { getSession } = await import("@/lib/auth/session");
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await GET(new Request("http://localhost/api/documents/x/download"), {
      params: Promise.resolve({ id: "cl9b9xj8k0000qz6l5d8z8x8x" })
    });
    expect(res.status).toBe(401);
  });
});

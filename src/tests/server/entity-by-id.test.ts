import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, requireSessionMock } = vi.hoisted(() => ({
  prismaMock: {
    intake: { findFirst: vi.fn(), findUnique: vi.fn() },
    matter: { findFirst: vi.fn() },
    client: { findFirst: vi.fn() }
  },
  requireSessionMock: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/auth/session", () => ({
  requireSession: requireSessionMock
}));

vi.mock("@/lib/permissions", () => ({
  intakeVisibilityFilter: vi.fn(() => ({})),
  isManager: vi.fn(() => true),
  clientVisibilityFilter: vi.fn(() => ({})),
  assertCanAccessMatter: vi.fn()
}));

vi.mock("@/server/audit", () => ({ audit: vi.fn() }));

import { getIntakeById } from "@/server/intakes/actions";
import { getMatterById } from "@/server/matters/actions";
import { getClientById } from "@/server/clients/actions";

const adminSession = {
  user: { id: "user-1", role: "ADMIN" as const, name: "管理员" }
};

describe("getIntakeById / getMatterById / getClientById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireSessionMock.mockResolvedValue(adminSession);
  });

  it("空 id 不调用 Prisma，直接返回 null", async () => {
    expect(await getIntakeById("")).toBeNull();
    expect(await getIntakeById("   ")).toBeNull();
    expect(await getMatterById("")).toBeNull();
    expect(await getClientById("")).toBeNull();

    expect(prismaMock.intake.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.matter.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.client.findFirst).not.toHaveBeenCalled();
  });

  it("有效 id 时正常查询 intake", async () => {
    const intake = { id: "cl9b9xj8k0000qz6l5d8z8x8x", title: "测试收案" };
    prismaMock.intake.findUnique.mockResolvedValue(intake);

    const result = await getIntakeById(intake.id);
    expect(result).toEqual(intake);
    expect(prismaMock.intake.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: intake.id } })
    );
  });
});

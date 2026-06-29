import { beforeEach, describe, expect, it, vi } from "vitest";

const MATTER_ID = "cl9b9xj8k0000qz6l5d8z8x8x";

const { prismaMock, txMock, auditMock } = vi.hoisted(() => {
  const tx = {
    matter: { update: vi.fn() },
    timelineEvent: { create: vi.fn() }
  };
  return {
    txMock: tx,
    prismaMock: {
      matter: { findUnique: vi.fn() },
      $transaction: vi.fn((fn: (t: typeof tx) => Promise<void>) => fn(tx))
    },
    auditMock: vi.fn()
  };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn().mockResolvedValue({
    user: { id: "lawyer-1", role: "LAWYER", name: "张律师" }
  })
}));

vi.mock("@/lib/archive/guard", () => ({
  assertMatterWritable: vi.fn()
}));

vi.mock("@/lib/permissions", () => ({
  assertCanLeadMatter: vi.fn()
}));

vi.mock("@/server/audit", () => ({ audit: auditMock }));

import { closeMatter, holdMatter, reopenMatter } from "@/server/matters/lifecycle";

describe("matter lifecycle server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    txMock.matter.update.mockResolvedValue({});
    txMock.timelineEvent.create.mockResolvedValue({});
  });

  it("closeMatter 写入 CLOSED 状态与时间线", async () => {
    const res = await closeMatter({ id: MATTER_ID, summary: "判决已生效" });
    expect(res).toEqual({ ok: true });
    expect(txMock.matter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MATTER_ID },
        data: expect.objectContaining({ status: "CLOSED" })
      })
    );
    expect(txMock.timelineEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          matterId: MATTER_ID,
          eventType: "MATTER_CLOSED",
          content: "判决已生效"
        })
      })
    );
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "MATTER_CLOSE", targetId: MATTER_ID })
    );
  });

  it("closeMatter 拒绝空小结", async () => {
    await expect(closeMatter({ id: MATTER_ID, summary: "" })).rejects.toThrow();
    expect(txMock.matter.update).not.toHaveBeenCalled();
  });

  it("holdMatter 写入 ON_HOLD", async () => {
    const res = await holdMatter({ id: MATTER_ID, reason: "待补材料" });
    expect(res).toEqual({ ok: true });
    expect(txMock.matter.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ON_HOLD" })
      })
    );
  });

  it("reopenMatter 已归档案件拒绝重新开放", async () => {
    prismaMock.matter.findUnique.mockResolvedValue({ status: "ARCHIVED" });
    await expect(reopenMatter(MATTER_ID)).rejects.toThrow("已归档案件不能重新开放");
  });
});

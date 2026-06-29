import { Prisma, type User, type UserRole } from "@prisma/client";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/** 懒猫微服部署时由 manifest 注入 LAZYCAT_AUTH=1 */
export function isLazyCatAuthEnabled(): boolean {
  return process.env.LAZYCAT_AUTH === "1";
}

/** 将微服 UID 映射为 LawLink 内部邮箱（无需改 schema） */
export function lazyCatEmail(uid: string): string {
  const safe = uid
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._+-]/g, "_")
    .slice(0, 64);
  return `${safe || "user"}@lazycat.local`;
}

function mapLazyCatRole(hcRole: string | null): UserRole {
  if (hcRole === "ADMIN") return "ADMIN";
  return "LAWYER";
}

function displayName(uid: string): string {
  const trimmed = uid.trim();
  return trimmed.length > 0 ? trimmed : "微服用户";
}

/**
 * 从 lzc-ingress 注入的 Header 解析/自动创建用户。
 * 仅在 LAZYCAT_AUTH=1 时调用。
 */
export async function resolveLazyCatUserFromHeaders(): Promise<User | null> {
  if (!isLazyCatAuthEnabled()) return null;

  const h = await headers();
  const uid = h.get("x-hc-user-id");
  if (!uid) return null;

  const email = lazyCatEmail(uid);
  const role = mapLazyCatRole(h.get("x-hc-user-role"));
  const name = displayName(uid);

  let user = await prisma.user.findUnique({ where: { email } });
  let created = false;

  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    try {
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          active: true,
          lastLoginAt: new Date()
        }
      });
      created = true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        user = await prisma.user.findUnique({ where: { email } });
      } else {
        throw error;
      }
    }
  }

  if (!user) {
    return null;
  }

  if (created) {
    return user;
  }

  if (!user.active) return null;

  const updates: { lastLoginAt: Date; role?: UserRole; name?: string } = {
    lastLoginAt: new Date()
  };
  if (h.get("x-hc-user-role") === "ADMIN" && user.role !== "ADMIN") {
    updates.role = "ADMIN";
  }
  if (user.name !== name && name !== "微服用户") {
    updates.name = name;
  }

  if (updates.role || updates.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: updates
    });
  } else {
    prisma.user
      .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      .catch(() => undefined);
  }

  return user;
}

export function toSessionUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };
}

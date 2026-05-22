"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export type ScheduleItem = {
  id: string;
  type: "hearing" | "deadline" | "task";
  title: string;
  occurredAt: Date;
  matter: { id: string; internalCode: string; title: string };
  procedureLabel?: string;
  completed?: boolean;
  remindDays?: number;
  category?: string;
  priority?: number;
  assigneeId?: string | null;
};

export async function listScheduleItems(params: {
  from?: Date;
  to?: Date;
  includeCompleted?: boolean;
  onlyMine?: boolean;
} = {}) {
  const session = await requireSession();
  const from = params.from ?? new Date(new Date().setHours(0, 0, 0, 0));
  const to = params.to ?? new Date(from.getTime() + 365 * 24 * 60 * 60 * 1000);
  const userId = session.user.id;

  const memberFilter = params.onlyMine
    ? {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    : {};

  const [hearings, deadlines, tasks] = await Promise.all([
    prisma.hearing.findMany({
      where: {
        startsAt: { gte: from, lte: to },
        procedure: {
          engagement: "ENGAGED",
          matter: { deletedAt: null, ...memberFilter }
        }
      },
      include: {
        procedure: {
          select: {
            type: true,
            customLabel: true,
            matter: { select: { id: true, internalCode: true, title: true } }
          }
        }
      }
    }),
    prisma.deadline.findMany({
      where: {
        dueAt: { gte: from, lte: to },
        ...(params.includeCompleted ? {} : { completed: false }),
        procedure: {
          engagement: "ENGAGED",
          matter: { deletedAt: null, ...memberFilter }
        }
      },
      include: {
        procedure: {
          select: {
            type: true,
            customLabel: true,
            matter: { select: { id: true, internalCode: true, title: true } }
          }
        }
      }
    }),
    prisma.task.findMany({
      where: {
        dueAt: { gte: from, lte: to, not: null },
        ...(params.includeCompleted ? {} : { completed: false }),
        ...(params.onlyMine
          ? {
              OR: [
                { assigneeId: userId },
                { matter: { ownerId: userId } },
                { matter: { members: { some: { userId } } } }
              ]
            }
          : {}),
        matter: { deletedAt: null }
      },
      include: {
        matter: { select: { id: true, internalCode: true, title: true } }
      }
    })
  ]);

  const items: ScheduleItem[] = [];

  for (const h of hearings) {
    items.push({
      id: `h-${h.id}`,
      type: "hearing",
      title: h.title,
      occurredAt: h.startsAt,
      matter: h.procedure.matter,
      procedureLabel: h.procedure.customLabel ?? h.procedure.type
    });
  }
  for (const d of deadlines) {
    items.push({
      id: `d-${d.id}`,
      type: "deadline",
      title: d.title,
      occurredAt: d.dueAt,
      matter: d.procedure.matter,
      procedureLabel: d.procedure.customLabel ?? d.procedure.type,
      completed: d.completed,
      remindDays: d.remindDays,
      category: d.category
    });
  }
  for (const t of tasks) {
    if (!t.dueAt) continue;
    items.push({
      id: `t-${t.id}`,
      type: "task",
      title: t.title,
      occurredAt: t.dueAt,
      matter: t.matter,
      completed: t.completed,
      priority: t.priority,
      assigneeId: t.assigneeId
    });
  }

  items.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  return items;
}

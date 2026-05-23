import { listSmsMessages } from "@/server/sms/actions";
import { prisma } from "@/lib/prisma";
import { InboxView } from "./_components/inbox-view";

export default async function InboxPage() {
  const [unprocessed, processed, recentMatters] = await Promise.all([
    listSmsMessages({ scope: "mine", processed: "unprocessed" }),
    listSmsMessages({ scope: "mine", processed: "processed" }),
    prisma.matter.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: {
        id: true,
        internalCode: true,
        title: true,
        procedures: {
          where: { engagement: "ENGAGED" },
          orderBy: { order: "asc" },
          select: { id: true, type: true, customLabel: true, caseNumber: true }
        }
      }
    })
  ]);

  return (
    <InboxView
      unprocessed={unprocessed}
      processed={processed}
      matters={recentMatters}
    />
  );
}

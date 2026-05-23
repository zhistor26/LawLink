import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMatterById } from "@/server/matters/actions";
import { getMatterFinance } from "@/server/finance/actions";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { LifecycleActions } from "./_components/lifecycle-actions";
import { MatterDetailTabs } from "./_components/matter-detail-tabs";

export default async function MatterDetailPage({ params }: { params: { id: string } }) {
  const [matter, session] = await Promise.all([
    getMatterById(params.id),
    getSession()
  ]);
  if (!matter) notFound();

  const [finance, userOptions, notes, documents, intakeContracts] = await Promise.all([
    getMatterFinance(matter.id),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" }
    }),
    prisma.note.findMany({
      where: { matterId: matter.id, deletedAt: null },
      orderBy: { occurredAt: "desc" },
      include: { author: { select: { id: true, name: true } } }
    }),
    prisma.document.findMany({
      where: { matterId: matter.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        procedure: { select: { id: true, type: true, customLabel: true } }
      }
    }),
    // v0.5: 从 Intake 上传过来的合同（同时绑定 intakeId 和 matterId）
    matter.intakeId
      ? prisma.document.findMany({
          where: {
            intakeId: matter.intakeId,
            deletedAt: null
          },
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: { select: { id: true, name: true } },
            procedure: { select: { id: true, type: true, customLabel: true } }
          }
        })
      : Promise.resolve([])
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/matters"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回案件列表
        </Link>
        {session?.user && (
          <LifecycleActions
            matterId={matter.id}
            status={matter.status}
            userRole={session.user.role}
          />
        )}
      </div>

      <MatterDetailTabs
        matter={matter}
        finance={finance}
        userOptions={userOptions}
        notes={notes}
        documents={documents}
        intakeContracts={intakeContracts}
      />
    </div>
  );
}

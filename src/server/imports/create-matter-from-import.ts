import { prisma } from "@/lib/prisma";
import { seedDefaultFolders } from "@/lib/default-folders";
import { generateInternalCode, generateFirmCaseNo } from "@/server/matters/code-generator";
import { generateClientCode } from "@/server/clients/code-generator";
import {
  buildMatterTitle,
  firstProcedureTypeFor,
  type NormalizedRow
} from "@/lib/imports/matter-import";

/** 落库单行：find-or-create 客户 → 建案件(+编号+主办+当事人+首程序+卷宗) */
export async function createMatterFromImportRow(n: NormalizedRow, currentUserId: string) {
  let ownerId = currentUserId;
  if (n.ownerEmail) {
    const lawyer = await prisma.user.findFirst({
      where: { email: { equals: n.ownerEmail, mode: "insensitive" } },
      select: { id: true }
    });
    if (!lawyer) throw new Error(`主办律师邮箱「${n.ownerEmail}」未匹配到用户`);
    ownerId = lawyer.id;
  }

  let causeId: string | null = null;
  let causeFreeText: string | null = null;
  if (n.causeText) {
    const cause = await prisma.causeOfAction.findFirst({
      where: { name: n.causeText },
      select: { id: true }
    });
    if (cause) causeId = cause.id;
    else causeFreeText = n.causeText;
  }

  const internalCode = await generateInternalCode(n.category);
  const firmCaseNo = await generateFirmCaseNo(n.category);

  const existingClient = await prisma.client.findFirst({
    where: { name: n.clientName, idNumber: n.clientIdNumber, deletedAt: null },
    select: { id: true }
  });
  const clientCode = existingClient ? null : await generateClientCode();

  const title = buildMatterTitle(n.clientName, n.opposingName, n.causeText);
  const intakeDate = n.intakeDate ?? new Date();

  const clientParty = {
    role: "CLIENT_PARTY" as const,
    ordinal: 1,
    name: n.clientName,
    partyType: n.clientPartyType,
    idNumber: n.clientIdNumber,
    phone: n.clientPhone,
    ...(n.clientPartyType !== "NATURAL_PERSON"
      ? { enterpriseSocialCode: n.clientIdNumber, enterpriseName: n.clientName }
      : {})
  };
  const opposingParty = {
    role: "OPPOSING_PARTY" as const,
    ordinal: 1,
    name: n.opposingName,
    partyType: n.opposingPartyType,
    idNumber: n.opposingIdNumber,
    ...(n.opposingPartyType !== "NATURAL_PERSON"
      ? { enterpriseSocialCode: n.opposingIdNumber, enterpriseName: n.opposingName }
      : {})
  };

  return prisma.$transaction(async (tx) => {
    const clientId =
      existingClient?.id ??
      (
        await tx.client.create({
          data: {
            name: n.clientName,
            type: n.clientType,
            idNumber: n.clientIdNumber,
            phone: n.clientPhone,
            internalCode: clientCode
          },
          select: { id: true }
        })
      ).id;

    const matter = await tx.matter.create({
      data: {
        internalCode,
        firmCaseNo,
        title,
        category: n.category,
        status: n.status,
        ownerId,
        intakeDate,
        claimAmount: n.claimAmount ?? undefined,
        causeId,
        causeFreeText,
        closedAt: n.status === "CLOSED" ? new Date() : null,
        archivedAt: n.status === "ARCHIVED" ? new Date() : null,
        primaryClientId: clientId,
        members: { create: { userId: ownerId, role: "LEAD" } },
        clientLinks: { create: { clientId, isPrimary: true, label: "主要委托方" } },
        parties: { create: [clientParty, opposingParty] },
        ...(n.status === "IN_PROGRESS"
          ? {
              procedures: {
                create: {
                  type: firstProcedureTypeFor(n.category),
                  engagement: "ENGAGED",
                  order: 1,
                  status: "IN_PROGRESS",
                  jurisdiction: n.jurisdiction,
                  handlingAgency: n.jurisdiction ? `${n.jurisdiction}人民法院` : undefined,
                  leadLawyerId: ownerId
                }
              },
              firstAcceptedAt: intakeDate
            }
          : {})
      },
      select: { id: true, internalCode: true, firmCaseNo: true, title: true, status: true, category: true }
    });

    await tx.timelineEvent.create({
      data: {
        matterId: matter.id,
        eventType: "MATTER_CREATED",
        title: "案件已创建（批量导入）",
        occurredAt: new Date()
      }
    });

    await seedDefaultFolders(tx, matter.id, n.category);
    return matter;
  });
}

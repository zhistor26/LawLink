/**
 * 可再导入案件 xlsx 导出（单 sheet，列 = IMPORT_COLUMNS，与批量导入模板同格式）。
 */
import ExcelJS from "exceljs";
import type { ClientType, MatterStatus, Party, PartyType } from "@prisma/client";

import { IMPORT_COLUMNS } from "@/lib/imports/matter-import";
import { matterCategoryLabel, matterStatusLabel } from "@/lib/enums";
import { IMPORT_SHEET_NAME } from "@/server/imports/template";
import {
  listIntakesForExport,
  listMattersForExport,
  mattersExportTabFileKey,
  resolveMattersExportParams,
  type MattersExportParams
} from "@/server/matters/export-xlsx";

type ExportUser = {
  id: string;
  role: string;
};

export { resolveMattersExportParams, type MattersExportParams };

function formatYmd(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatExportStamp(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
}

function mapClientTypeForImport(type: ClientType | null | undefined): string {
  return type === "COMPANY" || type === "ORGANIZATION" ? "企业" : "个人";
}

function mapPartyTypeForImport(type: PartyType | null | undefined): string {
  return type === "NATURAL_PERSON" ? "个人" : "企业";
}

/** 导入模板只接受 办理中 / 已结案 / 已归档 */
function mapMatterStatusForImport(status: MatterStatus): string {
  if (status === "CLOSED") return matterStatusLabel.CLOSED;
  if (status === "ARCHIVED") return matterStatusLabel.ARCHIVED;
  return matterStatusLabel.IN_PROGRESS;
}

function partyDocumentNumber(party: Party | undefined): string {
  if (!party) return "";
  return (party.idNumber ?? party.enterpriseSocialCode ?? "").trim();
}

function findOpposingParty(parties: Party[]): Party | undefined {
  return parties.find((party) => party.role === "OPPOSING_PARTY");
}

function mapMatterToImportRow(
  matter: Awaited<ReturnType<typeof listMattersForExport>>[number]
): Record<string, string> {
  const client = matter.primaryClient;
  const opposing = findOpposingParty(matter.parties);
  const jurisdiction =
    matter.procedures[0]?.jurisdiction ??
    matter.intake?.jurisdiction ??
    "";

  return {
    clientName: client?.name ?? "",
    clientIdNumber: client?.idNumber ?? "",
    clientType: mapClientTypeForImport(client?.type),
    opposingName: opposing?.name ?? "",
    opposingIdNumber: partyDocumentNumber(opposing),
    opposingType: mapPartyTypeForImport(opposing?.partyType),
    category: matterCategoryLabel[matter.category],
    status: mapMatterStatusForImport(matter.status),
    ownerEmail: matter.owner.email,
    intakeDate: matter.intakeDate ? formatYmd(matter.intakeDate) : "",
    cause: matter.cause?.name ?? matter.causeFreeText ?? "",
    claimAmount:
      matter.claimAmount === null || matter.claimAmount === undefined
        ? ""
        : String(Number(matter.claimAmount)),
    clientPhone: client?.phone ?? "",
    jurisdiction
  };
}

function mapIntakeToImportRow(
  intake: Awaited<ReturnType<typeof listIntakesForExport>>[number]
): Record<string, string> {
  const client = intake.client;
  const opposing = findOpposingParty(intake.parties);

  return {
    clientName: client?.name ?? "",
    clientIdNumber: client?.idNumber ?? "",
    clientType: mapClientTypeForImport(client?.type ?? intake.clientType),
    opposingName: opposing?.name ?? "",
    opposingIdNumber: partyDocumentNumber(opposing),
    opposingType: mapPartyTypeForImport(opposing?.partyType),
    category: matterCategoryLabel[intake.category],
    status: matterStatusLabel.IN_PROGRESS,
    ownerEmail: intake.ownerUser?.email ?? "",
    intakeDate: formatYmd(intake.receivedAt),
    cause: intake.cause?.name ?? intake.causeFreeText ?? "",
    claimAmount:
      intake.claimAmount === null || intake.claimAmount === undefined
        ? ""
        : String(Number(intake.claimAmount)),
    clientPhone: intake.contactPhone ?? client?.phone ?? "",
    jurisdiction: intake.jurisdiction ?? ""
  };
}

export async function buildImportableMattersExportWorkbook(
  params: MattersExportParams,
  user: ExportUser
): Promise<{ buffer: Buffer; filename: string; total: number }> {
  const rows =
    params.tab === "intake" || params.tab === "revision"
      ? (await listIntakesForExport(params, user)).map(mapIntakeToImportRow)
      : (await listMattersForExport(params, user)).map(mapMatterToImportRow);

  const wb = new ExcelJS.Workbook();
  wb.creator = "LawLink";
  wb.created = new Date();

  const sheet = wb.addWorksheet(IMPORT_SHEET_NAME);
  sheet.columns = IMPORT_COLUMNS.map((column) => ({
    header: column.required ? `${column.header}*` : column.header,
    key: column.key,
    width: Math.max(12, column.header.length * 2 + 4)
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  IMPORT_COLUMNS.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: column.required ? "FFFCE4E4" : "FFEFEFEF" }
    };
  });

  for (const row of rows) {
    sheet.addRow(
      IMPORT_COLUMNS.reduce<Record<string, string>>((acc, column) => {
        acc[column.key] = row[column.key] ?? "";
        return acc;
      }, {})
    );
  }

  const raw = await wb.xlsx.writeBuffer();
  const tabKey = mattersExportTabFileKey(params.tab);
  return {
    buffer: Buffer.from(raw),
    filename: `LawLink-案件可再导入-${tabKey}-${formatExportStamp(new Date())}.xlsx`,
    total: rows.length
  };
}

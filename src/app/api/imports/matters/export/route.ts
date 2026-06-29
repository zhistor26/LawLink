import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { audit } from "@/server/audit";
import { binaryAttachmentResponse } from "@/lib/http/binary-response";
import {
  buildImportableMattersExportWorkbook,
  resolveMattersExportParams
} from "@/server/imports/export-xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PRINCIPAL_LAWYER") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const url = new URL(req.url);
  const params = resolveMattersExportParams(url.searchParams);

  let result: Awaited<ReturnType<typeof buildImportableMattersExportWorkbook>>;
  try {
    result = await buildImportableMattersExportWorkbook(params, {
      id: session.user.id,
      role: session.user.role
    });
  } catch (err) {
    console.error("[imports/matters/export] 生成失败：", err);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }

  await audit({
    userId: session.user.id,
    action: "IMPORTABLE_MATTERS_EXPORT",
    targetType: "MatterList",
    targetId: params.tab,
    detail: {
      tab: params.tab,
      total: result.total,
      filters: params,
      bytes: result.buffer.byteLength
    }
  });

  return binaryAttachmentResponse(result.buffer, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: result.filename
  });
}

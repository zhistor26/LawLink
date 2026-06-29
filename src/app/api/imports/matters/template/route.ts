import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { binaryAttachmentResponse } from "@/lib/http/binary-response";
import { buildMatterImportTemplate } from "@/server/imports/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PRINCIPAL_LAWYER") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  let buf: Buffer;
  try {
    buf = await buildMatterImportTemplate();
  } catch (err) {
    console.error("[imports/template] 生成失败：", err);
    return NextResponse.json({ error: "模板生成失败" }, { status: 500 });
  }

  const filename = "LawLink-案件导入模板.xlsx";
  return binaryAttachmentResponse(buf, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename
  });
}

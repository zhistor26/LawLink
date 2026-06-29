import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";
import { binaryAttachmentResponse } from "@/lib/http/binary-response";
import { buildArchiveZip } from "@/server/archive/export";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matterId: string }> }
) {
  const { matterId } = await params;
  if (!matterId) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 权限：ADMIN / PRINCIPAL_LAWYER 或案件成员
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { id: true, status: true, internalCode: true }
  });
  if (!matter) return NextResponse.json({ error: "案件不存在" }, { status: 404 });
  if (matter.status !== "ARCHIVED") {
    return NextResponse.json({ error: "案件尚未归档" }, { status: 400 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL_LAWYER") {
    const member = await prisma.matterMember.findUnique({
      where: { matterId_userId: { matterId: matter.id, userId: session.user.id } }
    });
    if (!member) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }
  }

  let result;
  try {
    result = await buildArchiveZip(matterId);
  } catch (err) {
    console.error("[archive export] 构建失败：", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "导出失败" },
      { status: 500 }
    );
  }

  // 持久化路径 + checksum 回填到最新 ArchiveRecord
  try {
    const storagePath = await storage.writeFile(`archive_${matter.id}`, result.buffer);
    await prisma.archiveRecord.updateMany({
      where: { matterId: matter.id },
      data: { exportPath: storagePath, checksum: result.checksum }
    });
  } catch (err) {
    console.error("[archive export] 落盘失败（不阻断下载）：", err);
  }

  await audit({
    userId: session.user.id,
    action: "ARCHIVE_EXPORT",
    targetType: "Matter",
    targetId: matter.id,
    detail: { size: result.size, checksum: result.checksum }
  });

  return binaryAttachmentResponse(result.buffer, {
    contentType: "application/zip",
    filename: result.fileName
  });
}

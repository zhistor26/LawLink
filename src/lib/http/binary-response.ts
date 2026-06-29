import { NextResponse } from "next/server";

/** 二进制下载响应（避免 Buffer→ArrayBuffer slice 在部分运行时丢字节） */
export function binaryAttachmentResponse(
  body: Buffer,
  options: { contentType: string; filename: string }
): NextResponse {
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": options.contentType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(options.filename)}`,
      "Cache-Control": "no-store"
    }
  });
}

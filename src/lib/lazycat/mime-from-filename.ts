/** 下载/存网盘时按文件名确定 MIME，避免 xlsx 被嗅探成 application/zip */

const MIME_BY_EXT: Record<string, string> = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".zip": "application/zip",
  ".pdf": "application/pdf",
  ".csv": "text/csv"
};

export function extensionFromFilename(filename: string): string {
  const match = filename.toLowerCase().match(/(\.[^./\\]+)$/);
  return match?.[1] ?? "";
}

export function mimeTypeFromFilename(filename: string): string | undefined {
  return MIME_BY_EXT[extensionFromFilename(filename)];
}

/** xlsx/docx 等 Office 文件与 ZIP 同 PK 头，禁止按 application/zip 存网盘 */
export function normalizeDownloadBlob(blob: Blob, filename: string): Blob {
  const expected = mimeTypeFromFilename(filename);
  if (!expected) return blob;

  const lower = filename.toLowerCase();
  const type = blob.type?.split(";")[0]?.trim() ?? "";

  const shouldRewrap =
    type === expected
      ? false
      : lower.endsWith(".xlsx") || lower.endsWith(".xls")
        ? type === "application/zip" ||
          type === "application/octet-stream" ||
          type === "" ||
          type !== expected
        : type === "" || type === "application/octet-stream";

  if (!shouldRewrap) return blob;
  return new Blob([blob], { type: expected });
}

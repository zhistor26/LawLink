const ZIP_MAGIC = [0x50, 0x4b] as const;

function headText(buffer: ArrayBuffer, max = 64): string {
  return new TextDecoder().decode(new Uint8Array(buffer.slice(0, max))).trimStart();
}

function hasZipMagic(buffer: ArrayBuffer): boolean {
  const head = new Uint8Array(buffer.slice(0, 2));
  return head[0] === ZIP_MAGIC[0] && head[1] === ZIP_MAGIC[1];
}

/** 校验 fetch 到的二进制是否像完整 Excel/ZIP，拒绝 HTML/JSON/裸 XML 片段 */
export function assertDownloadBinary(buffer: ArrayBuffer, filename: string): void {
  if (buffer.byteLength === 0) {
    throw new Error("下载失败：文件为空");
  }

  const prefix = headText(buffer);
  if (prefix.startsWith("<!DOCTYPE") || prefix.startsWith("<html")) {
    throw new Error("下载失败：收到登录页面，请刷新后重试");
  }
  if (prefix.startsWith("{") || prefix.startsWith("[")) {
    throw new Error("下载失败：服务器返回 JSON 错误而非文件");
  }

  const lower = filename.toLowerCase();
  const expectsZip = lower.endsWith(".xlsx") || lower.endsWith(".zip") || lower.endsWith(".docx");

  if (prefix.startsWith("<?xml") && !hasZipMagic(buffer)) {
    throw new Error(
      "下载失败：收到 XML 文本而非完整 Excel 文件。请用 Excel/WPS 直接打开 .xlsx，不要解压或当 ZIP 查看"
    );
  }

  if (expectsZip && !hasZipMagic(buffer)) {
    throw new Error("下载失败：文件格式异常，不是有效的 Excel/ZIP 包");
  }
}

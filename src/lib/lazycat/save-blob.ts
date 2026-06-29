/** fetch → Blob → blob: URL → <a download>.click()，触发懒猫 inject 保存对话框 */

import { normalizeDownloadBlob, mimeTypeFromFilename } from "@/lib/lazycat/mime-from-filename";
import { ensureSaveFilename } from "@/lib/lazycat/ensure-save-filename";
import { assertDownloadBinary } from "@/lib/lazycat/validate-download";

const REVOKE_DELAY_MS = 5000;

/** 已有 Blob → 触发浏览器/inject 下载 */
export async function triggerBlobDownload(blob: Blob, filename: string): Promise<void> {
  const safeName = ensureSaveFilename(filename);
  const normalized = normalizeDownloadBlob(blob, safeName);
  const url = URL.createObjectURL(normalized);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/** fetch 鉴权 API → ArrayBuffer → Blob → 触发下载（懒猫环境会弹「本地 / 懒猫保存」） */
export async function fetchAndDownload(
  url: string,
  filename: string,
  init?: RequestInit
): Promise<void> {
  const response = await fetch(url, {
    credentials: "include",
    ...init
  });
  if (!response.ok) {
    let message = `下载失败（${response.status}）`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      /* 非 JSON 响应 */
    }
    throw new Error(message);
  }

  const buffer = await response.arrayBuffer();
  assertDownloadBinary(buffer, filename);

  const fromName = mimeTypeFromFilename(filename);
  const fromHeader = response.headers.get("Content-Type")?.split(";")[0]?.trim();
  let contentType = fromName || fromHeader || "application/octet-stream";

  // 服务端/静态资源常把 xlsx 误标为 zip（同为 PK 头），存网盘会变成「压缩包」
  if (fromName && (contentType === "application/zip" || !fromHeader)) {
    contentType = fromName;
  }

  const blob = normalizeDownloadBlob(new Blob([buffer], { type: contentType }), filename);
  await triggerBlobDownload(blob, filename);
}

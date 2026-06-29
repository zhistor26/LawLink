import { fetchAndDownload } from "@/lib/lazycat/save-blob";

const REVOKE_DELAY_MS = 60_000;

/** fetch 鉴权文件并在新标签页打开（预览，非 inject 保存） */
export async function fetchAndOpenInNewTab(url: string): Promise<void> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`打开失败（${response.status}）`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("无法打开新窗口，请检查浏览器弹窗拦截");
  }
  setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_DELAY_MS);
}

export { fetchAndDownload };

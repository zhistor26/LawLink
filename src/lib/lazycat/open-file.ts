/** 从懒猫网盘路径拉取文件，构造浏览器 File 对象 */

/** 规范化 lzc-file-picker / deep link 返回的路径 */
export function normalizeLazyCatPath(path: string): string {
  let normalized = String(path || "")
    .trim()
    .replace(/\.$/, "");
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    /* 已是解码后的路径 */
  }
  normalized = normalized.replace(/^\/_lzc\/files\/home(?=\/|$)/, "");
  if (normalized && !normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  return normalized;
}

function filenameFromPath(path: string, fallback: string): string {
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last && last.length > 0 ? last : fallback;
}

/** GET /_lzc/files/home${path} → File */
export async function fetchLazyCatFileAsFile(path: string, fallbackName: string): Promise<File> {
  const normalized = normalizeLazyCatPath(path);
  const url = `/_lzc/files/home${normalized}`;
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`无法从网盘读取文件（${response.status}）`);
  }
  const blob = await response.blob();
  const name = filenameFromPath(normalized, fallbackName);
  const type =
    blob.type ||
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return new File([blob], name, { type });
}

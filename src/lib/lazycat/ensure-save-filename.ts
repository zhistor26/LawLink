/** 存网盘/下载前确保文件名带正确后缀（xlsx 等） */
export function ensureSaveFilename(filename: string, fallbackExt = ".bin"): string {
  const trimmed = filename.trim().replace(/\.+$/, "");
  if (!trimmed) {
    return `download${fallbackExt}`;
  }

  if (/\.[^./\\]+$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}${fallbackExt}`;
}

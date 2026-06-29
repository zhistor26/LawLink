import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("LPK 网盘集成配置", () => {
  it("lzc-manifest.yml 声明 file_handler 与全局 inject", () => {
    const manifest = readText("lzc-manifest.yml");
    expect(manifest).toContain("file_handler:");
    expect(manifest).toContain("open: /settings/import?file=%u");
    expect(manifest).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(manifest).toContain("lzc-file-chooser-inject.js");
    expect(manifest).toContain("lazycat-auth-bridge.js");
    expect(manifest).toContain("LAZYCAT_AUTH=1");
    expect(manifest).toContain("fileInput: true");
    expect(manifest).toContain("fileSystemAccess: true");
  });

  it("package.yml 声明 document/media 读写权限", () => {
    const pkg = readText("package.yml");
    expect(pkg).toContain("document.read");
    expect(pkg).toContain("document.write");
    expect(pkg).toContain("media.read");
    expect(pkg).toContain("media.write");
  });

  it("inject 脚本与 build contentdir 存在", () => {
    expect(fs.existsSync(path.join(ROOT, "content/lazycat-injects/lzc-file-chooser-inject.js"))).toBe(
      true
    );
    expect(fs.existsSync(path.join(ROOT, "content/lazycat-injects/lazycat-auth-bridge.js"))).toBe(
      true
    );
    const build = readText("lzc-build.yml");
    expect(build).toContain("contentdir: ./content");
  });
});

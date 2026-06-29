# LawLink × 懒猫网盘：全局文件选择与导入/导出/应用关联

> **用途**：新对话 handoff 文档。把本文「开发提示词」整段复制给 AI，即可按 PR 顺序实施。  
> **项目**：`D:\LawLink`（Next.js 16 + LPK 已部署 zhistor）  
> **约束**：先读本文件 + 根目录 `AGENTS.md`；Prisma 迁移需叶森确认；不要 `git push` 除非明确要求。

---

## 一、复制给 AI 的开发提示词（整段粘贴）

```
你是 LawLink 仓库的 implementer。任务：完成「懒猫网盘全局文件对接 + 案件导入/导出闭环 + 应用关联」，用于 LPK 上架审核。

必读：
- D:/LawLink/AGENTS.md
- D:/LawLink/docs/LAZYCAT-NETDISK-FILE-INTEGRATION.md（本文件全文）

背景：
- inject 已在 lzc-manifest.yml 全局挂载（fileInput + fileSystemAccess）
- package.yml 已有 document.read/write + media.read/write
- 懒猫 inject 只拦截：① input[type=file] 点击 ② blob: + download 属性的 <a>.click()
- 不拦截：<a href="/api/..."> 直链、window.open 下载 —— 当前大量代码用这种，审核过不了

硬性要求：
1. 全站所有 file input（19 处）统一走 LazyCatFileTrigger 组件，保证 inject 能 hook
2. 全站所有导出/下载（模板、报表、ZIP、材料、所内文件、ICS 等）统一走 LazyCatSaveButton（fetch→Blob→blob:URL→a.download.click()）
3. lzc-manifest.yml 增加 file_handler，网盘 xlsx 可「用 LawLink 打开」→ /settings/import?file=%u
4. 新增「可再导入」导出 API（列 = IMPORT_COLUMNS），与导入模板同格式；报表类多 sheet 导出保持独立
5. 生成并提交 fixtures/lawlink-matter-import-demo-80.xlsx（80 行民事，含故意错误行），用于关联/导入/导出验收
6. 禁止业务页各自实现网盘 fetch/PUT；复用 inject + 统一组件
7. 每 PR 后跑：npm run lint && npm run typecheck && npm run build；LPK 改动再 lzc-cli project build + lpk install

按本文件「PR1→PR5」顺序实施，不要跳步。完成后逐项勾选「验收清单」。
```

---

## 二、问题根因（AI 必须先理解）

### 2.1 inject 拦截规则（`content/lazycat-injects/lzc-file-chooser-inject.js`）

| 用户操作 | inject 是否拦截 | LawLink 现状 |
|----------|-----------------|--------------|
| 点击 `<input type="file">` | ✅ 弹「本地 / 懒猫」 | 19 处 input，manifest 已配，**但未统一 UX、未真机验收** |
| `showOpenFilePicker` / `showSaveFilePicker` | ✅ | 几乎未用 |
| `blob:` + `download` 属性 + `anchor.click()` | ✅ 弹「本地 / 懒猫保存」 | 仅 `src/lib/ics.ts` 符合 |
| `<a href="/api/.../export">` 用户点击 | ❌ 浏览器直跳 API | 模板、案件导出、报表、归档 ZIP |
| `<a href="/api/documents/.../download">` | ❌ | 材料/所内/发票/用印等大量直链 |
| `window.open('/api/documents/.../download')` | ❌ | `template-picker-dialog.tsx` |

### 2.2 审核要求（懒猫商店 + 应用关联）

- 工具类应用须声明 `file_handler`，网盘文件可关联打开（[官方文档](https://developer.lazycat.cloud/advanced-mime.html)）
- 读写网盘须 `document.read` / `document.write`（`package.yml` 已有）
- **不能**只改 1～2 个页面；须覆盖真实用户会点的全部上传/下载路径
- 导出的 xlsx 也应能被网盘关联回 LawLink（格式须与 `file_handler` MIME 一致）

---

## 三、目标架构

```
L0  LPK（已有 + 待补 file_handler）
         ↑
L1  统一组件：LazyCatFileTrigger / LazyCatSaveButton / LazyCatOpenImport
         ↑
L2  全站替换：19 处上传 + 全部下载/导出
         ↑
L3  导入/导出闭环 + fixture + 应用关联 deep link
```

**原则**：不重复实现 picker；应用层只负责把下载改成 Blob 链、把 upload 改成标准 file input 结构。

---

## 四、Canonical 格式（唯一可 round-trip / 可关联格式）

**源定义**：`src/lib/imports/matter-import.ts` → `IMPORT_COLUMNS`  
**模板生成**：`src/server/imports/template.ts` → `buildMatterImportTemplate()`  
**解析/提交**：`src/server/imports/actions.ts` → `parseMatterImportAction` / `commitMatterImportAction`  
**UI**：`src/app/(app)/settings/import/_components/matter-import-view.tsx`

| 项 | 值 |
|----|-----|
| Sheet 名 | `案件导入`（`IMPORT_SHEET_NAME`） |
| 表头 | 第 1 行，必填列带 `*` |
| 文件名前缀 | `LawLink-案件`（便于审核识别） |
| MIME（file_handler） | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`、`application/vnd.ms-excel`、`x-lzc-extension/xlsx` |

**不可关联的导出**（保持现有，deep link 打开时友好提示）：

- `src/server/matters/export-xlsx.ts` — 多 sheet 案件报表
- `src/server/reports/export-xlsx.ts` — 律所报表
- 归档 ZIP — 本期不做 zip file_handler（二期）

---

## 五、L1 组件规格（新建）

### 5.1 `src/lib/lazycat/env.ts`

```ts
export function isLazyCatRuntime(): boolean
export function isLazyCatPickerReady(): boolean  // 检测 inject / lzc-file-picker
```

启发：`LAZYCAT_AUTH=1` 或页面存在 `/_lzc/files/home` 可访问性。

### 5.2 `src/lib/lazycat/save-blob.ts`

```ts
/** fetch API 或已有 Blob → createObjectURL → <a download>.click() → 触发 inject */
export async function triggerBlobDownload(blob: Blob, filename: string): Promise<void>
export async function fetchAndDownload(url: string, filename: string, init?: RequestInit): Promise<void>
```

要点：

- `credentials: 'include'`（鉴权 API）
- 延迟 `URL.revokeObjectURL`（inject 需读 blob）
- 非懒猫环境：同样 `.click()`，等价本地下载

### 5.3 `src/components/files/lazy-cat-save-button.tsx`

```tsx
<LazyCatSaveButton
  filename="LawLink-案件导入模板.xlsx"
  fetchUrl="/api/imports/matters/template"
  // 或 getBlob={async () => buffer}
  variant="outline"
  children="下载模板"
/>
```

内部调用 `fetchAndDownload`。禁止渲染 `<a href="/api/...">`。

### 5.4 `src/components/files/lazy-cat-file-trigger.tsx`

```tsx
<LazyCatFileTrigger
  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  multiple={false}
  disabled={parsing}
  onFiles={(files) => onFile(files[0])}
>
  <Button>上传并预览</Button>
</LazyCatFileTrigger>
```

实现：

- 隐藏 `<input type="file">` + children `onClick → input.click()`（inject hook 点）
- 懒猫环境显示 hint：「点击后可从本地或懒猫网盘选择」
- 支持 `multiple`、`accept`、`disabled`
- `onFiles` 在 `change` 后触发，传 `File[]`

### 5.5 `src/lib/lazycat/open-file.ts`

```ts
export function normalizeLazyCatPath(path: string): string
export async function fetchLazyCatFileAsFile(path: string, fallbackName: string): Promise<File>
```

网盘 deep link：`GET /_lzc/files/home${normalizedPath}` → `new File([blob], name, { type })`。

### 5.6 `src/app/(app)/settings/import/_components/lazycat-open-import.tsx`

Client 组件，在 `matter-import-view` 或 import page 挂载：

1. 读 `useSearchParams().get('file')`
2. `fetchLazyCatFileAsFile` → FormData → `parseMatterImportAction`
3. 表头检测：匹配 `IMPORT_COLUMNS` → 预览；匹配报表表头 → toast「此为报表文件，请使用可再导入包」
4. 可选：导入成功后 `router.replace('/settings/import')` 清 query

### 5.7 全局 hint

- `LazyCatFileTrigger` / `LazyCatSaveButton` 自带小字 hint
- `AppShell`（如 `src/components/layout/app-shell.tsx`）懒猫环境下一次性条：「文件操作支持本地与懒猫网盘」
- 逐步移除零散的 `LazyCatDriveHint` 或改为 re-export 避免重复

---

## 六、L0 manifest 变更

在 `lzc-manifest.yml` 的 `application:` 下增加：

```yaml
  file_handler:
    mime:
      - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      - application/vnd.ms-excel
      - x-lzc-extension/xlsx
    actions:
      open: /settings/import?file=%u
```

可选：inject `text.zh-CN` 文案（与官方示例一致）：

```yaml
            text:
              zh-CN:
                openTitle: 打开
                saveTitle: 保存
                openLocal: 从本地打开
                openLazyCat: 从懒猫打开
                saveLocal: 保存至本地
                saveLazyCat: 保存至懒猫
                cancel: 取消
```

---

## 七、新增 API：可再导入导出

**路由**：`GET /api/imports/matters/export`  
**文件**：`src/app/api/imports/matters/export/route.ts`  
**逻辑**：新建 `src/server/imports/export-xlsx.ts`

- 权限：同 template route（ADMIN / PRINCIPAL_LAWYER + session）
- Query：复用 `matters-view` 筛选参数（tab/search/category/status/from/to/sortBy/sortDir），参考 `src/app/api/matters/export/route.ts` 的 params 解析
- 输出：单 sheet `案件导入`，列 = `IMPORT_COLUMNS`，数据行从 DB 映射为导入格式（中文标签：案件类型用 `matterCategoryLabel`，状态用 `matterStatusLabel`）
- 文件名：`LawLink-案件可再导入-{tab}-{yyyyMMdd}.xlsx`

**案件列表 UI**（`src/app/(app)/matters/_components/matters-view.tsx`）：

- 原「导出」→ 文案改「导出报表」，`LazyCatSaveButton` + `/api/matters/export?...`
- 新增「导出可再导入包」→ `LazyCatSaveButton` + `/api/imports/matters/export?...`

---

## 八、Fixture 测试文件

### 8.1 脚本

**路径**：`scripts/gen-lawlink-import-fixture.ts`  
**npm script**：`"fixture:import-demo": "tsx scripts/gen-lawlink-import-fixture.ts"`

生成：`fixtures/lawlink-matter-import-demo-80.xlsx`（**提交 git**）

### 8.2 内容规格

| 部分 | 数量 | 说明 |
|------|------|------|
| 有效民事行 | ~75 | `category=民商诉讼`，`status` 混合 |
| 故意错误行 | ~5 | 缺证件号、无效类型、错误邮箱等 → 预览标红 |
| 重复客户 | ~10 | 同名称+证件号，测查重 |
| 办理中 | ~60 | 测 `firstProcedureTypeFor` 首程序 |

数据生成：faker 或确定性 seed；证件号用合法格式占位；案由从 `prisma/seeds/causes-civil.ts` 三级案由抽样；`ownerEmail` 用 `admin@lawlink.local` 或 seed 用户。

### 8.3 演示入口

批量导入页增加 `LazyCatSaveButton`：

- `fetchUrl="/fixtures/lawlink-matter-import-demo-80.xlsx"`（需放到 `public/fixtures/` 或 dedicated API route 读 `fixtures/`）

---

## 九、全站替换清单（必须全部完成）

### 9.1 上传（→ `LazyCatFileTrigger`）

| # | 文件路径 | 场景 |
|---|----------|------|
| 1 | `src/app/(app)/settings/import/_components/matter-import-view.tsx` | 批量导入 xlsx |
| 2 | `src/app/(app)/settings/profile/_components/avatar-form.tsx` | 头像 |
| 3 | `src/app/(app)/settings/firm-profile/_components/firm-profile-form.tsx` | 律所 logo |
| 4 | `src/app/(app)/firm-resources/_components/upload-dialog.tsx` | 所内资源 |
| 5 | `src/app/(app)/matters/[id]/_components/documents-panel.tsx` | 案件材料 |
| 6 | `src/app/(app)/matters/[id]/_components/procedure-documents-section.tsx` | 程序材料 |
| 7 | `src/app/(app)/matters/[id]/_components/procedure-content.tsx` | 程序内上传 ×2 |
| 8 | `src/app/(app)/matters/[id]/_components/procedure-forms.tsx` | 程序表单附件 |
| 9 | `src/app/(app)/matters/[id]/_components/finance-forms.tsx` | 财务附件 ×2 |
| 10 | `src/app/(app)/matters/[id]/_components/invoice-request-sheet.tsx` | 开票依据 |
| 11 | `src/app/(app)/matters/[id]/_components/info-extras.tsx` | 补充材料 |
| 12 | `src/app/(app)/matters/[id]/_components/archive-wizard.tsx` | 归档清单 |
| 13 | `src/app/(app)/intakes/_components/intake-sheet.tsx` | 收案材料 ×2 |
| 14 | `src/app/(app)/finance/_components/invoice-create-dialog.tsx` | 开票依据 |
| 15 | `src/app/(app)/finance/_components/invoice-management.tsx` | 发票文件 |
| 16 | `src/app/(app)/approvals/seals/_components/seal-request-sheet.tsx` | 待盖章稿 |
| 17 | `src/app/(app)/approvals/seals/_components/seal-actions-dialogs.tsx` | 盖章扫描 |

### 9.2 下载/导出（→ `LazyCatSaveButton` 或 `fetchAndDownload`）

| # | 现入口 | fetchUrl / 说明 |
|---|--------|-----------------|
| 1 | `matter-import-view.tsx` `<a href="/api/imports/matters/template">` | `/api/imports/matters/template` |
| 2 | 演示 fixture | `/fixtures/lawlink-matter-import-demo-80.xlsx` |
| 3 | `matters-view.tsx` `buildExportUrl()` | `/api/matters/export?...` |
| 4 | `matters-view.tsx` 新增 | `/api/imports/matters/export?...` |
| 5 | `reports-view.tsx` `exportHref` | `/api/reports/export?...` |
| 6 | `lifecycle-actions.tsx` archive export | `/api/archive/${matterId}/export` |
| 7 | `archive/page.tsx` | 同上 |
| 8 | `template-picker-dialog.tsx` `window.open(download)` | fetch `/api/documents/${id}/download` → blob |
| 9 | `lib/ics.ts` `downloadIcs` | 改为 `triggerBlobDownload(blob, filename)` |
| 10 | `documents-panel.tsx` 下载链接 | 每项 `LazyCatSaveButton` 或 icon button 调 `fetchAndDownload` |
| 11 | `procedure-documents-section.tsx` | 同上 |
| 12 | `folders-panel.tsx` | 同上 |
| 13 | `info-panel.tsx` / `info-extras.tsx` | 同上 |
| 14 | `invoice-section.tsx` | 同上 |
| 15 | `firm-files-view.tsx` / `preview-dialog.tsx` | `/api/firm-files/${id}/download` |
| 16 | `invoice-management.tsx` | document download |
| 17 | `seals-view.tsx` / `seal-actions-dialogs.tsx` | document download |

**大文件**：单文件 >50MB 可仅本地下载（`fetchAndDownload` 内 size 阈值 + 文档说明），但须证明已评估。

---

## 十、PR 拆分（严格按序）

### PR1 — 基础设施 + 导入页试点 + fixture + file_handler

- [ ] `src/lib/lazycat/*` + `src/components/files/lazy-cat-*.tsx`
- [ ] `lzc-manifest.yml` → `file_handler`
- [ ] `scripts/gen-lawlink-import-fixture.ts` + `fixtures/` + `public/fixtures/` + npm script
- [ ] `matter-import-view.tsx` 全改用新组件
- [ ] `lazycat-open-import.tsx` deep link
- [ ] 单测：`normalizeLazyCatPath`、表头检测（可选）

### PR2 — 可再导入导出 API + 案件列表双按钮

- [ ] `src/server/imports/export-xlsx.ts`
- [ ] `src/app/api/imports/matters/export/route.ts`
- [ ] `matters-view.tsx` 双导出 + LazyCatSaveButton

### PR3 — 其余全局导出

- [ ] `reports-view.tsx`
- [ ] archive ZIP（lifecycle + archive page）
- [ ] `ics.ts` + `template-picker-dialog.tsx`

### PR4 — 全局上传（19 处）

- [ ] 按 §9.1 表格 mechanical 替换
- [ ] AppShell 全局 hint

### PR5 — 全局材料/所内/财务/用印下载

- [ ] 按 §9.2 表格 #10–17
- [ ] 真机验收 + 更新本文验收清单勾选

---

## 十一、验收清单（zhistor 真机）

### 网盘打开（上传）

- [ ] 案件材料、所内文件、用印、开票、头像、批量导入等任意上传点 → 弹「本地 / 懒猫」
- [ ] 网盘选文件后 Server Action 收到正确 `File`
- [ ] 本地路径仍可用
- [ ] `accept` / `multiple` 行为正确

### 网盘保存（下载）

- [ ] 模板、演示包、可再导入包、报表、ZIP、材料下载 → 弹「本地 / 懒猫」
- [ ] 网盘内文件可见、大小正确
- [ ] 非 LPK 环境降级本地下载不报错

### 应用关联

- [ ] 网盘 xlsx →「用 LawLink 打开」→ `/settings/import?file=...` → 预览
- [ ] fixture 75 有效行可导入；5 错误行标红
- [ ] 导出可再导入包 → 存网盘 → 再打开 → 预览行数一致
- [ ] 报表 xlsx 打开 → 友好提示（非 silent fail）

### 金线 round-trip

```
下载演示 fixture → 导入 → 列表导出可再导入包 → 存网盘 → 网盘关联打开 → 再导入
```

### 构建

- [ ] `npm run lint && npm run typecheck && npm run prisma:validate && npm run build`
- [ ] `lzc-cli project build` + `lpk install --release` → Status_Running
- [ ] 免密登录 / 页面不 infinite reload（勿破坏 auth inject）

---

## 十二、可选：DB 演示 seed（低优先级）

- 恢复 `prisma/seeds/v23-demo-matters.ts`，**仅** `SEED_DEMO_MATTERS=1` 时执行
- **不要**绑在 `SEED_ON_START=1`（LPK 生产误灌数据）
- 逻辑复用 `commitMatterImportAction` 同款，避免两套造数

---

## 十三、参考 Skills / 文档

| 资源 | 路径 / URL |
|------|------------|
| 网盘集成 skill | `lazycat-lpk-netdisk`（M1 路径，LawLink 无 COEP） |
| 应用关联 | https://developer.lazycat.cloud/advanced-mime.html |
| 文件选择器 inject | https://developer.lazycat.cloud/lazycat-file-picker-auto-intercept.html |
| 现有 inject | `content/lazycat-injects/lzc-file-chooser-inject.js` |
| 权限 | `package.yml` |
| 导入列定义 | `src/lib/imports/matter-import.ts` |

---

## 十四、红线提醒

- 不要新增 `<a href="/api/...">` 作为用户下载入口
- 不要在业务组件内直接 `PUT /_lzc/files/home`（save 交给 inject + blob 链）
- 不要改 Prisma schema（本任务无需迁移）
- 不要 force push / 不要未经确认删文件
- UI 改完在浏览器走通金线；LPK 改完在 zhistor 验

---

*文档版本：2026-06-26 · 对应会话：LawLink 批量导入网盘 + 全局文件对接*

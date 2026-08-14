# Spec: HookLens（成瘾标注）— 网页截图标注 + Report

**Status:** REVISED (supersedes extension-first demo)  
**Date:** 2026-08-14  
**Revision reason:** 最终演示形态改为**网页**，用**他人 App 截图**标注易上瘾区域并生成 **report**；浏览器扩展不再作为 demo 主路径。  
**Workspace:** ShipAny Template Two  
**Reuse principle:** 尽量复用 ShipAny theme / shared / shadcn；只新增「截图画布标注」与「报告页」所需的最少客户端 UI。

---

## 0. 变更摘要（相对上一版）

| 旧目标 | 新目标 |
|--------|--------|
| Chrome MV3 扩展在真实 Reddit DOM 上叠标签 + Twin | **网页工具**：上传/选用 App 截图 → 标注成瘾区 → 输出 Report |
| Demo Lock / Load unpacked | 浏览器打开站点即可演示 |
| 扩展为 P1 核心交付 | **扩展降级为远期可选**；本 spec 的 P0/P1 全部在 ShipAny Web |

**已上线、可保留的营销页（无需推翻）：** `/hooklens` `/patterns` `/apps` `/demo`（文案需改成「截图标注」叙事，见 §10）。

---

## 1. 一句话

用户打开 HookLens 网页，上传或选择某 App 的界面截图，在图上标注「容易让人上瘾」的区域（钩子类型 + 说明），系统汇总成一份可读的 **Addiction Report**（可分享链接 / 可打印），用于公众提示与后续「去掉这些钩子的对比目录」。

---

## 2. 核心用户流程（Demo 必须跑通）

```
选截图 → 标注钩子 → 生成 Report → 分享/对比
```

1. **选图**：上传截图，或从预置图库点选（TikTok / Instagram / 小红书 / Reddit… 示意截图）  
2. **标注**：在图片上画框或点选热点，为每块选择钩子类型（无限滚动、红点焦虑、自动播放、相关推荐…）并写一句「为什么上瘾」  
3. **Report**：自动汇总钩子列表、严重度/数量、一句话结论；可选「若去掉这些钩子会怎样」指向 `/apps`  
4. **分享**：只读报告页 URL（`/report/[id]`）

**成功标准（演示）：** 评委/朋友在 **2 分钟内**看完「截图上的标注 + 报告页」，说出「原来这些是上瘾设计」。

---

## 3. 系统边界

| 层 | 内容 | ShipAny 复用 |
|----|------|----------------|
| **Marketing** | `/hooklens` `/patterns` `/apps` `/demo` | 现有 theme blocks + locale JSON（已部分交付） |
| **Workspace（核心）** | `/analyze`（或 `/studio`）：上传 + 画布标注 | `ImageUploader`、`Button` `Badge` `Card` `Dialog` `Select` `Textarea`；**新建** `ScreenshotAnnotator` |
| **Report** | `/report/[id]` 只读报告 | `PageHeader`、`MarkdownPreview`/`Card`、`Badge`、可选 `Button` 分享 |
| **Gallery（可选 v1）** | 预置截图列表 | `showcases` 或 `features-list` 卡片进 `/analyze?sample=` |
| **Admin** | 钩子词典、预置截图、报告审核 | `TableCard` `FormCard` dashboard |
| **Data / Storage** | 截图文件 + 标注 JSON + 报告 | 现有 `/api/storage/upload-image`、Drizzle 表 |

**不做（本 demo）：** Chrome 扩展、真实 DOM 注入、Twin 实时排毒、通用「扫描任意网页」。

---

## 4. 信息架构（路由）

| Route | 角色 | 实现方式 |
|-------|------|----------|
| `/hooklens` | 产品故事 | 动态页 JSON（改文案：截图标注而非扩展） |
| `/patterns` | 钩子词典（标注时下拉同源） | 动态页 + 日后 DB SSOT |
| `/apps` | 去掉钩子后的对比目录 | `showcases`（已有） |
| `/demo` | 如何演示本网页工具 | 改成「上传 → 标注 → Report」步骤，去掉 Load unpacked |
| **`/analyze`** | **核心工具页** | **App Router 页面**（非纯 JSON block；组合 shared UI） |
| **`/report/[id]`** | **报告页** | App Router + 读库/读 JSON |
| `/admin/hooks` | 钩子 CRUD | dashboard 表单 |
| `/admin/samples` | 预置截图 CRUD | dashboard + ImageUploader |

导航建议：Header 保留 HookLens；增加 **Analyze**（核心 CTA）、Patterns、Apps、Demo。

---

## 5. `/analyze` 产品规格（核心）

### 5.1 布局（一屏可演示）

```
┌─────────────────────────────────────────────────────────┐
│  [上传截图] [选用示例]     当前 App 名（可选输入）        │
├────────────────────────────┬────────────────────────────┤
│                            │  钩子列表（侧栏）            │
│   截图画布                  │  - 类型 Badge               │
│   + 半透明标注框            │  - 说明                     │
│   + 点击选中/编辑           │  [+ 添加标注]               │
│                            │  [生成 Report]              │
└────────────────────────────┴────────────────────────────┘
```

### 5.2 标注数据（每条）

```ts
Annotation {
  id: string
  hookId: string          // 对齐 /patterns：infinite | badge | related | autoplay | …
  label: string           // 展示名（可从词典带出）
  note: string            // 「为什么让人上瘾」一句人话
  severity: 1 | 2 | 3     // 可选，默认 2
  rect: { x: number; y: number; w: number; h: number }  // 相对图片 0–1 归一化
}
```

坐标用 **相对比例（0–1）**，避免不同屏幕尺寸错位。

### 5.3 交互

- 上传：复用 `ImageUploader` → `/api/storage/upload-image`（无存储时 v0 可用本地 Object URL，仅当次会话）  
- 示例图：点击预置卡片 → 加载 URL，清空或保留标注策略写死为「换图清空」  
- 画框：mousedown-drag 创建矩形；选中后侧栏编辑 hook/note  
- 删除标注；生成 Report 时至少 **1 条**标注  

### 5.4 复用 vs 新建

| 能力 | 复用 | 新建 |
|------|------|------|
| 上传 | `ImageUploader` | — |
| 按钮/徽章/表单 | shadcn `Button` `Badge` `Select` `Textarea` `Card` | — |
| 画布标注 | — | **`ScreenshotAnnotator`**（唯一必要新组件） |
| 空态/页头 | `Empty` `PageHeader` | — |

---

## 6. Report 规格

### 6.1 内容结构

1. **标题**：`{App名或「未命名截图」} — Addiction Report`  
2. **摘要**：钩子数量、最高严重度、一句话结论（模板生成即可，v0 不必 LLM）  
3. **带标注的截图**：只读画布（同 Annotator 的 view 模式）  
4. **发现列表**：每条 = 钩子名 + note + severity  
5. **行动**：链到 `/patterns`（了解机制）、`/apps`（更干净的替代）  
6. **元数据**：创建时间；可选「示意/非正式审计」免责声明  

### 6.2 生成方式（v0）

- 点击「生成 Report」→ `POST /api/hooklens/reports` 写入 `{ imageUrl, appName, annotations[], summary }` → 跳转 `/report/[id]`  
- 无 DB 时：v0 可用 `localStorage` + 客户端路由 query（仅本机 demo）；**推荐尽快用 Drizzle 表**以便分享链接  

### 6.3 摘要模板示例

> 本截图标注了 **N** 处成瘾相关设计。最突出的是 **{topHook}**。这些模式利用（可变奖励 / 无终点滚动 / 社交压力等）延长使用时长，而非完成用户任务。

---

## 7. 数据模型（推荐）

```
HookPattern   { id, name_en, name_zh, blurb_en, blurb_zh, sort }
SampleShot    { id, title, app_name, image_url, group, published }
Report        { id, app_name, image_url, annotations_json, summary, created_at, is_public }
```

- `annotations_json`：`Annotation[]`  
- 钩子词典与 `/patterns`、标注下拉 **同一 SSOT**（先常量文件 `src/config/hooklens/hooks.ts`，再迁 admin）

---

## 8. 与已有页面的文案对齐（必改点）

| 页 | 应改成 |
|----|--------|
| `/hooklens` | CTA → `/analyze`；去掉「Load unpacked / 扩展」主叙事；强调截图标注 + Report |
| `/demo` | 步骤改为：选示例截图 → 标注 2–3 处 → 打开 Report；删除 Demo Lock / MV3 |
| `/patterns` | 说明「标注工具的下拉选项来自本词典」 |
| Header | 增加 Analyze；Demo 指向新流程 |

（实现时作为独立小功能逐页改，仍遵守「一次一个可验收功能」。）

---

## 9. 非目标

- 浏览器扩展 / 真实网页 DOM 扫描（远期可选）  
- 自动 CV/LLM 识别钩子（v0 **人工标注**即可；AI 自动识别为 P2）  
- Twin 实时排毒切换  
- 新 design system / 重做整站视觉  
- 把 Report 做成复杂 BI 仪表盘  

---

## 10. 实现分期（更新）

### 已完成（营销壳）

- [x] `/hooklens` `/patterns` `/apps` + header HookLens  
- [ ] `/demo` 已存在但文案仍偏扩展 → **改文案**记为后续功能  

### P0 — 可演示的网页核心

1. [x] `/analyze` 页骨架（上传区 + 示例线框图 + 画布展示；钩子 SSOT 随标注一并做）  
2. `ScreenshotAnnotator`：画框 + 侧栏编辑 + 列表  
3. 预置 3–5 张示例截图（可先放 `public/imgs/hooklens/samples/` 或 picsum + 标题）  
4. 生成 Report（DB 或 localStorage）+ `/report/[id]` 只读页  
5. 更新 `/hooklens` `/demo` CTA 与文案指向 `/analyze`  
6. Header 增加 Analyze（及可选 Patterns/Apps/Demo）  

### P1 — 完整一点

7. Drizzle `reports` + 可分享公开链接  
8. Admin：hooks / samples  
9. Report 打印样式（`print:` Tailwind）  
10. `/apps` 与报告「行动建议」深链  

### P2 — 增强

11. LLM 根据标注草拟更长报告（可选）  
12. 批量多图报告  
13. 扩展版（若仍需要）从报告导出「应在真实 DOM 查找的钩子」  

---

## 11. 验收标准（新 Demo）

- [ ] 不安装任何扩展，仅用浏览器完成：示例图 → ≥2 条标注 → Report 页  
- [ ] 标注框在缩放窗口后位置仍大致正确（归一化坐标）  
- [ ] Report 含截图（带框）+ 列表 + 摘要 + 链到 `/patterns` 或 `/apps`  
- [ ] 中英：工具页关键文案至少覆盖默认 locale；营销页保持 en/zh  
- [ ] 新增 UI 仅限 Annotator + analyze/report 页面编排；营销仍用现有 blocks  

---

## 12. 已锁定决策（2026-08-14）

1. 路由：`/analyze`  
2. Report：v0 本机可演示即可（localStorage / 会话）；可分享链接进 P1（Drizzle）  
3. 示例图：占位/线框示意（避免真实 App UI 版权问题）  
4. 标注：仅矩形框（归一化坐标）  

---

## 13. 相关文档

- 旧 office-hours / eng（扩展 Twin）仍保留作历史；**demo 以本文为准**  
- 已实现营销页与本仓库 `docs/specs/` 同步  
- Wireframe（扩展 Twin）可弃用或改为「报告页线框」后续重画  

---

## 14. 推荐下一步（实现）

在你确认本修订 spec 后，按 P0-1 开工：**可运行的 `/analyze` 骨架（上传或选示例图显示在页上）**，验收通过再 commit/push，然后再做画框标注。

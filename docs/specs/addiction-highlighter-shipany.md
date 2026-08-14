# Spec: HookLens（成瘾标注）— ShipAny 复用优先

**Status:** DRAFT → ready for implementation planning  
**Date:** 2026-08-14  
**Sources:** office-hours design `frank-unknown-design-20260814-110700.md` (APPROVED) · eng plan `frank-unknown-eng-plan-20260814.md` (APPROVED)  
**Workspace:** ShipAny Template Two (`shipany-template-two`)

---

## 1. 一句话

**Chrome 扩展**在 Reddit（v0）上标注成瘾机制并提供 Addicted ↔ Detoxed；**ShipAny 站点**负责对外讲故事、钩子百科、干净替代目录与后台内容运营——**站点侧尽量只拼现有 theme blocks / shared blocks，不新造设计系统。**

---

## 2. 系统边界（必须分清）

| 层 | 运行时 | 能否复用 ShipAny React 组件 | 交付物 |
|----|--------|------------------------------|--------|
| **A. 扩展** | Chrome MV3 content/popup | **否**（独立 DOM，不进 Next bundle） | `extension/`（见 eng plan） |
| **B. 站点** | Next.js ShipAny | **是**（theme + shared + shadcn） | 动态页 JSON + 少量 admin 页 |
| **C. 数据** | Drizzle / 现有 DB | 复用 ShipAny data 层模式 | `hooks` / `apps` / `annotations` 表（v1 可先 JSON/静态） |

**原则：** 扩展按 eng plan 实现；本 spec 只规定 **B（+C）如何用 ShipAny 拼出来**，以及 A↔B 的衔接（下载、Demo Lock 说明、截图/录屏托管）。

---

## 3. 产品信息架构（站点）

### 3.1 对外路由（建议）

| Route | Slug（locale JSON） | 目的 | 优先复用的 block |
|-------|---------------------|------|------------------|
| `/`（改品牌后）或 `/hooklens` | `pages/index` 改造 **或** 新页 `pages/hooklens` | 落地：认识陷阱 → 装扩展 / 看目录 | `hero` `logos` `features` `features-step` `stats` `faq` `cta` |
| `/patterns` | `pages/patterns` | 成瘾钩子百科（taxonomy） | `features-list` 或 `features-accordion` + `faq` |
| `/apps` | `pages/apps` | 「干净替代 / 对比」目录 | **`showcases`**（groups = 品类） |
| `/demo` | `pages/demo` | 90s 演示说明 + 录屏/截图 | `features-media` + `features-step` + `cta` |
| `/pricing` | 现有 `pages/pricing` | 可选：Pro（更多站点适配） | 现有 `pricing` |
| `/blog/*` | 现有 blog | 深度文章（某 App 拆解） | `blog` / `blog-detail` |
| `/docs/*` | 现有 docs（若启用） | 安装扩展、Demo Lock | fumadocs 现成 |

**推荐 v1：** 新建动态页 `hooklens` / `patterns` / `apps` / `demo`，**先不动**现有 marketing `index`，避免和 ShipAny 模板首页冲突；域名指向后再把 `index` 换成品牌首页。

### 3.2 对内 Admin（复用 dashboard）

| Route | 能力 | 复用 |
|-------|------|------|
| `/admin/hooks` | 钩子词典 CRUD（id、文案、severity、detox 类型） | `Header` `Main` `MainHeader` + **`TableCard`** + **`FormCard`** |
| `/admin/apps` | 应用/替代条目 CRUD（截图、分组、外链、「无哪些钩子」标签） | 同上 |
| `/admin/demos` | Demo Lock 素材（录屏 URL、pinned post、选择器备注） | `FormCard` + `MarkdownEditor` / 现有 upload |

Auth / RBAC / sidebar：走现有 `(admin)` 布局与权限，**不重写后台壳**。

---

## 4. 页面规格（ShipAny blocks 映射）

### 4.1 `/hooklens` — 产品落地页

`show_sections` 建议：

1. **hero** — 品牌名 HookLens；一句话：「标注成瘾机制，而不是再装一个 Screen Time」；CTA：`安装扩展说明` → `/demo`，次 CTA → `/apps`
2. **logos**（可选）— 「不是这些」对比：Screen Time / 拦截类扩展（用文字 logo 或占位图）
3. **introduce**（`features` / `features-media`）— 现场叠加标注的示意（占位图 → 之后换录屏截帧）
4. **benefits**（`features-list`）— 三条：看见机制 · Twin 对比 · 指向干净产品
5. **usage**（`features-step`）— ① Load unpacked ② 打开 Reddit ③ Twin 切换（对齐 eng 脚本）
6. **stats**（可选）— 先占位，有数据再填
7. **faq** — 与 Screen Time 区别、是否收集浏览数据（本地）、v0 仅 Reddit 等
8. **cta** — 去 `/apps` 或订阅（现有 `subscribe`）

**禁止 v1 新造：** 自定义 3D、复杂仪表盘、紫色 AI 光效英雄区。沿用 default theme 视觉。

### 4.2 `/patterns` — 钩子百科

- Block：`features-accordion`（每条钩子 = 一项：名称、一句话、detox 行为、示例 App）
- 或 `features-list`（卡片网格）
- 文案来源：eng plan 钩子表（infinite / badge / related / autoplay…）
- CTA → `/demo`

**数据：** v1 可写死在 locale JSON；v1.1 改为 admin `hooks` 表驱动同一 block 的 `items`。

### 4.3 `/apps` — 干净替代 / 对比目录（对齐「排除成瘾功能的对比项目」）

- Block：直接复用 **`showcases`**  
  - `groups`：如 `social` / `video` / `news` / `tools`  
  - `items[]`：`title` `description` `url` `image` `group`  
  - `description` 约定格式：`无：无限滚动 · 无：自动播放` 等钩子标签文案
- 顶部可用 `page` title + 短 description（`showcases` 已支持）
- **不新造**对比表格组件；若要表格，用 admin 的 `Table` 类型在 **控制台页** 展示，公开展示仍用 showcases 卡片

### 4.4 `/demo` — 演示与 Demo Lock

- `features-media`：主视觉 = 录屏或 twin wireframe 截图（placeholder：`picsum` seed）
- `features-step`：与 eng **Scripted demo path** + **Demo Lock** 六步清单一致
- `cta`：链到 Chrome 扩展说明（GitHub Release / zip / 文档）
- 可选 `faq`：选择器过期怎么办 → 放录屏

### 4.5 Blog（可选但推荐）

- 一篇：「Reddit 上的四种上瘾钩子」→ 内链 `/patterns` `/demo`
- 复用现有 blog 流，**零新组件**

---

## 5. UI 组件复用清单（实现时对照）

### 5.1 Theme blocks（落地页 JSON）

| Block 文件 | 用途 |
|------------|------|
| `themes/default/blocks/hero.tsx` | 首页英雄区 |
| `features.tsx` / `features-list.tsx` / `features-step.tsx` / `features-media.tsx` / `features-accordion.tsx` | 介绍、步骤、百科 |
| `showcases.tsx` | `/apps` 目录 |
| `faq.tsx` / `cta.tsx` / `stats.tsx` / `logos.tsx` | 辅助区 |
| `header.tsx` / `footer.tsx` | 全局（改文案/导航即可） |
| `blog.tsx` / `blog-detail.tsx` | 内容营销 |

### 5.2 Shared blocks（后台与通用）

| Block | 用途 |
|-------|------|
| `shared/blocks/dashboard/*` | Admin 壳 |
| `shared/blocks/table/TableCard` | hooks/apps 列表 |
| `shared/blocks/form/FormCard` | 创建/编辑 |
| `shared/blocks/common/PageHeader` `SectionHeader` `Empty` `LazyImage` | 内页标题与空态 |
| `shared/blocks/common/MarkdownPreview` | 钩子长说明 |
| `shared/blocks/sign/*` | 若要登录才能下扩展 Pro |

### 5.3 shadcn UI（仅当拼自定义碎片时）

优先：`Button` `Badge` `Card` `Tabs` `Dialog` `Table` `Tooltip`  
**扩展 popup 不引用这些**（独立 HTML/CSS）。

### 5.4 v1 **允许**的唯一新 UI（尽量延后）

| 组件 | 何时才做 | 说明 |
|------|----------|------|
| `TwinPreview`（可选） | 仅当静态录屏不够「哇」 | Client 组件：Tabs Addicted/Detoxed，复用 `Tabs`+`Badge`；**不要**重写整套 design system |
| 扩展仓库 | 按 eng plan | 与 ShipAny 解耦的目录 `extension/` |

其余「看起来需要新页面」的需求，先映射到上表 blocks。

---

## 6. 内容与文案约定（中英）

- Locale：`en` + `zh` 双份 JSON（ShipAny `localeMessagesPaths`）
- 品牌临时名：**HookLens** / 副标题「看见上瘾的设计」
- 差异化一句话（已验证）：**不是 Screen Time，是给陷阱贴标签**
- 钩子文案与扩展 `label` **同一套字典**（admin 为 SSOT 后扩展可导出 JSON）

---

## 7. 数据模型（站点 v1.1；v1 可静态）

```
HookPattern { id, name_en, name_zh, blurb, detox_type, page_kinds[], sort }
AppListing  { id, title, url, image, group, missing_hooks[], description, published }
DemoAsset   { pinned_urls, recording_url, selector_notes, updated_at }
```

- ORM：沿用项目 Drizzle 模式（参考现有 `users` 等表风格）
- v1：**locale JSON + showcases items** 即可上线站点；扩展仍用 eng plan 内联选择器

---

## 8. A↔B 衔接

| 扩展（A） | 站点（B） |
|-----------|-----------|
| README Demo Lock | `/demo` features-step 同步 |
| 钩子 label 文案 | `/patterns` accordion 同步 |
| 备份录屏文件 | `/demo` features-media + 可选 R2/本地 `public`（或外链） |
| 安装方式 | CTA → docs 或 GitHub Release |
| 好友金句（assignment） | 可进 testimonials（有真实引用后再加） |

---

## 9. 非目标（站点）

- 站点内嵌「扫描任意网页」的通用检测器（那是扩展 10x）
- 用 ShipAny 重写 content script
- 新 theme / 新色彩体系
- 首屏堆砌数据看板、多 CTA、卡片墙英雄区

---

## 10. 实现分期

### P0 — 站点可演示（复用 blocks only）

1. `create_dynamic_page`：`hooklens` `patterns` `apps` `demo`（en/zh）  
2. 注册 `localeMessagesPaths`  
3. Header 导航链到上述页  
4. 文案对齐 office-hours + eng plan  
5. `/apps` 先放 4–6 条「干净/较干净」占位产品（可标注虚构/待核实）

### P1 — 与扩展并行

6. `extension/` 按 eng plan  
7. `/demo` 换真实录屏  
8. Demo Lock 文案冻结

### P2 — 运营化

9. Admin CRUD hooks/apps  
10. showcases/patterns 改为读 DB  
11. Blog 首更  

---

## 11. 验收标准（站点）

- [ ] 四个动态页均可在 `/{locale}/...` 打开，且 **未新增 theme block 文件**（P0）
- [ ] `/apps` 仅用 `showcases` 即可理解「缺哪些钩子」
- [ ] `/demo` 步骤与 eng Scripted path / Demo Lock 一致
- [ ] 中英 JSON 齐全
- [ ] 扩展仍可独立 Load unpacked（不依赖站点构建）

---

## 12. 开放问题

1. 品牌定名：HookLens 是否最终名？  
2. 首页是替换 `pages/index` 还是子路径 `/hooklens`？  
3. `/apps` 条目是否必须真实可点，还是 demo 可用「示意」？  
4. 是否启用定价（复用 `/pricing`）还是完全免费？

---

## 13. 相关文档

- Design: `~/.gstack/projects/shipany-template-two/frank-unknown-design-20260814-110700.md`
- Eng: `~/.gstack/projects/shipany-template-two/frank-unknown-eng-plan-20260814.md`
- Wireframe: `~/.gstack/projects/shipany-template-two/designs/twin-wireframe-sketch.html`

# OneFrame NAS Edition · 项目完整说明

> 版本：**v1.21**（2026-10-10）
> 本文件是当前版本的完整项目文档（架构、样式系统、统一预览缩放机制、导出、部署与开发指南）。
> 历史版本记录见 [`changelogs/`](./changelogs/)；更早归档见 [`archive/`](./archive/)；面向 AI 工具的旧版认知指南见 [`AI_PROJECT_GUIDE.md`](./AI_PROJECT_GUIDE.md)（v1.16 时代，部分内容已过时）。

---

## 一、项目概述

**OneFrame NAS Edition** 是 [OneFrame](https://github.com/IceyVanci/OneFrame) 的 Docker/NAS 移植版本：将原始 Electron 桌面应用迁移为**纯前端 Web 应用**（零构建，原生 HTML/CSS/JS ES Module），通过 Nginx + Docker 容器化部署，局域网内设备浏览器访问。

### 核心特性
- **智能 EXIF 读取**：自动识别相机厂商并显示对应 Logo，提取光圈/快门/ISO/焦距/时间/机型
- **20 种边框样式（Type A–T）**：底部边框、画中画、全幅叠加、胶片边缘、杂志留白等风格
- **EXIF 保留**：导出时自动将原图 EXIF 嵌入输出 JPEG
- **统一预览缩放（v1.21）**：20 种样式共用一套「填满式」缩放机制，画布完整可见、随窗口等比适配
- **纯前端零构建**：无需 Node.js/打包工具，静态文件直接运行

### 技术栈
| 模块 | 方案 | 说明 |
|------|------|------|
| 运行环境 | Nginx + Docker | 纯前端静态服务 |
| 前端 | 原生 HTML/CSS/JS（ES Module） | 零构建 |
| 图片预览 | DOM + CSS + JS 动态布局 | 实时预览 |
| EXIF 读取 | exifreader（本地 assets） | 浏览器端解析 |
| EXIF 写入 | piexifjs（本地 assets） | 导出保留 EXIF |
| 字体 | opentype.js（B/E 矢量轮廓）+ CSS @font-face（其余） | MiSans |
| 图标 | Font Awesome（本地） | — |

---

## 二、快速开始（部署）

### 方式一：Docker Compose（推荐）
```bash
git clone https://github.com/IceyVanci/OneFrame-nas.git
cd OneFrame-nas
docker compose up --build -d
# 访问 http://<NAS-IP>:8888
```

### 方式二：预编译镜像
从 GitHub Releases 下载镜像 tar：
```bash
docker load -i oneframe-web-v1.21-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

### 方式三：Cloudflare Pages（免费静态托管）
Fork 仓库 → Pages → Connect to Git → Build command 留空 → Build output directory 填 `src/renderer`。

### 本地开发
```bash
npx serve src/renderer          # 或 python -m http.server 3000 -d src/renderer
.\dev.ps1                       # Windows：生成 manifest + docker 构建
```

常用管理命令：`docker compose ps / logs -f / down / up --build -d`。端口在 `docker-compose.yml` 修改（默认 `8888:80`）。

---

## 三、样式系统（Type A–T）

每个样式由「CSS + 预览模块 + 导出模块 + 编辑面板配置」四件套组成，经注册表统一管理。

| 样式 | 布局特点 |
|------|----------|
| **A** | 白色下边框，边框高度 5%–30% 可调，完整编辑面板 |
| **B** | 正方形画布，图片居左，右侧参数+Logo（**仅接受竖图**） |
| **C** | 横向布局：Logo 左、参数右，竖图字号自动缩放 |
| **D** | 横向布局：Logo 居中，左时间+机型、右参数+署名 |
| **E** | 3:2 纵向画布：顶部 1:1 图片（可拖动裁剪），底部白色参数区 |
| **F** | 画中画：上留白 + 中照片（竖图 90% / 横图 80%）+ 下文字 |
| **G** | 画中画：居中 Logo + 日期\|参数\|机型 + 署名 |
| **H** | 全画幅叠加：照片填满，底部叠加 Logo+文字，文字颜色可选 |
| **I** | 极简叠加：Logo 顶中、底部仅署名，竖图字号 +50% |
| **J** | 署名 + 三栏参数（左机型/中参数/右时间） |
| **K** | 左下角 Logo + 双行文字（署名+日期 / 机型+参数） |
| **L** | 高斯模糊背景 + 清晰照片居中 + 白色文字 |
| **M** | 四边模糊背景各 5% + 清晰照片 90% + 顶部 Logo + 底部署名参数 |
| **N** | 上下对称边框：顶 Logo 居中 + 中照片（12px 圆角）+ 底参数+署名 |
| **O** | 胶片参数：品牌/型号下拉+手输，黑色署名水印 |
| **P** | 参数布局：机型 Semibold + 品牌 Logo + 参数胶囊，照片原比例完整显示 |
| **Q** | 简洁布局：四边 2.5% 边框自动取图片主色，右下 "Foto by" 署名 |
| **R** | 胶片边缘打印：Pentax 645N 风格，画布锁定 645 单帧比例，右侧竖排橙色参数 |
| **S** | 留白排版：白色画布 + 居中方形照片（82%）+ 左侧两行文字 + 右侧竖排日期 + 右下参数；比例 1:1 / 1:1.35 |
| **T** | 满幅无边框：照片铺满画布 + 与 S 相同的文字系统（带淡阴影）；比例 1:1 / 1:1.35 |

### 编辑能力
Logo / 拍摄参数 / 拍摄时间开关、自定义署名、边框颜色与高度、文字颜色（H/I/J/Q/S/T 等）、画布比例（S/T）、照片拖动裁剪（E/R/S/T）、图片主色取色（Q/S/T）等，按样式显示对应面板项（`js/components/type-X-editor-panel.js`）。

---

## 四、技术架构与目录结构

```
OneFrame-nas/
├── docker/
│   ├── Dockerfile              # nginx:alpine；构建期生成 sample-manifest
│   └── nginx.conf
├── docker-compose.yml          # oneframe-web：8888→80
├── dev.ps1                     # 本地开发构建脚本
├── scripts/                    # manifest 生成 / 样本压缩
├── docs/                       # 文档（本文件 + changelogs/ + archive/ + 指南）
├── CHANGELOG.md                # 全版本更新日志
└── src/renderer/               # 前端静态资源（构建上下文根）
    ├── index.html              # 首页图片墙 + 编辑器 + 关于弹窗
    ├── index.css               # 全局样式（@import type-A/B、@font-face、移动端）
    ├── css/type-{A..T}.css     # 各样式布局
    ├── js/
    │   ├── app.js              # 主逻辑：导入/updateBorder 统一分派/导出分发
    │   ├── exporter.js         # 导出注册表与 EXIF 嵌入
    │   ├── exif.js / exif-exporter.js
    │   ├── config.js / mobile.js / logo-utils.js / thumbnail-selector.js
    │   ├── styles/
    │   │   ├── index.js        # 样式注册表（preview + export）
    │   │   ├── preview-scale.js        # 统一缩放模块（v1.21 新增）
    │   │   ├── font-loader.js / canvas-utils.js
    │   │   ├── type-{A..T}-preview.js  # 预览模块
    │   │   └── type-{A..T}-export.js   # 导出模块
    │   └── components/type-{A..T}-editor-panel.js
    ├── logos/ fonts/ assets/ Sample/
    └── sample-manifest.json
```

> `type-A.css`/`type-B.css` 由 `index.css` 顶部 `@import`；`type-C~T.css` 由 `index.html` `<link>` 引入。

---

## 五、预览系统与统一缩放机制（v1.21 重点）

### 5.1 设计画布与「填满式」适配
每个样式的预览模块提供 `calcSize()`，返回该样式的**设计画布尺寸**（以原图像素为单位，包含底栏/边框/留白）。`app.js` 统一将设计画布按预览区 96% 等比适配：

```js
// js/styles/preview-scale.js
scale = min(availWidth / canvasWidth, availHeight / canvasHeight, 1)   // ≤1，小图不上采样
displayWidth  = round(canvasWidth  * scale)
displayHeight = round(canvasHeight * scale)
// availWidth/Height = previewArea.clientWidth/Height × 0.96
```

- **A–E（v1.21 起）**：由旧 CSS 上限（900px/80vh）改为填满式大画布，观感与 F–T 一致
- **F–T**：迁移到同一机制，几何 0px（逐像素与旧实现一致）
- **B**：设计方形 `round(图片高×1.1)`；内容按**实际渲染方形**缩放（frameWrapper 有 `overflow:hidden`，窄窗会被 flex 收缩）
- **E**：设计画布 `短边 × round(短边×1.5)`；验收允许 ≤1px（旧实现双次舍入）

### 5.2 统一模块接口
```
init(elements)                                  // { img, frameWrapper, photoFooter, borderContent }
calcSize(settings) -> { canvasWidth, canvasHeight }   // 设计画布（A–E 返回 canvasWidth；F–T 返回 squareSize，app.js 归一）
updateFrameWrapper(displayWidth, displayHeight) // 显式画布显示尺寸 + 基准字号
updatePreview(displayWidth, displayHeight, imgDims, settings)
updateContentPreview(elements, settings)        // 渲染文字/Logo（早已统一）
reset()                                         // 还原默认结构与类名（保留元素引用）
```
`app.js updateBorder()` 中 A–T 走**同一分支**（约 `app.js:1321`），逐样式差异全部收敛到各自模块的 `calcSize/updatePreview`。

### 5.3 各样式设计画布（摘要）
| 样式 | 设计画布公式（原图像素） |
|---|---|
| A / C / D | `{ nW, nH + round(min(nW,nH) × 边框百分比/100) }` |
| B | 方形 `round(nH × 1.1)`（仅竖图） |
| E | `{ min(nW,nH), round(min(nW,nH) × 1.5) }` |
| F / L / N / O / P / Q / R | 模块内部公式（照片占比 / 窗口比例等，详见各模块 `calcSize`） |
| G / H / I / J / K / M | 图片原始尺寸（叠加 / 画中画类） |
| S | `round(短边 / 0.82)` × 比例（`1:1` / `1:1.35`） |
| T | 图片尺寸 × 照片比例（`1:1` / `1:1.35`） |

### 5.4 设计尺寸缓存
F–T 的 `calcSize` 结果缓存在 `previewDesignCache`（Map，键=样式 ID）：
- **图片加载时**（文件/路径两种导入）统一 `clear()`
- **S/T 比例切换时** `delete('type-s')` / `delete('type-t')`（保留旧版「切 S 同时清 T」语义）
- A–E 不缓存（含 `borderPercent` 等实时参数）

### 5.5 旧实现保留策略（下版本清理）
改造过程中所有被替换的旧实现均以 `// ===== [LEGACY …] =====` 注释保留在文件内（app.js 各样式旧分支与缓存变量块、`preview-scale.js` 的 `computeLegacyCssAvail`、A/C/D/B/E 预览模块的旧 `calcSize/updateFrameWrapper/updatePreview` 等），用于回滚。**计划在下一版本更新中统一清理**（含死代码：`shortSide`、`typeBPreview` 死导入、`calcBorderSize`×3、`setOriginalDimensions`、E 拖动提示挤压修复等）。

### 5.6 验证方法（本项目实践）
- 改造前采集**基线矩阵**（多视口 × 竖/横图 × 各样式），改造后逐字段严格对比：迁移类样式要求 **0px**（F–T），E 允许 **≤1px**
- 冒烟：样式切换无残留/重建、导出尺寸、移动端、0 页面错误
- 全量回归：`smoke-all` 一次遍历 20 样式
- 语法检查（Node v24 ESM 需用 stdin 方式，避免 `node --check` 对块注释漏检）：
  `Get-Content -Raw -Encoding UTF8 <file> | node --input-type=module --check`

---

## 六、导出系统

- **分发**：`exporter.js` 注册表 → `getExportRenderer(styleId)` → 各样式 `renderImage(img, options)`
- **渲染**：各样式 `type-X-export.js` 独立 Canvas 渲染（画布尺寸公式与预览设计画布一致，预览/导出比例镜像）
- **EXIF**：导出后用 piexifjs 将原图 EXIF 嵌入输出 JPEG
- **字体**：
  - B/E：opentype.js `getPath`（矢量轮廓，`loadMiSansFonts()`）
  - 其余：`ctx.fillText` + CSS 'MiSans'，导出前 `await ensureCssFontsReady()`
  - `loadMiSansFonts` 失败返回 null，B/E 有降级守卫不中断导出
- **圆角**：统一使用 `canvas-utils.js` 的 `roundedRectPath`（兼容 `ctx.roundRect` 缺失环境）
- **B 预览照片圆角**（v1.21）：预览按 `round(12 × 显示方形/900)` 设置 `border-radius`，与导出 `round(12 × 设计方形/900)` 同比例

---

## 七、数据流

```
选择样式卡片 → <input type="file"> → loadImageWithExif(file)
  → URL.createObjectURL 显示 → getExif 解析 → 自动填充表单 + 匹配 Logo → showEditor

输入/开关/resize/图片 load → updateBorder()
  → A–T 统一路径：init → reset → calcSize（F–T 走缓存）→ 0.96 fit
  → updateFrameWrapper → updatePreview → updateBorderContent（updateContentPreview）

点击保存 → getEditSettings() → exportImage(img, options)
  → renderImage → DataURL → 嵌入 EXIF → <a download>
```

---

## 八、移动端适配

- `mobile.js` 按 UA 注入 `<html class="is-mobile">`，另有 `@media (max-width:768px) and (pointer:coarse)` 兜底
- 编辑器底部操作栏 + 抽屉面板（70vh，下滑关闭），触摸控件加大
- 填满式预览下，移动端画布与文字随窗口等比缩小（A/C/D 的 em 字号缩放已随 v1.21 修复）
- **已知问题（待下版本修复）**：E 的拖动提示 `.type-e-drag-hint` 是 flex 兄弟元素，窄窗/移动端会挤压画布导致右侧内容裁切

---

## 九、开发指南

### 添加新样式（以 Type X 为例）
1. `src/renderer/css/type-X.css` — 布局（选择器限定 `.frame-wrapper.type-x`；填满式需 `max-width/max-height:none !important` 覆盖）
2. `src/renderer/js/styles/type-X-preview.js` — 预览模块（实现统一接口；`calcSize` 返回设计画布）
3. `src/renderer/js/styles/type-X-export.js` — 导出模块（`renderImage`，画布公式与预览一致）
4. `src/renderer/js/components/type-X-editor-panel.js` — 面板显隐
5. `src/renderer/js/styles/index.js` — import + 注册 + re-export
6. `src/renderer/js/exporter.js` — 注册导出
7. `src/renderer/index.html` — CSS `<link>` + 样式卡片（`data-style="type-x"`）
8. `src/renderer/js/app.js` — 加入统一路径条件（如需缓存，加入 `usesDesignCache` 列表）；面板配置器注册
9. 样本图 `Sample/{id}-TypeX-sample_compressed.jpeg`（构建/dev.ps1 自动入 manifest）
10. 若用圆角：调用 `roundedRectPath`，勿直接用 `ctx.roundRect`

### 添加相机 Logo
Logo SVG 放入 `src/renderer/logos/`（命名 `{厂商名}.svg`），在 `js/logo-utils.js` 的 `logoList` 增加厂商名。

---

## 十、已知坑位（维护必读）

1. **CSS 作用域**：各样式选择器必须限定 `.frame-wrapper.type-x`；覆盖全局 `.frame-wrapper img` 时使用 `> img`（仅主图，避免误伤底栏内的 logo）。
2. **字号缩放**：填满式下预览文字用 em 相对容器基准字号（A/C/D `round(12×显示长边/900)`、E `round(24×显示方形/480)` 等），必须镜像导出公式；小画布下限 `max(8, …)`。
3. **fit 公式**：`min(可用区×0.96/设计尺寸, 1)`；可用区取 `previewArea.clientWidth`（含 padding，窄屏存在约 1 个 padding 的轻微外溢，待评估修正）。
4. **设计尺寸缓存**：F–T 缓存于 `previewDesignCache`；换图必须 `clear()`，比例类参数（S/T）切换必须 `delete` 对应键。
5. **显示开关两端一致**：showLogo/showModel/showParams/showTime/showSignature 等必须预览与导出一致处理。
6. **字体**：新导出模块若用 fillText 必须 `await ensureCssFontsReady()`；不要重复 `opentype.load`。
7. **圆角**：统一 `roundedRectPath`。
8. **manifest**：新增样本按命名规范自动入清单，勿改硬编码列表。
9. **Type B 仅接受竖图**（横图 alert 拒绝）；**E 拖动提示挤压**待下版本修复。
10. **LEGACY 注释**：文件内 `[LEGACY …]` 块为回滚保留的旧实现，修改时勿混淆；下版本更新统一清理。

---

## 十一、与原始 Electron 版差异

| 项目 | Electron 版 | NAS/Web 版 |
|------|-------------|------------|
| 主进程 | main.js + preload.js | 无 |
| 文件选择/保存 | Electron 对话框 | `<input type="file">` / `<a download>` |
| 图片加载 | `file://` | `URL.createObjectURL()` |
| Logo / 外部资源 | Electron API / CDN | 静态目录（本地 assets） |
| 部署 | electron-builder | Docker + Nginx |
| 字体 | opentype.js（全部） | opentype（B/E）+ CSS woff2（其余） |
| 预览缩放 | CSS 上限 | 统一 0.96 填满式（v1.21） |

---

## 十二、文档索引

| 文档 | 说明 |
|------|------|
| `docs/README.md`（本文） | 当前版本完整说明 |
| [`docs/changelogs/`](./changelogs/) | 历史版本记录（v1.08–v1.21 的 release/变更说明） |
| [`docs/archive/`](./archive/) | 更早归档（v1.00–v1.09 记录、历史报告等） |
| [`CHANGELOG.md`](../CHANGELOG.md) | 全版本更新日志 |
| [`README.md`](../README.md) | 仓库首页（简介/部署/使用） |
| [`migration-guide.md`](./migration-guide.md) | Electron → Docker 移植方法论（通用参考） |
| [`AI_PROJECT_GUIDE.md`](./AI_PROJECT_GUIDE.md) | 旧版 AI 认知指南（v1.16 时代，部分过时） |
| [`function_analysis.md`](./function_analysis.md) | 旧版函数分析（A–N 时代，部分过时） |
| [`preview-scaling-report.md`](./preview-scaling-report.md) | 历史分析报告（2026-07，问题已由 v1.21 解决） |

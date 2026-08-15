# OneFrame NAS Edition AI 项目认知指南

> 面向 AI 工具/开发者：帮助快速理解 OneFrame NAS 版本（v1.16）的架构、功能与代码组织。
> 本文件随版本更新维护。

---

## 一、项目概述

**OneFrame NAS Edition** 是 [OneFrame](https://github.com/IceyVanci/OneFrame) 的 Docker/NAS 移植版本。将原始 Electron 桌面应用迁移为纯前端 Web 应用，通过 Docker 容器化部署在 NAS 上，局域网内设备可通过浏览器访问。

### 核心特性
- 智能 EXIF 读取：自动识别相机厂商并显示对应 Logo
- 14 种边框样式（Type A–N）
- EXIF 保留：导出时自动保留原图 EXIF 信息
- 纯前端：零构建方案，无需 Node.js

### 技术栈
| 模块 | 技术方案 | 说明 |
|------|----------|------|
| 运行环境 | Nginx + Docker | 纯前端 Web 应用 |
| 前端 | 原生 HTML/CSS/JS（ES Module） | 无需构建工具 |
| 图片预览 | CSS + JS 动态布局 | 实时预览边框效果 |
| EXIF 读取 | exifreader | 浏览器端读取 EXIF（本地加载） |
| EXIF 写入 | piexifjs | 导出时保留 EXIF（本地加载） |
| 字体渲染 | opentype.js（Type B/E）+ CSS @font-face（其余） | 见 §七 字体加载策略 |
| 图标库 | Font Awesome | 本地加载 |

---

## 二、文件结构

```
OneFrame-nas/
├── docker/
│   ├── Dockerfile              # nginx:alpine 镜像定义（构建时生成 manifest）
│   └── nginx.conf              # CORS、gzip、缓存策略
├── docker-compose.yml          # 服务定义、端口映射（默认 8888:80）
├── dev.ps1                     # 本地开发：生成 manifest + docker 构建
├── scripts/
│   ├── generate-manifest.sh    # Docker 构建期扫描 Sample 生成 manifest（扫描式）
│   └── compress-type-n.ps1     # 样本压缩工具（ffmpeg）
├── docs/                       # 变更记录、指南、计划
└── src/renderer/               # 前端静态资源（构建上下文根）
    ├── index.html              # 主页面（首页图片墙 + 编辑器 + 关于弹窗）
    ├── index.css               # 全局样式（含 @import type-A/B、@font-face、移动端）
    ├── css/type-{A..N}.css     # 各样式布局（大写文件名）
    ├── js/
    │   ├── app.js              # 主逻辑入口（updateBorder/导入/导出分发）
    │   ├── config.js           # 导出命名模式等配置
    │   ├── exif.js             # EXIF 读取（exifreader，显示用）
    │   ├── exif-exporter.js    # EXIF 导出（piexifjs）
    │   ├── exporter.js         # 导出分发（exportStyles 注册表）
    │   ├── logo-utils.js       # 厂商 Logo 工具
    │   ├── mobile.js           # 移动端 UA 检测 + 面板手势/滚动锁定
    │   ├── thumbnail-selector.js # 首页缩略图随机选取（sample-manifest 清单法）
    │   ├── styles/
    │   │   ├── index.js        # 样式注册表（preview + export）
    │   │   ├── font-loader.js  # 公共字体加载（v1.16 新增）
    │   │   ├── canvas-utils.js # 圆角路径兼容工具（v1.16 新增）
    │   │   ├── type-{A..N}-preview.js  # 预览模块
    │   │   └── type-{A..N}-export.js   # 导出模块
    │   └── components/
    │       └── type-{A..N}-editor-panel.js # 编辑面板显隐配置
    ├── logos/                  # 相机厂商 Logo（SVG）
    ├── fonts/                  # MiSans（Normal/Medium/Semibold 的 ttf + woff2）
    ├── assets/                 # exifreader/piexifjs/opentype.js/font-awesome
    ├── Sample/                 # 各样式样本缩略图（{id}-TypeX-sample_compressed.jpeg）
    └── sample-manifest.json    # 样本清单（Docker 构建/ dev.ps1 自动生成）
```

> 注：`type-A.css`/`type-B.css` 通过 `index.css` 顶部 `@import` 加载；`type-C~N.css` 由 `index.html` `<link>` 引入。

---

## 三、样式系统（Type A–N）

每个样式由「CSS + 预览模块 + 导出模块 + 编辑面板配置」四件套组成，通过注册表统一管理。

| 样式 | 布局特点 | 编辑面板 |
|------|----------|----------|
| **A** | 白色下边框，可调边框高度（5%–30%），完整编辑面板 | 全部保留 |
| **B** | 正方形画布，图片居左 85%，右侧参数+Logo；仅纵向图 | 简化 |
| **C** | 横向布局，Logo 左、参数右，纵向图片字号缩放 | 简化 |
| **D** | 横向布局，Logo 居中，左时间+机型、右参数+署名 | 简化 |
| **E** | 3:2 纵向，顶部 1:1 图片（可拖动裁剪），底部白色参数区 | 隐藏比例等 |
| **F** | 画中画：上留白+中照片+下文字，字号动态缩放 | 隐藏边框/Logo 等 |
| **G** | 画中画：居中 Logo + 日期\|参数\|机型 + 署名，纵向自适应 | 隐藏开关，保留 Logo |
| **H** | 全画幅叠加：照片填满，Logo+文字叠加底部，文字颜色可选 | 保留 Logo+文字色 |
| **I** | 极简叠加：Logo 顶中、底部仅署名（默认 OneFrame），纵向字号+50% | 隐藏型号/参数/时间 |
| **J** | 署名+三栏参数（左机型/中参数/右时间），机型含厂商名 | 显示型号 |
| **K** | 左下角 Logo + 双行文字（署名+日期 / 机型+参数），字重区分 | 显示型号 |
| **L** | 高斯模糊背景 + 清晰照片居中 + 白色文字，文字颜色可选 | 保留 Logo+文字色 |
| **M** | 四边模糊背景各 5% + 清晰照片 90% 居中 + 顶部 Logo + 底部署名参数 | 保留 Logo+文字色 |
| **N** | 上下对称边框：顶 Logo 居中 + 中照片(12px 圆角) + 底参数+署名 | 隐藏边框色/高度/比例/型号/时间 |

### 预览/导出双模块架构
```
styles/index.js 注册表 ──> getPreview(styleId) / getExport(styleId)
                           │                    │
                     type-X-preview.js      type-X-export.js
                     （DOM 实时预览）        （Canvas 导出 renderImage）
```

**预览模块 API**（约定，Type B 例外见下）：
```
init(elements)                      // { img, frameWrapper, photoFooter, borderContent }
calcSize(settings)                  // { naturalWidth, naturalHeight } → 画布逻辑尺寸
updateFrameWrapper(...)             // 设置 frameWrapper 尺寸与字号
updatePreview(...)                  // 设置图片/区域布局
updateContentPreview(elements, settings)  // 渲染文字/Logo 内容
reset()                             // 还原默认结构与类名
```
> 例外：Type B 使用 `update(settings)` 全流程 + 单参数 `updateContentPreview(settings)`；Type E 额外导出 `getNormalizedOffset/getState/resetImageOffset`（拖动裁剪）。

**导出模块 API**：
```
renderImage(img, options)           // options: { settings, borderColor, borderHeight, quality, imageOffset, previewSquareSize } → DataURL
```

---

## 四、模块职责

### 1. styles/index.js — 样式注册表
- `styles` 对象：`'type-a': { preview, export }` … `'type-n': { preview, export }`
- `getPreview(styleId)` / `getExport(styleId)` / `getStyle(styleId)` / `getAllStyles()`
- 末尾对 `typeBPreview` 等做 re-export（供 app.js/editor.js 直接使用）

### 2. app.js — 主逻辑
- 图片导入：浏览器 `<input type="file">`（含 `window.electronAPI` 遗留分支，浏览器环境不触发）
- `updateBorder()`：按 `currentStyle` 分派到各样式预览模块（A/C/D 走通用分支；B/E/F–N 走独立分支）
- `updateBorderContent()`：收集表单设置 → `preview.updateContentPreview(...)`
- `getDisplaySettings()`（预览用）/ `getEditSettings()`（导出用）
- 导出：`exporter.js → exportImage → renderImage`
- EXIF 自动填充、Logo 亮度检测缓存、动态背景色、编辑面板显隐（panelConfigurers）

### 3. exporter.js — 导出分发
- `exportStyles` 映射 + `getExportRenderer(styleId)` → `renderImage`
- `exportImage(img, options)`：调用样式渲染 → 从原图读 EXIF（piexif）→ 嵌入 → Blob

### 4. font-loader.js — 公共字体加载（v1.16 新增）
- `loadMiSansFonts()`：opentype 加载 woff2（Semibold/Medium/Normal），模块级缓存 + Promise 去重，失败返回 null 不抛出（**Type B/E 专用**）
- `ensureCssFontsReady()`：`await document.fonts.ready`，返回 null 字体对象（fillText 渲染模块用）

### 5. canvas-utils.js — Canvas 工具（v1.16 新增）
- `roundedRectPath(ctx, x, y, w, h, r)`：兼容 `ctx.roundRect` 缺失环境

### 6. exif.js / exif-exporter.js — EXIF 双轨
- `exif.js`（exifreader）：`getExif(file)`、`getMakeName`、`getFocalLength`、`formatDateTime`
- `exif-exporter.js`（piexifjs）：`readExifFromFile`、`embedExif`、`hasExifData`

### 7. logo-utils.js — Logo 工具
- `logoList`（19 家厂商）、`getAllLogos()`、`getMakeName`、`getModelName`、`getLogoFilename`

### 8. thumbnail-selector.js — 首页缩略图
- 读取 `sample-manifest.json`（1 次 fetch），为每张样式卡片随机选取不重复样本图
- manifest 缺失时回退 `data-fallback-src`

### 9. mobile.js — 移动端适配
- UA 检测注入 `is-mobile` class、滑动手势关闭面板、滚动锁定

---

## 五、数据流

### 图片导入
```
选择样式卡片 → <input type="file"> → loadImageWithExif(file)
  → URL.createObjectURL 显示 → getExif(file) 解析
  → updateExifDisplay 自动填充表单 + 匹配 Logo → showEditor
```

### 预览更新
```
输入/开关/resize/图片 load → updateBorder()
  → 按样式分派 preview.init/calcSize/updateFrameWrapper/updatePreview
  → updateBorderContent → preview.updateContentPreview(elements, settings)
```

### 导出
```
点击保存 → getEditSettings() → exportImage(img, options)
  → getExportRenderer(styleId) → renderImage(img, options) → DataURL
  → readExifFromFile + embedExif → dataURLtoBlob → <a download>
```

---

## 六、首页缩略图清单机制

- `sample-manifest.json` 列出 Sample 目录所有样本按样式分组：`{ samples: { TypeA: ["001",...], ... } }`
- **Docker 构建时**由 `docker/Dockerfile` 执行 `scripts/generate-manifest.sh` 自动生成（扫描式，从文件名提取 `Type[A-Z]`，不再硬编码列表）
- **本地开发**：`.\dev.ps1` 用 PowerShell 逻辑重新生成后再构建
- 两种路径必须保持行为一致（均覆盖全部 TypeA–N）

---

## 七、字体加载策略（v1.16）

- **CSS 字体**：`index.css` 通过 `@font-face` 注册 MiSans woff2（normal / 500 / 600 三档）
- **导出端**：
  - Type A/C/D/F/G/H/I/J/K/L/M/N：`ctx.fillText` + CSS 'MiSans'，导出前 `await ensureCssFontsReady()`
  - Type B：opentype `getPath`（矢量轮廓）+ 共享 `loadMiSansFonts()`
  - Type E：`fontMedium.getPath` 测年份宽定 Logo 尺寸 + 共享 `loadMiSansFonts()`
- **预览端**：全部走 CSS 字体
- **兼容**：`loadMiSansFonts` 失败返回 null，B/E 有 null 守卫降级，不中断导出

---

## 八、移动端适配

- `mobile.js` 通过 UA 检测注入 `<html class="is-mobile">`，`index.css` 中 `.is-mobile *` 规则生效
- 首页 2 列图片墙；编辑器底部操作栏 + 底部抽屉面板（70vh，下滑关闭）；触摸控件加大
- 另有 `@media (max-width:768px) and (pointer:coarse)` 兜底
- **已知注意**：A/B/C/D 预览边框文字为固定 px（12px/24px/75px），移动端不随图片等比缩放（E/F–N 为等比）；这是已知局限，未在 v1.16 修复（见根目录 `MOBILE_SCALING_FIX_PLAN.md`）

---

## 九、开发命令

```bash
# 本地开发（静态服务）
npx serve src/renderer
# 或
python -m http.server 3000 -d src/renderer

# Docker 构建 + 启动（Windows 开发脚本：先生成 manifest）
.\dev.ps1

# 或
docker compose up --build -d
# 访问 http://<NAS-IP>:8888
```

---

## 十、添加新样式的步骤（以 Type X 为例）

1. `src/renderer/css/type-X.css` — 布局样式（选择器限定 `.frame-wrapper.type-x` 作用域）
2. `src/renderer/js/styles/type-X-preview.js` — 预览模块（标准 API）
3. `src/renderer/js/styles/type-X-export.js` — 导出模块（`renderImage`）
4. `src/renderer/js/components/type-X-editor-panel.js` — 编辑面板显隐配置
5. `src/renderer/js/styles/index.js` — import + 注册 `'type-x': { preview, export }` + re-export
6. `src/renderer/js/exporter.js` — import + 注册导出
7. `src/renderer/index.html` — 加 CSS 链接 + 样式卡片（`data-style="type-x"`）
8. `src/renderer/js/app.js` — 加 `updateBorder`/`showEditor` 分支 + 面板配置器
9. 样本图放入 `Sample/`（`{id}-TypeX-sample_compressed.jpeg`），`dev.ps1`/构建时自动入清单
10. 若使用圆角：调用 `canvas-utils.js` 的 `roundedRectPath`（不要直接用 `ctx.roundRect`）

---

## 十一、与原始项目的差异

| 项目 | Electron 版 | NAS/Web 版 |
|------|-------------|------------|
| 主进程 | `main.js` + `preload.js` | 无（移除） |
| 文件选择 | `electronAPI.selectImage()` | `<input type="file">` |
| 文件保存 | `electronAPI.saveBlob()` | `<a download>` |
| 图片加载 | `file://` 协议 | `URL.createObjectURL()` |
| Logo 加载 | `electronAPI.getLogos()` | 静态 `getAllLogos()` |
| EXIF 读取 | `electronAPI.readExifBinary()` | `FileReader` + piexif |
| 外部资源 | CDN 加载 | 本地 `assets/` 目录 |
| 部署方式 | electron-builder | Docker + Nginx |
| 字体 | opentype.js（全部样式） | opentype（B/E）+ CSS woff2（其余） |

---

## 十二、重要常量

### Logo 列表（19 家有 SVG）
Apple, Canon, DJI, Fujifilm, Google, GoPro, Hasselblad, Leica, Lumix, Nikon, Nokia, Olympus, Oneplus, Pentax, Ricoh, Sigma, Sony, Vivo, Xiaomi

### 默认边框高度
- Type A：12%（5%–30% 可调）
- Type B：固定比例；Type F/G/H/I/J/K/L/M/N：由画布决定

### 支持 EXIF 字段
Make / Model / DateTimeOriginal / FNumber / ExposureTime / ISOSpeedRatings / FocalLength / FocalLengthIn35mmFilm

---

## 十三、已知坑位（维护必读）

1. **样式类名清理**：`updateFrameWrapper`/`reset()` 的 `classList` 清理列表曾不完整，新样式必须移除全部 `type-a~n` 类再添加自身；`reset()` 应恢复默认 innerHTML。
2. **作用域限定**：`type-X.css` 选择器必须限定 `.frame-wrapper.type-x`；`index.css` 有全局 `.frame-wrapper img` 规则（需 `max-width:none` 覆盖）。
3. **A/C/D 固定 px 文字**：预览文字不随显示尺寸缩放（移动端偏大），见 §八。
4. **导出开关**：显示开关（showSignature/showTime/showLogo）必须两端（预览+导出）一致处理。
5. **字体**：新导出模块若用 fillText，务必 `await ensureCssFontsReady()`；不要重新 `opentype.load`。
6. **圆角**：统一用 `roundedRectPath`，勿直接调用 `ctx.roundRect`（兼容性）。
7. **manifest**：新增样式后样本命名 `{id}-TypeX-sample_compressed.jpeg` 即自动入清单；勿改 `generate-manifest.sh` 为硬编码列表。

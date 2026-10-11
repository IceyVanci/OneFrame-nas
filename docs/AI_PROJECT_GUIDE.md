# OneFrame NAS Edition AI 项目认知指南

> 面向 AI 工具/开发者：帮助快速理解 OneFrame NAS Edition（v1.21，Type A–T 共 20 样式）的架构、功能与代码组织。
> 本文件随版本更新维护，当前对应 **v1.21（含 U3 死代码清理后的源码状态）**；更完整的功能与验证说明见 [docs/README.md](./README.md)。

---

## 一、项目概述

**OneFrame NAS Edition** 基于原始项目 [OneFrame](https://github.com/IceyVanci/OneFrame) 开发，现已作为**正式开发版本**持续演进：纯前端 Web 应用（零构建，原生 HTML/CSS/JS ES Module），可通过 Nginx + Docker 部署（NAS 场景），也支持 Cloudflare Pages 等静态托管，局域网内设备浏览器访问。

### 核心特性
- 智能 EXIF 读取：自动识别相机厂商并显示对应 Logo
- 20 种边框样式（Type A–T）
- 统一预览缩放（v1.21）：全部样式共用「填满式」适配机制，画布完整可见、随窗口等比缩放
- EXIF 保留：导出时自动保留原图 EXIF 信息
- 纯前端：零构建方案，无需 Node.js

### 技术栈
| 模块 | 技术方案 | 说明 |
|------|----------|------|
| 运行环境 | Nginx + Docker / 静态托管（Cloudflare Pages） | 纯前端 Web 应用 |
| 前端 | 原生 HTML/CSS/JS（ES Module） | 无需构建工具 |
| 图片预览 | DOM + 统一填满式缩放（`preview-scale.js`） | 实时预览边框效果 |
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
├── docs/                       # 文档（README.md + 本文件 + function_analysis.md）
│   ├── changelogs/             # 历史版本记录（v1.00–v1.21 + 索引）
│   └── archive/                # 更早归档（历史报告、迁移指南等）
└── src/renderer/               # 前端静态资源（构建上下文根）
    ├── index.html              # 主页面（首页图片墙 + 编辑器 + 关于弹窗）
    ├── index.css               # 全局样式（含 @import type-A/B/C、@font-face、移动端）
    ├── films.json              # Type O 胶片品牌/型号数据
    ├── css/type-{A..T}.css     # 各样式布局（大写文件名）
    ├── js/
    │   ├── app.js              # 主逻辑入口（统一 updateBorder/导入/导出分发）
    │   ├── config.js           # 导出命名模式等配置（EXPORT_NAMING_MODE）
    │   ├── exif.js             # EXIF 读取（exifreader，显示用）
    │   ├── exif-exporter.js    # EXIF 导出（piexifjs）
    │   ├── exporter.js         # 导出分发（exportStyles 注册表）
    │   ├── logo-utils.js       # 厂商 Logo 工具
    │   ├── mobile.js           # 移动端 UA 检测 + 面板手势/滚动锁定
    │   ├── thumbnail-selector.js # 首页缩略图随机选取（sample-manifest 清单法）
    │   ├── styles/
    │   │   ├── index.js        # 样式注册表（preview + export）
    │   │   ├── preview-scale.js  # 统一填满式缩放（v1.21 新增）
    │   │   ├── font-loader.js  # 公共字体加载（opentype/CSS 就绪）
    │   │   ├── canvas-utils.js # 圆角路径兼容工具
    │   │   ├── type-{A..T}-preview.js  # 预览模块（统一 6 件套 API）
    │   │   └── type-{A..T}-export.js   # 导出模块（renderImage）
    │   └── components/
    │       └── type-{F..T}-editor-panel.js # 编辑面板显隐配置（A–E 内联在 app.js）
    ├── logos/                  # 相机厂商 Logo（SVG）
    ├── fonts/                  # MiSans（Normal/Medium/Semibold 的 ttf + woff2）
    ├── assets/                 # exifreader/piexifjs/opentype.js/font-awesome
    ├── Sample/                 # 各样式样本缩略图（{id}-TypeX-sample_compressed.jpeg）
    └── sample-manifest.json    # 样本清单（Docker 构建/ dev.ps1 自动生成）
```

> 注：`type-A/B/C.css` 通过 `index.css` 顶部 `@import` 加载（C 同时在 `index.html` 有 `<link>`，属双载、无副作用）；`type-D~T.css` 由 `index.html` `<link>` 引入。

---

## 三、样式系统（Type A–T）

每个样式由「CSS + 预览模块 + 导出模块 + 编辑面板配置」四件套组成，通过注册表统一管理。

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
| **O** | 胶片参数：品牌/型号下拉+手输（`films.json`），黑色署名水印 |
| **P** | 参数布局：机型 Semibold + 品牌 Logo + 参数胶囊，照片原比例完整显示 |
| **Q** | 简洁布局：四边 2.5% 边框自动取图片主色，右下 "Foto by" 署名 |
| **R** | 胶片边缘打印：Pentax 645N 风格，画布锁定 645 单帧比例，右侧竖排橙色参数 |
| **S** | 留白排版：白色画布 + 居中方形照片（82%）+ 文字系统；比例 1:1 / 1:1.35 |
| **T** | 满幅无边框：照片铺满画布 + 与 S 相同的文字系统（带淡阴影）；比例 1:1 / 1:1.35 |

### 预览/导出双模块架构
```
styles/index.js 注册表 ──> getPreview(styleId) / getExport(styleId)
                           │                    │
                     type-X-preview.js      type-X-export.js
                     （DOM 实时预览）        （Canvas 导出 renderImage）
```

**预览模块统一 API**（A–T 全部一致，v1.21 起）：
```
init(elements)                                  // { img, frameWrapper, photoFooter, borderContent }
calcSize(settings)                              // 设计画布：A–E 返回 { canvasWidth, canvasHeight }；
                                                // F–T 返回 { squareSize, canvasHeight, isPortrait }
updateFrameWrapper(displayWidth, displayHeight) // 设置显示尺寸 + 基准字号
updatePreview(displayWidth, displayHeight, imgDimensions, settings)
updateContentPreview(elements, settings)        // 渲染文字/Logo 内容
reset()                                         // 还原默认结构与类名
```
- `app.js` 统一归一 `design.canvasWidth ?? design.squareSize`，再经 `fitCanvasToPreview`（0.96）得显示尺寸
- **样式特有导出**：E 额外 `getImageOffset/getState/getNormalizedOffset/resetImageOffset`（拖动裁剪）；R/S/T 额外 `getNormalizedOffset/resetImageOffset/getState/getPhotoRect` 等；P–T 导出 `TYPE_X_LAYOUT` 布局常量

**导出模块 API**：
```
renderImage(img, options)           // options: { settings, borderColor, borderHeight, quality, imageOffset, previewSquareSize } → DataURL
```

---

## 四、模块职责

### 1. styles/index.js — 样式注册表
- `styles` 对象：`'type-a': { preview, export }` … `'type-t'`（20 样式）
- `getPreview(styleId)` / `getExport(styleId)`
- 末尾 re-export `typeEPreview`/`typeRPreview`/`typeSPreview`/`typeTPreview`（供 app.js 直接使用）

### 2. app.js — 主逻辑（~1260 行）
- 图片导入：`loadImageWithExif(file, options)`（含 `loadImageInElectron` 遗留分支，浏览器环境不触发）
- `updateBorder()`：**A–T 单一统一分支**（20 个样式 ID 显式白名单）→ `init → reset → calcSize → fitCanvasToPreview → updateFrameWrapper → updatePreview → updateBorderContent`
- `previewDesignCache`（Map）：F–T 设计尺寸缓存（图片加载 `clear()`；S/T 比例切换 `delete`）；A–E 现算
- `updateBorderContent()`：收集表单设置 → `preview.updateContentPreview(...)`；统一清理 Type B 残留容器
- `getEditSettings()`（导出用）；`updateExifDisplay()` EXIF 自动填充；`initFilms()/rebuildFilmModelOptions()` Type O 胶片数据；`sampleTypeSColor()/sampleTypeTColor()` S/T 图片主色取色
- `showEditor()`/`hideEditor()`：面板配置分发（`panelConfigurers` 仅 F–T）+ 内联规则（B 隐藏三个开关；E 删除 original 比例并隐藏开关组）
- 其他：`styleIdToTypeName`、`formatDateTimeForInput`、`applyDynamicBackground`、`checkImageOrientation`、`detectLogoBrightness`/`isLogoLight`（缓存）、`initLogoGrid`/`selectLogo`、`captureTopLineFields`/`restoreTopLineFields`（S/T 重选图保留手输）、`resetForm`、`exportImageHandler`

### 3. exporter.js — 导出分发
- `exportStyles` 映射（20 样式）+ `getExportRenderer(styleId)` → `renderImage`
- `exportImage(img, options)`：调用样式渲染 → 从原图读 EXIF（piexif）→ 嵌入 → Blob
- `dataURLtoBlob(dataUrl)` 内部工具

### 4. styles/preview-scale.js — 统一缩放（v1.21）
- `getPreviewAvail(previewArea, margin = 0.96)`：预览区可用宽高
- `fitCanvasToPreview(canvasWidth, canvasHeight, previewArea, options)`：`scale = min(availW/W, availH/H, 1)` 取整

### 5. styles/font-loader.js — 公共字体加载
- `loadMiSansFonts()`：opentype 加载 woff2（Semibold/Medium/Normal），模块级缓存 + Promise 去重，失败返回 null 不抛出（**Type B/E 专用**）
- `ensureCssFontsReady()`：`await document.fonts.ready`，返回 null 字体对象（fillText 渲染模块用）

### 6. styles/canvas-utils.js — Canvas 工具
- `roundedRectPath(ctx, x, y, w, h, r)`：兼容 `ctx.roundRect` 缺失环境

### 7. exif.js / exif-exporter.js — EXIF 双轨
- `exif.js`（exifreader）：`getExif`、`getMakeName`、`getFocalLength`、`getPhysicalFocalLength`、`getExposureModeLabel`、`formatExposureBias`、`formatDateTime`（另有 4 个未使用导出，见 function_analysis.md）
- `exif-exporter.js`（piexifjs）：`readExifFromFile`、`embedExif`、`hasExifData`、`dumpExif`、`ExifHandler`/`exifHandler`（单例）

### 8. logo-utils.js — Logo 工具
- `logoList`（19 家厂商）、`getAllLogos()`、`getMakeName`、`getModelName`、`getLogoFilename`
- （`logoSvgMap`/`getMakeLogoSvg`/`replaceTextVars` 等为未使用遗留，见 function_analysis.md）

### 9. thumbnail-selector.js — 首页缩略图
- `initHomepageThumbnails()`：读取 `sample-manifest.json`（1 次 fetch），为每张样式卡片随机选取不重复样本图；manifest 缺失时回退 `data-fallback-src`

### 10. mobile.js — 移动端适配
- `detectMobile`/`isMobile`、`initMobileLayout`、`lockBodyScroll`/`unlockBodyScroll`、`initSwipeToClose`
- UA 检测注入 `is-mobile` class、滑动手势关闭面板、滚动锁定

### 11. films.json — Type O 胶片数据
- 结构：`{ version, manufacturers, films: { 品牌: [{ model, ... }] } }`；`app.js` 的 `initFilms()` fetch 一次，失败时回退空表（不中断）

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
  → A–T 统一路径：init → reset → calcSize（F–T 走 previewDesignCache）
  → fitCanvasToPreview（0.96）→ updateFrameWrapper → updatePreview
  → updateBorderContent → preview.updateContentPreview(elements, settings)
```

### 导出
```
点击保存 → getEditSettings() → exportImage(img, options)
  → getExportRenderer(styleId) → renderImage(img, options) → DataURL
  → readExifFromFile + embedExif → dataURLtoBlob → <a download>
```

### 样式特有交互
- **E/R/S/T**：拖动裁剪（`getNormalizedOffset` 归一化偏移传给导出）
- **Q/S/T**：图片主色取色（`sampleTypeSColor`/`sampleTypeTColor` → 边框色/文字色）
- **S/T**：比例切换（`canvasRatioS`/`ratioT`）→ 失效缓存重新 calcSize
- **O**：品牌下拉 → `rebuildFilmModelOptions()` 重建型号列表

---

## 六、首页缩略图清单机制

- `sample-manifest.json` 列出 Sample 目录所有样本按样式分组：`{ samples: { TypeA: ["001",...], ... } }`（当前 169 张；A–N 多张、O–T 各 1 张）
- **Docker 构建时**由 `docker/Dockerfile` 执行 `scripts/generate-manifest.sh` 自动生成（扫描式，从文件名提取 `Type[A-Z]`，不再硬编码列表）
- **本地开发**：`.\dev.ps1` 用 PowerShell 逻辑重新生成后再构建
- 两种路径必须保持行为一致（均覆盖全部 TypeA–T）

---

## 七、字体加载策略

- **CSS 字体**：`index.css` 通过 `@font-face` 注册 MiSans woff2（normal / 500 / 600 三档）
- **导出端**：
  - Type A/C/D/F/G/H/I/J/K/L/M/N/O/P/Q/R/S/T：`ctx.fillText` + CSS 'MiSans'，导出前 `await ensureCssFontsReady()`
  - Type B/E：opentype `getPath`（矢量轮廓）+ 共享 `loadMiSansFonts()`（E 另用 Medium 测年份宽定 Logo 尺寸）
- **预览端**：全部走 CSS 字体
- **兼容**：`loadMiSansFonts` 失败返回 null，B/E 有 null 守卫降级，不中断导出

---

## 八、移动端适配

- `mobile.js` 通过 UA 检测注入 `<html class="is-mobile">`，`index.css` 中 `.is-mobile *` 规则生效
- 首页 2 列图片墙；编辑器底部操作栏 + 底部抽屉面板（70vh，下滑关闭）；触摸控件加大
- 另有 `@media (max-width:768px) and (pointer:coarse)` 兜底
- **文字缩放（v1.21 已修复）**：A/C/D 预览文字改为 em 基准（容器字号随显示尺寸缩放），B 内容按实际渲染方形缩放，与 E/F–T 的等比行为一致
- **E 拖动提示**：`.type-e-drag-hint` 为绝对定位浮层（预览区右侧垂直居中），不参与 flex 布局、不挤压画布
- **已知保留项**：填满式 fit 使用 `previewArea.clientWidth`（含 padding），窄屏存在约 1 个 padding 的轻微外溢（见 §十三）

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

语法检查（Node v24 对 ESM 文件需用 stdin 方式，避免 `node --check` 对块注释漏检）：
```powershell
Get-Content -Raw -Encoding UTF8 <file> | node --input-type=module --check
```

---

## 十、添加新样式的步骤（以 Type X 为例）

1. `src/renderer/css/type-X.css` — 布局样式（选择器限定 `.frame-wrapper.type-x`）
2. `src/renderer/js/styles/type-X-preview.js` — 预览模块（统一 6 件套 API）
3. `src/renderer/js/styles/type-X-export.js` — 导出模块（`renderImage`）
4. `src/renderer/js/components/type-X-editor-panel.js` — 编辑面板显隐配置（A–E 模式可内联在 `showEditor`）
5. `src/renderer/js/styles/index.js` — import + 注册 `'type-x': { preview, export }`
6. `src/renderer/js/exporter.js` — import + 注册导出
7. `src/renderer/index.html` — 加 CSS 链接 + 样式卡片（`data-style="type-x"`）
8. `src/renderer/js/app.js` — **关键三处**：① `updateBorder()` 的 20 样式白名单 if 加入新 ID（否则不走统一路径）；② 若需设计尺寸缓存，加入 F–T 集合；③ `showEditor` 面板配置器 + `borderColorSection` 显隐列表
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
| 部署方式 | electron-builder | Docker + Nginx / 静态托管 |
| 字体 | opentype.js（全部样式） | opentype（B/E）+ CSS woff2（其余） |

---

## 十二、重要常量

### Logo 列表（19 家有 SVG）
Apple, Canon, DJI, Fujifilm, Google, GoPro, Hasselblad, Leica, Lumix, Nikon, Nokia, Olympus, Oneplus, Pentax, Ricoh, Sigma, Sony, Vivo, Xiaomi

### 关键参数
- Type A：默认边框高度 12%（5%–30% 可调）
- Type S/T：画布比例 1:1 / 1:1.35；照片占比 82%（S）
- Type O：胶片品牌/型号来自 `films.json`
- 预览适配：`fitCanvasToPreview` 固定 margin 0.96（96% 可用区）
- F–T 设计尺寸缓存：`previewDesignCache`（图片加载清空；S/T 比例切换删除对应键）

### 导出尺寸基准（以 800×1200 竖图输入为例，JPEG）
| 样式 | 导出尺寸 |
|------|----------|
| A / C / D | 800×1296 |
| B | 1320×1320 |
| E | 800×1200 |
| F | 800×1333 |
| K | 800×1200 |
| P | 860×1569 |

### 支持 EXIF 字段
Make / Model / DateTimeOriginal / FNumber / ExposureTime / ISOSpeedRatings / FocalLength / FocalLengthIn35mmFilm

---

## 十三、已知坑位（维护必读）

1. **统一路径白名单**：`updateBorder()` 用显式列举 20 个样式 ID 的 if 判断；**新增样式必须加入该列表**，否则不会走统一填满式路径（静默不预览）。F–T 设计尺寸缓存集合同理。
2. **设计尺寸缓存失效**：`previewDesignCache` 在图片加载时 `clear()`；S/T 比例切换 `delete('type-s')/('type-t')`（保留「切 S 同时清 T」语义）。新增依赖参数的设计尺寸时，必须补失效点。
3. **作用域限定**：`type-X.css` 选择器必须限定 `.frame-wrapper.type-x`；`index.css` 有全局 `.frame-wrapper img` 规则（需覆盖）。A/C/D 的填满式覆盖使用 `.frame-wrapper.type-x > img`（**必须 `> img`**，否则误伤 Logo 等内部图片）。
4. **导出开关**：显示开关（showSignature/showTime/showLogo）必须两端（预览+导出）一致处理。
5. **字体**：新导出模块若用 fillText，务必 `await ensureCssFontsReady()`；不要重新 `opentype.load`。
6. **圆角**：统一用 `roundedRectPath`，勿直接调用 `ctx.roundRect`（兼容性）。
7. **manifest**：新增样式后样本命名 `{id}-TypeX-sample_compressed.jpeg` 即自动入清单；勿改 `generate-manifest.sh` 为硬编码列表。
8. **Type B 仅竖图**：导入横图会 alert 拒绝（`loadImageWithExif` 校验）。
9. **fit 含 padding 的轻微外溢**：`fitCanvasToPreview` 用 `previewArea.clientWidth`（含 padding）计算可用区，窄屏存在约 1 个 padding 的轻微外溢；当前决策为保持现状（详见 docs/README.md 已知坑位）。
10. **语法检查**：Node v24 下 ESM 文件用 stdin 方式检查（§九），否则块注释未闭合会漏检。

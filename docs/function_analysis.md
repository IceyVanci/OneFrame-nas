# OneFrame NAS Edition 函数分析文档

> 状态：基于当前源码（**v1.21 + U3 清理后**），覆盖 Type A–T 全部 20 样式。
> 定位：函数/模块级清单（有哪些函数、哪些未使用）；架构与机制说明见 [docs/README.md](./README.md)，AI 速览见 [AI_PROJECT_GUIDE.md](./AI_PROJECT_GUIDE.md)。
> 本文件 2026-10-11 重构：由早期「逐函数穷举（A–G 时代）」改为「共享模块详表 + 样式统一 API + 样式特有函数摘要」结构。
> 原始项目：[OneFrame](https://github.com/IceyVanci/OneFrame)（Electron 桌面应用）

---

## 一、快速总览

| 类别 | 数量 | 说明 |
|------|------|------|
| 样式 | 20 | Type A–T |
| 预览模块 | 20 文件 | 统一 6 件套 API（E/R/S/T 有额外导出） |
| 导出模块 | 20 文件 | 统一 `renderImage` |
| 编辑面板 | 15 文件 + 内联 | F–T 独立组件；A–E 内联在 `app.js showEditor` |
| 共享模块 | 11 文件 | app/exporter/exif×2/logo-utils/font-loader/canvas-utils/preview-scale/mobile/thumbnail-selector/config |
| 未使用/预留导出 | 10 | exif.js 4 + logo-utils 6（见 §七） |

---

## 二、项目文件结构（当前）

```
src/renderer/
├── index.html           # 主页面（20 样式卡片 + 编辑器 + 关于弹窗 v1.21）
├── index.css            # 全局样式（@import type-A/B/C）
├── films.json           # Type O 胶片品牌/型号数据
├── sample-manifest.json # 样本清单（自动生成）
├── css/type-{A..T}.css  # 各样式布局
├── js/
│   ├── app.js           # 主逻辑入口（A–T 统一 updateBorder）
│   ├── config.js        # EXPORT_NAMING_MODE
│   ├── exif.js          # EXIF 读取 (exifreader)
│   ├── exif-exporter.js # EXIF 导出 (piexifjs)
│   ├── exporter.js      # 导出分发（exportStyles 注册表）
│   ├── logo-utils.js    # Logo 工具
│   ├── mobile.js        # 移动端适配
│   ├── thumbnail-selector.js # 首页缩略图
│   ├── components/      # F–T 编辑面板组件（15 文件）
│   └── styles/
│       ├── index.js            # 样式注册表（20 样式）
│       ├── preview-scale.js    # 统一填满式缩放（v1.21）
│       ├── font-loader.js      # 字体加载
│       ├── canvas-utils.js     # 圆角路径工具
│       ├── type-{A..T}-preview.js
│       └── type-{A..T}-export.js
├── logos/  fonts/  assets/  Sample/
```

---

## 三、共享模块逐函数

### 3.1 app.js（主逻辑，~1260 行）

模块级状态：`previewDesignCache`（Map）— F–T 设计尺寸缓存；图片加载 `clear()`，S/T 比例切换 `delete`。

| 函数 | 触发时机 | 说明 |
|------|----------|------|
| `styleIdToTypeName(styleId)` | 辅助 | 样式 ID → 类型名（如 `type-s` → `S`） |
| `formatDateTimeForInput(value)` | EXIF 填充 | 日期格式化为 input 可用格式 |
| `applyDynamicBackground(img)` | 进入编辑器 | 编辑器动态背景（图片色调） |
| `checkImageOrientation(fileOrPath)` | 导入图片 | `URL.createObjectURL` 检查横竖（B 竖图校验） |
| `detectLogoBrightness(logoPath)` | Logo 检测 | 像素亮度分析（智能配色） |
| `isLogoLight(logoName)` | Logo 检测 | 带缓存的亮度检测 |
| `rebuildFilmModelOptions()` | O 品牌下拉变化 | 重建胶片型号下拉 |
| `initFilms()` | 初始化 | fetch `films.json`（失败回退空表，不中断） |
| `initLogoGrid()` | 初始化 | 加载 Logo 列表，`onerror` 隐藏无 SVG 品牌 |
| `selectLogo(name)` | 点击 Logo | 更新选中状态和预览 |
| `loadImageWithExif(file, options)` | 选择图片 | 读取 EXIF → 更新表单；B 仅竖图校验 |
| `loadImageInElectron(imagePath, options)` | 遗留（浏览器不触发） | Electron 路径分支 |
| `updateExifDisplay()` | EXIF 更新 | 自动填充表单（日期正则匹配等） |
| `showEditor()` | 进入编辑器 | 面板配置：F–T 组件 + 内联规则（B/E 特殊处理） |
| `hideEditor()` | 返回主页 | 释放 ObjectURL + `location.reload()` 彻底重置 |
| `captureTopLineFields()` | 重选图片前 | S/T 手输字段（topLine/photoBy）暂存 |
| `restoreTopLineFields(saved)` | 重选图片后 | 恢复 S/T 手输字段 |
| `resetForm()` | 返回主页 | 清空表单 |
| `updateBorder()` | 颜色/高度/比例/resize/图片 load | **A–T 统一路径**（20 样式白名单 → init/reset/calcSize/缓存/fit/updateFrameWrapper/updatePreview） |
| `updateBorderContent()` | 内容变化 | 收集设置 → `updateContentPreview`；清理 Type B 残留容器 |
| `sampleTypeSColor(e)` | S 取色按钮 | 图片主色采样 → S 边框色 |
| `sampleTypeTColor(e)` | T 取色按钮 | 图片主色采样 → T 文字色 |
| `getEditSettings()` | 导出时 | 收集编辑设置 |
| `exportImageHandler()` | 点击导出 | `exporter.exportImage` → `<a download>` |

> 注：U3 清理已删除 `getDisplaySettings()`（孤儿）、`shortSide`/`borderPercent` 等死代码。

### 3.2 exporter.js

| 函数 | 状态 | 说明 |
|------|------|------|
| `exportStyles` | ✅ | 样式 → 导出模块映射（20 样式） |
| `getExportRenderer(styleId)` | ✅ | 获取渲染函数（缺省 type-a） |
| `dataURLtoBlob(dataUrl)` | ✅ | DataURL → Blob |
| `exportImage(img, options)` | ✅ | 渲染 → 读原图 EXIF → 嵌入 → Blob |

### 3.3 exif.js（exifreader）

| 函数/常量 | 状态 | 说明 |
|-----------|------|------|
| `getExif(file)` | ✅ | 读取 EXIF |
| `getMakeName(make)` | ✅ | 标准化厂商名称 |
| `getFocalLength(exif)` | ✅ | 优先等效焦距 |
| `getPhysicalFocalLength(exif)` | ✅ | 物理焦距 |
| `getExposureModeLabel(exif)` | ✅ | 曝光模式标签 |
| `formatExposureBias(exif)` | ✅ | 曝光补偿格式化 |
| `formatDateTime(dateStr)` | ✅ | `YYYY:MM:DD HH:mm:ss` → `YYYY-MM-DD HH:mm:ss` |
| `getExifName` / `SUPPORTED_MAKES` / `exifPrimaryKeys` / `primaryExif` | ⚠️ 未使用 | 见 §七 |

### 3.4 exif-exporter.js（piexifjs）

| 函数/类 | 状态 | 说明 |
|---------|------|------|
| `ExifHandler`（class）/ `exifHandler`（单例） | ✅ | EXIF 处理 |
| `readExifFromFile(file)` | ✅ | FileReader + piexif 读取 |
| `embedExif(dataUrl, exifObj)` | ✅ | 嵌入 EXIF 到 DataURL |
| `hasExifData(exifObj)` | ✅ | 有效性检查 |
| `dumpExif(exifObj)` | ✅ | 转为 piexif 格式 |

### 3.5 logo-utils.js

| 函数/常量 | 状态 | 说明 |
|-----------|------|------|
| `logoList` | ✅ | 19 家厂商列表 |
| `getAllLogos()` | ✅ | 所有可用 Logo |
| `getLogoFilename(make)` | ✅ | Logo 文件名 |
| `getMakeName(make)` | ✅ | 标准化厂商名称 |
| `getModelName(model)` | ✅ | 机型格式化（去冗余后缀） |
| `logoSvgMap` / `getMakeLogoSvg` / `getAutoLogoFilename` / `getMakeLogoPath` / `getMakeLogo` / `replaceTextVars` | ⚠️ 未使用 | 见 §七 |

### 3.6 styles/font-loader.js

| 函数 | 状态 | 说明 |
|------|------|------|
| `loadMiSansFonts()` | ✅ | opentype 加载 MiSans woff2，缓存 + Promise 去重，失败返回 null（B/E 专用） |
| `ensureCssFontsReady()` | ✅ | 等待 CSS 字体就绪，返回 null（fillText 模块用） |

### 3.7 styles/canvas-utils.js

| 函数 | 状态 | 说明 |
|------|------|------|
| `roundedRectPath(ctx, x, y, w, h, r)` | ✅ | 圆角路径（`ctx.roundRect` 缺失时 arcTo 降级） |

### 3.8 styles/preview-scale.js（v1.21 新增）

| 函数 | 状态 | 说明 |
|------|------|------|
| `getPreviewAvail(previewArea, margin = 0.96)` | ✅ | 预览区可用宽高 |
| `fitCanvasToPreview(canvasWidth, canvasHeight, previewArea, options)` | ✅ | `scale = min(availW/W, availH/H, 1)` → 显示尺寸（取整） |

### 3.9 mobile.js

| 函数 | 状态 | 说明 |
|------|------|------|
| `detectMobile()` / `isMobile` | ✅ | UA 检测 |
| `initMobileLayout()` | ✅ | 注入 `is-mobile` class 等 |
| `lockBodyScroll()` / `unlockBodyScroll()` | ✅ | 滚动锁定 |
| `initSwipeToClose()` | ✅ | 下滑关闭抽屉面板 |

### 3.10 thumbnail-selector.js

| 函数 | 状态 | 说明 |
|------|------|------|
| `initHomepageThumbnails()` | ✅ | 读 `sample-manifest.json`，每卡片随机选不重复样本；缺失回退 `data-fallback-src` |

### 3.11 config.js

| 导出 | 状态 | 说明 |
|------|------|------|
| `EXPORT_NAMING_MODE` | ✅ | 导出命名模式配置 |

---

## 四、样式模块（Type A–T）

### 4.1 统一预览 API（20 样式全部实现）

```
init(elements)                                  // { img, frameWrapper, photoFooter, borderContent }
calcSize(settings)                              // 设计画布
updateFrameWrapper(displayWidth, displayHeight) // 显示尺寸 + 基准字号
updatePreview(displayWidth, displayHeight, imgDimensions, settings)
updateContentPreview(elements, settings)
reset()
```

| 样式 | calcSize 返回/设计画布 | 特有导出 |
|------|------------------------|----------|
| A / C / D | `{ canvasWidth, canvasHeight }` = `{ nW, nH + round(min(nW,nH)×pct/100) }` | — |
| B | `{ canvasWidth, canvasHeight }` = 方形 `round(nH×1.1)`（仅竖图） | — |
| E | `{ canvasWidth, canvasHeight }` = `{ 短边, round(短边×1.5) }` | `getImageOffset` `getState` `getNormalizedOffset` `resetImageOffset` |
| F / G | `{ squareSize, canvasHeight, isPortrait }`（照片占比公式） | — |
| H / I / J / K / M | `{ squareSize, canvasHeight, isPortrait }`（图片原始尺寸类） | — |
| L / N / O / P / Q | `{ squareSize, canvasHeight, ... }`（模块内部公式） | — |
| R | 645 单帧比例 | `getNormalizedOffset` `resetImageOffset` `getState` `buildPrintSlots` `computePrintLayout` |
| S / T | `{ squareSize, canvasHeight }`（比例 1:1 / 1:1.35） | `getNormalizedOffset` `resetImageOffset` `getState` `getPhotoRect` `resolveTextColor` `buildParamsLine` `formatDateS/T` |

- `app.js` 统一归一 `design.canvasWidth ?? design.squareSize` 后交给 `fitCanvasToPreview`
- P–T 模块额外导出 `TYPE_X_LAYOUT` 布局常量（Q 为 `TYPE_Q_LAYOUT`，依此类推）

### 4.2 预览模块内部辅助（摘要）

| 样式 | 内部函数 |
|------|----------|
| A / C / D | `updateBorderContentPosition`（底栏文字定位） |
| B | —（统一 API 内完成） |
| E | 拖动系列：`startDrag/onDrag/endDrag/applyImageOffset/clampImageOffset/getMaxOffset/calculateObjectPosition/updateDragHint`；渲染辅助：`onLogoLoad/getDateRows/getRightParams/getRenderedImageMetrics/clamp` |
| F–N | — |
| O / P / Q | `escapeHtml` |
| R | 拖动系列 + `formatPrintDate/getMeasureCtx/clamp/updateDragHint/escapeHtml` |
| S / T | 拖动系列 + `aspectHOverW`（S）/`ratioHOverW`（T）/`escapeHtml` |

### 4.3 导出模块内部辅助（摘要）

| 样式 | 内部函数 |
|------|----------|
| A / C / D | `drawText/drawBorderContent/drawLogo/detectLogoBrightness/borderColorIsLight/formatDateForDisplay/dataURLtoBlob`（+`isLogoLightFromCache`） |
| B | 同 A 组 + `drawBorderContentTypeB/drawLogoTypeB` |
| E | `borderColorIsLight/formatDateForDisplay/detectLogoBrightness/drawLogo/drawBorderContentTypeE/drawLogoTypeEFixed` |
| F / J | `drawText/drawBorderContent`（+`detectLogoBrightness/borderColorIsLight/formatDateForDisplay`） |
| G | 同 F + `drawLogoG` |
| H / I / K | `drawText/drawBorderContent` + `drawLogoH/drawLogoI/drawLogoK` |
| L / M | `drawText/drawBlurredBackground/drawBorderContent` + `drawLogoL/drawLogoM` |
| N | `drawText/drawLogoN/drawBorderContent` |
| O | `drawText`（内容内联绘制） |
| P | `loadLogo/pillFontPx` |
| Q | —（renderImage 内联） |
| R | `computeCanvas/drawPrint` |
| S / T | `drawTexts/setLetterSpacing/hexToRgba` |

> `renderImage(img, options)` 为 20 样式统一导出入口（`typeXExport` 对象一并导出）。

### 4.4 编辑面板模块

- **F–T（15 个组件文件）**：`components/type-X-editor-panel.js` → `configureEditPanel()`，通过 `.edit-section:has(#id)` 选择器隐藏无关分区；H/I/J/K/L/M 处理文字颜色分区，O 处理胶片分区，P/Q 处理开关，R 处理打印分区，S/T 处理取色器与比例
- **A–E（内联）**：`app.js showEditor()` 内联规则
  - `borderColorSection` 对 B/E/F–T 隐藏（其余显示）
  - B：隐藏 Logo/参数/时间三个开关
  - E：删除「原始比例」选项 + 隐藏三个开关组
- `panelConfigurers` 映射表仅含 F–T

---

## 五、数据流分析

### 图片导入流程（浏览器模式）

```
用户选择图片（<input type="file">）
  → loadImageWithExif(file)
     - URL.createObjectURL(file) 显示
     - checkImageOrientation（B 竖图校验）
     - getExif(file) 解析
  → updateExifDisplay()
     - getMakeName() → 自动选择 Logo
     - getModelName() → 填充机型
     - 正则匹配日期 → 填充拍摄时间
  → showEditor()
```

### 预览更新流程（A–T 统一）

```
用户修改设置 / resize / 图片 load
  → updateBorder()
     - getPreview(currentStyle)
     - init → reset
     - calcSize(designSettings)（F–T 走 previewDesignCache；S/T 比例参数）
     - 归一 design.canvasWidth ?? design.squareSize
     - fitCanvasToPreview（0.96）
     - updateFrameWrapper(displayW, displayH)
     - updatePreview(displayW, displayH, imgDims, settings)
  → updateBorderContent() → updateContentPreview(elements, settings)
```

### 图片导出流程（浏览器模式）

```
用户点击导出
  → getEditSettings() → exportImage(img, options)
     - getExportRenderer(styleId) → renderImage → DataURL
     - readExifFromFile + embedExif 嵌入原图 EXIF
  → dataURLtoBlob() → <a download> 下载
```

### 样式特有交互

- **E/R/S/T 拖动裁剪**：预览记录归一化偏移（`getNormalizedOffset`），导出端按同比例应用
- **Q/S/T 取色**：`sampleTypeSColor`/`sampleTypeTColor` 在离屏 canvas 采样图片主色
- **S/T 比例切换**：`canvasRatioS`/`ratioT` 变化 → 失效 `previewDesignCache` 对应键 → 重新 calcSize
- **O 胶片下拉**：品牌变化 → `rebuildFilmModelOptions()` 重建型号列表

---

## 六、特殊样式布局说明

### 6.1 Type E（3:2 纵向，支持拖动裁剪）

```
┌─────────────────────────────────┐
│                                 │
│         1:1 正方形图片            │  ← 顶部 短边 × 短边
│       (可拖动裁剪区域)            │
├─────────────────────────────────┤
│  March              f/2.8       │
│  2024            50mm 1/125   │  ← 底部白色区域
│                   ISO 400       │
│ [Logo]            Model          │
│                 Signature        │
└─────────────────────────────────┘

设计画布：短边 × round(短边 × 1.5)
```

- **基准字号**：`max(8, round(24 × 显示短边 / 480))`（容器字号）；月份 = 2× 基准（橙色年份 = 基准）；参数行 margin-top ≈ 2.333× 基准
- **拖动**：竖图只能上下、横图只能左右，范围 = (原图长边 − 短边) / 2；提示为绝对定位浮层（右侧垂直居中）
- **导出**：基准 `24 × 设计短边 / 480`，与预览同构

### 6.2 Type B（正方形，仅竖图）

- 设计方形：`round(图片高 × 1.1)`；内容（字号/列宽/分隔线）按**实际渲染方形** `frameWrapper.clientWidth / 900` 等比缩放（窄窗会被 flex 收缩，必须用渲染值而非设计值）
- 预览照片圆角：`round(12 × 渲染方形 / 900)`；导出圆角：`round(12 × 设计方形 / 900)`（同比例）
- 横图导入被拒绝（alert）

### 6.3 Type F / G（画中画）

```
┌──────────────────────────────────┐
│          5% 白色留白              │
├──────────────────────────────────┤
│     92% 宽度 × 80% 高度           │  ← 照片展示区（object-fit: cover）
├──────────────────────────────────┤
│   底部 15% 文字信息区（绝对定位）  │
└──────────────────────────────────┘
```

- **F**：三行文字（"Shot on"+品牌型号 / 参数行 / © 署名）；**G**：Logo + 日期|参数|机型 + 署名
- **动态字号**：`max(8, round(14 × 显示宽 / 900))`；第二行 = 基准 × (12/14)；行距 = 基准 × (6/14)
- **G 纵向自适应**：照片区 90% / 顶留白 2.5% / 文字区 7.5%（横图 80%/5%/15%）
- v1.21 起预览缩放走统一 fit（几何与旧实现 0px 一致）

### 6.4 Type S / T（留白排版 / 满幅）

- **比例**：1:1 / 1:1.35（S 用 `canvasRatioS`，T 用 `ratioT`）
- **S**：白色画布 + 居中方形照片（82%）+ 左侧两行文字 + 右侧竖排日期 + 右下参数
- **T**：照片铺满 + 与 S 相同文字系统（带淡阴影）
- **文字系统**：`resolveTextColor`（黑/白/主色）、`buildParamsLine`（参数行）、`formatDateS/T`（竖排日期）
- **取色**：`sampleTypeSColor`/`sampleTypeTColor` 采样主色 → 边框色/文字色
- **拖动**：照片可拖动裁剪（归一化偏移导出）

---

## 七、未使用/预留导出（10）

### exif.js（4）

| 符号 | 原因 |
|------|------|
| `getExifName` | UI 不显示 EXIF 详情表 |
| `SUPPORTED_MAKES` | 厂商匹配改走 logoList |
| `exifPrimaryKeys` | 仅定义 |
| `primaryExif` | 仅被未使用的 `getExifName` 引用 |

### logo-utils.js（6）

| 符号 | 原因 |
|------|------|
| `logoSvgMap` | 仅被未使用的 `getMakeLogoSvg` 引用 |
| `getMakeLogoSvg` | 无调用方（改用真实 SVG 文件 + CSS filter） |
| `getAutoLogoFilename` | 无调用方 |
| `getMakeLogoPath` | 仅被未使用的 `getMakeLogo` 引用 |
| `getMakeLogo` | 无调用方 |
| `replaceTextVars` | 无调用方 |

> U3 清理（2026-10-10）已删除的死代码不再列出：`drawLogoTypeE`、`setOriginalDimensions`、`getDisplaySettings`、`calcBorderSize`×3、`shortSide`、`borderPercent`、`typeBPreview` 死导入等（约 1000 行）。

---

## 八、统计

| 分类 | 数量 |
|------|------|
| 样式（A–T） | 20 |
| 预览 / 导出模块 | 20 + 20 |
| 编辑面板组件文件 | 15（F–T） |
| 共享模块 | 11 |
| 未使用/预留导出 | 10 |

---

## 九、与原始 Electron 版本的差异

| 项目 | Electron 版 | NAS/Web 版 |
|------|------------|------------|
| 主进程 | `main.js` + `preload.js` | 无（移除） |
| 文件选择 | `electronAPI.selectImage()` | `<input type="file">` |
| 文件保存 | `electronAPI.saveBlob()` | `<a download>` |
| 图片加载 | `file://` 协议 | `URL.createObjectURL()` |
| Logo 加载 | `electronAPI.getLogos()` | 静态 `getAllLogos()` |
| EXIF 二进制读取 | `electronAPI.readExifBinary()` | `FileReader` + `piexif` |
| 外部资源 | CDN 加载 | 本地 `assets/` 目录 |
| 部署方式 | electron-builder 打包 | Docker + Nginx / 静态托管 |
| 字体 | opentype.js（全部样式） | opentype（B/E）+ CSS woff2（其余） |

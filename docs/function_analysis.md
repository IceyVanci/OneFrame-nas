# OneFrame NAS Edition 函数分析文档

> 本文档基于 OneFrame NAS 版本（Docker/Web），反映从 Electron 移植后的实际代码状态。
> 原始项目：[OneFrame](https://github.com/IceyVanci/OneFrame)（Electron 桌面应用）

---

## 📊 快速总览

| 状态 | 数量 | 说明 |
|------|------|------|
| ✅ 设计/使用中 | 60+ | 按设计预期运行 |
| ⚠️ 未使用/预留 | 8 | 功能已废弃或预留，未被调用 |

---

## 📁 项目文件结构

```
src/renderer/
├── index.html           # 主页面
├── index.css            # 全局样式
├── css/
│   ├── type-a.css       # Type A 样式（白色下边框）
│   ├── type-b.css       # Type B 样式（正方形画布）
│   ├── type-c.css       # Type C 样式（横向布局）
│   ├── type-d.css       # Type D 样式（横向居中）
│   ├── type-e.css       # Type E 样式（3:2纵向）
│   ├── type-f.css       # Type F 样式（画中画风格）
│   └── type-g.css       # Type G 样式（Logo+日期参数+签名画中画）
├── js/
│   ├── app.js           # 主逻辑入口（浏览器模式）
│   ├── exif.js          # EXIF 读取 (exifreader)
│   ├── exif-exporter.js # EXIF 导出 (piexifjs)
│   ├── exporter.js      # 图片导出
│   ├── logo-utils.js    # Logo 工具函数
│   ├── components/
│   │   ├── type-f-editor-panel.js  # Type F 编辑面板配置
│   │   └── type-g-editor-panel.js  # Type G 编辑面板配置
│   └── styles/
│       ├── index.js     # 样式注册表
│       ├── type-a-preview.js / type-a-export.js
│       ├── type-b-preview.js / type-b-export.js
│       ├── type-c-preview.js / type-c-export.js
│       ├── type-d-preview.js / type-d-export.js
│       ├── type-e-preview.js / type-e-export.js
│       ├── type-f-preview.js / type-f-export.js
│       └── type-g-preview.js / type-g-export.js
├── logos/               # 相机厂商 Logo (SVG)
├── fonts/               # 字体文件 (MiSans)
└── assets/
    ├── piexif.js        # EXIF 处理库
    ├── exifreader.js    # EXIF 读取库
    ├── opentype.min.js  # 字体渲染库
    └── font-awesome/    # 图标库（本地化）
```

---

## 📋 模块职责表

### 样式相关模块

| 模块 | 文件 | 职责 | 样式 |
|------|------|------|------|
| **预览** | `type-a-preview.js` | Type A 边框预览渲染（白色下边框） | Type A |
| **预览** | `type-b-preview.js` | Type B 边框预览渲染（正方形画布，图片居左） | Type B |
| **预览** | `type-c-preview.js` | Type C 边框预览渲染（横向布局） | Type C |
| **预览** | `type-d-preview.js` | Type D 边框预览渲染（横向居中） | Type D |
| **预览** | `type-e-preview.js` | Type E 边框预览渲染（3:2纵向，支持拖动裁剪） | Type E |
| **预览** | `type-f-preview.js` | Type F 边框预览渲染（画中画风格，动态字号缩放） | Type F |
| **预览** | `type-g-preview.js` | Type G 边框预览渲染（Logo+日期参数+签名画中画） | Type G |
| **导出** | `type-a-export.js` | Type A Canvas 绘制导出 | Type A |
| **导出** | `type-b-export.js` | Type B Canvas 绘制导出 | Type B |
| **导出** | `type-c-export.js` | Type C Canvas 绘制导出 | Type C |
| **导出** | `type-d-export.js` | Type D Canvas 绘制导出 | Type D |
| **导出** | `type-e-export.js` | Type E Canvas 绘制导出 | Type E |
| **导出** | `type-f-export.js` | Type F Canvas 绘制导出 | Type F |
| **导出** | `type-g-export.js` | Type G Canvas 绘制导出 | Type G |
| **编辑面板** | `type-f-editor-panel.js` | Type F 编辑面板配置（隐藏边框颜色/高度/比例/Logo） | Type F |
| **编辑面板** | `type-g-editor-panel.js` | Type G 编辑面板配置（隐藏边框/比例/所有开关，保留 Logo 区域） | Type G |
| **样式注册表** | `index.js` | 统一管理样式模块 | 通用 |

### 共享模块

| 模块 | 文件 | 职责 | 说明 |
|------|------|------|------|
| **主入口** | `app.js` | 主逻辑入口 | 纯浏览器模式，无 Electron 分支 |
| **EXIF 读取** | `exif.js` | 读取图片 EXIF 信息 | 使用 exifreader（本地加载） |
| **EXIF 导出** | `exif-exporter.js` | 嵌入 EXIF 到输出图 | 使用 piexifjs |
| **图片导出** | `exporter.js` | Canvas 绘制导出 | 通用逻辑，通过 `<a download>` 下载 |
| **Logo 工具** | `logo-utils.js` | Logo 文件和厂商映射 | 共享 |

---

## 📋 机制汇总表

### styles/index.js

| 函数名 | 状态 | 说明 | 样式 |
|--------|------|------|------|
| `styles` | ✅ | 样式注册表对象 | 通用 |
| `getPreview(styleId)` | ✅ | 获取预览模块 | 通用 |
| `getExport(styleId)` | ✅ | 获取导出模块 | 通用 |
| `getStyle(styleId)` | ✅ | 获取完整样式配置 | 通用 |
| `getAllStyles()` | ✅ | 获取所有样式列表 | 通用 |

### styles/type-a-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type A 预览 |
| `calcBorderSize(imgWidth, imgHeight, borderPercent)` | ✅ | 计算边框尺寸 |
| `updateFrameWrapper(frameWrapper)` | ✅ | 更新 frameWrapper 类名（完整清理 type-a~e） |
| `updatePreview(img, footer, options)` | ✅ | 更新边框预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新边框内容（焦距带 mm 单位） |
| `reset()` | ✅ | 重置预览状态（完整清理类名） |

### styles/type-b-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type B 预览 |
| `calcSize(settings)` | ✅ | 计算正方形尺寸（含自适应缩放） |
| `updateFrameWrapper(squareSize)` | ✅ | 设置 frameWrapper 为正方形（完整清理 type-a~e） |
| `updatePreview(squareSize, margin, imgDimensions)` | ✅ | 更新图片和右侧区域布局 |
| `updateContentPreview(settings)` | ✅ | 更新右侧参数和 Logo |
| `update(imgSettings, displaySettings)` | ✅ | 完整更新流程 |
| `reset()` | ✅ | 重置预览状态（完整清理类名，移除 mainContainer） |

### styles/type-c-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type C 预览 |
| `calcBorderSize(imgWidth, imgHeight, borderPercent)` | ✅ | 计算边框尺寸 |
| `updateFrameWrapper(frameWrapper)` | ✅ | 更新 frameWrapper 类名（完整清理 type-a~e） |
| `updatePreview(img, footer, options)` | ✅ | 更新边框预览（纵向图片自动缩放字体） |
| `updateContentPreview(elements, settings)` | ✅ | 更新边框内容（焦距带 mm 单位） |
| `reset()` | ✅ | 重置预览状态（完整清理类名） |

### styles/type-d-preview.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type D 预览 |
| `calcBorderSize(imgWidth, imgHeight, borderPercent)` | ✅ | 计算边框尺寸 |
| `updateFrameWrapper(frameWrapper)` | ✅ | 更新 frameWrapper 类名（完整清理 type-a~e） |
| `updatePreview(img, photoFooter, options)` | ✅ | 更新边框预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新边框内容（焦距带 mm 单位） |
| `reset()` | ✅ | 重置预览状态（完整清理类名） |

### styles/type-e-preview.js (3:2 纵向，支持拖动裁剪)

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type E 预览，添加拖动事件监听 |
| `setOriginalDimensions(width, height)` | ✅ | 设置原始图片尺寸 |
| `calcSize(settings)` | ✅ | 计算尺寸（正方形 + 3:2 比例） |
| `updateFrameWrapper(squareSize)` | ✅ | 更新 frameWrapper 为 3:2（完整清理 type-a~e） |
| `updatePreview(squareSize, margin, imgDimensions)` | ✅ | 更新 1:1 正方形图片预览 |
| `updateContentPreview(elements, settings)` | ✅ | 更新底部参数布局 |
| `updateDragHint()` | ✅ | 添加/更新拖动提示文字 |
| `startDrag(e)` | ✅ | 开始拖动 |
| `onDrag(e)` | ✅ | 拖动中（根据图片方向限制偏移） |
| `endDrag()` | ✅ | 结束拖动 |
| `getMaxOffset()` | ✅ | 获取最大偏移量（拖动限制） |
| `calculateObjectPosition()` | ✅ | 计算 object-position 值 |
| `getImageOffset()` | ✅ | 获取图片偏移量（用于导出） |
| `getState()` | ✅ | 获取完整 state（用于导出） |
| `getNormalizedOffset()` | ✅ | 获取归一化偏移量（用于导出） |
| `resetImageOffset()` | ✅ | 重置图片偏移 |
| `reset()` | ✅ | 重置预览状态（完整清理类名，移除拖动提示） |

### styles/type-e-export.js

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载 MiSans 字体 |
| `drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts)` | ✅ | 绘制 Type E 底部参数 |
| `drawLogoTypeEFixed(ctx, logoName, x, bottomY, scale, yearFontSize)` | ✅ | 绘制 Logo（固定在底部） |
| `drawLogoTypeE(ctx, logoName, x, y, scale, yearFontSize)` | ⚠️ | 已废弃，改用 drawLogoTypeEFixed |
| `renderImage(img, options)` | ✅ | Type E Canvas 导出（3:2 纵向） |

### styles/type-f-preview.js（画中画风格，动态字号缩放）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type F 预览 |
| `calcSize(settings)` | ✅ | 计算画布尺寸（宽度=图片宽度，高度=图片高度/0.8） |
| `updateFrameWrapper(squareSize, canvasHeight)` | ✅ | 设置 frameWrapper 尺寸和动态字号（基准 900px 对应 14px） |
| `updatePreview(squareSize, canvasHeight, imgDimensions)` | ✅ | 更新图片样式（由 CSS 控制布局），隐藏 photoFooter |
| `updateContentPreview(elements, settings)` | ✅ | 更新底部文字区（绝对定位，与导出一致） |
| `reset()` | ✅ | 重置预览状态（完整清理类名，恢复默认 HTML 结构） |

### styles/type-f-export.js（画中画导出）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载 MiSans 字体（Normal + Medium） |
| `borderColorIsLight(color)` | ✅ | 检测边框颜色亮度 |
| `drawText(ctx, text, x, y, fontSize, options)` | ✅ | 绘制单行文字（opentype.js 路径渲染） |
| `drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts)` | ✅ | 绘制 Type F 底部文字区（Shot on + 参数 + 署名） |
| `renderImage(img, options)` | ✅ | Type F Canvas 导出（画布宽度=图片宽度，高度=图片高度/0.8） |

### styles/type-g-preview.js（Logo+日期参数+签名画中画）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `init(elements)` | ✅ | 初始化 Type G 预览 |
| `calcSize(settings)` | ✅ | 计算画布尺寸（宽度=图片宽度，高度=图片高度/0.8或0.9） |
| `updateFrameWrapper(squareSize, canvasHeight)` | ✅ | 设置 frameWrapper 尺寸和动态字号（基准 900px 对应 14px） |
| `updatePreview(squareSize, canvasHeight, imgDimensions)` | ✅ | 更新照片区域样式（纵向图片覆盖 CSS 默认值） |
| `updateContentPreview(elements, settings)` | ✅ | 更新文字和 Logo 内容预览（三行居中布局） |
| `reset()` | ✅ | 重置预览状态 |

### styles/type-g-export.js（Logo+日期参数+签名导出）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `loadFonts()` | ✅ | 预加载 MiSans 字体（Semibold/Medium/Normal） |
| `drawText(ctx, text, x, y, fontSize, options)` | ✅ | 使用 ctx.fillText 绘制文字 |
| `detectLogoBrightness(logoPath)` | ✅ | 检测 logo 图片的平均亮度 |
| `borderColorIsLight(color)` | ✅ | 判断颜色是否为浅色 |
| `formatDateForDisplay(dateTimeStr)` | ✅ | 格式化日期 |
| `drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait)` | ✅ | 绘制底部文字内容（Logo+日期参数+签名） |
| `drawLogoG(ctx, logoName, centerX, centerY, maxHeight)` | ✅ | 绘制 Logo（居中，按目标高度缩放） |
| `renderImage(img, options)` | ✅ | Type G Canvas 导出 |

### components/type-f-editor-panel.js（Type F 编辑面板配置）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `configureEditPanel()` | ✅ | 配置 Type F 编辑面板（隐藏边框颜色/高度/比例/Logo，更新设备型号提示） |

### components/type-g-editor-panel.js（Type G 编辑面板配置）

| 函数名 | 状态 | 说明 |
|--------|------|------|
| `configureEditPanel()` | ✅ | 配置 Type G 编辑面板（隐藏边框/比例/所有开关，保留 Logo 区域，更新机型提示） |

### app.js（浏览器模式）

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `checkImageOrientation(fileOrPath)` | ✅ | 导入图片 | 使用 `URL.createObjectURL()` 检查图片方向 |
| `detectLogoBrightness(logoPath)` | ✅ | Logo 检测 | 分析像素亮度，用于智能配色 |
| `isLogoLight(logoName)` | ✅ | Logo 检测 | 带缓存的亮度检测 |
| `initLogoGrid()` | ✅ | 初始化 | 加载 Logo 列表，`onerror` 隐藏无 SVG 的品牌 |
| `selectLogo(name)` | ✅ | 点击 Logo | 更新选中状态和预览 |
| `loadImageWithExif(file)` | ✅ | 选择图片 | 读取 EXIF → 更新表单 |
| `updateExifDisplay()` | ✅ | EXIF 更新 | 自动填充表单（日期正则匹配 `YYYY-MM-DD` 格式） |
| `showEditor()` | ✅ | 进入编辑器 | 配置编辑面板，区分 Type B/E 特殊处理 |
| `hideEditor()` | ✅ | 返回主页 | 重置状态，调用对应预览模块 reset |
| `resetForm()` | ✅ | 返回主页 | 清空表单 |
| `updateBorder()` | ✅ | 颜色/高度变化 | 更新边框（Type B/E 走独立路径） |
| `updateBorderContent()` | ✅ | 内容变化 | 更新边框内容 |
| `getDisplaySettings()` | ✅ | 预览更新 | 收集显示设置 |
| `getEditSettings()` | ✅ | 导出时 | 收集编辑设置 |
| `exportImageHandler()` | ✅ | 点击导出 | 调用 exporter → `<a download>` 下载 |
| `filterCards(category)` | ✅ | 标签切换 | 筛选样式卡片（参数/海报） |

### exporter.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `exportImage(img, options)` | ✅ | 导出按钮 | 获取渲染函数 → Canvas 绘制 → 嵌入 EXIF → Blob |
| `getExportRenderer(styleId)` | ✅ | 导出时 | 获取对应样式渲染函数 |
| `dataURLtoBlob(dataUrl)` | ✅ | 导出完成 | DataURL → Blob |

### exif.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `getExif(file)` | ✅ | 导入图片 | 使用 `window.ExifReader` 读取 EXIF（本地加载） |
| `getMakeName(make)` | ✅ | Logo 选择 | 标准化厂商名称 |
| `getFocalLength(exif)` | ✅ | 焦距获取 | 优先等效焦距 |
| `formatDateTime(dateStr)` | ✅ | 日期格式化 | `YYYY:MM:DD HH:mm:ss` → `YYYY-MM-DD HH:mm:ss` |
| `formatValue(val)` | ✅ | 值格式化 | 提取 description/value |
| `getExifName(key)` | ⚠️ | 未使用 | UI 不显示 EXIF 详情表 |
| `SUPPORTED_MAKES` | ⚠️ | 未使用 | 从 logoList 获取 |
| `exifPrimaryKeys` | ⚠️ | 未使用 | 仅定义 |
| `primaryExif` | ⚠️ | 未使用 | UI 不显示详情 |

### exif-exporter.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `readExifFromFile(file)` | ✅ | 导出时 | 使用 FileReader + piexif 读取 EXIF |
| `embedExif(dataUrl, exifObj)` | ✅ | 导出时 | 将 EXIF 嵌入图片 DataURL |
| `hasExifData(exifObj)` | ✅ | 导出时 | 检查 EXIF 对象是否包含有效数据 |
| `dumpExif(exifObj)` | ✅ | 导出时 | 转换 EXIF 对象为 piexif 格式 |
| `ExifHandler` (class) | ✅ | 内部 | EXIF 处理单例 |

### logo-utils.js

| 函数名 | 状态 | 触发时机 | 说明 |
|--------|------|----------|------|
| `getAllLogos()` | ✅ | Logo 列表 | 返回所有可用 Logo（19 个有 SVG 文件） |
| `getLogoFilename(make)` | ✅ | Logo URL | 获取 Logo 文件名 |
| `getModelName(model)` | ✅ | 机型格式化 | 去除冗余后缀 |
| `getMakeName(make)` | ✅ | Logo 选择 | 标准化厂商名称 |
| `getAutoLogoFilename(make)` | ⚠️ | 未使用 | 改用 CSS filter |
| `getMakeLogoPath(make)` | ⚠️ | 未使用 | 改用相对路径 |
| `getMakeLogo(exif)` | ⚠️ | 未使用 | 改用直接匹配 |
| `logoSvgMap` | ⚠️ | 未使用 | 改用真实 SVG 文件 |

---

## 📈 数据流分析

### 图片导入流程（浏览器模式）

```
用户选择图片（<input type="file">）
     │
     ▼
┌─────────────────────────────────────┐
│       loadImageWithExif(file)       │
│  - URL.createObjectURL(file)        │
│  - getExif(file)                    │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│            getExif(file)            │
│  - window.ExifReader.load(file)     │
│  - 解析 EXIF 字段                   │
│  - formatDateTime() 格式化日期      │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         updateExifDisplay()         │
│  - getMakeName() → 自动选择 Logo    │
│  - getModelName() → 填充机型        │
│  - 正则匹配 YYYY-MM-DD 格式日期     │
└─────────────────────────────────────┘
```

### 样式切换流程

```
点击样式卡片
     │
     ▼
┌─────────────────────────────────────┐
│  currentStyle = card.dataset.style  │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│    showEditor()                     │
│  - 配置编辑面板（Type B/E 特殊处理）│
│  - updateBorder() → 预览渲染        │
└─────────────────────────────────────┘
```

### 边框预览更新流程

```
用户修改设置 / 图片加载
     │
     ▼
┌─────────────────────────────────────┐
│        updateBorder()               │
│  - getPreview(currentStyle)         │
│  - preview.init()                   │
│  - preview.reset()                  │
│  - preview.updateFrameWrapper()     │  ← 统一清理 type-a~e 类名
│  - preview.updatePreview()          │
│  - updateBorderContent()            │
└─────────────────────────────────────┘
```

### 图片导出流程（浏览器模式）

```
用户点击导出
     │
     ▼
┌─────────────────────────────────────┐
│       exportImageHandler()          │
│  - 收集编辑设置                      │
│  - exportImage(img, options)        │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  getExportRenderer(currentStyle)    │
│  - renderImage(img, options)        │
│  - Canvas 绘制 → DataURL            │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  readExifFromFile(file)             │
│  - piexif.load() 读取原图 EXIF      │
│  - embedExif() 嵌入到输出图          │
└────────────────┬────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  dataURLtoBlob() → <a download>     │
│  浏览器自动下载文件                   │
└─────────────────────────────────────┘
```

---

## Type E 特殊布局说明

### Type E 画布结构

```
┌─────────────────────────────────┐
│                                 │
│         1:1 正方形图片            │  ← 顶部 squareSize × squareSize
│       (可拖动裁剪区域)            │
│                                 │
├─────────────────────────────────┤
│  March              f/2.8       │
│  2024            50mm 1/125   │  ← 底部白色区域
│                   ISO 400       │    canvasHeight - squareSize
│ [Logo]            Model          │
│                 Signature        │
└─────────────────────────────────┘

画布尺寸：squareSize × (squareSize × 1.5)
```

### Type E 布局规则

| 位置 | 内容 | 样式 |
|------|------|------|
| 左上 | 月份（英文首字母大写） | font-size: 48px（是其他文字的 2 倍） |
| 左上（月份下方） | 年份 | font-size: 24px, 橙色 #FF6B00 |
| 左下 | Logo | 固定在底部，距离下边缘 5% |
| 右上 | 光圈 + 焦距 + 快门 + ISO | 合并在一行，font-size: 18px |
| 右上 | 机型 | font-size: 18px, 灰色 #666666 |
| 右上 | 署名 | font-size: 18px, 浅灰 #888888 |

### Type E 拖动机制

- 纵向图片：只能上下拖动，可拖动范围 = (原始高度 - squareSize) / 2
- 横向/方形图片：只能左右拖动，可拖动范围 = (原始宽度 - squareSize) / 2
- 拖动提示：显示在画布外部下方，切换样式时自动清除

---

## Type F 特殊布局说明

### Type F 画布结构

```
┌──────────────────────────────────┐
│          5% 白色留白              │
├──────────────────────────────────┤
│                                  │
│     92% 宽度 × 80% 高度           │  ← 照片展示区
│     (object-fit: cover)          │
│                                  │
├──────────────────────────────────┤
│    Shot on Sony A7M4             │  ← 底部 15% 文字信息区
│    2024/06/18 f/2.8 50mm 1/125   │     (绝对定位)
│    ISO 400                       │
│    © Photo by John               │
└──────────────────────────────────┘

画布尺寸：图片宽度 × (图片高度 / 0.8)
```

### Type F 布局规则

| 区域 | 位置 | 内容 |
|------|------|------|
| 白色留白 | 顶部 5% 高度 | 纯白背景 |
| 照片区 | top:5%, left:4%, width:92%, height:80% | 图片（object-fit: cover） |
| 文字区 | 底部 15% 高度 | 绝对定位文字 |
| 第一行 | 文字区居中 | "Shot on"（灰色 #888）+ 品牌型号（黑色 #000） |
| 第二行 | 第一行下方 | 日期 光圈 焦距 快门 ISO（灰色 #888） |
| 第三行 | 第二行下方 | © 署名（灰色 #888，可选） |

### Type F 动态字号

- 基准：900px 画布宽度对应 14px 字号
- 公式：`fontSize = 14 × displayWidth / 900`
- 第二行/第三行字号 = 第一行 × (12/14)
- 行间距 = baseFontSize × (6/14)

### Type F 预览缩放机制（v1.04 修复）

- 画布原始尺寸完全基于图片（`canvasW = naturalWidth`，`canvasH = naturalHeight / 0.8`）
- 每次 resize 时计算 `displayScale = min(availW/canvasW, availH/canvasH, 1)`
- 显示尺寸 = 原始尺寸 × displayScale
- 所有元素（字号、CSS 百分比）基于显示尺寸计算，无 transform 双重缩放

### Type F 编辑面板特殊配置

- 隐藏：边框颜色、边框高度、比例设置、Logo 区域
- 设备型号文本框自动包含品牌名（如 "Sony A7M4"）
- 使用 `type-f-editor-panel.js` 独立配置模块

---

## Type G 特殊布局说明

### Type G 画布结构

```
┌──────────────────────────────────┐
│          5% 白色留白              │
├──────────────────────────────────┤
│                                  │
│     92% 宽度 × 80% 高度           │  ← 照片展示区
│     (object-fit: cover)          │
│                                  │
├──────────────────────────────────┤
│         [Canon Logo]             │  ← 第一行：厂商 Logo（居中）
│   2024/06/18 | f/2.8 50mm | A7M4 │  ← 第二行：日期|参数|机型（竖线分隔）
│         © Photo by John          │  ← 第三行：署名（居中）
└──────────────────────────────────┘

画布尺寸：图片宽度 × (图片高度 / 0.8)
```

### Type G 布局规则

| 区域 | 位置 | 内容 |
|------|------|------|
| 白色留白 | 顶部 5% 高度 | 纯白背景 |
| 照片区 | top:5%, left:4%, width:92%, height:80% | 图片（object-fit: cover） |
| 文字区 | 底部 15% 高度 | 绝对定位文字 |
| 第一行 | 文字区居中 | 厂商 Logo（居中，高度 = textAreaHeight / 6） |
| 第二行 | 第一行下方 | 日期 | 参数 | 机型（竖线分隔，全部黑色 #000） |
| 第三行 | 第二行下方 | © 署名（黑色 #000，可选） |

### Type G 纵向图片自适应

| 场景 | 照片区 | 顶部留白 | 底部文字区 | Logo 高度 |
|------|--------|---------|-----------|----------|
| 横向图片 | 80% | 5% | 15% | canvasHeight × 2.5% |
| 纵向图片 | 90% | 2.5% | 7.5% | canvasHeight × 1.25% |

### Type G 动态字号

- 基准：900px 画布宽度对应 14px 字号
- 公式：`fontSize = 14 × displayWidth / 900`
- 第三行字号 = 基准 × (12/14)
- 行间距 = baseFontSize × (6/14)

### Type G 预览缩放机制

与 Type F 一致：
- 画布原始尺寸完全基于图片（`canvasW = naturalWidth`，`canvasH = naturalHeight / 0.8`）
- 每次 resize 时计算 `displayScale = min(availW/canvasW, availH/canvasH, 1)`
- 显示尺寸 = 原始尺寸 × displayScale
- 所有元素（字号、CSS 百分比）基于显示尺寸计算

### Type G 与 Type F 差异

| 特性 | Type F | Type G |
|------|--------|--------|
| 第一行 | "Shot on" + 品牌型号（文字） | 厂商 Logo（图片） |
| 第二行格式 | 日期 光圈 焦距 快门 ISO（空格分隔） | 日期\|参数\|机型（竖线分隔） |
| 文字颜色 | 灰色 #888888 | 黑色 #000000 |
| 机型名 | 带品牌前缀（如 "Sony A7M4"） | 仅型号（如 "A7M4"） |
| 编辑面板 | 隐藏 Logo 区域 | 保留 Logo 区域 |
| 开关控制 | 保留部分开关 | 隐藏所有开关（全部默认显示） |

### Type G 编辑面板特殊配置

- 隐藏：边框颜色、边框高度、比例设置
- 隐藏：所有显示开关（Logo/参数/时间/署名，所有元素默认显示）
- 保留：Logo 选择区域
- 机型 placeholder：`型号（如 A7M4）`

---

## 📊 统计

| 分类 | 数量 |
|------|------|
| 设计/使用中 | 60+ |
| 未使用/预留 | 8 |
| **总计分析** | 68+ |

---

## ⚠️ 未使用/预留函数

### exif.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `getExifName` | 未使用 | UI 不显示详情表 |
| `SUPPORTED_MAKES` | 未使用 | 从 logoList 获取 |
| `exifPrimaryKeys` | 未使用 | 仅定义 |
| `primaryExif` | 未使用 | UI 不显示详情 |

### logo-utils.js

| 函数/常量 | 状态 | 原因 |
|-----------|------|------|
| `logoSvgMap` | 未使用 | 改用真实 SVG 文件 |
| `getAutoLogoFilename` | 未使用 | 改用 CSS filter |
| `getMakeLogoPath` | 未使用 | 改用相对路径 |
| `getMakeLogo` | 未使用 | 改用直接匹配 |

### styles/type-e-export.js

| 函数 | 状态 | 原因 |
|------|------|------|
| `drawLogoTypeE` | 已废弃 | 改用 `drawLogoTypeEFixed` |

---

## 📊 与原始 Electron 版本的差异

| 项目 | Electron 版 | NAS/Web 版 |
|------|------------|------------|
| 主进程 | `main.js` + `preload.js` | 无（移除） |
| 文件选择 | `electronAPI.selectImage()` | `<input type="file">` |
| 文件保存 | `electronAPI.saveBlob()` | `<a download>` |
| 图片加载 | `file://` 协议 | `URL.createObjectURL()` |
| Logo 加载 | `electronAPI.getLogos()` | 静态 `getAllLogos()` |
| EXIF 二进制读取 | `electronAPI.readExifBinary()` | `FileReader` + `piexif` |
| 外部资源 | CDN 加载 | 本地 `assets/` 目录 |
| 部署方式 | electron-builder 打包 | Docker + Nginx |
| 编辑面板配置 | `components/type-*-editor-panel.js` | 内联在 `app.js` 的 `showEditor()` |
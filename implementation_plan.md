# Implementation Plan

## [Overview]

将原始项目（Electron 版 v1.0.5）中的 Type G 样式完整移植到 NAS Docker Web 版（当前 v1.04），使 NAS 版功能与原始项目保持同步。

NAS 版当前已有 Type A-F 六种样式，且已完成 V1.04（Type F 缩放修复）和 V1.05（Type F 纵向自适应 + Type E 文字缩放）的功能同步。唯一缺失的是 Type G 画中画样式及其相关 bug 修复。Type G 是一种白色背景画中画风格，第一行显示厂商 Logo，第二行显示「拍摄日期 | 拍摄参数 | 相机名称」（竖线分隔），第三行显示署名。

移植需要适配 NAS 版的 Web-only 环境（无 Electron IPC、无 file:// 协议、使用浏览器 `<input type="file">` 和 `<a download>`）。

## [Types]

无新增类型系统变更。Type G 使用与 Type F 相同的 state 结构和 settings 对象接口。

### Type G 核心数据结构

```javascript
// calcSize 返回值
{ squareSize: number, canvasHeight: number, isPortrait: boolean }

// updateContentPreview settings 对象
{
  selectedLogo: string,        // 厂商 Logo 名
  showLogo: boolean,           // Type G 始终 true
  showModel: boolean,          // Type G 始终 true
  customModel: string,         // 仅型号名（不带品牌前缀，如 "A7M4"）
  showParams: boolean,         // Type G 始终 true
  fNumber: string,
  exposureTime: string,
  focalLength: string,
  iso: string,
  showTime: boolean,           // Type G 始终 true
  dateTime: string,
  signatureText: string,
  borderColor: string          // Type G 固定 '#ffffff'
}
```

### Type G 布局参数

| 场景 | 照片区高度占比 | 顶部留白 | 底部文字区 |
|------|--------------|---------|-----------|
| 横向图片 | 80% | 5% | 15% |
| 纵向图片 | 90% | 2.5% | 7.5% |

| 场景 | Logo 最大高度 |
|------|-------------|
| 横向图片 | canvasHeight × 2.5% |
| 纵向图片 | canvasHeight × 1.25% |

| 组件 | 字号（基准 900px 宽度对应 14px） |
|------|-------------------------------|
| 第二行（日期\|参数\|机型） | 14px (baseScale) |
| 第三行（署名） | 12px (14 × 12/14) |

## [Files]

### 新建文件（4 个）

| 文件路径 | 用途 |
|---------|------|
| `src/renderer/css/type-g.css` | Type G 样式定义：frame-wrapper.type-g 布局、照片区域（92%×80%/90%）、文字行定位、Logo 容器 |
| `src/renderer/js/styles/type-g-preview.js` | Type G 预览模块：init/calcSize/updateFrameWrapper/updatePreview/updateContentPreview/reset |
| `src/renderer/js/styles/type-g-export.js` | Type G 导出模块：loadFonts/drawBorderContent/drawLogoG/renderImage |
| `src/renderer/js/components/type-g-editor-panel.js` | Type G 编辑面板配置：隐藏边框/比例/所有开关，保留 Logo 选择区 |

### 修改文件（4 个）

| 文件路径 | 变更内容 |
|---------|---------|
| `src/renderer/js/styles/index.js` | 添加 `import { typeGPreview }` 和 `import { typeGExport }`，在 styles 注册表中添加 `'type-g'` 条目，添加 `export { typeGPreview }` 重新导出 |
| `src/renderer/index.html` | 1) `<head>` 中添加 `<link rel="stylesheet" href="css/type-g.css">` 2) 在 type-f 卡片后添加 Type G 样式卡片（`data-style="type-g"`, `data-category="params"`，使用 `TypeG-sample_compressed.jpeg`）3) 更新关于弹框版本号为 v1.05 |
| `src/renderer/js/app.js` | 1) 添加 `import { configureEditPanel as configureTypeG }` 2) 添加 `typeGCachedSize` 变量 3) `loadImageWithExif` 中清除 typeGCachedSize 4) `showEditor()` 中添加 `type-g` 到 borderColor 隐藏列表 + `configureTypeG()` 调用 5) `updateBorder()` 中添加 Type G 分支（与 Type F 相同的缩放逻辑：计算原始画布尺寸 → displayScale → 动态显示尺寸）6) `updateExifDisplay()` 中 Type G 不拼接品牌前缀（仅对 Type F 拼接） |
| `src/renderer/js/exporter.js` | 1) 添加 `import { typeGExport }` 2) 在 exportStyles 映射中添加 `'type-g': typeGExport` |

### 静态资源需求

| 文件路径 | 说明 |
|---------|------|
| `src/renderer/TypeG-sample_compressed.jpeg` | Type G 首页缩略图（需从原始项目复制或自行准备） |

## [Functions]

### 新建函数

| 函数名 | 文件 | 签名 | 说明 |
|--------|------|------|------|
| `init` | `type-g-preview.js` | `init(elements: {img, frameWrapper, photoFooter, borderContent})` | 初始化 Type G 预览状态 |
| `calcSize` | `type-g-preview.js` | `calcSize(settings: {naturalWidth, naturalHeight}) → {squareSize, canvasHeight, isPortrait}` | 计算画布尺寸，纵向使用 0.9，横向使用 0.8 |
| `updateFrameWrapper` | `type-g-preview.js` | `updateFrameWrapper(squareSize, canvasHeight)` | 设置 frameWrapper 尺寸和类名，动态设置字号（14 × displayW / 900） |
| `updatePreview` | `type-g-preview.js` | `updatePreview(squareSize, canvasHeight, imgDimensions)` | 更新照片区域样式，纵向图片覆盖 CSS 默认百分比 |
| `updateContentPreview` | `type-g-preview.js` | `updateContentPreview(elements, settings)` | 生成三行 HTML（Logo + 日期\|参数\|机型 + 署名），绝对定位居中布局 |
| `reset` | `type-g-preview.js` | `reset()` | 重置所有样式和 innerHTML |
| `loadFonts` | `type-g-export.js` | `async loadFonts() → {fontSemibold, fontMedium, fontNormal}` | 加载 MiSans 三种字重 |
| `drawText` | `type-g-export.js` | `drawText(ctx, text, x, y, fontSize, options?)` | 使用 ctx.fillText 绘制文字 |
| `drawBorderContent` | `type-g-export.js` | `async drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait?)` | 绘制三行文字内容（Logo + 日期\|参数\|机型 + 署名） |
| `drawLogoG` | `type-g-export.js` | `async drawLogoG(ctx, logoName, centerX, centerY, maxHeight)` | 居中绘制 Logo，按目标高度缩放 |
| `renderImage` | `type-g-export.js` | `async renderImage(img, options) → string(DataURL)` | Type G Canvas 导出主函数 |
| `configureEditPanel` | `type-g-editor-panel.js` | `configureEditPanel()` | 隐藏边框颜色/高度/比例/所有开关，保留 Logo 区域，设置机型 placeholder |

### 修改函数

| 函数名 | 文件 | 变更内容 |
|--------|------|---------|
| `showEditor` | `app.js` | 在 borderColor 隐藏条件中添加 `currentStyle === 'type-g'`；添加 Type G 的 `configureTypeG()` 调用 |
| `updateBorder` | `app.js` | 添加 `else if (currentStyle === 'type-g')` 分支，实现与 Type F 相同的缩放逻辑（原始画布尺寸 → displayScale → 动态显示尺寸） |
| `updateExifDisplay` | `app.js` | 修改 `customModel` 赋值逻辑：仅 Type F 拼接品牌前缀，Type G 和其他类型只显示型号名 |
| `loadImageWithExif` | `app.js` | 添加 `typeGCachedSize = null;` 清除缓存 |
| `exportImageHandler` | `app.js` | 无需修改（Type G 不需要额外参数如 Type E 的 imageOffset） |

## [Classes]

无类定义变更。项目使用纯函数 + 模块导出模式。

## [Dependencies]

无新增依赖。Type G 复用已有技术栈：
- CSS 定位（与 Type F 相同的画中画布局模式）
- opentype.js（字体渲染，已有）
- exifreader + piexifjs（EXIF 处理，已有）
- MiSans 字体文件（已有）

## [Testing]

### 手动测试验证

| 测试项 | 预期结果 |
|--------|---------|
| 首页显示 Type G 卡片 | 卡片出现在参数分类下 |
| 点击 Type G 卡片选择图片 | 进入编辑器，白色画中画布局 |
| 横向图片预览 | 照片占 80%，顶部 5%，底部 15% |
| 纵向图片预览 | 照片占 90%，顶部 2.5%，底部 7.5% |
| Logo 居中显示 | Logo 在底部文字区水平居中 |
| 第二行内容 | 「日期 | 参数 | 机型」竖线分隔，全部黑色 |
| 机型名不含品牌前缀 | 如 "A7M4" 而非 "Sony A7M4" |
| 编辑面板 | 隐藏边框颜色/高度/比例/所有开关，保留 Logo 区域 |
| 导出横向图片 | 白色背景 + 92%×80% 照片 + 三行文字 |
| 导出纵向图片 | 白色背景 + 92%×90% 照片 + 三行文字 |
| 导出与预览一致 | 文字内容、Logo 位置、颜色均一致 |
| 其他样式不受影响 | Type A-F 功能正常 |
| 窗口缩放 | Type G 预览等比缩放 |
| 版本号更新 | 关于弹框显示 v1.05 |

### NAS 特有测试

| 测试项 | 预期结果 |
|--------|---------|
| 浏览器文件选择 | 正常选择图片 |
| 浏览器下载导出 | 正常下载 JPG 文件 |
| Docker 容器内运行 | 功能正常 |

## [Implementation Order]

按依赖关系从底层到顶层的顺序实施：

1. **创建 Type G CSS 文件** (`type-g.css`) — 样式基础，无依赖
2. **创建 Type G 预览模块** (`type-g-preview.js`) — 依赖 CSS
3. **创建 Type G 导出模块** (`type-g-export.js`) — 依赖字体文件
4. **创建 Type G 编辑面板配置** (`type-g-editor-panel.js`) — 依赖 DOM 元素
5. **注册到样式注册表** (`styles/index.js`) — 依赖预览和导出模块
6. **注册到导出器** (`exporter.js`) — 依赖导出模块
7. **修改主逻辑** (`app.js`) — 依赖注册表和面板配置
8. **修改 HTML** (`index.html`) — 添加 CSS 引用和样式卡片
9. **复制缩略图资源** (`TypeG-sample_compressed.jpeg`)
10. **版本号更新** — 修改关于弹框版本号
11. **Docker 构建测试** — `docker-compose up --build` 验证
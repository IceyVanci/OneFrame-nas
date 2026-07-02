# Implementation Plan

## 概述

同步原始项目 F:\OneFrame 的 v1.0.3 更新到 NAS 移植项目。核心变更是新增 Type F 边框样式（上方留白 + 照片区 + 底部文字信息区），以及相关的样式注册、编辑面板配置和导出支持。

原始项目的 Type F 实现已包含完整的预览、导出和编辑面板模块，需要将这些文件复制到 NAS 项目，并移除 Electron 相关代码（如 `window.electronAPI`、`file://` 协议等），使其适配浏览器模式。

---

## 新增文件（5 个）

### 1. `src/renderer/css/type-f.css`
- 直接从 `F:\OneFrame\src\renderer\css\type-f.css` 复制，无需修改
- 定义 Type F 的 frame-wrapper 布局（白色背景、照片区 92%×80%、底部文字区 15%）
- 文字行使用绝对定位和 em 单位

### 2. `src/renderer/js/styles/type-f-preview.js`
- 从 `F:\OneFrame\src\renderer\js\styles\type-f-preview.js` 复制
- 需要修改：`reset()` 中类名清理列表添加 `'type-f'`（当前只有 `type-a` ~ `type-e`）
- 包含：init、calcSize、updateFrameWrapper、updatePreview、updateContentPreview、reset

### 3. `src/renderer/js/styles/type-f-export.js`
- 直接从 `F:\OneFrame\src\renderer\js\styles\type-f-export.js` 复制，无需修改
- 使用 opentype.js + Canvas API 渲染导出
- 画布尺寸：宽=图片宽，高=图片高/0.8

### 4. `src/renderer/js/components/type-f-editor-panel.js`
- 直接从 `F:\OneFrame\src\renderer\js\components\type-f-editor-panel.js` 复制，无需修改
- 隐藏边框颜色、边框高度、比例设置、Logo 区域
- 设备型号 placeholder 更新

### 5. `src/renderer/TypeF-sample_compressed.jpeg`
- 从 `F:\OneFrame\src\renderer\TypeF-sample_compressed.jpeg` 复制
- Type F 样式卡片的预览缩略图

---

## 修改文件（5 个）

### 6. `src/renderer/js/styles/index.js`
- 添加 type-f-preview.js 和 type-f-export.js 的 import
- 在 styles 注册表中添加 `'type-f'` 条目
- 添加 `typeFPreview` 重新导出

### 7. `src/renderer/index.html`
- 添加 `<link rel="stylesheet" href="css/type-f.css">`（在 type-e.css 后面）
- 添加 Type F 样式卡片 HTML（`data-style="type-f" data-category="params"`，缩略图 `TypeF-sample_compressed.jpeg`）
- 关于弹框版本号从 `v1.01` 更新为 `v1.03`

### 8. `src/renderer/js/app.js`
需要做的改动（基于 NAS 版本的浏览器模式，不引入 Electron 代码）：

- **import 部分**：在 styles/index.js 导入中添加 `typeFPreview`；添加 `import { configureEditPanel as configureTypeF } from './components/type-f-editor-panel.js'`
- **变量声明**：在 `let selectedLogo = null;` 后添加 `let typeFCachedSize = null;`
- **`loadImageWithExif()`**：添加 `typeFCachedSize = null;`（清除 Type F 图框缓存）
- **`updateExifDisplay()`**：Type F 时设备型号自动拼接品牌名（`if (currentStyle === 'type-f') { customModel.value = makeName ? \`${makeName} ${modelName}\` : modelName; } else { customModel.value = modelName; }`）
- **`showEditor()`**：添加 Type F 分支：
  - `borderColorSection` 条件添加 `|| currentStyle === 'type-f'`
  - 调用 `configureTypeF()`
- **`updateBorder()`**：添加 Type F 分支（在 type-e 分支后，else 前）：
  ```javascript
  } else if (currentStyle === 'type-f') {
    const frameWrapper = document.getElementById('frameWrapper');
    const borderContent = document.getElementById('borderContent');
    preview.init({ img: userImage, frameWrapper, photoFooter, borderContent });
    if (!typeFCachedSize) {
      typeFCachedSize = preview.calcSize({ naturalWidth: userImage.naturalWidth, naturalHeight: userImage.naturalHeight });
    }
    const { squareSize: fSize, canvasHeight: fH } = typeFCachedSize;
    preview.updateFrameWrapper(fSize, fH);
    preview.updatePreview(fSize, fH, { naturalWidth: userImage.naturalWidth, naturalHeight: userImage.naturalHeight });
    // 窗口缩小时等比缩放
    const previewArea = frameWrapper?.parentElement;
    if (previewArea) {
      const availW = previewArea.clientWidth * 0.96;
      const availH = previewArea.clientHeight * 0.96;
      const needScale = Math.min(availW / fSize, availH / fH, 1);
      frameWrapper.style.transformOrigin = 'top center';
      frameWrapper.style.transform = needScale < 1 ? `scale(${needScale})` : 'none';
    }
    updateBorderContent();
  }
  ```
- **`hideEditor()`**：在现有 reset 逻辑中添加 Type F 分支（调用 `typeFPreview.reset()`）

### 9. `src/renderer/js/exporter.js`
- 添加 `import { typeFExport } from './styles/type-f-export.js'`
- 在 `exportStyles` 中注册 `'type-f': typeFExport`

### 10. 所有 preview 模块的 `updateFrameWrapper()` 和 `reset()`
- 在类名清理列表中添加 `'type-f'`（确保 `classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f')`）
- 涉及文件：`type-a-preview.js`、`type-b-preview.js`、`type-c-preview.js`、`type-d-preview.js`、`type-e-preview.js`

---

## NAS 适配注意事项

1. **type-f-preview.js**: 已使用标准浏览器 API，无需额外适配
2. **type-f-export.js**: 使用 opentype.js（已本地化），无需修改
3. **type-f-editor-panel.js**: 纯 DOM 操作，无需修改
4. **app.js**: 不引入原始项目的 `window.electronAPI`、`file://` 协议、`location.reload()` 等 Electron 代码
5. **hideEditor**: 原始项目使用 `location.reload()`，NAS 版本保持现有的状态重置方式，但需确保 Type F 的 reset 被调用
6. **version**: 原始项目版本号为 v1.0.3，NAS 版本同步为 v1.03（关于弹框显示）

---

## 实施顺序

1. 复制 5 个新文件（css、js、图片）
2. 修改 styles/index.js 注册 Type F
3. 修改 index.html 添加 Type F 卡片、CSS 和版本号
4. 修改 app.js 添加 Type F 逻辑（import、变量、各函数分支）
5. 修改 exporter.js 注册 Type F 导出
6. 修改所有 preview 模块的类名清理列表（添加 type-f）
7. 本地测试验证
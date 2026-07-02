# Implementation Plan

## [Overview]

在 `app.js` 中添加一个常量开关，控制导出文件的命名规则。默认使用当前规则（`{图片名}-OneFrame.jpg`），切换后使用预览图命名规则（`{图片名}-TypeA-sample.jpg`）。通过修改代码中的常量值切换，不暴露在 UI 界面。

---

## [Types]

无类型变更。

---

## [Files]

**新建文件：`src/renderer/js/config.js`**

独立配置文件，方便切换命名模式：

```javascript
/**
 * OneFrame 配置文件
 * 修改此文件中的常量值即可切换功能，无需修改其他代码。
 */

/**
 * 导出命名模式：
 * 0 = 默认模式：{图片名}-OneFrame.jpg
 * 1 = 预览图模式：{图片名}-TypeA-sample.jpg
 */
export const EXPORT_NAMING_MODE = 0;
```

**修改文件：`src/renderer/js/app.js`**

1. 导入配置：
```javascript
import { EXPORT_NAMING_MODE } from './config.js';
```

2. 修改 `exportImageHandler()` 中的文件名生成逻辑：
```javascript
const styleTypeName = styleIdToTypeName(currentStyle || 'type-a');

// Electron 环境：
exportFilename = EXPORT_NAMING_MODE === 1
  ? `${nameWithoutExt}-${styleTypeName}-sample.jpg`
  : `${nameWithoutExt}-OneFrame.jpg`;

// 浏览器环境：
const baseName = currentFile?.name.replace(/\.[^.]+$/, '') || 'output';
exportFilename = EXPORT_NAMING_MODE === 1
  ? `${baseName}-${styleTypeName}-sample.jpg`
  : `${baseName}-OneFrame.jpg`;
```

3. 内联 `styleIdToTypeName` 辅助函数（因为 `thumbnail-selector.js` 中的版本未导出）：
```javascript
function styleIdToTypeName(styleId) {
  const match = styleId.match(/^type-(.)(.*)$/);
  if (!match) return styleId.charAt(0).toUpperCase() + styleId.slice(1);
  return 'Type' + match[1].toUpperCase() + match[2];
}
```

`currentStyle` 在每次点击样式卡片时自动更新，切换样式后导出的 Type 部分会自动刷新。

---

## [Functions]

### 新增（`src/renderer/js/config.js`）

- `EXPORT_NAMING_MODE` — 命名模式常量（0=默认，1=预览图）

### 新增（`src/renderer/js/app.js`）

- `styleIdToTypeName(styleId)` — 内联辅助函数，将 `type-a` 转为 `TypeA`

### 修改（`src/renderer/js/app.js`）

- `exportImageHandler()` — 文件名生成逻辑根据 `EXPORT_NAMING_MODE` 常量选择命名规则

---

## [Classes]

无类变更。

---

## [Dependencies]

无新增依赖。

---

## [Testing]

1. `EXPORT_NAMING_MODE = 0` 时导出文件名应为 `{图片名}-OneFrame.jpg`
2. `EXPORT_NAMING_MODE = 1` 时导出文件名应为 `{图片名}-TypeA-sample.jpg`
3. 切换样式（如 type-b）后导出，Type 部分自动更新为 TypeB

---

## [Implementation Order]

1. 新建 `src/renderer/js/config.js` — 导出命名模式配置
2. 修改 `src/renderer/js/app.js` — 导入配置 + 内联转换函数 + 修改命名逻辑

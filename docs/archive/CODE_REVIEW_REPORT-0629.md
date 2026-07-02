# OneFrame NAS 代码审查报告

**日期**：2026-06-29  
**版本**：v1.09

---

## 一、逻辑错误（需要修复）

### 1.1 app.js — Electron 死代码

**位置**：`src/renderer/js/app.js` 多处

原始项目 v1.09 同步后遗留了大量 Electron 专用代码，在浏览器环境下永远不会执行：

| 函数/代码段 | 行号 | 问题 |
|------------|------|------|
| `loadImageInElectron()` | 191-234 | 整个函数在 NAS 版无用（依赖 `window.electronAPI`） |
| `currentImagePath` 变量 | 16 | 仅 Electron 使用，浏览器模式始终 null |
| `checkImageOrientation` 中的 `file://` 分支 | 36 | 浏览器中 `file://` 协议不可用 |
| `btnReselect` 的 Electron 分支 | 694-697 | `window.electronAPI.selectImage()` 不存在 |
| `styleCards` 点击的 Electron 分支 | 269-275 | `window.electronAPI.selectImage()` 不存在 |
| `exportImageHandler` 的 Electron 分支 | 817-832 | `window.electronAPI.saveBlob()` 不存在 |
| `initLogoGrid` 的 Electron 分支 | 113-117 | `window.electronAPI.getLogos()` 不存在 |

**建议**：删除所有 `if (window.electronAPI)` 分支，简化代码逻辑。

### 1.2 index.css — 缺少 Type D 和 Type E 的 @import

**位置**：`src/renderer/index.css` 第 1-5 行

`index.css` 只导入了 type-A/B/C，缺少 type-D 和 type-E 的 `@import`。D-L 的样式通过 `index.html` 的 `<link>` 标签加载，但 type-D 和 type-E 的 CSS 仅通过 `index.html` 引入，而 `index.css` 中的 `@import url('css/type-A.css')` 等与 `index.html` 中的 `<link rel="stylesheet" href="css/type-A.css">` 存在重复加载。

**建议**：统一使用一种方式加载 CSS（仅 `index.html` 的 `<link>` 或仅 `index.css` 的 `@import`），删除重复。

### 1.3 updateBorder — 重复的缩放逻辑

**位置**：`src/renderer/js/app.js` 的 `updateBorder()` 函数（约 400-600 行）

Type F/G/H/I/J/K/L 六种样式使用完全相同的"计算缓存尺寸→计算显示尺寸→缩放"逻辑，代码重复 6 次：

```javascript
// 同一模式重复 6 次，仅变量名不同
if (!typeXxxCachedSize) { typeXxxCachedSize = preview.calcSize({...}); }
const { squareSize, canvasHeight } = typeXxxCachedSize;
const availW = ...; const availH = ...;
const displayScale = Math.min(availW/..., availH/..., 1);
preview.updateFrameWrapper(displayW, displayH);
preview.updatePreview(displayW, displayH, {...});
```

**建议**：提取为通用函数 `updateScaledPreview(preview, cachedSizeKey, img)`。

### 1.4 getDisplaySettings — textColor 默认值不一致

**位置**：`src/renderer/js/app.js`

- `getDisplaySettings()` 第 710 行：`textColor: '#000000'`
- `getEditSettings()` 第 740 行：`textColor: '#000000'`
- 但 Type H/I/J/K 的编辑面板默认设置为白色 `#ffffff`

如果用户不手动切换颜色，Type H/I/J/K 的预览和导出可能使用错误的默认颜色。

**建议**：确认默认值统一为 `#ffffff`（或根据当前样式动态设置）。

---

## 二、冗余代码

### 2.1 type-*-preview.js — removeClassList 冗余

**位置**：所有 `type-*-preview.js` 的 `updateFrameWrapper()` 函数

每个样式模块在切换时都移除所有 12 个样式类名：

```javascript
state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j');
```

**建议**：在 `reset()` 或样式切换前统一清理一次，各模块只需 `classList.add('type-x')`。

### 2.2 logo-utils.js 和 exif.js — 重复的 getMakeName

**位置**：`logo-utils.js` 第 64-73 行，`exif.js` 第 75-98 行

两个文件各自实现了 `getMakeName()` 函数，且映射规则不同：
- `logo-utils.js`：包含 `OnePlus`, `XIAOMI`, `HUAWEI`
- `exif.js`：不包含这三个

**建议**：统一使用 `logo-utils.js` 的版本，`exif.js` 中引用它。

### 2.5 index.html — 缺少 type-A.css 和 type-B.css 的 <link>

**位置**：`src/renderer/index.html` 第 8-17 行

`index.html` 的 `<link>` 标签从 `type-C.css` 开始，缺少 `type-A.css` 和 `type-B.css`。这两个通过 `index.css` 的 `@import` 加载，但与其他样式加载方式不一致。

---

## 三、问题汇总

| 优先级 | 类型 | 问题 | 文件 | 状态 |
|--------|------|------|------|------|
| 🔴 高 | 逻辑错误 | Electron 死代码（7 处） | app.js | 待修复 |
| 🔴 高 | 逻辑错误 | textColor 默认值不一致 | app.js | 待修复 |
| 🟡 中 | 逻辑错误 | CSS 重复加载（index.css @import + index.html link） | index.css, index.html | 待修复 |
| 🟡 中 | 逻辑错误 | 缺少 type-A/B 的 link 标签 | index.html | 待修复 |
| 🟡 中 | 冗余 | getMakeName 在两个文件中重复实现 | logo-utils.js, exif.js | 待修复 |
| 🟡 中 | 冗余 | updateBorder 缩放逻辑重复 6 次 | app.js | 待修复 |

### 设计决策（不修改）

以下项目经确认为有意的设计决策，不纳入修改范围：
- **editor-panel 12 个独立文件**：每个样式独立维护编辑面板配置，便于单独修改
- **export 模块字体加载/绘制重复**：每个导出模块独立加载字体，保证模块自包含
- **preview removeClassList 冗余**：每个预览模块自行清理类名，避免模块间耦合

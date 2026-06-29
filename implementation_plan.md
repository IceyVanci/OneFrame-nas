# Implementation Plan: 同步 v1.10 — 编辑器动态背景色

## [Overview]

将原始项目 v1.1.0 的"编辑器动态背景色"功能同步到 NAS 版。该功能在编辑器预览区根据图片主色调自动生成深色背景，替代固定背景色 `#16213e`。

仅修改 `src/renderer/js/app.js` 一个文件，新增 `applyDynamicBackground(img)` 函数并在 3 处调用。

## [Types]

无新增数据结构。

## [Files]

### 修改文件（1 个）

| 文件路径 | 变更内容 |
|---------|---------|
| `src/renderer/js/app.js` | 新增 `applyDynamicBackground` 函数 + 3 处调用 |

### 新建文件

| 文件路径 | 说明 |
|---------|------|
| `docs/V1.10-NAS_CHANGES.md` | v1.10 变更记录 |

### 更新文件

| 文件路径 | 变更内容 |
|---------|---------|
| `README.md` | 版本号 v1.10 |
| `CHANGELOG.md` | 添加 v1.10 条目 |

## [Functions]

### 新增函数

| 函数名 | 文件 | 签名 | 说明 |
|--------|------|------|------|
| `applyDynamicBackground` | `app.js` | `function applyDynamicBackground(img)` | 将图片缩放到 10×10 canvas，计算平均 RGB，乘以 0.4 压暗系数，设置为 `.preview-area` 的背景色 |

### 修改函数

无。只在现有函数中添加调用点。

### 调用点（3 处）

| 位置 | 当前行号 | 说明 |
|------|---------|------|
| `showEditor()` 末尾 | 约 340 行 | `if (userImage.complete)` 之后 |
| `loadImageInElectron()` 图片 onload | 约 267 行 | Electron 环境图片加载完成 |
| `updateBorder()` 中 `userImage.addEventListener('load')` | 约 771 行 | 浏览器环境图片加载完成 |

**注意：** 当前 NAS 版 app.js 仍有 `loadImageInElectron` 函数（Electron 死代码），但有 `if (window.electronAPI)` 保护。Electron 调用点在浏览器中不会触发，可以安全添加（与原始项目保持一致），或选择省略。

## [Classes]

无类定义变更。

## [Dependencies]

无新增依赖。

## [Testing]

- 导入暖色调照片 → 编辑器背景应为深橙/棕色
- 导入冷色调照片 → 深蓝色背景
- 导入绿色植物照片 → 深绿色背景
- 导出图片不受背景色影响（背景色仅用于编辑器 UI）

## [Implementation Order]

1. 在 `app.js` 中添加 `applyDynamicBackground` 函数定义（位于 `isLogoLight` 之后，`DOMContentLoaded` 之前）
2. 在 `showEditor()` 的 `if (userImage.complete) updateBorder();` 之前添加 `applyDynamicBackground(userImage);`
3. 在 `userImage.addEventListener('load', updateBorder);` 之后添加 `userImage.addEventListener('load', () => applyDynamicBackground(userImage));`
4. 在 `loadImageInElectron` 的 onload 回调中添加 `applyDynamicBackground(userImage);`
5. 更新文档（V1.10-NAS_CHANGES.md、CHANGELOG.md、README.md）
6. Docker 重建并测试
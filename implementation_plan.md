# Implementation Plan

[Overview]
同步原始项目 v1.05 的 Type F 纵向图片自适应功能到 NAS 移植版本。当导入纵向图片（高度 > 宽度）时，Type F 样式的白色留白区域减少一半（5%→2.5%），照片区域增大（80%→90%），文字区域相应缩小（15%→7.5%）。

原始项目 V1.05_CHANGES.md 指出需要修改 `type-f-preview.js` 和 `type-f-export.js` 两个文件。经对比分析，**导出模块已同步**（当前 NAS 版的 `type-f-export.js` 已包含 `isPortrait` 参数和纵向比例逻辑），只需修改**预览模块**和 **app.js** 中的 Type F 分支。

[Types]
无新增类型。`calcSize()` 返回值结构变更：移除 `margin` 字段（Type F 从未使用），新增 `isPortrait` 布尔字段。

[Files]
修改 2 个文件，无需新建或删除文件。

- **`src/renderer/js/styles/type-f-preview.js`** — 修改 `calcSize()` 和 `updatePreview()` 两个函数，添加纵向图片自适应逻辑
- **`src/renderer/js/app.js`** — 修改 `updateBorder()` 函数中 Type F 分支的画布高度计算，使用纵向自适应比例

[Functions]
修改 3 个函数，无新增或删除。

- **`calcSize()`**（`src/renderer/js/styles/type-f-preview.js`，第 40 行）— 当前使用固定 `0.8` 计算画布高度。修改为：检测 `isPortrait = naturalHeight > naturalWidth`，纵向图片使用 `heightRatio = 0.9`，横向使用 `0.8`。返回值从 `{ squareSize, margin, canvasHeight }` 改为 `{ squareSize, canvasHeight, isPortrait }`。

- **`updatePreview()`**（`src/renderer/js/styles/type-f-preview.js`，第 85 行）— 当前重置图片样式后让 CSS 控制布局（默认 top:5%, height:80%）。修改为：纵向图片时通过内联样式覆盖 CSS 默认值（`top: 2.5%`, `height: 90%`），同时设置 `borderContent.style.height = '7.5%'`。横向图片保持 CSS 默认值不变。

- **`updateBorder()` Type F 分支**（`src/renderer/js/app.js`，第 350-377 行）— 当前 Type F 分支硬编码 `canvasH = Math.round(userImage.naturalHeight / 0.8)`。修改为：先检测纵向图片，使用 `heightRatio = isPortrait ? 0.9 : 0.8` 计算 `canvasH`。确保 `preview.updatePreview()` 调用时传递正确的 `imgDimensions`（当前已传递，无需额外修改）。

[Classes]
无修改。

[Dependencies]
无变更。

[Testing]
无自动化测试。验证方式：
1. 横向图片导入 Type F：布局不变（顶部 5%，照片 80%，底部 15%）
2. 纵向图片导入 Type F：顶部白色区域明显更窄（2.5%），照片区域更大（90%），底部文字区更窄（7.5%）
3. 窗口缩放后纵向图片图框比例保持正确
4. 导出纵向图片结果与预览一致
5. 其他样式不受影响

[Implementation Order]
1. **修改 `type-f-preview.js` 的 `calcSize()`** — 添加纵向检测和自适应高度比例
2. **修改 `type-f-preview.js` 的 `updatePreview()`** — 添加纵向图片 CSS 覆盖
3. **修改 `app.js` 的 Type F 分支** — 更新画布高度计算使用自适应比例
4. **创建变更文档** — `docs/V1.05-NAS_CHANGES.md`
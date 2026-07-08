# 预览缩放文字大小异常分析报告

**日期**：2026-07-06  
**问题**：移动端预览区边框文字在缩放后大小不正常  
**状态**：分析完成，待修复

---

## 一、问题概述

移动端设备横向分辨率为 **1080px**，`preview-area` 的可用宽度约为 `1080 × 0.96 ≈ 1036px`。各样式预览模块的 `frameWrapper` 在 PC 端受 `max-width: 900px` 约束（CSS 定义），但在移动端 1080px 视口下，`width: 100%` 导致 `frameWrapper` 实际宽度为 ~1036px，**超过了 PC 端的 900px 上限**。

由于文字大小按画布宽度等比缩放（如 `14 * squareSize / 900`），当 `squareSize` 从 PC 端的 900px 增大到移动端的 1036px 时，文字从 14px 增大到 **16px**（增大 14%），导致移动端文字比例偏大。

**核心问题**：移动端画布宽度没有受 `max-width: 900px` 约束，超过了 PC 端设计基准。

---

## 二、移动端识别方式

项目通过 **UA 检测**识别移动端设备：

```javascript
// src/renderer/js/mobile.js
const UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
export const isMobile = detectMobile();

export function initMobileLayout() {
  document.documentElement.classList.add('is-mobile');
  // ...
}
```

- `app.js` 中 `if (isMobile) initMobileLayout()` 仅在移动端调用
- `is-mobile` class 注入到 `<html>` 元素上
- 各模块可通过 `document.documentElement.classList.contains('is-mobile')` 检测

---

## 三、根因分析

### CSS 约束关系

```css
/* type-A.css 第 8-18 行 */
.frame-wrapper.type-a,
.frame-wrapper:not(.type-b):not(.type-e) {
  max-width: 900px;   /* PC 端生效：限制画布不超过 900px */
  width: 100%;         /* 移动端生效：占满可用宽度 ~1036px */
  ...
}
```

| 场景 | 视口宽度 | 可用宽度 | frameWrapper 宽度 | fontSize（14*squareSize/900） |
|------|---------|---------|------------------|---------------------------|
| PC 端 | 1920px | ~1720px | **900px**（max-width 生效） | **14px** |
| 移动端 | 1080px | ~1036px | **1036px**（width:100% 生效） | **16px** |

### 问题本质

- PC 端：`max-width: 900px` 限制了画布上限 → 文字大小稳定在 14px
- 移动端：`width: 100%` 占满 1036px → 画布超过 900px 基准 → 文字按比例放大到 16px
- **不是文字缩放公式的问题，而是画布尺寸约束缺失的问题**

---

## 四、逐样式缩放规则分析（待完成）

### ⚠️ 重要：每个样式使用了不同的缩放规则，需要逐个分析

不同的样式可能在原始模式下使用了不同的缩放规则，每个样式要具体分析。

### frameWrapper 宽度来源分类

| 分类 | 样式 | frameWrapper 宽度来源 | CSS max-width 是否生效 |
|------|------|---------------------|---------------------|
| CSS 控制 | Type A, B, C, D, E | CSS（不设 JS width） | ✅ 生效 |
| JS 内联设置 | Type F, G, H, I, J, K, L, M | **JS 设置 `frameWrapper.style.width = squareSize + 'px'`** | ❌ 被 JS 内联样式覆盖 |

**关键发现**：Type F~M 模块在 `updateFrameWrapper()` 中通过 JS 直接设置 `frameWrapper.style.width`，内联样式优先级高于 CSS，因此纯 CSS 的 `max-width` 约束对这些模块**不起作用**。

### 逐样式分析清单

| # | 模块 | frameWrapper 宽度来源 | 字体缩放方式 | 分析状态 |
|---|------|---------------------|------------|---------|
| 1 | Type A | CSS（max-width: 900px） | CSS 固定 12px/24px | ⏳ 待分析 |
| 2 | Type B | CSS | 硬编码 12px | ⏳ 待分析 |
| 3 | Type C | CSS | `12 * fontScale` | ⏳ 待分析 |
| 4 | Type D | CSS | `12 * fontScale` | ⏳ 待分析 |
| 5 | Type E | CSS | `24 * squareSize / 480` | ⏳ 待分析 |
| 6 | Type F | **JS 内联** | `14 * squareSize / 900` | ⏳ 待分析 |
| 7 | Type G | **JS 内联** | `14 * squareSize / 900` | ⏳ 待分析 |
| 8 | Type H | **JS 内联** | `14 * squareSize / 900` | ⏳ 待分析 |
| 9 | Type I | **JS 内联** | `14 * squareSize / 900`（两处） | ⏳ 待分析 |
| 10 | Type J | **JS 内联** | `14 * squareSize / 900`（两处） | ⏳ 待分析 |
| 11 | Type K | **JS 内联** | `14 * squareSize / 900`（两处） | ⏳ 待分析 |
| 12 | Type L | **JS 内联** | `14 * squareSize / 900` | ⏳ 待分析 |
| 13 | Type M | **JS 内联** | `14 * photoAreaWidth / 900`（两处） | ⏳ 待分析 |

---

## 五、修复方案（待完善）

### 思路：限制移动端画布宽度不超过 900px

- **CSS 控制的模块**（A~E）：通过 CSS `max-width` 约束
- **JS 内联的模块**（F~M）：需要在 JS 的 `updateFrameWrapper()` 中限制 `squareSize`

### 方案 A：CSS 媒体查询约束（仅适用于 A~E）

```css
/* 移动端：限制画布宽度不超过 900px，与 PC 端一致 */
@media (max-width: 1200px) {
  .frame-wrapper.type-a,
  .frame-wrapper:not(.type-b):not(.type-e) {
    max-width: min(90vw, 900px);
  }
}
```

### 方案 B：JS 约束（适用于 F~M）

在各模块的 `updateFrameWrapper()` 中添加限制：
```javascript
// 限制移动端画布不超过 PC 端基准
if (document.documentElement.classList.contains('is-mobile')) {
  squareSize = Math.min(squareSize, 900);
}
```

### ⚠️ 两种方案的 PC 端影响

- 方案 A：`@media (max-width: 1200px)` 不会影响常规 PC 端显示器（1920px+）
- 方案 B：`classList.contains('is-mobile')` 在 PC 端返回 false，不执行

---

## 六、修改文件汇总（待完善）

| 文件 | 修改类型 | 修改内容 | PC 端影响 |
|------|---------|---------|----------|
| `src/renderer/css/type-A.css` | 新增 CSS 规则 | 添加 `@media (max-width: 1200px)` 约束 | ✅ 零 |
| Type F~M 各 preview.js | 修改 JS | `updateFrameWrapper()` 中限制 squareSize | ✅ 零（is-mobile 保护） |

---

## 七、安全保证

1. CSS 方案：`@media (max-width: 1200px)` 仅在视口 ≤1200px 时生效
2. JS 方案：`classList.contains('is-mobile')` 在 PC 端返回 false
3. 不影响导出功能（导出模块使用完整分辨率画布）

---

## 八、已废弃的分析

~~原始分析认为移动端画布过小（~366px）导致文字按比例缩小到 8px 下限。~~

**实际上移动端设备横向分辨率为 1080px，画布宽度约 1036px，超过了 PC 端 900px 基准，导致文字偏大而非偏小。原始分析基于错误的视口宽度假设（366px）。**
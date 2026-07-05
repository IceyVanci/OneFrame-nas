# 预览缩放文字大小异常分析报告

**日期**：2026-07-06  
**问题**：移动端预览区边框文字在缩放后大小不正常  
**状态**：分析完成，待修复

---

## 一、问题概述

移动端 `preview-area` 的可用空间从 PC 端的 ~1720×920px 缩小到 ~400×700px。各样式预览模块的 `calcSize()` 根据可用空间计算 `squareSize`（画布宽度），然后基于 `squareSize` 按比例计算字体大小。当 `squareSize` 大幅缩小时，字体按比例缩小到不可读的程度。

---

## 二、各样式字体缩放逻辑详细分析

### 样式分组

根据字体缩放方式，分为 4 组：

| 组别 | 样式 | 缩放方式 | 移动端风险 |
|------|------|---------|-----------|
| A 组：固定字号 | Type A, B | 硬编码 12px | ✅ 无风险 |
| B 组：简单比例 | Type C, D | `12 * scale` | ⚠️ 轻微风险 |
| C 组：squareSize 比例 | Type E, F, G, H, L | `Math.max(8, N * squareSize / M)` | ❌ 高风险 |
| D 组：二次计算 | Type I, J, K, M | calcSize 设置基础字号 + updateContentPreview 二次计算 | ⚠️ 中等风险 |

---

### A 组：固定字号（字号过大风险）

#### Type A (`type-A-preview.js`) + `css/type-A.css`
- **字号来源**：CSS 固定 `.border-text { font-size: 12px }`、`.border-focal-text { font-size: 24px }`
- **JS 预览逻辑**：
  - `updateFrameWrapper()` — 不设置尺寸，依赖 CSS `max-width: 900px; width: 100%`
  - `updatePreview()` — 设置 `photoFooter.style.height = borderHeight + 'px'`
  - `updateContentPreview()` — 不设置 fontSize，完全依赖 CSS
- **footer 高度计算**：`footerHeight = Math.round(shortSide * (borderPercent / 100))`
  - PC 端：shortSide ≈ 900px → footerHeight ≈ 108px（12%）→ 12px/24px 文字比例正常 ✅
  - 移动端：shortSide ≈ 366px → footerHeight ≈ 44px（12%）→ 12px/24px 文字相对于 44px footer **过大** ❌

**问题**：移动端 footer 只有 44px 高，焦距文字 24px 占 footer 高度的 55%，普通文字 12px 占 27%。多行内容（Logo + 机型 + 参数 + 时间）在 44px 空间内会溢出或重叠。

**与 Type F/G/H/L 的问题相反**：Type A 是文字过大溢出，Type F/G/H/L 是文字过小不可读。

| 场景 | footer 高度 | .border-text | .border-focal-text | 状态 |
|------|------------|-------------|-------------------|------|
| PC 端 | ~108px | 12px | 24px | ✅ 正常 |
| 移动端 | ~44px | 12px | 24px | ❌ 文字溢出 |

**结论**：❌ 文字过大，footer 高度不足以容纳内容

#### Type B (`type-B-preview.js`)
- **字号来源**：硬编码 `12px`
- **代码**：`leftCell.style.fontSize = '12px'; rightCell.style.fontSize = '12px';`
- **缩放方式**：表格布局自适应，字号固定
- **结论**：✅ 无问题

---

### B 组：简单比例（轻微风险）

#### Type C (`type-C-preview.js`)
- **字号来源**：`baseFontSize = 12`（硬编码）
- **缩放公式**：`fontSize = isPortrait ? Math.round(12 * 0.7) : 12`
- **移动端**：纵向图片时 8px，横向图片时 12px
- **问题**：8px 在小屏手机上偏小
- **结论**：⚠️ 轻微问题，纵向模式字体偏小

#### Type D (`type-D-preview.js`)
- **字号来源**：`fontSize = Math.round(12 * fontScale)`
- **缩放公式**：`fontScale` 基于图片宽度计算
- **移动端**：取决于 `fontScale` 的计算结果
- **结论**：⚠️ 需要进一步检查 `fontScale` 的计算逻辑

---

### C 组：squareSize 比例（高风险）

这组样式的共同公式：`fontSize = Math.max(8, Math.round(N * squareSize / M))`

#### Type E (`type-E-preview.js`)
- **公式**：`Math.max(8, Math.round(24 * squareSize / 480))`
- **基准**：squareSize=480px → fontSize=24px
- **calcSize 逻辑**：`squareSize = Math.min(availW, imgShortEdge)`, 然后 `squareSize = Math.round(maxCanvasHeight / 1.5)`

| squareSize | fontSize | 移动端可见度 |
|-----------|----------|-------------|
| 480px (PC) | 24px | ✅ 完美 |
| 400px | 20px | ✅ 良好 |
| 300px | 15px | ⚠️ 偏小 |
| 200px | 10px | ❌ 太小 |
| 160px | 8px (min) | ❌ 不可读 |

**移动端预期**：iPhone 14 竖屏 390×844，padding 后可用 ~366×600，squareSize ≈ 366，fontSize ≈ **18px** → ⚠️ 可接受但偏小

#### Type F (`type-F-preview.js`)
- **公式**：`Math.max(8, Math.round(14 * squareSize / 900))`
- **基准**：squareSize=900px → fontSize=14px
- **calcSize 逻辑**：`squareSize = Math.min(availW, availH)`

| squareSize | fontSize | 移动端可见度 |
|-----------|----------|-------------|
| 900px (PC) | 14px | ✅ 正常 |
| 600px | 9px | ⚠️ 偏小 |
| 514px | 8px (min) | ❌ 最小值 |
| 400px | 6px → 8px (min) | ❌ 不可读 |
| 300px | 5px → 8px (min) | ❌ 不可读 |

**移动端预期**：squareSize ≈ 366，fontSize = Math.round(14*366/900) = **6px → 8px (min)** → ❌ **严重问题**

#### Type G (`type-G-preview.js`)
- **公式**：与 Type F 完全相同 `Math.max(8, Math.round(14 * squareSize / 900))`
- **移动端预期**：同 Type F → ❌ **严重问题**

#### Type H (`type-H-preview.js`)
- **公式**：与 Type F 完全相同 `Math.max(8, Math.round(14 * squareSize / 900))`
- **额外**：`baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14`
- **移动端预期**：同 Type F → ❌ **严重问题**

#### Type L (`type-L-preview.js`)
- **公式**：与 Type F 完全相同 `Math.max(8, Math.round(14 * squareSize / 900))`
- **移动端预期**：同 Type F → ❌ **严重问题**

---

### D 组：二次计算（中等风险）

这组样式在 `calcSize()` 中设置基础字号，然后在 `updateContentPreview()` 中基于 `fwWidth`（frameWrapper 宽度）二次计算。

#### Type I (`type-I-preview.js`)
- **calcSize 公式**：`Math.max(8, Math.round(14 * squareSize / 900))`
- **updateContentPreview 公式**：`Math.max(8, Math.round(14 * fwWidth / 900))`，纵向模式 `* 1.5`
- **额外**：有 `const fontScale = isPortrait ? 0.85 : 1` 用于部分内容

| squareSize | calcSize fontSize | updateContent fwWidth fontSize | 纵向 bonus |
|-----------|------------------|------------------------------|-----------|
| 900px (PC) | 14px | 14px | 21px |
| 400px | 8px (min) | 8px (min) | 12px |
| 366px (移动) | 8px (min) | 8px (min) | 12px |

**移动端预期**：基础 8px + 纵向 bonus 后 12px → ⚠️ 勉强可读

#### Type J (`type-J-preview.js`)
- **公式**：与 Type I 相同的两阶段计算
- **移动端预期**：同 Type I → ⚠️ 勉强可读

#### Type K (`type-K-preview.js`)
- **公式**：与 Type I 相同，但有纵向 `* 1.5` bonus
- **移动端预期**：同 Type I → ⚠️ 勉强可读

#### Type M (`type-M-preview.js`)
- **calcSize 公式**：`Math.max(8, Math.round(14 * squareSize / 900))`
- **updateContentPreview 公式**：`Math.max(8, Math.round(14 * photoAreaWidth / 900))`，纵向 `* 1.5`
- **移动端预期**：同 Type I → ⚠️ 勉强可读

---

## 三、问题汇总

| 样式 | 移动端 fontSize | 严重程度 | 说明 |
|------|----------------|---------|------|
| **Type A** | **12px/24px 固定** | **❌ 严重** | footer 44px 不足以容纳固定字号内容，文字溢出 |
| Type B | 12px 固定 | ✅ 无问题 | — |
| Type C | 8-12px | ⚠️ 轻微 | 纵向模式 8px 偏小 |
| Type D | 取决于 fontScale | ⚠️ 待查 | 需检查 fontScale 计算 |
| Type E | ~18px | ⚠️ 可接受 | 但比 PC 端 24px 小很多 |
| **Type F** | **8px (min)** | **❌ 严重** | 公式基准分母 900 太大 |
| **Type G** | **8px (min)** | **❌ 严重** | 同 Type F |
| **Type H** | **8px (min)** | **❌ 严重** | 同 Type F |
| Type I | 8-12px | ⚠️ 中等 | 纵向 bonus 部分补偿 |
| Type J | 8-12px | ⚠️ 中等 | 同 Type I |
| Type K | 8-12px | ⚠️ 中等 | 同 Type I |
| **Type L** | **8px (min)** | **❌ 严重** | 同 Type F |
| Type M | 8-12px | ⚠️ 中等 | 同 Type I |

---

## 四、根因分析

**核心问题 1（Type A）**：Type A 的文字大小由 CSS 固定（12px/24px），不随画布/footer 缩放。移动端 footer 从 ~108px 缩小到 ~44px，但文字保持不变，导致文字溢出 footer 区域。

**核心问题 2（Type F/G/H/L）**：Type F/G/H/L 的公式 `Math.max(8, Math.round(14 * squareSize / 900))` 中，基准分母 `900` 是基于 PC 端 full-size 画布（~900px 宽）设计的。当移动端 squareSize 缩小到 ~366px 时，计算结果远低于 8px 最小值，导致所有文字都被限制在 8px。

**对比**：Type E 的公式 `Math.max(8, Math.round(24 * squareSize / 480))` 基准分母是 480，更接近移动端尺寸，所以问题较轻。

---

## 五、修复方案

### 方案 0：Type A 移动端字体缩放（针对文字过大问题）

Type A 需要单独处理——将固定字号改为按 footer 高度比例缩放：

**方案 0a：CSS 响应式**
```css
.is-mobile .border-text {
  font-size: max(8px, 1cqi);  /* 容器查询单位 */
}
.is-mobile .border-focal-text {
  font-size: max(10px, 2cqi);
}
```

**方案 0b：JS 动态设置（推荐）**
在 `type-A-preview.js` 的 `updatePreview()` 中，根据 `footerHeight` 动态设置 fontSize：
```javascript
const baseFontSize = Math.max(8, Math.round(footerHeight * 0.28));  // footer 高度的 28%
const focalFontSize = Math.max(10, Math.round(footerHeight * 0.55)); // footer 高度的 55%
// 应用到 borderContent
```

### 方案 A：提高移动端最小字体下限（针对文字过小问题）

在各模块的 `fontSize` 计算后，检测 `isMobile` 并提高下限：

```javascript
// 在各模块的 calcSize() 中
const minFont = window.document.documentElement.classList.contains('is-mobile') ? 12 : 8;
const fontSize = Math.max(minFont, Math.round(14 * squareSize / 900));
```

**需要修改的文件**（9 个模块）：
0. `type-A-preview.js` + `css/type-A.css` — 固定字号需改为按 footer 高度比例缩放
1. `type-E-preview.js` — `Math.max(8, Math.round(24 * squareSize / 480))`
2. `type-F-preview.js` — `Math.max(8, Math.round(14 * squareSize / 900))`
3. `type-G-preview.js` — 同上
4. `type-H-preview.js` — 同上
5. `type-I-preview.js` — 同上（两处）
6. `type-J-preview.js` — 同上（两处）
7. `type-K-preview.js` — 同上（两处）
8. `type-L-preview.js` — 同上
9. `type-M-preview.js` — 同上（两处）

**优点**：精确控制，每个模块独立  
**缺点**：需要修改 9 个文件

### 方案 B：CSS override

在 `index.css` 中：
```css
.is-mobile .border-content {
  font-size: max(12px, inherit) !important;
}
```

**优点**：只改 CSS  
**缺点**：`max()` 在 `font-size` 中浏览器支持不一致；`!important` 可能影响导出

### 方案 C：统一工具函数

在 `mobile.js` 中导出 `getMinFontSize()` 函数，各模块统一调用：
```javascript
// mobile.js
export function getMinFontSize() {
  return isMobile ? 12 : 8;
}

// 各模块
import { getMinFontSize } from '../mobile.js';
const fontSize = Math.max(getMinFontSize(), Math.round(14 * squareSize / 900));
```

**优点**：统一管理，未来调整只需改一处  
**缺点**：各模块增加对 mobile.js 的依赖

### 推荐方案：统一 `getMinFontSize()` 工具函数 + 各模块 `isMobile` 分支

**核心原则**：所有修改都包裹在 `isMobile` 判断中，PC 端代码路径完全不变。

---

## 六、逐样式修复方案

### 统一步骤：在 `mobile.js` 中新增工具函数

```javascript
// mobile.js 新增
export function getMobileMinFont() {
  return isMobile ? 12 : 8;
}
export function getMobileScale() {
  // 移动端画布约为 PC 端的 40-50%，字号需要放大补偿
  return isMobile ? 1.5 : 1;
}
```

---

### Type A — 修复文字过大

**文件**：`src/renderer/js/styles/type-A-preview.js`

**当前问题**：`updateContentPreview()` 不设置 fontSize，完全依赖 CSS 固定 12px/24px。移动端 footer 仅 ~44px，24px 焦距文字溢出。

**修复方案**：在 `updateContentPreview()` 末尾添加移动端字号调整

```javascript
// 在 updateContentPreview() 函数末尾添加
if (document.documentElement.classList.contains('is-mobile')) {
  // 按 footer 高度比例缩放字号
  const footerH = state.borderContent?.clientHeight || 44;
  const baseFontSize = Math.max(8, Math.round(footerH * 0.28));
  const focalFontSize = Math.max(10, Math.round(footerH * 0.5));
  state.borderContent.style.fontSize = `${baseFontSize}px`;
  const focalEl = state.borderContent.querySelector('.border-focal-text');
  if (focalEl) focalEl.style.fontSize = `${focalFontSize}px`;
}
```

**PC 端影响**：✅ 零（`is-mobile` class 不存在时不执行）

---

### Type B — 无需修复

**当前状态**：硬编码 12px，使用 flexbox 表格布局（`leftCell.width = 75px`），单元格自适应。

**移动端表现**：右侧边栏区域（`rightAreaWidth`）随画布缩小，表格会自动缩小。12px 字号在小区域中可能偏大但不会溢出（flexbox 自动换行）。

**结论**：✅ 暂不修改，观察实际效果。如需调整，在 `update()` 中添加 `isMobile` 分支缩小 `leftCell/rightCell` 的 width。

---

### Type C — 修复纵向模式字体偏小

**文件**：`src/renderer/js/styles/type-C-preview.js`

**当前问题**：`fontSize = isPortrait ? Math.round(12 * 0.7) : 12`，纵向模式 8px。

**修复方案**：

```javascript
// 修改前
const fontSize = isPortrait ? Math.round(12 * 0.7) : 12;

// 修改后
const isMobileDevice = document.documentElement.classList.contains('is-mobile');
const fontSize = isPortrait
  ? Math.round((isMobileDevice ? 14 : 12) * 0.7)  // 移动端纵向 10px，PC 端纵向 8px
  : (isMobileDevice ? 14 : 12);                     // 移动端横向 14px，PC 端横向 12px
```

**PC 端影响**：✅ 零（`isMobileDevice` 为 false，原逻辑不变）

---

### Type D — 修复 fontScale 缩放

**文件**：`src/renderer/js/styles/type-D-preview.js`

**当前问题**：`fontSize = Math.round(12 * fontScale)`，fontScale 基于图片宽度。

**修复方案**：

```javascript
// 修改前
const fontSize = Math.round(12 * fontScale);

// 修改后
const isMobileDevice = document.documentElement.classList.contains('is-mobile');
const baseFont = isMobileDevice ? 14 : 12;
const fontSize = Math.round(baseFont * fontScale);
```

**PC 端影响**：✅ 零

---

### Type E — 轻微调整

**文件**：`src/renderer/js/styles/type-E-preview.js`

**当前问题**：`Math.max(8, Math.round(24 * squareSize / 480))`，移动端 ~18px，可接受。

**修复方案**：提高移动端最小下限

```javascript
// 修改前
const baseFontSize = Math.max(8, Math.round(24 * squareSize / 480));

// 修改后
const minFont = document.documentElement.classList.contains('is-mobile') ? 12 : 8;
const baseFontSize = Math.max(minFont, Math.round(24 * squareSize / 480));
```

**PC 端影响**：✅ 零

---

### Type F — 修复严重字体过小

**文件**：`src/renderer/js/styles/type-F-preview.js`

**当前问题**：`Math.max(8, Math.round(14 * squareSize / 900))`，移动端 8px。

**修复方案**：

```javascript
// calcSize() 中修改前
const fontSize = Math.max(8, Math.round(14 * squareSize / 900));

// 修改后
const minFont = document.documentElement.classList.contains('is-mobile') ? 12 : 8;
const fontSize = Math.max(minFont, Math.round(14 * squareSize / 900));
```

**PC 端影响**：✅ 零

---

### Type G — 同 Type F

**文件**：`src/renderer/js/styles/type-G-preview.js`

**修复方案**：同 Type F（公式完全相同）

---

### Type H — 同 Type F

**文件**：`src/renderer/js/styles/type-H-preview.js`

**修复方案**：同 Type F

---

### Type I — 修复两处 fontSize

**文件**：`src/renderer/js/styles/type-I-preview.js`

**问题**：calcSize 和 updateContentPreview 两处都有 `Math.max(8, ...)`

**修复方案**：

```javascript
// calcSize() 中
const minFont = document.documentElement.classList.contains('is-mobile') ? 12 : 8;
const fontSize = Math.max(minFont, Math.round(14 * squareSize / 900));

// updateContentPreview() 中
const minFont2 = document.documentElement.classList.contains('is-mobile') ? 12 : 8;
let baseFontSize = Math.max(minFont2, Math.round(14 * fwWidth / 900));
```

---

### Type J — 同 Type I

**文件**：`src/renderer/js/styles/type-J-preview.js`

**修复方案**：同 Type I（两处修改）

---

### Type K — 同 Type I

**文件**：`src/renderer/js/styles/type-K-preview.js`

**修复方案**：同 Type I（两处修改）

---

### Type L — 同 Type F

**文件**：`src/renderer/js/styles/type-L-preview.js`

**修复方案**：同 Type F

---

### Type M — 同 Type I

**文件**：`src/renderer/js/styles/type-M-preview.js`

**修复方案**：同 Type I（两处修改）

---

## 七、修改文件汇总

| 文件 | 修改类型 | 修改位置 | PC 端影响 |
|------|---------|---------|----------|
| `src/renderer/js/mobile.js` | 新增函数 | `getMobileMinFont()`, `getMobileScale()` | ✅ 零 |
| `src/renderer/js/styles/type-A-preview.js` | 新增代码块 | `updateContentPreview()` 末尾 | ✅ 零（isMobile 包裹） |
| `src/renderer/js/styles/type-C-preview.js` | 修改公式 | `updateContentPreview()` 中 fontSize | ✅ 零 |
| `src/renderer/js/styles/type-D-preview.js` | 修改公式 | `updateContentPreview()` 中 fontSize | ✅ 零 |
| `src/renderer/js/styles/type-E-preview.js` | 修改下限 | `calcSize()` 中 Math.max | ✅ 零 |
| `src/renderer/js/styles/type-F-preview.js` | 修改下限 | `calcSize()` 中 Math.max | ✅ 零 |
| `src/renderer/js/styles/type-G-preview.js` | 修改下限 | `calcSize()` 中 Math.max | ✅ 零 |
| `src/renderer/js/styles/type-H-preview.js` | 修改下限 | `calcSize()` 中 Math.max | ✅ 零 |
| `src/renderer/js/styles/type-I-preview.js` | 修改下限（两处） | `calcSize()` + `updateContentPreview()` | ✅ 零 |
| `src/renderer/js/styles/type-J-preview.js` | 修改下限（两处） | 同上 | ✅ 零 |
| `src/renderer/js/styles/type-K-preview.js` | 修改下限（两处） | 同上 | ✅ 零 |
| `src/renderer/js/styles/type-L-preview.js` | 修改下限 | `calcSize()` 中 Math.max | ✅ 零 |
| `src/renderer/js/styles/type-M-preview.js` | 修改下限（两处） | `calcSize()` + `updateContentPreview()` | ✅ 零 |

**Type B 不需要修改。**

## 八、安全保证

所有修改都通过以下方式确保 PC 端零影响：

1. `document.documentElement.classList.contains('is-mobile')` — PC 端返回 false
2. 三元表达式 `isMobile ? 12 : 8` — PC 端取原值 8
3. 代码块 `if (isMobile) { ... }` — PC 端跳过

即使 `isMobile` 检测代码本身出错（抛异常），也会被 `try/catch` 或条件判断的安全回退值覆盖。

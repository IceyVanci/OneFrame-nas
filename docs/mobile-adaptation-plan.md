# Implementation Plan

[Overview]
为 OneFrame 编辑器页面添加移动端支持。通过 **JavaScript UA 检测 + CSS class 注入**（在 `<html>` 元素添加 `is-mobile` class）实现移动端布局切换。画布预览区通过限制 `img` 的 `max-height`/`max-width` 自然缩放适配（不使用 `transform: scale()`）。所有移动端样式通过 `.is-mobile .selector` 选择器隔离，**PC 端零影响**。

**安全隔离机制（三重保障）：**
1. **UA 检测层**：JS 检测移动设备 UA → 添加 `is-mobile` class → CSS `.is-mobile .selector` 生效
2. **JS 加载失败保护**：mobile.js 加载失败 → class 不添加 → 所有移动端样式不生效 → PC 端零影响
3. **Fallback 层**：`@media (max-width: 768px) and (pointer: coarse)` — 仅在触摸设备 + 窄视口时触发，PC 窄窗口不会触发（鼠标 = `pointer: fine`）

**为什么不用 `transform: scale()` 缩放画布：**
- `transform: scale()` 不改变布局空间，元素仍占原始大小，导致溢出
- 缩放后文字模糊（downscale 渲染精度损失）
- 与各样式预览模块的 `calcSize()`、`cachedSize` 机制冲突
- 正确做法：限制 `img` 的 `max-height`/`max-width`，让浏览器自然缩放

[Types]
无新增类型定义。

全局标志定义在 `mobile.js` 中：

```javascript
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
  document.documentElement.classList.add('is-mobile');
}
```

[Files]
修改文件及具体变更：

**1. 新建文件：`src/renderer/js/mobile.js`**

移动端检测和适配模块（约 80 行）：
- `detectMobile()` — UA 检测，返回 boolean
- `initMobileLayout()` — 注入 `is-mobile` class，监听 resize/orientationchange
- `initSwipeToClose(panel)` — 编辑面板向下滑动手势关闭
- `lockBodyScroll()` / `unlockBodyScroll()` — 编辑面板打开/关闭时锁定/解锁 body 滚动
- 导出 `isMobile` 标志供 app.js 判断

**2. 修改文件：`src/renderer/index.html`**

更新 viewport meta，禁止双指缩放（避免干扰编辑操作）：
```html
<!-- 当前 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- 改为 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**3. 修改文件：`src/renderer/js/app.js`**

- 顶部导入 `mobile.js`：`import { isMobile, initMobileLayout, initSwipeToClose, lockBodyScroll, unlockBodyScroll } from './mobile.js';`
- `DOMContentLoaded` 回调开头：`if (isMobile) initMobileLayout();`
- `showEditor()` 末尾：`if (isMobile) initSwipeToClose(editPanel);`
- 编辑面板 toggle 事件：添加 `lockBodyScroll()` / `unlockBodyScroll()`
- 无需修改 `updateBorder()` — 图片自然缩放，不需要额外 JS 计算

**4. 修改文件：`src/renderer/index.css`**

在文件末尾追加移动端样式块。所有选择器都带 `.is-mobile` 前缀或 `pointer: coarse` 条件：

```css
/* ============================================
   移动端样式（UA 检测触发）
   ============================================ */

/* --- 首页 --- */
.is-mobile .app-container {
  padding: 12px 8px;
}
.is-mobile .style-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.is-mobile .style-card .frame-container {
  max-height: 200px;
}

/* --- 编辑器：预览区 --- */
.is-mobile .preview-area {
  padding: 12px 12px 80px 12px;  /* 底部 80px 给按钮栏 */
  padding-right: 12px;           /* 移除 PC 端的 120px 右侧留白 */
}
.is-mobile .frame-wrapper img {
  max-width: 100%;
  max-height: calc(100dvh - 160px);  /* 减去顶部空间 + 底部按钮栏 */
  max-height: calc(100vh - 160px);   /* fallback */
  width: auto;
  height: auto;
  object-fit: contain;
}

/* --- 编辑器：底部操作栏 --- */
.is-mobile .float-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: auto;
  transform: none;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(17, 17, 17, 0.95);
  border-top: 1px solid #333;
  z-index: 10;
  height: 64px;
}
.is-mobile .float-btn {
  width: 56px;
  height: 56px;
  border-radius: 12px;
}
.is-mobile .float-btn i {
  font-size: 20px;
}
.is-mobile .float-btn span {
  font-size: 9px;
}

/* --- 编辑器：底部抽屉面板 --- */
.is-mobile .edit-panel {
  top: auto;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 70vh;
  height: 70dvh;
  transform: translateY(100%);
  border-left: none;
  border-top: 1px solid #222;
  border-radius: 16px 16px 0 0;
  z-index: 100;
}
.is-mobile .edit-panel.visible {
  transform: translateY(0);
}
.is-mobile .panel-header {
  padding: 12px 16px;
}
.is-mobile .panel-header::before {
  content: '';
  display: block;
  width: 36px;
  height: 4px;
  background: #444;
  border-radius: 2px;
  margin: 0 auto 8px;
}

/* --- 编辑面板内部控件触摸优化 --- */
.is-mobile .edit-section {
  padding: 12px 16px;
}
.is-mobile .params-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.is-mobile .logo-grid {
  gap: 6px;
}
.is-mobile .logo-grid-item {
  width: 48px;
  height: 48px;
}
.is-mobile .color-preset {
  min-width: 44px;
  min-height: 44px;
}
.is-mobile input[type="range"] {
  height: 44px;
}
.is-mobile .btn-primary {
  min-height: 48px;
}

/* --- 模态框适配 --- */
.is-mobile .modal {
  width: 90%;
  max-width: none;
  margin: 10vh auto;
}

/* ============================================
   Fallback：触摸设备 + 窄视口
   （pointer: coarse 确保 PC 窄窗口不触发）
   ============================================ */
@media (max-width: 768px) and (pointer: coarse) {
  .app-container { padding: 12px 8px; }
  .style-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .preview-area { padding: 12px 12px 80px 12px; padding-right: 12px; }
  .float-actions {
    position: fixed; bottom: 0; left: 0; right: 0; top: auto;
    transform: none; flex-direction: row; justify-content: space-around;
    gap: 8px; padding: 8px 12px;
    background: rgba(17,17,17,0.95); border-top: 1px solid #333;
    z-index: 10; height: 64px;
  }
  .float-btn { width: 56px; height: 56px; border-radius: 12px; }
  .edit-panel {
    top: auto; left: 0; right: 0; bottom: 0;
    width: 100%; height: 70vh; height: 70dvh;
    transform: translateY(100%); border-left: none;
    border-top: 1px solid #222; border-radius: 16px 16px 0 0;
  }
  .edit-panel.visible { transform: translateY(0); }
  .frame-wrapper img {
    max-width: 100%; max-height: calc(100dvh - 160px);
    max-height: calc(100vh - 160px); width: auto; height: auto;
  }
}
```

[Functions]
新增函数：

**`src/renderer/js/mobile.js`**

| 函数 | 签名 | 用途 |
|------|------|------|
| `detectMobile()` | `() => boolean` | UA 检测是否为移动设备 |
| `initMobileLayout()` | `() => void` | 注入 `is-mobile` class，监听 resize/orientationchange |
| `initSwipeToClose(panel)` | `(HTMLElement) => void` | 编辑面板向下滑动手势关闭（阈值 50px） |
| `lockBodyScroll()` | `() => void` | `document.body.style.overflow = 'hidden'` |
| `unlockBodyScroll()` | `() => void` | `document.body.style.overflow = ''` |
| `isMobile` | `const boolean` | 导出标志，供 app.js 判断 |

**修改的现有函数：`src/renderer/js/app.js`**

| 函数 | 修改内容 |
|------|---------|
| 顶部 imports | 添加 `import { isMobile, initMobileLayout, initSwipeToClose, lockBodyScroll, unlockBodyScroll } from './mobile.js'` |
| DOMContentLoaded 回调开头 | 添加 `if (isMobile) initMobileLayout();` |
| `showEditor()` | 末尾添加 `if (isMobile) initSwipeToClose(editPanel);` |
| 编辑面板 toggle | `btnEdit` 点击时添加 `lockBodyScroll()`，`btnClosePanel` 点击时添加 `unlockBodyScroll()` |
| `hideEditor()` | 添加 `unlockBodyScroll()` |

**不修改的函数（安全）：**
- `updateBorder()` — 不需要修改，图片自然缩放
- `updateBorderContent()` — 不需要修改
- `loadImageWithExif()` / `loadImageInElectron()` — 不需要修改
- `selectLogo()` — 不需要修改
- `exportImageHandler()` — 不需要修改
- 各样式预览模块（type-B/C/D/E/F/G/H/I/J/K/L/M preview）— 不需要修改

[Classes]
无 JavaScript class 修改。

CSS 层面通过 `.is-mobile` class 前缀覆盖样式（所有移动端选择器都带此前缀）：
- `.is-mobile .app-container` — padding: 12px 8px
- `.is-mobile .style-grid` — 2 列 grid
- `.is-mobile .preview-area` — padding-bottom: 80px，移除 padding-right: 120px
- `.is-mobile .float-actions` — 底部横向排列
- `.is-mobile .float-btn` — 56×56px
- `.is-mobile .edit-panel` — 底部抽屉，70vh/70dvh
- `.is-mobile .edit-panel.visible` — translateY(0)
- `.is-mobile .frame-wrapper img` — max-height: calc(100dvh - 160px)
- `.is-mobile .params-grid` — 2×2
- `.is-mobile .logo-grid` — 紧凑布局
- `.is-mobile .panel-header::before` — 拖拽指示器

[Dependencies]
无新增外部依赖。

[Testing]
测试矩阵（PC 端回归 + 移动端验证）：

| 测试场景 | 方法 | 预期结果 |
|----------|------|---------|
| **PC Chrome 1920×1080** | 直接打开 | **布局完全不变**（无 is-mobile class） |
| **PC Chrome 窗口缩小至 600px** | 拖拽窗口 | **布局不变**（pointer: fine，fallback 不触发） |
| iPhone 14 竖屏 | Chrome DevTools | 底部按钮栏 + 底部抽屉 + 图片自然缩放 |
| iPhone 14 横屏 | Chrome DevTools | 底部按钮栏 + 图片正常显示 |
| iPad Pro 竖屏 | Chrome DevTools | UA 检测触发 is-mobile |
| Samsung S24 Ultra 横屏 1440px | Chrome DevTools | UA 检测触发 is-mobile（不靠断点） |
| 编辑面板滑动关闭 | 触摸模拟 | 向下滑动 >50px 关闭 |
| 文件导入 + 导出完整流程 | 移动端模拟 | 全流程正常 |
| **PC 端导出图片** | 正常操作 | **结果与修改前完全一致** |

[Implementation Order]

> **进度标记：** ✅ = 已完成 | 🔄 = 进行中 | ⬜ = 待执行

1. ✅ **新建 `src/renderer/js/mobile.js`**
   - ✅ detectMobile() + isMobile 标志导出
   - ✅ initMobileLayout() — class 注入 + resize 监听
   - ✅ initSwipeToClose() — 滑动手势
   - ✅ lockBodyScroll() / unlockBodyScroll()

2. ✅ **修改 `src/renderer/index.html`**
   - ✅ 更新 viewport meta（禁止双指缩放）

3. ✅ **修改 `src/renderer/js/app.js`**
   - ✅ 导入 mobile.js
   - ✅ DOMContentLoaded 中初始化 `if (isMobile) initMobileLayout()`
   - ✅ btnEdit 点击中初始化滑动手势 + lockBodyScroll
   - ✅ btnClosePanel 点击中 unlockBodyScroll

4. ✅ **修改 `src/renderer/index.css`**
   - ✅ 追加 `.is-mobile` 选择器块（首页 + 编辑器 + 面板控件 + 模态框）
   - ✅ 追加 `@media (max-width: 768px) and (pointer: coarse)` fallback 块

5. ✅ **Docker 本地验证**
   - ✅ `.\dev.ps1` 重建容器（build context 114KB，成功启动）
   - ⬜ Chrome DevTools 移动端模拟全测试（需手动验证）
   - ⬜ PC 端回归测试确认无影响（需手动验证）

6. ⬜ **更新文档**
   - ⬜ `docs/V1.15-NAS_CHANGES.md`（暂不需要，用户明确指示）

---

## 问题 3：预览缩放文字大小异常 — 逐样式分析

### 根因

所有样式预览模块的字体大小是基于 `squareSize`（画布宽度）按比例计算的。移动端 `preview-area` 可用空间缩小（padding 从 `40px 120px` 改为 `12px 12px 80px 12px`），导致 `squareSize` 变小，字体按比例缩小后可能过小。

### 各样式缩放逻辑

| 样式 | calcSize 输入 | 字体缩放公式 | 问题 |
|------|--------------|-------------|------|
| **Type A/C** | 直接使用 img 尺寸 | `shortSide * borderPercent` | 字体大小由 CSS 控制，不受 squareSize 影响 ✅ |
| **Type B** | `typeBPreview.update()` | 由模块内部计算 | 需检查模块内是否有 fontSize 计算 |
| **Type D** | 类似 Type A | CSS 控制 | ✅ |
| **Type E** | `Math.min(availW, availH*2/3)` | `Math.max(8, Math.round(24 * squareSize / 480))` | squareSize 从 ~480 降到 ~300 时，字体从 24px 降到 15px ⚠️ |
| **Type F** | `Math.min(availW, availH)` | `Math.max(8, Math.round(14 * squareSize / 900))` | squareSize 从 ~900 降到 ~400 时，字体从 14px 降到 6px ❌ |
| **Type G** | 类似 Type F | 类似 Type F | 同 Type F ⚠️ |
| **Type H** | `Math.min(availW, availH)` | 需检查 | 需检查 |
| **Type I/J/K** | 类似 Type H | 类似 Type H | 同 Type H ⚠️ |
| **Type L** | 类似 Type G | 类似 Type G | 同 Type G ⚠️ |
| **Type M** | 类似 Type F | 类似 Type F | 同 Type F ⚠️ |

### 问题核心

Type F/G/H/I/J/K/L/M 的 `fontSize = Math.max(8, Math.round(N * squareSize / M))` 公式中，基准分母 M 是基于 PC 端 full-size 画布计算的。移动端画布缩小后，字体降到 8px（Math.max 下限），但 8px 在手机上仍然太小。

### 修复方案选项

**方案 A：提高移动端最小字体下限**
- 在各模块的 fontSize 计算中，当 `isMobile` 时将 `Math.max(8, ...)` 改为 `Math.max(12, ...)`
- 优点：简单直接
- 缺点：需要修改每个模块

**方案 B：CSS override（推荐）**
- 在 `.is-mobile .border-content` 中设置 `font-size: 12px !important` 覆盖 JS 计算的值
- 优点：只改 CSS，不改 JS
- 缺点：`!important` 覆盖可能导致导出时字号不一致

**方案 C：在 updateBorderContent 中检测 isMobile 并传入 scale 参数**
- 让各模块的 `updateContentPreview()` 接受一个 `fontScale` 参数
- 移动端传入 `fontScale = 1.5` 或更高
- 优点：精确控制
- 缺点：需要修改所有模块的接口

**方案 D：移动端使用固定的预览缩放比例**
- 移动端 `preview-area` 不缩小画布，而是用 `transform: scale()` 整体缩小预览区
- 字体保持原始大小（因为 scale 只影响视觉，不影响计算）
- 优点：零代码改动，画布和字体比例完全正确
- 缺点：之前分析过 scale 有布局溢出和模糊问题

**推荐方案：A + 移动端 padding 调整**
1. 各模块 fontSize 公式中，移动端最小下限从 8px 提高到 12px
2. 移动端 `preview-area` 的 `padding-bottom` 从 80px 减小到 60px（给画布更多空间）
3. 在 `mobile.js` 中导出 `isMobile`，各模块导入后判断

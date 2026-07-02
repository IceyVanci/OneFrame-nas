# OneFrame NAS Edition 更新日志

## v1.13 (2026-07-02)

### ✨ 新功能

#### 首页缩略图随机选取
- 基于原始项目 v1.13 移植缩略图选择器（thumbnail-selector.js）
- 首页 13 个样式卡片每次刷新随机显示不同缩略图
- 全局 imageId 去重：不同样式尽量不重复使用同一张图片
- Fisher-Yates 洗牌算法保证均匀随机
- 兼容 .jpeg 和 .jpg 两种扩展名

#### 首页缩略图路径修正
- 修复样式卡片 img src 指向不存在的根目录文件的问题
- 所有卡片指向 Sample/ 目录下实际存在的图片文件
- 移除样式卡片中多余的 photo-footer 元素

### 🐛 Bug 修复

#### 修复刷新页面时缩略图闪烁两次
- 将 checkFileExists() 从 Image 对象探测改为 fetch HEAD 请求
- HEAD 请求只获取 HTTP 头信息，不加载图片体，避免视觉闪烁

#### 修复部分样式导出遗失焦距单位 mm
- 在 getFocalLength() 中统一确保返回值带 "mm" 后缀
- 修复 FocalLengthIn35mmFilm 返回纯数字时导出图片缺少单位的问题

### 🔧 修改文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `index.html` | 修改 | 修正13个样式卡片 img src 路径，移除 photo-footer，版本号 v1.13 |
| `js/thumbnail-selector.js` | 新增 | 首页缩略图随机选择器模块 |
| `js/app.js` | 修改 | 导入并调用 initHomepageThumbnails，移除首页 photo-footer 高度计算 |
| `js/exif.js` | 修改 | getFocalLength() 统一添加 mm 后缀 |
| `docs/V1.13-NAS_CHANGES.md` | 新增 | 记录 NAS v1.13 变更内容 |
| `CHANGELOG.md` | 修改 | 添加 v1.13 条目 |

---

## v1.12 (2026-07-01)

### 🐛 Bug 修复

#### Type E 预览拖动边界修复
- 修复预览端坐标系混用（原始像素 vs CSS 像素）问题
- 统一偏移模型：maxOffset 使用 rendered CSS 像素计算
- 修复拖动提示文字（从临时禁用恢复为正常提示）

#### Type E 导出偏移方向修复
- 修复导出裁剪区域与预览方向相反的问题
- drawOffset 从加法改为减法，与 CSS object-position 语义一致

#### 重选图片 EXIF 刷新与偏移重置
- 新增 imageLoadSequence 防止旧异步结果覆盖新图片
- Type E 重选图片时重置拖动偏移
- 统一日期格式化（formatDateTimeForInput）

---

## v1.11 (2026-06-30)

### ✨ 新功能

#### 新增样式 M（模糊边框+顶部Logo+底部文字）
- 照片 90%×90% 居中，四条边等高模糊背景（各 5%）
- 顶部 Logo + 底部署名 + 参数行三栏
- 导入图像应用 12px 圆角

#### 样式 B/F/G/L 图片圆角
- 预览端和导出端统一 12px 圆角

#### 关于界面调整
- GitHub 链接指向本项目，添加 Bilibili/Instagram 链接

### 🐛 Bug 修复

#### Type L 导出模糊背景缩放修复
- 修复导出图片模糊背景边缘黑边/透明边问题

### 🔧 修改文件

- `app.js` — 添加 Type M 支持
- `index.html` — 添加 Type M 卡片 + 关于模态框调整
- `styles/index.js` — 注册 Type M
- `exporter.js` — 注册 Type M 导出
- `css/type-B/F/G/L.css` — 图片圆角 12px
- `type-B/F/G/L-export.js` — 导出圆角
- 新增 `type-M-preview.js`、`type-M-export.js`、`type-M.css`、`type-M-editor-panel.js`

### 📝 文档

- 新增 `docs/V1.11-NAS_CHANGES.md`
- 更新 `README.md` 版本号
- 更新 `CHANGELOG.md`

---

## v1.10 (2026-06-29)

### ✨ 新功能

#### 编辑器动态背景色（同步自原始项目 v1.1.0）
- 导入图片后，编辑器预览区背景色自动根据图片主色调生成深色版本
- 替代固定背景色 `#16213e`，提升视觉体验
- 算法：10×10 canvas 采样 + 0.4 压暗系数

### 🔧 修改文件

- `app.js` — 新增 `applyDynamicBackground` 函数及调用点

### 📝 文档

- 新增 `docs/V1.10-NAS_CHANGES.md`
- 更新 `README.md` 版本号

---

## v1.09 (2026-06-29)

### ✨ 新功能

#### 主界面图片墙重构
- 从单列纵向排列重构为 3 列瀑布流图片墙
- 移除参数/海报标签栏，所有 12 种样式同时显示
- 布局铺满窗口宽度，自适应屏幕

#### Type K/L 编辑面板改进
- Type K 和 Type L 编辑面板现在显示设备型号输入框
- 输入框 placeholder 改为"型号（如 A7M4）"

#### 文件名大写化
- 48 个样式文件名从小写改为大写（`type-a` → `type-A`）
- CSS 类名、data-style 属性、JS 样式 ID 保持小写不变
- 所有 import 路径同步更新（6 个引用文件）

### 🔧 修改文件

- `index.html` — 删除标签栏、CSS 路径大写化、修正预览图、版本号 v1.09
- `index.css` — Grid→Columns 瀑布流，移除宽度限制
- `app.js` — import 路径大写化，删除标签页筛选逻辑
- `styles/index.js` — import 路径大写化（24处）
- `exporter.js` — import 路径大写化（12处）
- `editor.js` — import 路径大写化（2处）
- `type-K/L-editor-panel.js` — 显示设备型号输入框

### 📝 文档

- 新增 `docs/V1.09-NAS_CHANGES.md`
- 新增 `docs/release-v1.09-nas.md`
- 更新 `README.md` 版本号和使用说明

---

## v1.08 (2026-06-29)

### ✨ 新功能

#### Type J 编辑面板改进
- 设备型号输入框现在可见，方便手动修改机型名称
- 输入框 placeholder 改为"型号（如 Sony A7M4）"

#### Type K 左下角 Logo + 双行文字样式（同步自原始项目 v1.0.8）
- Logo 在底部左下角，右侧两行左对齐文字
- 第一行：署名（medium）+ 日期（normal）
- 第二行：机型名称（medium）+ 拍摄参数（normal）
- 纵向图片底部字号增大 50%

#### Type L 高斯模糊背景样式（同步自原始项目 v1.0.8）
- 基于 Type G，白色外框替换为照片高斯模糊版本
- 文字颜色默认白色，支持黑/灰/白选择
- 预览端：动态创建 blur 背景 DOM，CSS filter + transform scale
- 导出端：Canvas ctx.filter 两步绘制

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| `css/type-k.css` | Type K 样式定义 |
| `styles/type-k-preview.js` | Type K 预览模块 |
| `styles/type-k-export.js` | Type K 导出模块 |
| `components/type-k-editor-panel.js` | Type K 编辑面板配置 |
| `css/type-l.css` | Type L 样式定义 |
| `styles/type-l-preview.js` | Type L 预览模块 |
| `styles/type-l-export.js` | Type L 导出模块 |
| `components/type-l-editor-panel.js` | Type L 编辑面板配置 |

### 🔧 修改文件

- `styles/index.js` — 注册 Type K/L
- `exporter.js` — 注册 Type K/L 导出
- `index.html` — 添加 Type K/L 卡片和 CSS，版本号 v1.08
- `app.js` — 添加 Type K/L 入口
- `components/type-j-editor-panel.js` — 显示设备型号输入框

### 📝 文档

- 新增 `docs/V1.08-NAS_CHANGES.md`
- 新增 `docs/release-v1.08-nas.md`
- 更新 `README.md` 版本号和样式列表
- 更新 `docs/AI_PROJECT_GUIDE.md`

---

## v1.07 (2026-06-28)

### ✨ 新功能

#### Type I 极简叠加文字样式（同步自原始项目 v1.0.7）
- 照片 100% 填满画布，Logo 顶部居中，底部仅署名（默认 "OneFrame"）
- 纵向图片底部字号增大 50%
- 编辑面板：隐藏型号/参数/时间，保留 Logo + 署名 + 文字颜色

#### Type J 署名+三栏参数行样式（同步自原始项目 v1.0.7）
- 不显示 Logo，署名在底部第一行，参数行三栏布局（左机型/中参数/右时间）
- 机型名称自动包含厂商前缀（如 "Sony A7M4"）
- 纵向图片底部字号增大 50%
- 导出使用底部锚定 `bottom: 3%` 定位

#### 文字颜色选择功能扩展
- Type I 和 Type J 均支持文字颜色选择（黑/灰/白）

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| `css/type-i.css` | Type I 样式定义 |
| `styles/type-i-preview.js` | Type I 预览模块 |
| `styles/type-i-export.js` | Type I 导出模块 |
| `components/type-i-editor-panel.js` | Type I 编辑面板配置 |
| `css/type-j.css` | Type J 样式定义 |
| `styles/type-j-preview.js` | Type J 预览模块 |
| `styles/type-j-export.js` | Type J 导出模块 |
| `components/type-j-editor-panel.js` | Type J 编辑面板配置 |

### 🔧 修改文件

- `styles/index.js` — 注册 Type I/J
- `exporter.js` — 注册 Type I/J 导出
- `index.html` — 添加 Type I/J 卡片和 CSS 引用，版本号 v1.07
- `app.js` — 添加 Type I/J 的 showEditor/updateBorder 分支

### 📝 文档

- 新增 `docs/V1.07-NAS_CHANGES.md`
- 更新 `README.md` 版本号和样式列表
- 更新 `docs/AI_PROJECT_GUIDE.md`

---

## v1.05 (2026-06-19)

### ✨ 新功能

#### Type G 画中画样式（同步自原始项目 v1.0.5）
- 新增 Type G 边框样式：第一行显示厂商 Logo，第二行显示「拍摄日期 | 拍摄参数 | 相机名称」（竖线分隔），第三行显示署名
- 纵向图片自适应：白色区域减半（顶部 2.5%，底部 7.5%），照片区域增大到 90%
- Logo 大小规则：横向图片高度 = 画布 2.5%，纵向图片高度 = 画布 1.25%
- 编辑面板：隐藏所有显示开关（所有元素默认显示），保留 Logo 选择区域
- 机型名称只显示型号（不带品牌前缀）
- 文字颜色统一为黑色

#### Type F 纵向图片自适应
- 纵向图片（高度 > 宽度）时，顶部/底部白色区域减半，照片区域增大到 90%

#### Type E 预览文字缩放
- CSS font-size 从 px 改为 em 单位，文字随画布大小自动缩放
- Logo 加载时从 borderContent 读取动态基准字号

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| `css/type-g.css` | Type G 布局样式 |
| `styles/type-g-preview.js` | Type G 预览模块 |
| `styles/type-g-export.js` | Type G 导出模块 |
| `components/type-g-editor-panel.js` | Type G 编辑面板配置 |
| `TypeG-sample_compressed.jpeg` | Type G 预览缩略图 |

### 🔧 修改文件

- `styles/index.js` — 注册 Type G
- `exporter.js` — 注册 Type G 导出
- `index.html` — 添加 Type G 卡片和 CSS 引用，版本号更新为 v1.05
- `app.js` — 添加 Type G 的 showEditor/updateBorder 分支
- `css/type-e.css` — font-size 从 px 改为 em
- `styles/type-e-preview.js` — 动态基准字号
- `styles/type-e-export.js` — 缩放基准固定为 480
- `styles/type-f-preview.js` — 纵向图片自适应
- `styles/type-f-export.js` — 纵向图片自适应

### 📝 文档

- 更新版本号到 v1.05
- 新增 `docs/release-v1.05-nas.md` Release 说明
- 更新 `docs/V1.05-NAS_CHANGES.md` 添加 Type G 章节
- 更新 `docs/function_analysis.md` 添加 Type G 函数分析和布局说明
- 更新 README.md 版本号和样式列表

### 📦 构建

- 新增 `oneframe-web-v1.05-nas.tar` 预编译镜像

---

## v1.04 (2026-06-19)

### 🐛 Bug 修复

#### 修复 Type F 预览缩放问题
- 修复窗口大小变化后图框与图片相对位置/比例关系错乱的问题
- 修复非初始窗口大小下导入图片时图框比例错误的问题
- 修复横向窗口变小时图框不缩放的问题
- 修复纵向窗口变大时图框只增大纵向高度的问题

**根因**：两个独立问题
1. `calcSize()` 内部预览缩放与 `transform: scale()` 双重缩放
2. `type-a.css` 通用选择器意外匹配 Type F 施加 CSS 约束

**修复**：
- `type-f-css` 添加 `max-width: none !important` 和 `max-height: none !important`
- `app.js` Type F 分支去掉 `transform: scale()`，改为动态计算显示尺寸

### 📝 文档

- 更新版本号到 v1.04
- 为每个历史版本生成独立变更文档（V1.00~V1.04）
- 创建 AI 项目认知指南
- 重写 CHANGELOG 和 release 文档

---

## v1.03 (2026-06-18)

### ✨ 新功能

#### Type F 画中画样式（同步自原始项目 v1.0.3）
- 新增 Type F 边框样式：上方 5% 白色留白 + 中部 92%×80% 照片展示区 + 底部 15% 文字信息区
- 文字区域使用绝对定位，署名不影响前两行位置
- 字号动态缩放（基准 900px 宽度对应 14px）
- 编辑面板：隐藏边框颜色/高度/比例/Logo，设备型号自动包含品牌名

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| `css/type-f.css` | Type F 布局样式 |
| `styles/type-f-preview.js` | Type F 预览模块 |
| `styles/type-f-export.js` | Type F 导出模块 |
| `components/type-f-editor-panel.js` | Type F 编辑面板配置 |
| `TypeF-sample_compressed.jpeg` | Type F 预览缩略图 |

### 🔧 修改文件

- `styles/index.js` — 注册 Type F
- `index.html` — 添加 Type F 卡片和 CSS 引用
- `app.js` — 添加 Type F 各分支逻辑
- `exporter.js` — 注册 Type F 导出
- `type-a~e-preview.js` — 类名清理列表添加 `type-f`

---

## v1.01 (2026-06-16)

### ✨ 首次发布

#### 架构变更（Electron → Docker/Nginx）
- 移除 Electron 28.0 桌面框架
- 采用零构建方案：原生 HTML/CSS/JS + nginx:alpine
- 浏览器原生 API 替代 Electron API
- 本地化 Font Awesome 和 opentype.js

#### 新增文件
- Docker 部署文件（Dockerfile、nginx.conf、docker-compose.yml）
- `.dockerignore`、`.gitignore`
- 项目文档（README、CHANGELOG、函数分析、移植指南）
- Font Awesome 和 opentype.js 本地副本

#### Bug 修复
- 修复 `file://` 协议在浏览器中不可用
- 修复拍摄时间无法读取（EXIF 日期正则不匹配）
- 修复样式切换后 CSS 类名累积
- 修复焦距显示缺失 mm 单位
- 修复 Logo 网格显示空占位
- 修复 Type E 拖动提示残留
- 清理 Electron 残留变量
- 优化 Docker 镜像体积

---

## 原始项目版本历史

### v1.0.4 (2026-06-19)
- 修复 Type F 预览缩放问题

### v1.0.3 (2026-06-18)
- 新增 Type F 画中画样式

### v1.0.2 (2026-06-17)
- 首页分类标签、关于弹框、多项 Bug 修复

### v1.01 (2026-05-28)
- 首页分类标签、关于弹框、窗口缩放修复

### v1.00 (2026-05-25)
- 首次发布，5 种边框样式
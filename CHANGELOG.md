# OneFrame NAS Edition 更新日志

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
# OneFrame NAS Edition 🎨

一款简洁优雅的图片边框添加工具，为您的照片自动添加精美的底部边框，并智能显示相机 EXIF 信息。

本项目是 [OneFrame](https://github.com/IceyVanci/OneFrame) 的 NAS/Docker 移植版本，从 Electron 桌面应用迁移为纯前端 Web 应用，通过 Docker 容器化部署在 NAS 上，局域网内设备可通过浏览器访问。

![Version](https://img.shields.io/badge/version-1.04--nas-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Docker](https://img.shields.io/badge/Docker-nginx:alpine-2496ED.svg)

---

## ✨ 功能特性

### 📷 智能 EXIF 读取
- 自动识别相机厂商并显示对应 Logo
- 提取并展示拍摄参数（光圈、快门、ISO、焦距）
- 自动读取拍摄时间和设备型号

### 🎨 边框样式
支持多种边框样式：
- **Type A**：白色下边框 - 可调节边框高度（5%-30%），完整编辑面板
- **Type B**：黑色下边框 - 正方形画布，图片居左，右侧显示参数和 Logo
- **Type C**：横向布局 - Logo 在左侧，参数在右侧，纵向图片自动缩放字体
- **Type D**：横向布局 - Logo 居中，左侧时间+机型，右侧参数+署名
- **Type E**：3:2 纵向 - 顶部 1:1 正方形图片，底部白色区域显示参数，支持拖动裁剪
- **Type F**：画中画 - 上方白色留白 + 中部照片展示区 + 底部文字信息区，字号动态缩放

### 📝 边框信息编辑
- Logo 显示开关
- 拍摄参数显示开关
- 拍摄时间显示开关
- 支持自定义署名
- 边框颜色和高度自定义

### 🔒 EXIF 保留
- 导出时自动保留原图 EXIF 信息
- 支持 JPG 高质量输出

### 📁 广泛的相机支持
支持以下相机厂商的 Logo 和信息识别：
Apple、Canon、DJI、Fujifilm、Google、GoPro、Hasselblad、Leica、Lumix、Nikon、Nokia、Olympus、Oneplus、Pentax、Ricoh、Sigma、Sony、Vivo、Xiaomi 等

---

## 🛠 技术架构

| 模块 | 原始方案 | NAS 方案 | 说明 |
|------|----------|----------|------|
| **运行环境** | Electron 28.0 | Nginx + Docker | 纯前端 Web 应用 |
| **前端** | 原生 HTML/CSS/JS | 原生 HTML/CSS/JS | 零构建方案，无需 Node.js |
| **图片预览** | CSS 渲染 | CSS 渲染 | 实时预览边框效果 |
| **EXIF 读取** | exifreader | exifreader | 本地加载，无需 CDN |
| **EXIF 写入** | piexifjs | piexifjs | 保留原图 EXIF 数据 |
| **字体渲染** | opentype.js | opentype.js | 精确字体渲染 |
| **部署** | electron-builder | Docker Compose | 一行命令部署 |
| **文件选择** | Electron 对话框 | `<input type="file">` | 浏览器原生 File API |
| **文件保存** | Electron 对话框 | `<a download>` | 浏览器原生下载 |

### 移植关键改动

1. **移除 Electron 依赖**：删除 `window.electronAPI` 分支，统一使用浏览器原生 API
2. **本地化 CDN 资源**：Font Awesome 和 opentype.js 从 CDN 下载到本地 `assets/` 目录
3. **修复样式类名管理**：统一所有预览模块的 `updateFrameWrapper()` 和 `reset()` 类名清理逻辑
4. **修复 EXIF 时间解析**：匹配已格式化的日期格式
5. **Docker 镜像优化**：排除 exifreader 源码等不必要的文件

---

## 📂 项目结构

```
OneFrame-nas/
├── docker/
│   ├── Dockerfile              # 基于 nginx:alpine
│   └── nginx.conf              # CORS、gzip、SPA fallback
├── docker-compose.yml          # 服务定义、端口映射、重启策略
├── .dockerignore               # Docker 构建排除规则
├── .gitignore                  # Git 忽略规则
├── README.md                   # 本文档
├── CHANGELOG.md                # 更新日志
├── docs/
│   ├── AI_PROJECT_GUIDE.md     # AI 项目认知指南
│   ├── V1.00-NAS_CHANGES.md    # 初始移植说明
│   ├── V1.01-NAS_CHANGES.md    # v1.01 说明
│   ├── V1.03-NAS_CHANGES.md    # v1.03 Type F 同步
│   ├── V1.04_CHANGES.md        # v1.04 Type F 缩放修复
│   ├── release-v1.01-nas.md    # Release 历史
│   ├── function_analysis.md    # 函数分析文档
│   ├── migration-guide.md      # Electron→Docker 移植指南
│   └── pending-issues-and-improvements.md  # 问题追踪
└── src/
    └── renderer/               # 前端静态文件（Nginx 托管）
        ├── index.html          # 主页面
        ├── index.css           # 全局样式
        ├── css/
        │   ├── type-a.css      # Type A 样式
        │   ├── type-b.css      # Type B 样式
        │   ├── type-c.css      # Type C 样式
        │   ├── type-d.css      # Type D 样式
        │   ├── type-e.css      # Type E 样式
        │   └── type-f.css      # Type F 画中画样式
        ├── js/
        │   ├── app.js          # 主逻辑入口
        │   ├── exif.js         # EXIF 读取 (exifreader)
        │   ├── exif-exporter.js # EXIF 导出 (piexifjs)
        │   ├── exporter.js     # 图片导出
        │   ├── logo-utils.js   # Logo 工具
        │   ├── components/
        │   │   └── type-f-editor-panel.js  # Type F 面板配置
        │   └── styles/         # 样式模块
        │       ├── index.js    # 样式注册表
        │       ├── type-a-preview.js / type-a-export.js
        │       ├── type-b-preview.js / type-b-export.js
        │       ├── type-c-preview.js / type-c-export.js
        │       ├── type-d-preview.js / type-d-export.js
        │       ├── type-e-preview.js / type-e-export.js
        │       └── type-f-preview.js / type-f-export.js
        ├── logos/               # 相机厂商 Logo (SVG)
        ├── fonts/               # 字体文件 (MiSans)
        └── assets/
            ├── piexif.js       # EXIF 处理库
            ├── exifreader.js   # EXIF 读取库
            ├── opentype.min.js # 字体渲染库
            └── font-awesome/   # 图标库（本地化）
```

---

## 🚀 部署

### 环境要求
- Docker
- Docker Compose

### 方式一：Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/IceyVanci/OneFrame-nas.git
cd OneFrame-nas

# 构建并启动（后台运行）
docker compose up --build -d
```

### 方式二：使用预编译镜像（无需构建）

从 [GitHub Releases](https://github.com/IceyVanci/OneFrame-nas/releases) 下载预编译镜像文件，无需本地构建：

```bash
# 下载镜像文件（在 Release 页面下载 .tar 文件）
# 导入镜像
docker load -i oneframe-web-v1.01-nas.tar

# 运行容器
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

### 方式三：Docker 命令（从源码构建）

```bash
# 构建镜像
docker build -f docker/Dockerfile -t oneframe-web .

# 运行容器
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-web
```

### 访问

在局域网内任何设备的浏览器中访问：

```
http://<NAS的IP地址>:8888
```

### 常用管理命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重新构建并启动（代码更新后）
docker compose up --build -d
```

---

## 📖 使用说明

### 1. 选择边框样式
打开浏览器访问应用后，点击首页的样式卡片。
- **参数**标签：Type A（白色下边框）、Type C（横向布局）、Type D（横向居中）
- **海报**标签：Type B（黑色下边框）、Type E（3:2 纵向）
- **参数**标签包含：Type A、Type C、Type D、Type F

### 2. 选择图片
选择样式后，系统会弹出文件选择器，选择要处理的图片。

### 3. 调整设置
在右侧编辑面板中，您可以：
- 调整边框颜色和高度
- 选择是否显示相机 Logo
- 编辑或自动填充拍摄参数
- 添加自定义署名
- 设置拍摄时间

### 4. 导出图片
点击"保存"或"导出"按钮，图片将自动下载到本地。

---

## ⚙️ 配置说明

### 端口配置
默认端口为 `8888`，可在 `docker-compose.yml` 中修改：
```yaml
ports:
  - "8888:80"  # 修改左侧数字即可
```

### 边框高度
边框高度默认设置为图片短边的 12%，可在 5%-30% 范围内调整。

### Logo 智能适配
- 浅色边框背景：使用原始 Logo
- 深色边框背景：深色 Logo 自动转换为白色

### 支持的 EXIF 字段
- Make: 相机厂商
- Model: 相机型号
- DateTimeOriginal: 拍摄时间
- FNumber: 光圈值
- ExposureTime: 快门速度
- ISOSpeedRatings: ISO 感光度
- FocalLength/FocalLengthIn35mmFilm: 焦距

---

## 🔧 开发指南

### 本地开发测试
无需 Node.js 或构建工具，直接使用 HTTP 服务器：

```bash
# 使用 npx serve（需要 Node.js）
npx serve src/renderer

# 或使用 Python
python -m http.server 3000 -d src/renderer

# 或使用 Docker
docker compose up --build
```

### 添加新的相机厂商 Logo

1. 准备 Logo 文件（SVG 格式）
2. 将文件放入 `src/renderer/logos/` 目录
3. 文件命名规范：`{厂商名}.svg`（如 `Sony.svg`）
4. 在 `src/renderer/js/logo-utils.js` 的 `logoList` 数组中添加厂商名称

### 添加新的边框样式

1. 在 `src/renderer/index.html` 中添加新的样式卡片
2. 在 `src/renderer/css/` 中添加对应的 CSS 样式文件
3. 在 `src/renderer/js/styles/` 中添加预览和导出模块
4. 在 `src/renderer/js/styles/index.js` 中注册新样式

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 📚 相关文档

- [CHANGELOG.md](./CHANGELOG.md) - 更新日志
- [docs/AI_PROJECT_GUIDE.md](./docs/AI_PROJECT_GUIDE.md) - AI 项目认知指南
- [docs/function_analysis.md](./docs/function_analysis.md) - 函数分析文档
- [docs/migration-guide.md](./docs/migration-guide.md) - Electron → Docker 移植指南
- [docs/V1.04_CHANGES.md](./docs/V1.04_CHANGES.md) - v1.04 Type F 缩放修复
- [docs/V1.03-NAS_CHANGES.md](./docs/V1.03-NAS_CHANGES.md) - v1.03 Type F 同步
- [docs/release-v1.01-nas.md](./docs/release-v1.01-nas.md) - Release 历史
- [docs/pending-issues-and-improvements.md](./docs/pending-issues-and-improvements.md) - 问题追踪与修复记录

---

## 🙏 致谢

- [OneFrame](https://github.com/IceyVanci/OneFrame) - 原始 Electron 桌面应用
- [exifreader](https://github.com/mattiasw/ExifReader) - EXIF 信息读取
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF 信息写入
- [opentype.js](https://github.com/opentypejs/opentype.js) - 字体渲染
- [Copicseal](https://github.com/copicseal) - 可图匠，部分代码逻辑来自 Copicseal
- [Font Awesome](https://fontawesome.com/) - 图标库
- [MiSans](https://hyperos.mi.com/font) - 小米 MiSans 字体
- [Xiaomi MiMo](https://mimo.xiaomi.com/) - Xiaomi MiMo Orbit-百万亿 Token 创造者激励计划
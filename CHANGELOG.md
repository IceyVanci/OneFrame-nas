# OneFrame NAS Edition 更新日志

## v1.01-nas (2026-06-16)

### 🎉 NAS/Docker 移植版本首次发布

从 [OneFrame](https://github.com/IceyVanci/OneFrame) v1.01 Electron 桌面应用移植为纯前端 Web 应用，通过 Docker 容器化部署在 NAS 上。

### ✨ 架构变更

#### Electron → Docker/Nginx
- 移除 Electron 28.0 桌面框架依赖
- 采用零构建方案：原生 HTML/CSS/JS + Nginx 静态服务器
- Docker 使用 `nginx:alpine` 镜像，构建产物仅含前端静态文件
- `docker-compose.yml` 定义服务、端口映射（8888:80）、自动重启策略

#### 浏览器 API 替代 Electron API
- 文件选择：`<input type="file">` 替代 `electronAPI.selectImage()`
- 文件保存：`<a download>` 替代 `electronAPI.saveBlob()`
- 图片加载：`URL.createObjectURL()` 替代 `file://` 协议
- Logo 加载：静态 `getAllLogos()` 替代 `electronAPI.getLogos()`

#### 资源本地化
- Font Awesome 6.5.1 从 CDN 下载到 `assets/font-awesome/`
- opentype.js 1.3.4 从 CDN 下载到 `assets/opentype.min.js`
- 所有资源均本地加载，无需外网访问

### 🐛 Bug 修复

#### P0 功能阻断
- **`file://` 协议**：`checkImageOrientation()` 删除字符串路径分支，统一使用 `URL.createObjectURL()`
- **拍摄时间无法读取**：`updateExifDisplay()` 日期正则从 `(\d{4}):(\d{2}):(\d{2})` 改为 `(\d{4})-(\d{2})-(\d{2})`，匹配 `exif.js` 已格式化的日期
- **样式类名累积**：所有 5 个 preview 模块的 `updateFrameWrapper()` 和 `reset()` 统一清理全部类型类名 `type-a ~ type-e`

#### P1 可靠性/显示
- **焦距缺 mm 单位**：`type-a-preview.js`、`type-c-preview.js`、`type-d-preview.js` 统一使用 `strip mm → append mm` 逻辑
- **Logo 空占位**：`initLogoGrid()` 添加 `img.onerror` 处理，隐藏无 SVG 文件的品牌（Huawei、Insta360、OPPO、Samsung、xuzhou）
- **Type E 拖动提示残留**：`typeEPreview.reset()` 中移除 `.type-e-drag-hint` 元素
- **CDN 外部依赖**：Font Awesome 和 opentype.js 改为本地引用，确保 NAS 离线环境可用
- **Docker 镜像体积**：`.dockerignore` 排除 `src/renderer/assets/package`（exifreader 源码，约 2MB）

#### P2 代码质量
- **Electron 残留变量**：删除 `currentImagePath` 变量及所有引用（`app.js` 4 处）
- **`.dockerignore` 不一致**：根目录和 `docker/` 目录的 `.dockerignore` 内容同步
- **过时注释**：`exporter.js` JSDoc 中 `imagePath` 参数描述更新

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| `docker/Dockerfile` | 基于 nginx:alpine 的 Docker 镜像定义 |
| `docker/nginx.conf` | Nginx 配置（gzip、CORS、SPA fallback、缓存策略） |
| `docker-compose.yml` | Docker Compose 服务定义 |
| `docker/.dockerignore` | Docker 构建排除规则 |
| `.dockerignore` | 根目录 Docker 构建排除规则 |
| `.gitignore` | Git 忽略规则 |
| `.gitattributes` | Git 属性配置 |
| `README.md` | NAS 版项目说明文档 |
| `CHANGELOG.md` | 更新日志（本文档） |
| `docs/function_analysis.md` | 函数分析文档 |
| `docs/pending-issues-and-improvements.md` | 问题追踪与修复记录 |
| `src/renderer/assets/font-awesome/` | Font Awesome 本地副本 |
| `src/renderer/assets/opentype.min.js` | opentype.js 本地副本 |

### 📁 修改文件

| 文件 | 变更说明 |
|------|---------|
| `src/renderer/js/app.js` | 移除 5 处 Electron 分支、删除 `file://` 协议、修复日期正则、删除 `currentImagePath`、Logo 加载失败隐藏 |
| `src/renderer/js/styles/type-a-preview.js` | `updateFrameWrapper()` 完整类名清理、焦距追加 mm |
| `src/renderer/js/styles/type-b-preview.js` | `updateFrameWrapper()` 和 `reset()` 完整类名清理 |
| `src/renderer/js/styles/type-c-preview.js` | `updateFrameWrapper()` 完整类名清理、焦距追加 mm |
| `src/renderer/js/styles/type-d-preview.js` | `updateFrameWrapper()` 和 `reset()` 完整类名清理、焦距追加 mm |
| `src/renderer/js/styles/type-e-preview.js` | `updateFrameWrapper()` 完整类名清理、`reset()` 移除拖动提示 |
| `src/renderer/js/exporter.js` | JSDoc 注释更新（`imagePath` 参数描述） |
| `src/renderer/index.html` | CDN 引用改为本地路径 |

### 🔧 依赖变更

| 依赖 | 变更 | 说明 |
|------|------|------|
| Electron 28.0 | 移除 | 桌面框架不再需要 |
| electron-builder | 移除 | 打包工具不再需要 |
| electron-store | 移除 | 原始项目已移除 |
| Font Awesome 6.5.1 | 本地化 | 从 CDN 下载到 `assets/font-awesome/` |
| opentype.js 1.3.4 | 本地化 | 从 CDN 下载到 `assets/opentype.min.js` |
| exifreader | 保留 | EXIF 读取，本地加载 |
| piexifjs | 保留 | EXIF 写入，本地加载 |

### 📦 Docker 镜像

- **基础镜像**：`nginx:alpine`（约 40MB）
- **镜像内容**：仅包含 `src/renderer/` 前端静态文件 + Nginx 配置
- **排除内容**：`node_modules`、`src/main`（Electron 主进程）、`assets/package`（exifreader 源码）、文档文件

---

## 原始项目版本历史

### v1.01 (2026-05-28) - 原始 Electron 版本

- 首页分类标签（参数/海报）
- 关于弹框
- 窗口缩放预览错位修复
- 移除未使用的 `electron-store` 依赖

### v1.00 (2026-05-25) - 原始 Electron 版本首次发布

- 5 种边框样式：Type A/B/C/D/E
- 智能 EXIF 读取：24 家相机厂商 Logo
- EXIF 保留：导出时自动保留原图 EXIF 信息
- Electron 28 + 原生 HTML/CSS/JS
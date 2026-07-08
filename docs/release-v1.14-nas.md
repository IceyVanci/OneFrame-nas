# OneFrame NAS Edition v1.14 Release

**发布日期**：2026-07-06

---

## 🎉 新功能

### 字体加载优化
- MiSans 字体从 TTF 优先切换为 **woff2 优先**（压缩率 38%），TTF 作为 Canvas 导出回退
- 首屏字体体积从 23.4MB 降至 **14.5MB**
- 添加 `font-display: swap`，页面渲染不再被字体阻塞
- 浏览器先用系统字体渲染，woff2 加载完成后自动替换
- nginx 已有长期缓存配置，二次访问零延迟

### 首页加载动画（Shimmer 骨架屏）
- 解决 V1.13 首页加载时样式卡片区域黑屏问题
- 新增 CSS shimmer 微光骨架屏动画，加载期间显示灰色脉冲效果
- 13 个样式卡片 img 添加 `loading` class，图片加载完成后自动移除
- `<head>` 中添加 manifest 预加载 `<link rel="preload">`
- 缩略图加载完成后 shimmer 自动消失，过渡流畅

### 样本图片压缩优化
- 167 个样本图片从 34MB 压缩至 **16.4MB**（压缩 52%）
- 分辨率从 1714×1280 缩放至 1200px 宽，保持原始比例
- 单文件大小从 200-420KB 降至 60-130KB
- 原图备份保存在 `Sample_backup/` 目录

### 导出命名规则切换
- 新增独立配置文件 `src/renderer/js/config.js`
- 通过修改 `EXPORT_NAMING_MODE` 常量切换命名规则
- 默认模式：`{图片名}-OneFrame.jpg`
- 预览图模式：`{图片名}-TypeA-sample.jpg`

### Manifest 自动生成机制
- Docker 构建时自动扫描 Sample 目录生成 `sample-manifest.json`
- 新增 `scripts/generate-manifest.sh` 脚本
- 新增 `dev.ps1` 开发脚本（自动更新 manifest + docker build）
- 新增 `.git/hooks/pre-commit` 钩子（GitHub Desktop 提交时自动更新）

---

## 🔧 Bug 修复

### 重选图片 EXIF 显示修复
- 修复点击"重选图片"按钮后 EXIF 信息只在编辑面板显示、预览区不更新的问题
- 根因：`loadImageWithExif()` 中 `updateExifDisplay()` 在 `updateBorderContent()` 之后才执行
- 修复：在 `updateExifDisplay()` 后添加 `updateBorderContent()` 调用

### Manifest 路径重构
- 将 `sample-manifest.json` 从 `src/renderer/Sample/` 移动到 `src/renderer/`
- 更新 `index.html`、`thumbnail-selector.js`、`generate-manifest.sh` 中的所有引用

### Docker 构建优化
- `.dockerignore` 排除 `Sample_backup` 和 `Samplearchive` 目录
- build context 从 60MB 降至 21KB（压缩 99.97%）

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/js/config.js` | 导出命名模式配置 |
| `src/renderer/sample-manifest.json` | 样本清单文件（从 Sample/ 移动） |
| `scripts/generate-manifest.sh` | Docker 构建时自动生成 manifest |
| `dev.ps1` | 本地开发脚本 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/js/app.js` | 导入 config + 导出命名切换 + EXIF 时序修复 |
| `src/renderer/index.html` | 版本号 v1.14 + manifest 路径更新 |
| `src/renderer/index.css` | @font-face woff2 优先 + shimmer 加载动画 |
| `src/renderer/js/thumbnail-selector.js` | manifest 路径更新 |
| `docker/Dockerfile` | 添加 manifest 自动生成步骤 |
| `.dockerignore` | 排除 Sample_backup 和 Samplearchive |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.14-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 13 种（Type A ~ Type M） |
| **样本图片** | 167 个，共 16.4MB |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.14-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## ⚡ 性能对比

| 指标 | V1.13（优化前） | V1.14（优化后） |
|------|----------------|----------------|
| 首屏字体阻塞 | 阻塞 2-5 秒 | 不阻塞（swap） |
| 首屏字体体积 | 23.4MB TTF | 14.5MB woff2 |
| 首屏视觉 | 黑屏 | shimmer 动画 |
| manifest 等待 | 无预加载 | preload 提前获取 |
| 二次访问字体 | 需重新下载 | CDN 缓存（immutable） |
| 样本图片总大小 | ~34 MB | 16.4 MB（压缩 52%） |
| 样本图片分辨率 | 1714×1280 | 1200px 宽 |
| 重选图片 EXIF | 不显示在预览 | 正确显示 |
| 导出命名 | 固定 OneFrame | 可切换预览图命名 |

---

## 🔗 相关文档

- [V1.14-NAS_CHANGES.md](./V1.14-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志

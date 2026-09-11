# OneFrame NAS Edition v1.18 Release

**发布日期**：2026-09-12

> 本次新增第 16、17 种边框样式 **Type P**（参数布局）与 **Type Q**（简洁布局）。Type P 机型+品牌 Logo+参数胶囊、照片按原图比例完整显示无裁切；Type Q 四边主色边框 + 右下 "Foto by" 署名。

---

## 🎨 新特性

### Type P — 参数布局 · 机型 + 品牌 Logo + 参数胶囊
- 白色边框，照片区 93%×76.5%（左右 3.5% / 上 4% / 底部 19.5% 文字区）
- 第 1 行：机型（Semibold 黑）+ 细分隔线 + 品牌 Logo（沿用现有 Logo 选择器），水平居中
- 第 2 行：4 个圆角参数胶囊（细灰描边）+ 下方浅灰小标签（s / ISO / mm / f）
- 参数沿用现有 EXIF 流程（快门 / ISO / 焦距 / 光圈），空值隐藏对应胶囊
- **照片完整显示无裁切**：预览端内联 px 比例精确尺寸，导出端全图 1:1 drawImage
- 编辑面板：Logo + 设备型号（EXIF 自动读取）+ 拍摄参数开关

### Type Q — 简洁布局 · 主色边框 + 右下署名
- 四边等宽 2.5% 边框，颜色自动取**图片主色**，照片区 95%×95%
- 署名 "Foto by {署名}" 叠照片内右下角（Semibold，字号 0.021×画布宽）
- 署名颜色三选一：黑 / 白 / 图片主色；可开关显示/隐藏
- 主色提取：新增 `js/utils/dominant-color.js`（32×32 采样 + 4bit/通道分桶量化 + src 缓存）

### 首页缩略图
- Type P / Type Q 固定显示自身样本，不参与随机缩略图
- 样本：`Sample/00424-TypeP-sample_compressed.jpeg` / `Sample/00308-TypeQ-sample_compressed.jpeg`

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-P.css` | Type P 样式 |
| `src/renderer/css/type-Q.css` | Type Q 样式 |
| `src/renderer/js/styles/type-P-preview.js` | Type P 预览模块 |
| `src/renderer/js/styles/type-P-export.js` | Type P 导出模块 |
| `src/renderer/js/styles/type-Q-preview.js` | Type Q 预览模块 |
| `src/renderer/js/styles/type-Q-export.js` | Type Q 导出模块 |
| `src/renderer/js/components/type-P-editor-panel.js` | Type P 编辑面板配置 |
| `src/renderer/js/components/type-Q-editor-panel.js` | Type Q 编辑面板配置 |
| `src/renderer/js/utils/dominant-color.js` | 图片主色提取工具 |
| `src/renderer/Sample/00424-TypeP-sample_compressed.jpeg` | Type P 预览样本 |
| `src/renderer/Sample/00308-TypeQ-sample_compressed.jpeg` | Type Q 预览样本 |
| `docs/V1.18-NAS_CHANGES.md` | v1.18 详细变更说明 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | type-P/type-Q.css 链接 + 第 16/17 个样式卡片 + Type Q 署名编辑区 + 版本号 v1.18 |
| `src/renderer/js/app.js` | Type P/Q 预览分支、缓存变量、面板配置、updateBorder 分支、署名颜色设置 |
| `src/renderer/js/styles/index.js` | 注册 Type P / Type Q |
| `src/renderer/js/exporter.js` | 注册 Type P / Type Q 导出 |
| `src/renderer/js/thumbnail-selector.js` | Type P/Q 静态样本回退（移除随机占位） |
| `README.md` | 版本号 + 样式数量 15→17 + 文档链接 |
| `CHANGELOG.md` | 添加 v1.18 条目 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.18-nas.tar`（待构建） |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 17 种（Type A ~ Type Q） |
| **样本图片** | 166 个 |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.18-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.18-NAS_CHANGES.md](./V1.18-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志

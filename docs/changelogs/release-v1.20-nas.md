# OneFrame NAS Edition v1.20 Release

**发布日期**：2026-09-21

> 本次新增第 19、20 种边框样式 **Type S（留白排版）** 与 **Type T（满幅无边框）**：参考图/杂志排版风格，共用一套文字系统（左上两行文字 + 右侧竖排日期与倒三角标记 + 右下参数行），支持画布比例切换（1:1 / 1:1.35）、图片主色取色与照片拖动裁剪。

---

## 🎨 新特性

### Type S — 留白排版（参考图）
- **白色画布**；画布比例可切换（1:1 / 1:1.35 竖），照片恒为画布宽 82% 的正方形并水平垂直居中
- 照片 `cover` 填满照片区，可**二维拖动**选择显示区域
- 左上两行文字：第一行（默认空）+「PHOTO BY {handle}」
- 右侧**竖排日期**（YYYYMMDD）+ **倒三角标记**（上平边、尖端渐隐），垂直居中
- 右下参数行：`ISO | {focal}mm | F/{f} | {shutter}s`，EXIF 预填、可手改
- **文字颜色取图片主色（默认）**，并支持黑 / 琥珀 / 自定义（原生选色器 + 点选图片取色）

### Type T — 满幅无边框（参考图）
- 照片**铺满整张画布**（无白边）；照片比例可切换（1:1 / 1:1.35 竖）
- 文字布局与 Type S 一致（左上两行 / 右侧竖排日期+倒三角 / 右下参数）
- **文字带淡阴影**，保证压在照片上可读
- **文字颜色默认白色**，并支持图片主色 / 琥珀 / 自定义

### 编辑面板
- Type S：画布比例 + 第一行 / PHOTO BY / 日期 + 右下四参数（ISO/mm/F/s）+ 文字颜色（预设 + 选色器 + 点选图片取色）
- Type T：照片比例 + 第一行 / PHOTO BY / 日期 + 右下四参数 + 文字颜色（同上）
- 隐藏比例（传统）、边框颜色、Logo、设备型号、原拍摄参数、时间、文字颜色（通用）、厂商、胶片、Q 署名、R 打印、通用署名等无关项

### 首页缩略图
- Type S / T 固定显示自身样本（Type S：`Sample/04474-TypeS-sample_compressed.jpeg`；Type T：`Sample/04510-TypeT-sample_compressed.jpeg`），不参与随机缩略图

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-S.css` | Type S 样式 |
| `src/renderer/css/type-T.css` | Type T 样式 |
| `src/renderer/js/styles/type-S-preview.js` | Type S 预览模块（布局常量 + 拖动偏移） |
| `src/renderer/js/styles/type-S-export.js` | Type S 导出模块 |
| `src/renderer/js/styles/type-T-preview.js` | Type T 预览模块（布局常量 + 拖动偏移） |
| `src/renderer/js/styles/type-T-export.js` | Type T 导出模块 |
| `src/renderer/js/components/type-S-editor-panel.js` | Type S 编辑面板配置 |
| `src/renderer/js/components/type-T-editor-panel.js` | Type T 编辑面板配置 |
| `src/renderer/Sample/04474-TypeS-sample_compressed.jpeg` | Type S 预览样本 |
| `src/renderer/Sample/04510-TypeT-sample_compressed.jpeg` | Type T 预览样本 |
| `docs/V1.20-NAS_CHANGES.md` | v1.20 详细变更说明 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | type-S.css / type-T.css 链接 + 第 19/20 个样式卡片 + `#typeSSection` / `#typeTSection` 编辑区 + 版本号 v1.20 |
| `src/renderer/js/app.js` | Type S/T 预览分支、尺寸缓存、面板注册、`updateBorder` 分支、EXIF 预填、颜色预设与点选取色、导出偏移 |
| `src/renderer/js/styles/index.js` | 注册 Type S / Type T |
| `src/renderer/js/exporter.js` | 注册 Type S / Type T 导出 |
| `src/renderer/js/thumbnail-selector.js` | Type S/T 固定样本，不参与随机缩略图 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.20-nas.tar`（待构建） |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 20 种（Type A ~ Type T） |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.20-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.20-NAS_CHANGES.md](./V1.20-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
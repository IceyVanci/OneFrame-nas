# OneFrame NAS Edition v1.17 Release

**发布日期**：2026-08-25

> 本次新增第 15 种边框样式 **Type O**（胶片参数 · 机身大字 · 底部水印），支持胶片品牌/型号多级下拉与手动输入，并针对纵向图片优化白边。

---

## 🎨 新特性

### Type O — 胶片参数 · 机身大字 · 底部水印
- 横图照片区 84%×68%（2px 黑描边），纵图照片区 81%×76.7%（左右白边减半、底部白边减 1/3）
- 三行文字水平居中：胶片型号（机型字号 80%）→ 厂商+机型（大字 Semibold）→ 黑色署名水印
- 编辑面板：胶片（品牌 → 型号，可下拉也可手输）→ 厂商 → 设备型号 → 署名
- 厂商与机型均手动输入，**不读取 EXIF**
- 新增 `films.json`：13 家厂商精简列表 + 11 个胶片品牌共 60 款胶片

### 首页缩略图
- Type O 固定显示自身样本，不参与随机缩略图

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/films.json` | 厂商 + 胶片数据表 |
| `src/renderer/css/type-O.css` | Type O 样式 |
| `src/renderer/js/styles/type-O-preview.js` | Type O 预览模块 |
| `src/renderer/js/styles/type-O-export.js` | Type O 导出模块 |
| `src/renderer/js/components/type-O-editor-panel.js` | Type O 编辑面板配置 |
| `src/renderer/Sample/001-TypeO-sample_compressed.jpeg` | Type O 预览样本 |
| `docs/V1.17-NAS_CHANGES.md` | v1.17 详细变更说明 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | type-O.css 链接 + 第 15 个样式卡片 + 厂商/胶片编辑区 + 版本号 v1.17 |
| `src/renderer/js/app.js` | films.json 加载 + 胶片级联 + type-o 分支 + 厂商/机型不读 EXIF |
| `src/renderer/js/styles/index.js` | 注册 Type O |
| `src/renderer/js/exporter.js` | 注册 Type O 导出 |
| `src/renderer/js/thumbnail-selector.js` | Type O 静态样本回退 |
| `README.md` | 版本号 + 样式数量 14→15 + 文档链接 |
| `CHANGELOG.md` | 添加 v1.17 条目 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.17-nas.tar`（待构建） |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 15 种（Type A ~ Type O） |
| **样本图片** | 178 个 |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.17-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.17-NAS_CHANGES.md](./V1.17-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志

# OneFrame NAS Edition v1.07 Release

**发布日期**：2026-06-28

---

## 🎉 新功能

### Type I 极简叠加文字样式（同步自原始项目 v1.0.7）

新增第九种边框样式，最大化照片展示面积，仅保留品牌 Logo 和署名：

- **Logo**：顶部居中显示（白色）
- **底部**：仅显示署名（默认 "OneFrame"，可自定义）
- 照片 100% 填满画布，无额外白色边框
- 纵向图片时底部字号自动增大 50%
- 文字颜色支持黑/灰/白选择

### Type J 署名+三栏参数行样式（同步自原始项目 v1.0.7）

新增第十种边框样式，不显示 Logo，署名替代 Logo 位置：

- **署名**：底部第一行（与参数同字号，居中显示）
- **参数行**：三栏布局（左机型/中参数/右时间）
- 机型名称自动包含厂商前缀（如 "Sony A7M4"）
- 纵向图片时底部字号自动增大 50%
- 导出使用底部锚定定位，与预览一致

### 文字颜色选择功能扩展

Type I 和 Type J 均支持文字颜色选择（黑/灰/白），与 Type H 共用 `#textColorSection`。

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-i.css` | Type I 样式定义 |
| `src/renderer/js/styles/type-i-preview.js` | Type I 预览模块 |
| `src/renderer/js/styles/type-i-export.js` | Type I 导出模块 |
| `src/renderer/js/components/type-i-editor-panel.js` | Type I 编辑面板配置 |
| `src/renderer/css/type-j.css` | Type J 样式定义 |
| `src/renderer/js/styles/type-j-preview.js` | Type J 预览模块 |
| `src/renderer/js/styles/type-j-export.js` | Type J 导出模块 |
| `src/renderer/js/components/type-j-editor-panel.js` | Type J 编辑面板配置 |
| `src/renderer/TypeI-sample_compressed.jpeg` | Type I 首页缩略图 |
| `src/renderer/TypeJ-sample_compressed.jpeg` | Type J 首页缩略图 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | 添加 type-i/j.css 链接、Type I/J 卡片、版本号 v1.07 |
| `src/renderer/js/styles/index.js` | 注册 typeIPreview/typeIExport 和 typeJPreview/typeJExport |
| `src/renderer/js/app.js` | 添加 Type I/J 完整入口 + Type J 品牌名逻辑 |
| `src/renderer/js/exporter.js` | 注册 typeIExport/typeJExport |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.07-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **重启策略** | `unless-stopped` |
| **支持样式** | 10 种（Type A/B/C/D/E/F/G/H/I/J） |

### 使用方法

```bash
# 方式一：Docker Compose
git clone https://github.com/IceyVanci/OneFrame-nas.git
cd OneFrame-nas
docker compose up --build -d

# 方式二：预编译镜像
docker load -i oneframe-web-v1.07-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.07-NAS_CHANGES.md](./V1.07-NAS_CHANGES.md) - 详细变更说明
- [V1.06-NAS_CHANGES.md](./V1.06-NAS_CHANGES.md) - v1.06 变更说明（Type H）
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
- [原始项目](https://github.com/IceyVanci/OneFrame) - OneFrame Electron 版
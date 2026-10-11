# OneFrame NAS Edition v1.06 Release

**发布日期**：2026-06-23

---

## 🎉 新功能

### Type H 全画幅叠加文字样式（同步自原始项目 v1.0.6）

新增第八种边框样式，照片 100% 填满画布，Logo 和文字叠加在照片底部：

- **第一行**：厂商 Logo（居中显示，白色）
- **第二行**：`拍摄日期 | 拍摄参数 | 相机名称`（竖线分隔）
- **第三行**：署名（可选）
- 画布 = 图片原始大小，无额外白色边框区域
- 照片 100%×100% 填满画布（object-fit: cover）
- 纵向图片不做任何调整（与 Type F/G 不同）

### 文字颜色选择功能（Type H 专属）

Type H 文字叠加在照片上，白色文字在浅色照片上可能看不清，因此新增文字颜色选择器：

- 支持黑/灰/白三种文字颜色
- 仅 Type H 样式显示文字颜色选择器，其他样式不受影响
- 选择后预览实时更新，导出与预览一致

---

## 🐛 Bug 修复

### 修复文字颜色切换预览不更新

- 修复 `.color-preset` 事件处理器选择器过于宽泛导致文字颜色按钮被边框颜色处理器拦截的问题
- 选择器从 `.color-preset` 改为 `.color-preset[data-color]`，与原始项目一致

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-h.css` | Type H 样式定义 |
| `src/renderer/js/styles/type-h-preview.js` | Type H 预览模块 |
| `src/renderer/js/styles/type-h-export.js` | Type H 导出模块 |
| `src/renderer/js/components/type-h-editor-panel.js` | Type H 编辑面板配置 |
| `src/renderer/TypeH-sample_compressed.jpeg` | Type H 首页缩略图 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | 添加 type-h.css 链接、Type H 卡片、textColorSection、版本号 v1.06 |
| `src/renderer/js/styles/index.js` | 注册 typeHPreview 和 typeHExport |
| `src/renderer/js/app.js` | 添加 Type H 完整入口 + textColor 传递 + 事件修复 |
| `src/renderer/js/exporter.js` | 注册 typeHExport |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.06-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **重启策略** | `unless-stopped` |

### 使用方法

```bash
# 方式一：Docker Compose
git clone https://github.com/IceyVanci/OneFrame-nas.git
cd OneFrame-nas
docker compose up --build -d

# 方式二：预编译镜像
docker load -i oneframe-web-v1.06-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.06-NAS_CHANGES.md](./V1.06-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
- [原始项目](https://github.com/IceyVanci/OneFrame) - OneFrame Electron 版
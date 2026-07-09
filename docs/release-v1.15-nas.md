# OneFrame NAS Edition v1.15 Release

**发布日期**：2026-07-09

---

## 🎉 新功能

### Type N 样式 — 上下对称边框
- 基于 Type G 演变的上下对称边框布局
- 顶部 7.5% 白色边框（Logo 居中）+ 中部 85% 照片区（12px 圆角）+ 底部 7.5% 文字区
- 纵向图片自适应：顶部 3.75% + 中部 92.5% + 底部 3.75%
- 混合字重参数行：标签（Aperture/Focal/Shutter/ISO）使用 MiSans Medium（500），数值使用 MiSans Normal（400）
- 参数格式：`Aperture f/1.8  Focal 50mm  Shutter 1/100s  ISO 100`
- 署名固定在参数行下方，不影响参数位置
- 编辑面板隐藏：边框颜色、边框高度、比例设置、设备型号、时间设置
- 编辑面板保留：Logo 选择、拍摄参数、署名文字

### Type N 样本图片
- 新增 10 张 Type N 样本图片（压缩至 34-98KB）

---

## 🔧 Bug 修复

### Type N 导出署名位置修复
- 修复导出图片中署名文字跑到边框外面的问题
- 参数行+署名两行整体在底部文字区域垂直居中

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-N.css` | Type N CSS 样式（上下对称边框、混合字重） |
| `src/renderer/js/styles/type-N-preview.js` | 预览模块（顶部 Logo + 底部参数+署名） |
| `src/renderer/js/styles/type-N-export.js` | 导出渲染模块（Canvas 逐段绘制混合字重） |
| `src/renderer/js/components/type-N-editor-panel.js` | 编辑面板配置 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | 添加 type-N.css 链接 + 第 14 个样式卡片 + 版本号 v1.15 |
| `src/renderer/js/styles/index.js` | 注册 Type N 预览和导出模块 |
| `src/renderer/js/exporter.js` | 注册 Type N 导出样式 |
| `src/renderer/js/app.js` | 添加 Type N 分支逻辑 |
| `README.md` | 版本号 + 样式数量 13→14 + 相关文档链接 |
| `CHANGELOG.md` | 添加 v1.15 条目 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.15-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 14 种（Type A ~ Type N） |
| **样本图片** | 177 个 |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.15-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.15-NAS_CHANGES.md](./V1.15-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
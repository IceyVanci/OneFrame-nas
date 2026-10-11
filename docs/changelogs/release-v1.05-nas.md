# OneFrame NAS Edition v1.05 Release

**发布日期**：2026-06-19

---

## 🎉 新功能

### Type G 画中画样式（同步自原始项目 v1.0.5）

新增第七种边框样式，白色背景画中画风格：

- **第一行**：厂商 Logo（居中显示）
- **第二行**：`拍摄日期 | 拍摄参数 | 相机名称`（竖线分隔，全部黑色）
- **第三行**：署名（可选）
- 支持纵向图片自适应（白色区域减半，照片区域增大到 90%）
- Logo 大小规则：横向图片 2.5% 画布高度，纵向图片 1.25%
- 编辑面板：隐藏所有显示开关（所有元素默认显示），保留 Logo 选择区域
- 机型名称只显示型号（不带品牌前缀）

### Type F 纵向图片自适应

- 纵向图片（高度 > 宽度）时，顶部/底部白色区域减半
- 照片区域从 80% 增大到 90%

### Type E 预览文字缩放

- CSS font-size 从 px 改为 em 单位，文字随画布大小自动缩放
- 预览端基准字号：`24 × squareSize / 480`
- 导出端缩放基准固定为 480px，确保预览和导出一致

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-g.css` | Type G 样式定义 |
| `src/renderer/js/styles/type-g-preview.js` | Type G 预览模块 |
| `src/renderer/js/styles/type-g-export.js` | Type G 导出模块 |
| `src/renderer/js/components/type-g-editor-panel.js` | Type G 编辑面板配置 |
| `src/renderer/TypeG-sample_compressed.jpeg` | Type G 首页缩略图 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | 添加 type-g.css 链接、Type G 卡片、版本号更新为 v1.05 |
| `src/renderer/js/app.js` | 添加 configureTypeG 导入、Type G 的 showEditor/updateBorder 分支 |
| `src/renderer/js/styles/index.js` | 注册 typeGPreview 和 typeGExport |
| `src/renderer/js/exporter.js` | 注册 typeGExport 到导出映射 |
| `src/renderer/css/type-e.css` | font-size 从 px 改为 em |
| `src/renderer/js/styles/type-e-preview.js` | 动态基准字号、Logo 加载读取动态字号 |
| `src/renderer/js/styles/type-e-export.js` | 缩放基准从 previewSquareSize 改为固定 480 |
| `src/renderer/js/styles/type-f-preview.js` | calcSize/updatePreview 纵向图片自适应 |
| `src/renderer/js/styles/type-f-export.js` | renderImage/drawBorderContent 纵向图片自适应 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.05-nas.tar` |
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
docker load -i oneframe-web-v1.05-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.05-NAS_CHANGES.md](./V1.05-NAS_CHANGES.md) - 详细变更说明
- [function_analysis.md](./function_analysis.md) - 函数分析文档
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
- [原始项目](https://github.com/IceyVanci/OneFrame) - OneFrame Electron 版
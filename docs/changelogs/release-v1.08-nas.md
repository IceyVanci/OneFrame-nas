# OneFrame NAS Edition v1.08 Release

**发布日期**：2026-06-29

---

## 🎉 新功能

### Type J 编辑面板改进
- 设备型号输入框现在可见，方便手动修改机型名称
- 输入框 placeholder 改为"型号（如 Sony A7M4）"

### Type K 左下角 Logo + 双行文字样式（同步自原始项目 v1.0.8）

新增第十一种边框样式，Logo 在底部左下角，右侧显示两行文字：

- **Logo**：底部左下角显示
- **第一行**：署名（medium 字重）+ 日期（normal）
- **第二行**：机型名称（medium）+ 拍摄参数（normal）
- 照片 100% 填满画布，纵向图片字号增大 50%
- 编辑面板：显示 Logo 选择、署名、文字颜色

### Type L 高斯模糊背景样式（同步自原始项目 v1.0.8）

新增第十二种边框样式，将白色外框替换为照片的高斯模糊版本：

- **外框背景**：照片高斯模糊（替代 Type G 的白色背景）
- **照片区域**：清晰照片 92%×80% 居中
- **文字颜色**：默认白色，支持黑/灰/白选择
- **底部布局**：Logo 居中 + 日期|参数|机型 + 署名
- 纵向图片白色区域减半

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `css/type-k.css` | Type K 样式定义 |
| `styles/type-k-preview.js` | Type K 预览模块 |
| `styles/type-k-export.js` | Type K 导出模块 |
| `components/type-k-editor-panel.js` | Type K 编辑面板配置 |
| `css/type-l.css` | Type L 样式定义 |
| `styles/type-l-preview.js` | Type L 预览模块 |
| `styles/type-l-export.js` | Type L 导出模块 |
| `components/type-l-editor-panel.js` | Type L 编辑面板配置 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `index.html` | 添加 Type K/L 卡片和 CSS，版本号 v1.08 |
| `styles/index.js` | 注册 Type K/L |
| `app.js` | 添加 Type K/L 入口 |
| `exporter.js` | 注册 Type K/L 导出 |
| `components/type-j-editor-panel.js` | 显示设备型号输入框 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.08-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 12 种（Type A/B/C/D/E/F/G/H/I/J/K/L） |

### 使用方法

```bash
# 方式一：Docker Compose
docker compose up --build -d

# 方式二：预编译镜像
docker load -i oneframe-web-v1.08-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.08-NAS_CHANGES.md](./V1.08-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
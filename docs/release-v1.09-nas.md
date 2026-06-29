# OneFrame NAS Edition v1.09 Release

**发布日期**：2026-06-29

---

## 🎉 新功能

### 主界面图片墙重构
- 从单列纵向排列重构为 3 列瀑布流图片墙
- 移除参数/海报标签栏，所有 12 种样式同时显示
- 布局铺满窗口宽度，自适应屏幕

### Type K/L 编辑面板改进
- Type K 和 Type L 编辑面板现在显示设备型号输入框
- 输入框 placeholder 改为"型号（如 A7M4）"

### 文件名大写化
- 48 个样式文件名从小写改为大写（`type-a` → `type-A`）
- CSS 类名、data-style 属性、JS 样式 ID 保持小写不变
- 所有 import 路径同步更新

---

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `index.html` | 删除标签栏、CSS 路径大写化、修正预览图、版本号 v1.09 |
| `index.css` | Grid→Columns 瀑布流，移除宽度限制 |
| `app.js` | import 路径大写化，删除标签页筛选逻辑 |
| `styles/index.js` | import 路径大写化（24处） |
| `exporter.js` | import 路径大写化（12处） |
| `editor.js` | import 路径大写化（2处） |
| `type-K/L-editor-panel.js` | 显示设备型号输入框 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.09-nas.tar` |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 12 种（Type A-L） |

### 使用方法

```bash
docker compose up --build -d

# 或预编译镜像
docker load -i oneframe-web-v1.09-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.09-NAS_CHANGES.md](./V1.09-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志
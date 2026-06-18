# OneFrame NAS Edition Release 历史

---

## v1.04 (2026-06-19)

### Bug 修复
- 修复 Type F 预览缩放问题（双重缩放 + CSS 选择器意外匹配）

### 文档更新
- 更新版本号到 v1.04
- 为每个历史版本生成独立变更文档
- 创建 AI 项目认知指南
- 重写 CHANGELOG 和 release 文档

### 镜像信息
| 属性 | 值 |
|------|-----|
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **重启策略** | `unless-stopped` |

### 使用方法

```bash
# 方式一：Docker Compose
docker compose up --build -d

# 方式二：预编译镜像
docker load -i oneframe-web-v1.04-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## v1.03 (2026-06-18)

### 新功能
- 同步原始项目 v1.0.3：新增 Type F 画中画样式
- 新增 5 个文件（CSS、预览、导出、编辑面板、缩略图）
- 修改 6 个现有文件

---

## v1.01 (2026-06-16)

### 首次发布
- 从 Electron 桌面应用移植为 Docker Web 应用
- 移除 Electron 依赖，采用浏览器原生 API
- 本地化 CDN 资源
- 修复 8 个 Bug
- 镜像大小 ~42MB

---

## 相关链接

- [README](https://github.com/IceyVanci/OneFrame-nas/blob/main/README.md)
- [CHANGELOG](https://github.com/IceyVanci/OneFrame-nas/blob/main/CHANGELOG.md)
- [函数分析](https://github.com/IceyVanci/OneFrame-nas/blob/main/docs/function_analysis.md)
- [移植指南](https://github.com/IceyVanci/OneFrame-nas/blob/main/docs/migration-guide.md)
- [原始项目](https://github.com/IceyVanci/OneFrame)
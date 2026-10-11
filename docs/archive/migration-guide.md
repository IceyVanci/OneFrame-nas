# Electron → Docker 移植指南

> 本文档详细说明如何将 Electron 桌面应用移植为纯前端 Web 应用，通过 Docker 容器化部署在 NAS 上。以 OneFrame 项目为实例，提供通用的移植方法论和步骤参考。

---

## 概述

### 移植目标

将基于 Electron 的桌面应用迁移为：
- **纯前端 Web 应用**：移除 Electron 框架依赖，使用浏览器原生 API 替代
- **Docker 容器化**：使用 Nginx 静态服务器托管前端文件
- **NAS 部署**：局域网内设备通过浏览器访问

### 适用场景

- 原始应用的核心渲染逻辑运行在浏览器端（Canvas API、DOM 操作等）
- Electron 主进程仅提供文件选择/保存、系统信息读取等辅助功能
- 应用不依赖 Node.js 后端服务或数据库

### 不适用场景

- 应用依赖 Node.js 后端 API（如 Express 服务器）
- 需要访问本地文件系统（读写任意文件）
- 依赖 Electron 的 Native Module（如 node-pty、sqlite3）

---

## 移植流程

### 第一阶段：分析与规划

#### 1.1 分析原始项目结构

```bash
# 识别项目文件结构
Get-ChildItem -Recurse -Include "*.js","*.html","*.css" | Select-Object FullName

# 查找 Electron 相关代码
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "electron|electronAPI|ipcMain|ipcRenderer|BrowserWindow"

# 查找 Node.js 特有代码
Get-ChildItem -Recurse -Include "*.js" | Select-String -Pattern "require\(|fs\.|path\.|child_process|__dirname"
```

#### 1.2 分类代码模块

将代码分为三类：

| 类别 | 说明 | 处理方式 |
|------|------|---------|
| **纯前端代码** | HTML/CSS/JS，使用浏览器 API | 直接保留 |
| **Electron 专用代码** | 使用 `electronAPI`、`ipcMain` 等 | 替换为浏览器 API |
| **Node.js 代码** | 使用 `fs`、`path`、`child_process` 等 | 替换或删除 |

#### 1.3 识别 Electron API 使用点

常见的 Electron API 及其浏览器替代方案：

| Electron API | 用途 | 浏览器替代方案 |
|-------------|------|---------------|
| `dialog.showOpenDialog()` | 文件选择 | `<input type="file">` |
| `dialog.showSaveDialog()` | 文件保存 | `<a download>` |
| `fs.readFile()` | 读取文件 | `FileReader` API |
| `fs.writeFile()` | 写入文件 | `Blob` + `<a download>` |
| `nativeImage.createFromPath()` | 加载图片 | `URL.createObjectURL()` |
| `file://` 协议 | 本地文件访问 | `URL.createObjectURL()` |
| `ipcMain.handle()` / `ipcRenderer.invoke()` | IPC 通信 | 直接函数调用 |
| `process.env` | 环境变量 | 硬编码或配置文件 |

---

### 第二阶段：代码移植

#### 2.1 复制前端文件

```bash
# 创建工作目录
mkdir OneFrame-nas
cd OneFrame-nas

# 复制前端静态文件（排除 Electron 主进程）
# 只复制 src/renderer/ 目录
xcopy /E /I ..\OneFrame\src\renderer src\renderer
```

**注意**：只复制渲染进程文件，不复制 `src/main/`（Electron 主进程）。

#### 2.2 移除 Electron 依赖

搜索并移除所有 Electron 相关代码：

```javascript
// 搜索模式
const electronPatterns = [
  /window\.electronAPI/g,           // Electron API 检测
  /electronAPI\.\w+/g,              // Electron API 调用
  /ipcMain\.handle/g,               // IPC 主进程
  /ipcRenderer\.invoke/g,           // IPC 渲染进程
  /require\(['"]electron['"]\)/g,   // Electron 模块导入
  /file:\/\//g,                     // file:// 协议
];
```

#### 2.3 替换文件选择功能

**原始代码（Electron）：**
```javascript
// Electron: 通过 IPC 调用主进程的文件选择对话框
const imagePath = await window.electronAPI.selectImage();
if (imagePath) {
  // 通过 file:// 协议加载图片
  img.src = `file://${imagePath}`;
}
```

**移植后（浏览器）：**
```javascript
// 浏览器: 使用原生 file input
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    // 使用 URL.createObjectURL 加载图片
    img.src = URL.createObjectURL(file);
  }
};
input.click();
```

#### 2.4 替换文件保存功能

**原始代码（Electron）：**
```javascript
// Electron: 通过 IPC 调用主进程的保存对话框
await window.electronAPI.saveBlob(blob, filename);
```

**移植后（浏览器）：**
```javascript
// 浏览器: 使用 <a download> 触发下载
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```

#### 2.5 替换文件读取功能

**原始代码（Electron）：**
```javascript
// Electron: 通过 IPC 读取文件二进制数据
const buffer = await window.electronAPI.readExifBinary(imagePath);
```

**移植后（浏览器）：**
```javascript
// 浏览器: 使用 FileReader API
function readFileAsArrayBuffer(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}
```

#### 2.6 替换图片路径加载

**原始代码（Electron）：**
```javascript
// Electron: 使用 file:// 协议
img.src = `file://${imagePath}`;
```

**移植后（浏览器）：**
```javascript
// 浏览器: 使用 URL.createObjectURL
img.src = URL.createObjectURL(file);
```

#### 2.7 清理残留变量

移除所有 Electron 环境特有的变量和逻辑分支：

```javascript
// 删除 Electron 专用变量
- let currentImagePath = null;  // Electron 路径变量

// 删除 Electron 分支代码
- if (window.electronAPI) {
-   const imagePath = await window.electronAPI.selectImage();
-   ...
- } else {
-   // 浏览器 fallback
- }
+
+ // 统一使用浏览器 API
+ const input = document.createElement('input');
+ ...
```

---

### 第三阶段：本地化外部资源

#### 3.1 识别 CDN 依赖

```html
<!-- 搜索外部资源引用 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/...">
<script src="https://cdn.jsdelivr.net/..."></script>
```

#### 3.2 下载到本地

```bash
# 创建资源目录
mkdir -p src/renderer/assets/font-awesome/css
mkdir -p src/renderer/assets/font-awesome/webfonts

# 下载 CSS
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" -OutFile "src/renderer/assets/font-awesome/css/all.min.css"

# 下载字体文件
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2" -OutFile "src/renderer/assets/font-awesome/webfonts/fa-solid-900.woff2"

# 下载 JS 库
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js" -OutFile "src/renderer/assets/opentype.min.js"
```

#### 3.3 更新引用路径

```html
<!-- 修复前 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js"></script>

<!-- 修复后 -->
<link rel="stylesheet" href="assets/font-awesome/css/all.min.css">
<script src="assets/opentype.min.js"></script>
```

---

### 第四阶段：Docker 化部署

#### 4.1 创建 Dockerfile

```dockerfile
# docker/Dockerfile
FROM nginx:alpine

# 复制前端静态文件
COPY src/renderer/ /usr/share/nginx/html/

# 复制 Nginx 配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### 4.2 创建 Nginx 配置

```nginx
# docker/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # gzip 压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
    gzip_min_length 256;
    gzip_vary on;

    # 字体文件 CORS 头
    location ~* \.(ttf|woff2?|eot|otf)$ {
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 静态资源缓存
    location ~* \.(css|js)$ {
        add_header Cache-Control "public, max-age=3600";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 4.3 创建 docker-compose.yml

```yaml
# docker-compose.yml
services:
  oneframe:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: oneframe-web
    ports:
      - "8888:80"
    restart: unless-stopped
```

#### 4.4 创建 .dockerignore

```
# .dockerignore
node_modules
.git
src/main
package.json
README.md
implementation_plan.md
docs
docker/.dockerignore
*.tgz
*.md
src/renderer/assets/package
```

**关键**：排除 Electron 主进程（`src/main`）、文档文件、依赖源码等不必要的文件，减小镜像体积。

#### 4.5 构建并测试

```bash
# 构建镜像
docker compose up --build -d

# 查看日志
docker compose logs -f

# 访问测试
# http://localhost:8888
```

---

## 常见问题与解决方案

### Q1: `file://` 协议在浏览器中不可用

**问题**：代码中使用 `file://` 协议加载本地文件。

**解决**：统一使用 `URL.createObjectURL(file)` 替代。

```javascript
// 修复前
img.src = `file://${imagePath}`;

// 修复后
img.src = URL.createObjectURL(file);
```

### Q2: CDN 资源在 NAS 离线环境无法加载

**问题**：NAS 容器可能无法访问外网 CDN。

**解决**：下载所有外部资源到本地 `assets/` 目录，修改引用路径。

### Q3: 样式类名累积导致样式混乱

**问题**：切换样式时，旧样式的 CSS 类名未被清理。

**解决**：在 `updateFrameWrapper()` 中统一清理所有类型类名。

```javascript
// 修复后
function updateFrameWrapper(frameWrapper) {
  frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
  frameWrapper.classList.add('type-a');  // 添加当前类型
}
```

### Q4: EXIF 日期格式不匹配

**问题**：EXIF 读取库已格式化日期，但正则仍匹配原始格式。

**解决**：确认 EXIF 库的输出格式，调整正则表达式。

### Q5: Docker 镜像体积过大

**问题**：包含了不必要的源码和依赖。

**解决**：使用 `.dockerignore` 排除不必要的文件。

### Q6: 浏览器模式下导出功能不工作

**问题**：导出逻辑依赖 Electron 的文件保存对话框。

**解决**：使用 `<a download>` 触发浏览器下载。

---

## 移植检查清单

### 代码层面

- [ ] 搜索并移除所有 `window.electronAPI` 引用
- [ ] 搜索并移除所有 `file://` 协议使用
- [ ] 替换文件选择功能为 `<input type="file">`
- [ ] 替换文件保存功能为 `<a download>`
- [ ] 替换文件读取功能为 `FileReader` API
- [ ] 删除 Electron 专用变量和函数
- [ ] 清理 `require('electron')` 导入
- [ ] 验证所有功能在浏览器中正常工作

### 资源层面

- [ ] 识别所有 CDN 外部资源
- [ ] 下载到本地 `assets/` 目录
- [ ] 更新 HTML 引用路径
- [ ] 验证离线环境可用

### Docker 层面

- [ ] 创建 `Dockerfile`（基于 nginx:alpine）
- [ ] 创建 `nginx.conf`（gzip、CORS、缓存、SPA fallback）
- [ ] 创建 `docker-compose.yml`（端口映射、重启策略）
- [ ] 创建 `.dockerignore`（排除不必要的文件）
- [ ] 构建并测试镜像
- [ ] 验证局域网访问

### 文档层面

- [ ] 更新 README.md（部署方式、使用说明）
- [ ] 创建 CHANGELOG.md（版本历史）
- [ ] 创建函数分析文档
- [ ] 记录已知问题和解决方案

---

## OneFrame 移植实例

### 原始项目

- **仓库**：[OneFrame](https://github.com/IceyVanci/OneFrame)
- **技术栈**：Electron 28 + 原生 HTML/CSS/JS
- **打包**：electron-builder，生成 Windows 便携版 exe

### 移植后

- **仓库**：OneFrame-nas
- **技术栈**：Nginx + Docker + 原生 HTML/CSS/JS
- **部署**：Docker Compose，一行命令启动
- **访问**：`http://<NAS-IP>:8888`

### 移植统计

| 项目 | 数量 |
|------|------|
| 修改的 JS 文件 | 8 个 |
| 新增的配置文件 | 6 个 |
| 修复的 Bug | 13 个 |
| 移除的 Electron API 调用 | 5 处 |
| 本地化的 CDN 资源 | 2 个（Font Awesome、opentype.js） |
| Docker 镜像大小 | ~42MB |

---

## 参考资源

- [Electron 官方文档](https://www.electronjs.org/docs)
- [MDN Web API](https://developer.mozilla.org/zh-CN/docs/Web/API)
- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 配置指南](https://nginx.org/en/docs/)
# OneFrame 移植到 Docker-NAS — 待修复问题与改进文档

> 文档编写日期：2026-06-16
> 对应仓库：`F:\OneFrame-nas`
> 原始仓库：`F:\OneFrame`（基于 Electron 的桌面应用）
> 移植目标：纯前端 Web 应用，运行于 Debian + Docker 的 NAS 环境

---

## 概述

本仓库是 OneFrame（图片水印/边框工具）从 Electron 桌面应用移植到 Web 应用的产物。移植采用方案 A（纯前端 + Nginx 静态服务器），但在代码审查后发现了 **6 个遗留问题**，按严重程度分为 P0~P2 三个等级。其中 P0 为功能阻断级，P1 为可靠性/性能级，P2 为代码整洁级。

---

## 问题清单

### P0: `file://` 协议在浏览器中不可用

| 属性 | 值 |
|------|-----|
| **文件** | `src/renderer/js/app.js` |
| **行号** | 29 |
| **代码** | `img.src = typeof fileOrPath === 'string' ? \`file://${fileOrPath}\` : URL.createObjectURL(fileOrPath);` |
| **问题** | 浏览器安全策略禁止 `file://` 协议，仅 Electron 可用 |
| **严重性** | ⛔ 功能阻断 |

#### 根因分析

`checkImageOrientation()` 函数接受 `File` 对象或字符串路径两种参数。在 Electron 中，字符串路径通过 `file://` 协议加载；但在纯 Web 浏览器中，`file://` 被沙箱机制阻止，无法加载本地文件。

不过实际调用时，该函数仅从 `loadImageWithExif()` 传入 `File` 对象，字符串路径分支从未被触发。

#### 修复方案

1. 删除字符串路径分支，统一使用 `URL.createObjectURL()`
2. 如果未来需要支持通过字符串路径加载外部图片，应采用 `fetch()` 或服务端代理

```javascript
// 修复前
img.src = typeof fileOrPath === 'string' ? `file://${fileOrPath}` : URL.createObjectURL(fileOrPath);

// 修复后
img.src = URL.createObjectURL(fileOrPath);
```

---

### P1: CDN 外部资源依赖

| 属性 | 值 |
|------|-----|
| **文件** | `src/renderer/index.html` |
| **行号** | 11, 12 |
| **代码** | `<link>` 和 `<script>` 引用 `cdnjs.cloudflare.com` |
| **问题** | NAS 容器可能无法访问外网 CDN 资源 |
| **严重性** | ⚠️ 可靠性 |

#### 依赖项详情

```html
<!-- 第 11 行 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<!-- 第 12 行 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js"></script>
```

| 依赖 | 用途 | 替代方案 |
|------|------|----------|
| **Font Awesome 6.5.1** | 工具栏图标（保存、导出、编辑等） | 下载到 `assets/font-awesome/` 本地引用 |
| **opentype.js 1.3.4** | 未在代码中找到直接使用（可能是预览功能预留） | 下载到 `assets/opentype.js` 本地引用 |

#### 修复方案

1. 下载 Font Awesome 到 `src/renderer/assets/font-awesome/`
2. 下载 opentype.js 到 `src/renderer/assets/opentype/`
3. 修改 `index.html` 引用本地路径
4. 更新 `.dockerignore` 确保不排除这些静态资源

---

### P1: Docker 镜像体积优化

| 属性 | 值 |
|------|-----|
| **文件** | `docker/.dockerignore` |
| **问题** | 未排除 `assets/package/` 目录（exifreader 源码），增加不必要的镜像体积 |
| **严重性** | ⚠️ 镜像体积 |

#### 原因

`src/renderer/assets/package/` 是 exifreader NPM 包的完整源码目录，包含 TypeScript 源文件、构建脚本、测试等。但在运行时，只有 `dist/exif-reader.js` 和 `exifreader.js` 被使用。Docker 镜像中包含了约 2MB 的无关文件。

#### 修复方案

在 `docker/.dockerignore` 中添加排除规则：

```
src/renderer/assets/package/src
src/renderer/assets/package/bin
src/renderer/assets/package/babel.config.json
src/renderer/assets/package/package.json
src/renderer/assets/package/README.md
src/renderer/assets/package/webpack.config.js
src/renderer/assets/package/LICENSE
src/renderer/assets/package/.eslintrc.json
src/renderer/assets/package/*.tgz
```

或者直接排除整个 package 目录（仅保留编译产物）：

```
src/renderer/assets/package*
!src/renderer/assets/package/dist
```

---

### P2: Electron 残留变量

| 属性 | 值 |
|------|-----|
| **文件** | `src/renderer/js/app.js` |
| **行号** | 9, 148, 243, 457 |
| **问题** | `currentImagePath` 是 Electron 环境下保存图片路径用的，Web 环境中已无意义 |
| **严重性** | 🔧 代码整洁 |

#### 影响范围

| 行号 | 代码 | 说明 |
|------|------|------|
| 9 | `let currentImagePath = null;` | 变量声明，Web 环境不需要 |
| 148 | `currentImagePath = null;` | 初始化时赋值 |
| 243 | `currentImagePath = null;` | 重置时赋值 |
| 457 | `imagePath: currentImagePath,` | 传给导出函数，始终为 null |

#### 修复方案

1. 删除第 9 行的变量声明
2. 删除第 148 行和第 243 行的赋值
3. 第 457 行的 `imagePath: currentImagePath` 改为 `imagePath: null`

---

### P2: `.dockerignore` 文件不一致

| 属性 | 值 |
|------|-----|
| **文件** | `.dockerignore` 和 `docker/.dockerignore` |
| **问题** | 两个文件内容不同步，`docker/.dockerignore` 缺少关键排除规则 |
| **严重性** | 🔧 配置维护 |

#### 当前差异对比

| 规则 | `.dockerignore` | `docker/.dockerignore` |
|------|:---:|:---:|
| `node_modules` | ✅ | ✅ |
| `.git` | ✅ | ✅ |
| `src/main` | ✅ | ✅ |
| `package.json` | ✅ | ✅ |
| `README.md` | ✅ | ✅ |
| `implementation_plan.md` | ✅ | ❌ |
| `src/renderer/assets/package` | ✅ | ❌ |
| `docker/.dockerignore` | ✅ | ❌ |
| `*.tgz` | ✅ | ❌ |

#### 修复方案

将 `docker/.dockerignore` 内容同步为 `.dockerignore` 的内容（保持完全一致）。

---

### P2: 过时注释

| 属性 | 值 |
|------|-----|
| **文件** | `src/renderer/js/exporter.js` |
| **行号** | 63 |
| **代码** | `@param {string} options.imagePath - 图片路径（Electron 环境）` |
| **问题** | Electron 不再使用，注释产生误导 |
| **严重性** | 🔧 代码文档 |

#### 修复方案

```javascript
// 修复前
@param {string} options.imagePath - 图片路径（Electron 环境）

// 修复后
@param {string|null} options.imagePath - 图片路径（当前未使用，保留接口兼容性）
```

---

## 改进优先级总结

| 优先级 | 问题 | 预估工作量 | 影响 |
|--------|------|-----------|------|
| **P0** | `file://` 协议 | 5 分钟 | 功能阻断 |
| **P1** | CDN 外部依赖 | 15 分钟 | 离线可用性 |
| **P1** | Docker 镜像体积 | 5 分钟 | 容器大小 |
| **P2** | Electron 残留变量 | 5 分钟 | 代码质量 |
| **P2** | `.dockerignore` 不一致 | 3 分钟 | 配置维护 |
| **P2** | 过时注释 | 2 分钟 | 文档质量 |

---

## 当前移植状态

将原始 Electron 项目移植到 Docker-NAS 的核心工作（架构设计、前端代码改造、Docker 化部署）**已全部完成**。上述问题属于移植完成后的**增量修复**，非阻塞性问题。

### 已完成的工作

- [x] 分析原始项目结构
- [x] 确定移植方案（方案 A：纯前端 + Nginx 静态服务器）
- [x] 创建实施计划文档（`implementation_plan.md`）
- [x] 移除 Electron 依赖（`app.js` 5 处改动）
- [x] 创建 Docker 部署文件（`Dockerfile`, `nginx.conf`, `docker-compose.yml`）
- [x] 复制前端文件到 `f:\OneFrame-nas`

### 已完成的修复

- [x] P0: 修复 `file://` 协议 — 统一使用 `URL.createObjectURL()`
- [x] P0: 修复拍摄时间正则 — 匹配 `YYYY-MM-DD` 格式
- [x] P0: 修复样式类名累积 — 所有 preview 模块 `updateFrameWrapper()` 和 `reset()` 完整清理
- [x] P1: 本地化 CDN 资源 — Font Awesome 和 opentype.js 已下载到 `assets/` 目录
- [x] P1: 焦距显示缺失 mm — type-a/c/d-preview.js 已统一追加 mm 单位
- [x] P1: Logo 加载失败隐藏 — `initLogoGrid()` 添加 `onerror` 隐藏无 SVG 的 Logo
- [x] P1: 海报样式画布修复 — 类名管理统一后自动修复
- [x] P1: 优化 Docker 镜像 — `.dockerignore` 排除 exifreader 源码
- [x] P2: 清理 Electron 残留变量 — 删除 `currentImagePath`
- [x] P2: 统一 `.dockerignore` — 两个文件内容同步
- [x] P2: 更新过时注释 — `exporter.js` JSDoc 已更新

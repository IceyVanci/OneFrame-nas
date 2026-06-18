# OneFrame NAS Edition AI 项目认知指南

> 本文档旨在帮助 AI 工具快速理解 OneFrame NAS 版本的架构、功能和代码组织方式。

---

## 项目概述

**OneFrame NAS Edition** 是 OneFrame 的 Docker/NAS 移植版本。将原始 Electron 桌面应用迁移为纯前端 Web 应用，通过 Docker 容器化部署在 NAS 上，局域网内设备可通过浏览器访问。

### 核心特性
- 智能 EXIF 读取：自动识别相机厂商并显示对应 Logo
- 多种边框样式：支持 Type A/B/C/D/E/F 六种样式
- EXIF 保留：导出时自动保留原图 EXIF 信息
- 纯前端：零构建方案，无需 Node.js

### 技术栈
| 模块 | 技术方案 | 说明 |
|------|----------|------|
| 运行环境 | Nginx + Docker | 纯前端 Web 应用 |
| 前端 | 原生 HTML/CSS/JS | 无需构建工具 |
| 图片预览 | CSS 渲染 | 实时预览边框效果 |
| EXIF 读取 | exifreader | 浏览器端读取 EXIF（本地加载） |
| EXIF 写入 | piexifjs | 导出时保留 EXIF（本地加载） |
| 字体渲染 | opentype.js | Canvas 精确字体（本地加载） |
| 图标库 | Font Awesome | 工具栏图标（本地加载） |

---

## 文件结构

```
OneFrame-nas/
├── docker/
│   ├── Dockerfile              # nginx:alpine 镜像定义
│   └── nginx.conf              # CORS、gzip、SPA fallback
├── docker-compose.yml          # 服务定义、端口映射
├── .dockerignore               # Docker 构建排除规则
├── .gitignore                  # Git 忽略规则
├── README.md                   # 项目文档
├── CHANGELOG.md                # 更新日志
├── docs/
│   ├── AI_PROJECT_GUIDE.md     # 本文档
│   ├── CHANGELOG.md            # 更新日志
│   ├── V1.00-NAS_CHANGES.md    # 初始移植说明
│   ├── V1.01-NAS_CHANGES.md    # v1.01 版本说明
│   ├── V1.03-NAS_CHANGES.md    # Type F 同步说明
│   ├── V1.04_CHANGES.md        # Type F 缩放修复说明
│   ├── release-v1.01-nas.md    # Release 历史
│   ├── function_analysis.md    # 函数分析文档
│   ├── migration-guide.md      # Electron→Docker 移植指南
│   └── pending-issues-and-improvements.md
└── src/
    └── renderer/
        ├── index.html           # 主页面（首页 + 编辑器）
        ├── index.css            # 全局样式
        ├── css/
        │   ├── type-a.css       # Type A：白色下边框
        │   ├── type-b.css       # Type B：黑色下边框
        │   ├── type-c.css       # Type C：横向布局
        │   ├── type-d.css       # Type D：横向居中
        │   ├── type-e.css       # Type E：3:2纵向
        │   └── type-f.css       # Type F：画中画风格
        ├── js/
        │   ├── app.js           # 主逻辑入口（浏览器模式）
        │   ├── exif.js          # EXIF 读取
        │   ├── exif-exporter.js # EXIF 导出
        │   ├── exporter.js      # 图片导出
        │   ├── logo-utils.js    # Logo 工具函数
        │   ├── components/
        │   │   └── type-*-editor-panel.js
        │   └── styles/
        │       ├── index.js     # 样式注册表
        │       ├── type-*-preview.js
        │       └── type-*-export.js
        ├── logos/               # 相机厂商 Logo（SVG）
        ├── fonts/               # 字体文件（MiSans）
        └── assets/
            ├── piexif.js        # EXIF 处理库
            ├── exifreader.js    # EXIF 读取库
            ├── opentype.min.js  # 字体渲染库
            └── font-awesome/    # 图标库
```

---

## 样式系统

### Type A - 白色下边框
- **特点**：可调节边框高度（5%-30%），完整编辑面板
- **布局**：图片 + 底部白色边框
- **适用**：通用照片

### Type B - 黑色下边框
- **特点**：固定边框比例，简化编辑面板
- **布局**：图片 + 底部黑色边框
- **适用**：纵向图片（自动检测）

### Type C - 横向布局
- **特点**：Logo 在左侧，参数在右侧
- **布局**：横向边框，Logo + 参数分区显示

### Type D - 横向居中
- **特点**：Logo 居中，左侧时间+署名，右侧机型+参数
- **布局**：横向边框，复杂布局

### Type E - 3:2 纵向
- **特点**：顶部 1:1 正方形图片，底部白色区域显示参数
- **布局**：
  ```
  ┌────────────────────┐
  │                    │
  │   1:1 正方形图片    │  ← 可拖动裁剪区域
  │   (可拖动选择)      │
  │                    │
  ├────────────────────┤
  │ March      f/2.8   │  ← 底部白色区域
  │ 2024    50mm 1/125│
  │          ISO 400   │
  │ [Logo]    Model    │
  └────────────────────┘
  ```
- **特殊功能**：图片可拖动选择裁剪区域

### Type F - 画中画风格
- **特点**：上方白色留白 + 中部照片展示区 + 下方文字信息区
- **布局**：画布宽度 = 图片宽度，画布高度 = 图片高度 / 0.8
- **照片区域**：92% 宽度 × 80% 高度，顶部 5% 留白
- **文字区域**：底部 15%，使用绝对定位
- **字号**：动态缩放（基准 900px 宽度对应 14px）
- **窗口缩放**：每次 resize 动态计算显示尺寸，所有元素等比缩放
- **编辑面板**：隐藏边框颜色/高度/比例/Logo，设备型号自动包含品牌名

---

## 模块职责

### 1. styles/index.js - 样式注册表
```javascript
export const styles = {
  'type-a': { preview, export },
  'type-b': { preview, export },
  // ... type-c, type-d, type-e, type-f
};
```

### 2. app.js - 主逻辑
浏览器模式下的主逻辑：
- 图片导入（`<input type="file">`）
- 样式切换（Type B/E/F 走独立路径）
- 预览更新（`updateBorder()`）
- 导出处理（`<a download>`）
- 表单管理

### 3. exif.js - EXIF 读取
使用 exifreader 读取图片 EXIF：
- `getExif(file)` - 获取全部 EXIF
- `getMakeName(make)` - 标准化厂商名
- `getFocalLength(exif)` - 获取焦距
- `formatDateTime(dateStr)` - 格式化日期

### 4. exif-exporter.js - EXIF 导出
使用 piexifjs 处理 EXIF：
- `readExifFromFile(file)` - 读取 EXIF
- `embedExif(dataUrl, exif)` - 嵌入 EXIF
- `hasExifData(exifObj)` - 检查 EXIF 数据

### 5. exporter.js - 导出逻辑
通用导出逻辑，调用对应样式的导出模块：
- `exportImage(img, options)` - 创建 Canvas → 绘制 → 嵌入 EXIF → Blob

### 6. logo-utils.js - Logo 工具
- `logoList` - 24 家厂商列表（实际有 SVG 的 19 家）
- `getAllLogos()` - 获取所有 Logo
- `getMakeName(make)` - 厂商名标准化
- `getModelName(model)` - 格式化型号

---

## 数据流

### 图片导入流程（浏览器模式）
```
用户选择图片（<input type="file">）
    ↓
loadImageWithExif(file)
    ↓
URL.createObjectURL(file) → 显示图片
    ↓
getExif(file) → 解析 EXIF
    ↓
updateExifDisplay → 自动填充表单 + 选择 Logo
```

### 导出流程（浏览器模式）
```
用户点击导出
    ↓
exportImageHandler → 收集设置
    ↓
exportImage → 获取导出模块
    ↓
renderImage → Canvas 绘制
    ↓
readExifFromFile + embedExif → 嵌入 EXIF
    ↓
dataURLtoBlob → <a download> 浏览器下载
```

---

## EXIF 双轨机制

### 显示用 EXIF
- 模块：`exif.js`
- 库：`exifreader`（本地加载）
- 用途：读取图片信息，填充表单

### 导出用 EXIF
- 模块：`exif-exporter.js`
- 库：`piexifjs`（本地加载）
- 用途：将 EXIF 嵌入导出的图片

---

## 开发命令

```bash
# 本地开发测试
npx serve src/renderer
# 或
python -m http.server 3000 -d src/renderer

# Docker 构建
docker compose up --build -d

# 查看日志
docker compose logs -f
```

---

## 添加新样式的步骤

1. **创建 CSS**：`src/renderer/css/type-x.css`
2. **创建预览模块**：`src/renderer/js/styles/type-x-preview.js`
3. **创建导出模块**：`src/renderer/js/styles/type-x-export.js`
4. **创建面板配置**：`src/renderer/js/components/type-x-editor-panel.js`
5. **注册样式**：`src/renderer/js/styles/index.js`
6. **添加卡片**：`src/renderer/index.html`
7. **修改 app.js**：添加 updateBorder/showEditor/hideEditor 分支

---

## 与原始项目的差异

| 项目 | Electron 版 | NAS/Web 版 |
|------|------------|------------|
| 主进程 | `main.js` + `preload.js` | 无（移除） |
| 文件选择 | `electronAPI.selectImage()` | `<input type="file">` |
| 文件保存 | `electronAPI.saveBlob()` | `<a download>` |
| 图片加载 | `file://` 协议 | `URL.createObjectURL()` |
| Logo 加载 | `electronAPI.getLogos()` | 静态 `getAllLogos()` |
| EXIF 读取 | `electronAPI.readExifBinary()` | `FileReader` + `piexif` |
| 外部资源 | CDN 加载 | 本地 `assets/` 目录 |
| 部署方式 | electron-builder 打包 | Docker + Nginx |

---

## 重要常量

### Logo 列表（24 家，19 家有 SVG）
Apple, Canon, DJI, Fujifilm, Google, GoPro, Hasselblad, Huawei*, Insta360*, Leica, Lumix, Nikon, Nokia, Olympus, Oneplus, OPPO*, Pentax, Ricoh, Samsung*, Sigma, Sony, Vivo, Xiaomi, xuzhou*

*标注的为无 SVG 文件的品牌，通过 `img.onerror` 自动隐藏

### 默认边框高度
- Type A: 12%（可调 5%-30%）
- Type B: 固定比例
- Type F: 不适用（画布由图片决定）

### 支持的 EXIF 字段
- Make: 相机厂商
- Model: 相机型号
- DateTimeOriginal: 拍摄时间
- FNumber: 光圈值
- ExposureTime: 快门速度
- ISOSpeedRatings: ISO 感光度
- FocalLength/FocalLengthIn35mmFilm: 焦距
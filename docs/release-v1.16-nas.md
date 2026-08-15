# OneFrame NAS Edition v1.16 Release

**发布日期**：2026-08-15

> 本次为代码审查修复 + 性能重构版，不包含新边框样式。

---

## 🔧 Bug 修复

### 导出"显示开关"失效
- 修复关闭开关后导出仍输出对应内容的问题
- 署名开关：Type A/C/D（门控由 `showSignature` 改为 `signatureText`）、Type F/G/H/L（补 `showSignature !== false`）
- 时间开关：Type J/K/M（补 `settings.dateTime && settings.showTime`）
- Logo 开关：Type M（补 `settings.selectedLogo && settings.showLogo`）

### Type B 导出与预览布局不一致
- 导出图片绘制宽度对齐预览左侧 85% 区域，修复右侧文字区坍缩、文字溢出
- 清除死赋值 `logoY`

### Type E 预览与交互修复
- 拖动事件监听器重复注册（改为幂等注册），修复拖动位置跳变与内存泄漏
- 移除 `window.handleLogoLoad` 全局函数泄漏
- 非法日期不再抛 TypeError
- 参数/署名位置漂移：由 `document.fonts.ready + getBoundingClientRect` 一次性测量改为确定性对齐（`marginTop = 2.333 × baseFontSize`，与导出端一致）

### Type N 顶部 Logo 区首帧顺序
- `updatePreview` 内先创建 `.type-n-top` 再设高度，修复首帧纵向高度不生效

---

## ⚡ 性能与健壮性

### 字体加载重构
- 新增 `js/styles/font-loader.js`：opentype 加载 woff2（约 15MB），模块级缓存 + Promise 去重，失败不中断导出
- 12 个导出模块移除无用的 8MB×3 ttf 加载（每次导出省约 24MB 下载/解析）
- 仅 Type B（矢量轮廓）、Type E（年份测宽）保留 opentype

### `ctx.roundRect` 兼容
- 新增 `js/styles/canvas-utils.js`：老浏览器自动降级 arcTo 手绘圆角路径

### manifest 扫描式生成
- `generate-manifest.sh` 改为从 Sample 文件名扫描样式类型，修复 Docker 构建遗漏 TypeN 的问题

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/js/styles/font-loader.js` | 公共字体加载（woff2 + 共享缓存 + 降级） |
| `src/renderer/js/styles/canvas-utils.js` | `roundedRectPath` 圆角路径兼容工具 |
| `docs/V1.16-NAS_CHANGES.md` | v1.16 详细变更说明 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/js/styles/type-A/C/D-export.js` | 署名门控修复 + 改 `ensureCssFontsReady()` |
| `src/renderer/js/styles/type-B-export.js` | 布局一致性 + 共享 `loadMiSansFonts()` + `roundedRectPath` |
| `src/renderer/js/styles/type-E-export.js` | 共享 `loadMiSansFonts()` |
| `src/renderer/js/styles/type-E-preview.js` | 监听幂等 + 日期守卫 + 确定性对齐 + 移除全局函数 |
| `src/renderer/js/styles/type-F/G/H/L-export.js` | 署名开关 + `ensureCssFontsReady()` |
| `src/renderer/js/styles/type-I-export.js` | `ensureCssFontsReady()` |
| `src/renderer/js/styles/type-J/K-export.js` | 时间开关 + `ensureCssFontsReady()` |
| `src/renderer/js/styles/type-M-export.js` | Logo/时间开关 + `ensureCssFontsReady()` |
| `src/renderer/js/styles/type-N-export.js` | `ensureCssFontsReady()` + `roundedRectPath` |
| `src/renderer/js/styles/type-N-preview.js` | 顶部 Logo 区首帧顺序修复 |
| `src/renderer/css/type-E.css` | 月份间距 em 修正 + 参数行高对齐导出 |
| `scripts/generate-manifest.sh` | 扫描式生成（补 TypeN） |
| `src/renderer/index.html` | 版本号 v1.16 |
| `README.md` | 版本徽章 + 删除 Netlify + 文档链接 |
| `CHANGELOG.md` | 添加 v1.16 条目 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.16-nas.tar`（71.6 MB） |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 14 种（Type A ~ Type N） |
| **样本图片** | 177 个 |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.16-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.16-NAS_CHANGES.md](./V1.16-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志

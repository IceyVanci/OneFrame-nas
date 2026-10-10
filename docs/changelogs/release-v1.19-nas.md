# OneFrame NAS Edition v1.19 Release

**发布日期**：2026-09-13

> 本次新增第 18 种边框样式 **Type R**（Pentax 645N 胶片边缘打印）：黑色胶片底 + 画面窗口 + 右侧胶片带竖排橙色参数打印；画布锁定 645 单帧比例，序号底边对齐图片下边缘。

---

## 🎨 新特性

### Type R — 胶片边缘打印（Pentax 645N）
- 画布锁定 645 单帧比例：横图 4:3、纵图 3:4（方向随原图）
- **黑色胶片底**；画面窗口 left / top / width / height = 3% / 8% / 89% / 84%，右侧 8% 为胶片带
- 画面窗口内照片 **cover 填满**，可**二维拖动**选择显示区域（不拉伸、不直接裁切）
- 右带**竖排橙色**（`#E5742A`）8 项打印（自顶向下）：署名 / 日期 / 焦距 / 曝光偏差 / 光圈 / 快门 / 曝光模式 / 序号
- 文字**逆时针 90°**（字头朝右、自下而上读），字体 **Doto-Bold**（OFL 开源点阵字体，仅拉丁/数字）
- **动态边缘等距排版**：序号底边对齐图片下边缘（`windowTop + windowHeight`），各文字块之间空白等宽
- **署名固定 5 字符预留盒**：盒顶贴图片上边缘，文字自盒底向上排；≤5 字符落在盒内，>5 字符向上溢出到胶片上边；署名为空仍保留该盒，其余项位置不受影响
- 参数来源：曝光模式下拉（`--` / `M` / `P` / `Av` / `Tv`）、日期原生选择器（打印为 `YY/MM/DD`）、曝光偏差带 `Ev` 后缀（`0.0Ev` / `+0.7Ev` / `-0.3Ev`）、焦距取**物理焦距**，均由 EXIF 自动预填、可手输覆盖

### 编辑面板
- Type R：署名（仅英文，提示点阵字体只支持英文）+ 序号 / 日期 / 曝光模式 / 快门 / 光圈 / 曝光偏差 / 焦距
- 隐藏比例、边框、Logo、设备型号、原拍摄参数、时间、文字颜色、厂商、胶片等无关项

### 首页缩略图
- Type R 固定显示自身样本，不参与随机缩略图
- 样本：`Sample/08740-TypeR-sample_compressed.jpeg`

---

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `src/renderer/css/type-R.css` | Type R 样式 |
| `src/renderer/js/styles/type-R-preview.js` | Type R 预览模块（含 `TYPE_R_LAYOUT` 与 `computePrintLayout`） |
| `src/renderer/js/styles/type-R-export.js` | Type R 导出模块 |
| `src/renderer/js/components/type-R-editor-panel.js` | Type R 编辑面板配置 |
| `src/renderer/fonts/Doto-Bold.ttf` | 点阵字体（Doto Bold，OFL） |
| `src/renderer/fonts/OFL-Doto.txt` | Doto 字体开源许可 |
| `src/renderer/Sample/08740-TypeR-sample_compressed.jpeg` | Type R 预览样本 |
| `docs/V1.19-NAS_CHANGES.md` | v1.19 详细变更说明 |

## 🔧 修改文件

| 文件 | 说明 |
|------|------|
| `src/renderer/index.html` | type-R.css 链接 + 第 18 个样式卡片 + `#typeRPrintSection` 编辑区 + 版本号 v1.19 |
| `src/renderer/index.css` | 新增 Doto `@font-face`（weight 700） |
| `src/renderer/js/app.js` | Type R 预览分支、缓存、面板注册、`updateBorder` 分支、EXIF 预填、日期/模式监听、导出偏移 |
| `src/renderer/js/exif.js` | 新增 `getExposureModeLabel` / `getPhysicalFocalLength`；`formatExposureBias` 改为 `Ev` 后缀；`FocalLength` 回退 |
| `src/renderer/js/styles/index.js` | 注册 Type R |
| `src/renderer/js/exporter.js` | 注册 Type R 导出 |
| `src/renderer/js/thumbnail-selector.js` | Type R 固定样本，不参与随机缩略图 |

---

## 📦 镜像信息

| 属性 | 值 |
|------|-----|
| **镜像文件** | `oneframe-web-v1.19-nas.tar`（待构建） |
| **基础镜像** | `nginx:alpine` |
| **服务端口** | 80（容器）→ 8888（映射） |
| **支持样式** | 18 种（Type A ~ Type R） |

### 使用方法

```bash
# 方式一：Docker Compose（推荐）
.\dev.ps1

# 方式二：预编译镜像
docker load -i oneframe-web-v1.19-nas.tar
docker run -d -p 8888:80 --name oneframe-web --restart unless-stopped oneframe-nas-oneframe:latest
```

---

## 🔗 相关文档

- [V1.19-NAS_CHANGES.md](./V1.19-NAS_CHANGES.md) - 详细变更说明
- [CHANGELOG.md](../CHANGELOG.md) - 完整更新日志

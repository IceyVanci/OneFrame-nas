# OneFrame NAS Edition v1.21 Release

**发布日期**：2026-10-10

> 本次为**预览体验与工程结构更新**：20 种样式的预览画布全部统一为「填满式」缩放机制（画布完整可见、随窗口等比适配、小图不上采样）；移动端/窄窗下文字与内容随画布等比缩放；Type B 预览补齐照片圆角；并完成文档结构重组。

---

## 🎨 预览缩放统一（核心更新）

- **统一机制**：每个样式定义「设计画布」（图片 + 底栏/边框/留白的完整尺寸），按预览区 **96% 等比适配**；20 种样式共用同一套适配代码（`js/styles/preview-scale.js`），不再各自维护缩放逻辑
- **A–E 填满式大画布**：移除旧的 900px / 80vh 上限，画布完整可见、垂直居中，观感与 F–T 一致
- **F–T 迁移**：接入统一机制，几何逐像素与旧版一致（0px 差异）
- **移动端字号修复**：A/C/D 底栏文字改为 em 相对容器基准字号，随画布等比缩放（此前移动端偏大）
- **小图不上采样**：图片小于预览区时保持原始尺寸（`scale ≤ 1`）

## 🖼 Type B 改进

- **预览补齐照片圆角**：与导出同比例（`round(12 × 显示方形/900)`），随画布缩放
- **修复内容残留**：B → 其他样式切换时不再残留 B 的参数容器

## 📚 文档重组

- 新增 [`docs/README.md`](../README.md)：当前版本**完整项目说明**（架构 / 20 样式 / 统一缩放机制 / 导出 / 部署 / 开发指南 / 已知坑位）
- 历史版本记录（v1.08–v1.21）迁入 [`docs/changelogs/`](./)，更早归档见 `docs/archive/`
- `README.md` 相关文档索引同步更新

---

## 🔧 升级说明

- **无破坏性变更**：样式渲染、导出尺寸、EXIF 处理均不受影响；重新构建镜像即可：
  ```bash
  docker compose up --build -d
  ```
- 旧实现以 `[LEGACY]` 注释形式保留在源码中（用于回滚），将在**下一版本更新**统一清理

## ⚠️ 已知问题（计划下一版本修复）

- Type E 拖动提示（`.type-e-drag-hint`）在窄窗/移动端会挤压画布，导致右侧内容被裁切（预览显示问题，不影响导出）

---

## 📁 主要变更文件

| 文件 | 说明 |
|------|------|
| `src/renderer/js/styles/preview-scale.js` | **新增**：统一缩放模块（`fitCanvasToPreview` / `getPreviewAvail`） |
| `src/renderer/js/app.js` | A–T 统一缩放分派路径 + 设计尺寸缓存 Map（`previewDesignCache`） |
| `src/renderer/js/styles/type-A/C/D-preview.js` | 设计画布 calcSize + 显式尺寸 + 字号 em 缩放 |
| `src/renderer/js/styles/type-B-preview.js` | 设计方形 + 内容按渲染方形缩放 + 照片圆角 |
| `src/renderer/js/styles/type-E-preview.js` | 设计画布（短边×1.5）+ 统一接口 |
| `src/renderer/css/type-A/C/D.css` | 填满式覆盖（移除 900px 上限）+ em 字号 |
| `docs/` | 文档重组（完整说明 + 历史记录迁入 changelogs/） |

详细实现与验证数据见 [V1.21-NAS_CHANGES.md](./V1.21-NAS_CHANGES.md)。

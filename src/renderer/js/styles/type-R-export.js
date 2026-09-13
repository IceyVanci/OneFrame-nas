/**
 * Type R 导出渲染模块（Pentax 645N 胶片边缘打印）
 * 布局：黑色胶片底 + 画面窗口（左/上/下窄边，右侧宽胶片带）+ 右带竖排橙色 8 项打印
 * - 画布比例锁定 645 单帧：横图 4:3，纵图 3:4（方向随原图）
 * - 画面窗口内照片 cover 填满，按归一化偏移裁剪（与预览一致）
 * - 右侧打印 8 项（自顶向下）：署名 / 日期 / 焦距 / 曝光偏差 / 光圈 / 快门 / 曝光模式 / 序号
 * - 动态边缘等距；署名固定 5 字符预留盒，序号底边对齐图片下边缘（与预览共用 computePrintLayout）
 */

import { ensureCssFontsReady } from './font-loader.js';
import { TYPE_R_LAYOUT, buildPrintSlots, computePrintLayout } from './type-R-preview.js';

const PRINT_COLOR = '#E5742A';

/**
 * 计算画布尺寸（与预览 calcSize 一致）
 */
function computeCanvas(naturalWidth, naturalHeight) {
  const isPortrait = naturalHeight > naturalWidth;
  const ratio = isPortrait ? 3 / 4 : 4 / 3;
  const L = TYPE_R_LAYOUT;
  const winRatio = (L.windowWidth / L.windowHeight) * ratio;
  const imgRatio = naturalWidth / naturalHeight;

  let canvasWidth, canvasHeight;
  if (imgRatio > winRatio) {
    canvasHeight = naturalHeight / L.windowHeight;
    canvasWidth = canvasHeight * ratio;
  } else {
    canvasWidth = naturalWidth / L.windowWidth;
    canvasHeight = canvasWidth / ratio;
  }
  return {
    canvasWidth: Math.round(canvasWidth),
    canvasHeight: Math.round(canvasHeight)
  };
}

/**
 * 渲染 Type R 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {}, imageOffset = { x: 0, y: 0 } } = options;

  await ensureCssFontsReady();

  // 显式加载 Doto（Canvas 不会自动按 @font-face 加载未使用的字体）
  try {
    if (typeof document !== 'undefined' && document.fonts?.load) {
      await document.fonts.load("700 16px 'Doto'");
    }
  } catch (e) { /* 字体加载失败则回退 MiSans */ }

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  const { canvasWidth, canvasHeight } = computeCanvas(img.naturalWidth, img.naturalHeight);
  const L = TYPE_R_LAYOUT;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 黑色胶片底
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 画面窗口
  const winX = canvasWidth * L.windowLeft;
  const winY = canvasHeight * L.windowTop;
  const winW = canvasWidth * L.windowWidth;
  const winH = canvasHeight * L.windowHeight;

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const winRatio = winW / winH;
  let drawW, drawH;
  if (imgRatio > winRatio) {
    drawH = winH;
    drawW = winH * imgRatio;
  } else {
    drawW = winW;
    drawH = winW / imgRatio;
  }

  const maxOffsetX = Math.max(0, (drawW - winW) / 2);
  const maxOffsetY = Math.max(0, (drawH - winH) / 2);
  // 与预览 object-position 一致的偏移方向
  const drawX = winX - maxOffsetX * (1 + (imageOffset?.x || 0));
  const drawY = winY - maxOffsetY * (1 + (imageOffset?.y || 0));

  ctx.save();
  ctx.beginPath();
  ctx.rect(winX, winY, winW, winH);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. 右侧胶片带打印（竖排橙色）
  drawPrint(ctx, canvasWidth, canvasHeight, settings);

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * 绘制右带竖排打印项：动态边缘等距（署名固定 5 字符预留盒，序号底边对齐图片下边缘）
 */
function drawPrint(ctx, canvasWidth, canvasHeight, settings) {
  const slots = buildPrintSlots(settings);
  if (!slots.some(Boolean)) return;

  const L = TYPE_R_LAYOUT;
  const bandCenterX = canvasWidth - canvasWidth * L.stripWidth / 2;
  const { fontSize, centers } = computePrintLayout(slots, canvasWidth, canvasHeight);
  if (!fontSize) return;

  ctx.font = `700 ${fontSize}px 'Doto', 'MiSans', sans-serif`;
  try { ctx.letterSpacing = `${L.letterSpacingEm * fontSize}px`; } catch (e) { /* 不支持则忽略 */ }
  ctx.fillStyle = PRINT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < slots.length; i++) {
    const text = slots[i];
    if (!text || centers[i] == null) continue;
    const w = ctx.measureText(text).width;
    const centerY = canvasHeight * centers[i];
    // 逆时针 90°（字头朝右，自下而上读）：锚点取底部，使字符串居中于槽中心
    const itemBottom = centerY + w / 2;
    ctx.save();
    ctx.translate(bandCenterX, itemBottom);
    ctx.rotate(-Math.PI / 2); // +x 向上
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
}

/**
 * Type R 导出样式配置
 */
export const typeRExport = {
  id: 'type-r-export',
  name: 'Type R Export',
  renderImage
};

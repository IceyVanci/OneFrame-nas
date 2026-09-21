/**
 * Type S 导出渲染模块（留白排版 / 参考图）
 * 布局：白色画布 + 居中照片 + 左上两行文字 + 右侧竖排日期与三角标记 + 右下参数行
 * - 画布比例可切换（1:1 / 1:1.35）；照片区固定 1:1（画布宽 82% 正方形，居中）
 * - 照片以 cover 填入照片区并按归一化偏移裁剪（与预览一致）
 * - 布局常量与预览侧 type-S-preview.js 共用
 */

import { ensureCssFontsReady } from './font-loader.js';
import {
  TYPE_S_LAYOUT,
  calcSize,
  getPhotoRect,
  buildParamsLine,
  formatDateS,
  resolveTextColor
} from './type-S-preview.js';

const DATE_MARK_GAP_EM = 1.0;   // 日期与针状标记间距（× 字号）
const MARK_WIDTH_EM = 1.0;      // 针状标记顶边宽（× 字号，与文字列同宽）
const MARK_HEIGHT_EM = 5.0;     // 针状标记长度（× 字号）

/**
 * 渲染 Type S 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {}, imageOffset = { x: 0, y: 0 } } = options;

  await ensureCssFontsReady();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  const canvasAspect = settings.canvasRatioS === '1:1.35' ? '1:1.35' : '1:1';

  const { squareSize: canvasWidth, canvasHeight } = calcSize({
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    canvasRatioS: canvasAspect
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 白色底
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 照片（cover 裁剪，按归一化偏移定位）
  const rect = getPhotoRect(canvasWidth, canvasHeight);
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const winRatio = rect.w / rect.h;
  let drawW, drawH;
  if (imgRatio > winRatio) {
    drawH = rect.h;
    drawW = rect.h * imgRatio;
  } else {
    drawW = rect.w;
    drawH = rect.w / imgRatio;
  }
  const maxOffsetX = Math.max(0, (drawW - rect.w) / 2);
  const maxOffsetY = Math.max(0, (drawH - rect.h) / 2);
  const drawX = rect.x - maxOffsetX * (1 + (imageOffset?.x || 0));
  const drawY = rect.y - maxOffsetY * (1 + (imageOffset?.y || 0));

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. 文字
  const color = resolveTextColor(settings, img);
  drawTexts(ctx, canvasWidth, canvasHeight, settings, color);

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * 绘制左上 / 右侧日期与标记 / 右下参数
 */
function drawTexts(ctx, W, H, settings, color) {
  const L = TYPE_S_LAYOUT;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';

  const topFont = Math.max(7, Math.round(L.topFont * W));
  const dateFont = Math.max(7, Math.round(L.dateFont * W));
  const paramsFont = Math.max(7, Math.round(L.paramsFont * W));

  // ---- 左上两行 ----
  const topLine = String(settings.topLineS || '').trim();
  const handle = String(settings.photoByS || '').trim();
  const lines = [];
  lines.push(topLine);
  if (handle) lines.push(`PHOTO BY ${handle}`);

  if (topLine || handle) {
    ctx.save();
    ctx.font = `400 ${topFont}px 'MiSans', sans-serif`;
    setLetterSpacing(ctx, L.topLetterSpacing * topFont);
    ctx.textAlign = 'left';
    const x = W * L.topLeftX;
    const lineH = topFont * L.topLineHeight;
    let y = H * L.topLeftY + topFont / 2;
    for (const ln of lines) {
      if (ln) ctx.fillText(ln, x, y);
      y += lineH;
    }
    ctx.restore();
  }

  // ---- 右侧竖排日期 + 三角标记（垂直居中）----
  const date = formatDateS(settings.dateS);
  if (date) {
    ctx.save();
    ctx.font = `400 ${dateFont}px 'MiSans', sans-serif`;
    setLetterSpacing(ctx, L.dateLetterSpacing * dateFont);
    ctx.textAlign = 'left';
    const dateLen = ctx.measureText(date).width;
    const markW = MARK_WIDTH_EM * dateFont;
    const markH = MARK_HEIGHT_EM * dateFont;
    const gap = DATE_MARK_GAP_EM * dateFont;
    const groupH = dateLen + gap + markH;
    const topY = H / 2 - groupH / 2;
    const centerX = W - W * L.dateRight - dateFont / 2;

    // 竖排（顺时针 90°，自上而下）
    ctx.save();
    ctx.translate(centerX, topY);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(date, 0, 0);
    ctx.restore();

    // 针状标记（上平边、下收尖、尖端渐隐）
    const markTop = topY + dateLen + gap;
    const grad = ctx.createLinearGradient(0, markTop, 0, markTop + markH);
    grad.addColorStop(0, color);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(centerX - markW / 2, markTop);
    ctx.lineTo(centerX + markW / 2, markTop);
    ctx.lineTo(centerX, markTop + markH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---- 右下参数 ----
  const params = buildParamsLine(settings);
  if (params) {
    ctx.save();
    ctx.font = `400 ${paramsFont}px 'MiSans', sans-serif`;
    setLetterSpacing(ctx, L.paramsLetterSpacing * paramsFont);
    ctx.textAlign = 'right';
    ctx.fillText(params, W - W * L.paramsRight, H * L.paramsBottom);
    ctx.restore();
  }
}

/**
 * 设置字距（不支持则忽略）
 */
function setLetterSpacing(ctx, px) {
  try {
    ctx.letterSpacing = `${px.toFixed(2)}px`;
  } catch (e) { /* 忽略 */ }
}

/**
 * #rrggbb → rgba(r,g,b,alpha)（用于尖端渐隐，避免透明处出现灰边）
 */
function hexToRgba(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return `rgba(0,0,0,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * Type S 导出样式配置
 */
export const typeSExport = {
  id: 'type-s-export',
  name: 'Type S Export',
  renderImage
};

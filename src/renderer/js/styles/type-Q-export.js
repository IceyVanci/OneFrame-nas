/**
 * Type Q 导出渲染模块（简洁布局）
 * 主色边框（四边等宽 2.5%，底色 = 图片主色）+ 照片区（95%×95%）
 * 署名 "Foto by {署名}" 叠照片内右下角（Semibold，颜色黑/白/主色三选一）
 * 布局常量与预览侧 type-Q-preview.js 共用，保证两侧一致
 */

import { ensureCssFontsReady } from './font-loader.js';
import { getDominantColor } from '../utils/dominant-color.js';
import { TYPE_Q_LAYOUT } from './type-Q-preview.js';

/**
 * 渲染 Type Q 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;

  await ensureCssFontsReady();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  const L = TYPE_Q_LAYOUT;
  const canvasWidth = Math.round(img.naturalWidth / L.photoSize);
  const canvasHeight = Math.round(img.naturalHeight / L.photoSize);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 边框底色 = 图片主色
  const dominantColor = getDominantColor(img);
  ctx.fillStyle = dominantColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 绘制照片（cover 裁剪，四周各留 2.5%）
  const photoX = canvasWidth * L.border;
  const photoY = canvasHeight * L.border;
  const photoWidth = canvasWidth * L.photoSize;
  const photoHeight = canvasHeight * L.photoSize;

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const areaRatio = photoWidth / photoHeight;

  let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;
  if (imgRatio > areaRatio) {
    srcW = Math.round(img.naturalHeight * areaRatio);
    srcX = Math.round((img.naturalWidth - srcW) / 2);
  } else {
    srcH = Math.round(img.naturalWidth / areaRatio);
    srcY = Math.round((img.naturalHeight - srcH) / 2);
  }
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);

  // 3. 署名（照片内右下角）
  const signatureText = (settings.signatureText || '').trim();
  const showSignature = settings.showSignatureQ !== false;
  if (showSignature && signatureText) {
    // 解析署名颜色：黑 / 白 / 图片主色
    const colorChoice = settings.signatureColorQ || '#000000';
    const sigColor = colorChoice === 'dominant' ? dominantColor : colorChoice;

    const sigFontSize = Math.max(8, Math.round(canvasWidth * L.sigFont));
    const sigX = canvasWidth - canvasWidth * L.sigRight;
    const sigY = canvasHeight * L.sigCY;

    ctx.font = `600 ${sigFontSize}px 'MiSans', sans-serif`;
    ctx.fillStyle = sigColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText(`Foto by ${signatureText}`, sigX, sigY);
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type Q 导出样式配置
 */
export const typeQExport = {
  id: 'type-q-export',
  name: 'Type Q Export',
  renderImage
};

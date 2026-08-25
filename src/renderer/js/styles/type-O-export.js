/**
 * Type O 导出渲染模块
 * 布局：白色背景 + 照片区（横 84%×68% / 纵 81%×76.7%，左右白边减半、底部白边减 1/3）+ 三行文字 + 底部水印带
 * - 第 1 行：胶片型号（0.80× 机身字号 Normal #333，水平居中）
 * - 第 2 行：厂商 + 机型（机身字号 Semibold #000，水平居中）
 * - 第 3 行：署名水印（0.36× 机身字号 黑色，底部 6% 带，水平居中）
 * 文字基准字号 = 0.030 × 画布宽度（与预览同比例）
 * 第 1+2 行文字组在 15% 文字区内垂直居中
 */

import { ensureCssFontsReady } from './font-loader.js';

/**
 * 使用 ctx.fillText 绘制文字
 */
function drawText(ctx, text, x, y, fontSize, options = {}) {
  const color = options.color || '#000000';
  const fontWeight = options.fontWeight || 'normal';
  const align = options.align || 'left';

  ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;

  ctx.fillText(text, x, y);
}

/**
 * 渲染 Type O 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;

  const fonts = await ensureCssFontsReady();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  const isPortrait = img.naturalHeight > img.naturalWidth;
  // 横图照片宽 84%（左右 8%）；纵图照片宽 81%（左右 9.5%，白边减半）
  // 纵图照片高 76.7%（底部白边减 1/3），横图照片高 68%
  const photoWidthRatio = isPortrait ? 0.81 : 0.84;
  const photoHeightRatio = isPortrait ? 0.7667 : 0.68;
  const canvasWidth = Math.round(img.naturalWidth / photoWidthRatio);
  const canvasHeight = Math.round(img.naturalHeight / photoHeightRatio);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 绘制照片（cover 裁剪，无圆角）
  const photoX = canvasWidth * (isPortrait ? 0.095 : 0.08);
  const photoY = canvasHeight * 0.06;
  const photoWidth = canvasWidth * photoWidthRatio;
  const photoHeight = canvasHeight * photoHeightRatio;

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

  // 3. 绘制照片描边（边框色可调，默认黑；宽度与预览同比例：900px 宽对应 2px）
  const borderColor = settings.borderColor || '#000000';
  const borderWidth = Math.max(2, Math.round(canvasWidth * (2 / 900)));
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(photoX + borderWidth / 2, photoY + borderWidth / 2, photoWidth - borderWidth, photoHeight - borderWidth);

  // 4. 绘制三行文字（水平居中）
  const baseFontSize = Math.round(canvasWidth * 0.030);
  const centerX = canvasWidth / 2;
  // 垂直布局（与预览一致）：按方向取布局常量
  // 横图：照片底 74%、文字区 79%/15%、水印带 94%/6%
  // 纵图：照片底 82.7%、文字区 86%/10%、水印带 96%/4%
  const L = isPortrait
    ? { textTop: 0.86, textHeight: 0.10, watermarkTop: 0.96, watermarkHeight: 0.04 }
    : { textTop: 0.79, textHeight: 0.15, watermarkTop: 0.94, watermarkHeight: 0.06 };
  const textAreaTop = canvasHeight * L.textTop;
  const textAreaHeight = canvasHeight * L.textHeight;
  const line1Height = Math.round(baseFontSize * 0.80 * 1.2);
  const gap = Math.round(baseFontSize * 0.1);
  const line2Height = Math.round(baseFontSize * 1.2);
  const groupHeight = line1Height + gap + line2Height;
  const groupTop = textAreaTop + Math.round((textAreaHeight - groupHeight) / 2);

  // 第 1 行：胶片型号
  const filmStyle = settings.filmStyle || '';
  if (filmStyle) {
    drawText(ctx, filmStyle, centerX, groupTop + Math.round(baseFontSize * 0.80 / 2), Math.round(baseFontSize * 0.80), {
      color: '#333333', fontWeight: 'normal', align: 'center'
    });
  }

  // 第 2 行：厂商 + 机型
  const manufacturer = settings.manufacturer || '';
  const customModel = settings.customModel || '';
  const line2Text = `${manufacturer}${customModel ? ' ' + customModel : ''}`;
  if (line2Text) {
    drawText(ctx, line2Text, centerX, groupTop + line1Height + gap + Math.round(baseFontSize / 2), baseFontSize, {
      color: '#000000', fontWeight: '600', align: 'center'
    });
  }

  // 第 3 行：署名水印（底部水印带垂直居中）
  const signatureText = settings.signatureText || '';
  const line3Text = signatureText ? `© ${signatureText}` : '';
  if (line3Text) {
    const line3FontSize = Math.round(baseFontSize * 0.36);
    const bandCenterY = canvasHeight * L.watermarkTop + canvasHeight * L.watermarkHeight / 2;
    drawText(ctx, line3Text, centerX, bandCenterY, line3FontSize, {
      color: '#000000', fontWeight: 'normal', align: 'center'
    });
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type O 导出样式配置
 */
export const typeOExport = {
  id: 'type-o-export',
  name: 'Type O Export',
  renderImage
};

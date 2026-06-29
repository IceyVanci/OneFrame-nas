/**
 * Type M 导出渲染模块
 * 布局：基于 Type I + Type L 模糊边框（四边等高 5%）
 * - 全画幅模糊背景
 * - 中部 90%×90% 清晰照片
 * - 顶部 Logo（和样式J一样）
 * - 底部文字（和样式J一样：署名 + 参数行三栏）
 */

const opentype = window.opentype;

let fontSemibold = null;
let fontMedium = null;
let fontNormal = null;

async function loadFonts() {
  try {
    if (!fontSemibold) {
      const semiboldUrl = new URL('../../fonts/MiSans-Semibold.ttf', import.meta.url).href;
      fontSemibold = await opentype.load(semiboldUrl);
    }
    if (!fontMedium) {
      const mediumUrl = new URL('../../fonts/MiSans-Medium.ttf', import.meta.url).href;
      fontMedium = await opentype.load(mediumUrl);
    }
    if (!fontNormal) {
      const normalUrl = new URL('../../fonts/MiSans-Normal.ttf', import.meta.url).href;
      fontNormal = await opentype.load(normalUrl);
    }
    return { fontSemibold, fontMedium, fontNormal };
  } catch (error) {
    console.error('Font loading failed:', error);
    throw error;
  }
}

/**
 * 使用 ctx.fillText 绘制文字
 */
function drawText(ctx, text, x, y, fontSize, options = {}) {
  const color = options.color || '#ffffff';
  const fontWeight = options.fontWeight || 'normal';
  const align = options.align || 'left';

  ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;

  ctx.fillText(text, x, y);
}

/**
 * 绘制模糊背景（cover 裁剪，1.5x 缩放隐藏 blur 边缘）
 */
function drawBlurredBackground(ctx, img, canvasWidth, canvasHeight, blurRadius) {
  const scale = 1.5;
  const scaledW = canvasWidth * scale;
  const scaledH = canvasHeight * scale;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = scaledW / scaledH;

  let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;

  if (imgRatio > canvasRatio) {
    srcW = Math.round(img.naturalHeight * canvasRatio);
    srcX = Math.round((img.naturalWidth - srcW) / 2);
  } else {
    srcH = Math.round(img.naturalWidth / canvasRatio);
    srcY = Math.round((img.naturalHeight - srcH) / 2);
  }

  const offsetX = (canvasWidth - scaledW) / 2;
  const offsetY = (canvasHeight - scaledH) / 2;
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(img, srcX, srcY, srcW, srcH, offsetX, offsetY, scaledW, scaledH);
  ctx.filter = 'none';
}

/**
 * 绘制 Logo（Type M 专用）
 */
function drawLogoM(ctx, logoName, centerX, centerY, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let drawWidth = img.naturalWidth;
      let drawHeight = img.naturalHeight;

      drawWidth = drawWidth * (maxHeight / drawHeight);
      drawHeight = maxHeight;

      const x = centerX - drawWidth / 2;
      const y = centerY - drawHeight / 2;
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `logos/${logoName}.svg`;
  });
}

/**
 * 绘制 Type M 内容（和样式J一样：Logo 顶部 + 底部署名 + 参数行三栏）
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts) {
  // 基于照片区域计算字号（照片区域 = 画布 90%）
  const photoAreaWidth = canvasWidth * 0.90;
  const baseScale = photoAreaWidth / 900;
  let fontSize = Math.max(8, Math.round(14 * baseScale));

  // 纵向图片字号增大 50%
  const isPortrait = canvasHeight > canvasWidth;
  if (isPortrait) {
    fontSize = Math.round(fontSize * 1.5);
  }

  // 照片区域
  const photoX = canvasWidth * 0.05;
  const photoY = canvasHeight * 0.05;
  const photoW = canvasWidth * 0.90;
  const photoH = canvasHeight * 0.90;
  const photoCenterX = photoX + photoW / 2;

  // Logo：照片区域内顶部 3%
  if (settings.selectedLogo) {
    const logoHeight = Math.round(fontSize * 1.2);
    const logoY = photoY + photoH * 0.03 + logoHeight / 2;
    await drawLogoM(ctx, settings.selectedLogo, photoCenterX, logoY, logoHeight);
  }

  // 参数行三栏（和样式J一样）
  const modelText = settings.customModel || '';
  const paramParts = [];
  if (settings.focalLength) paramParts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.fNumber) paramParts.push(`f/${settings.fNumber}`);
  if (settings.exposureTime) paramParts.push(`${settings.exposureTime}s`);
  if (settings.iso) paramParts.push(`ISO${settings.iso}`);
  const paramsText = paramParts.join(' ');

  let timeText = '';
  if (settings.dateTime) {
    const dt = new Date(settings.dateTime);
    timeText = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  }

  // 底部：与 CSS bottom: 3% 一致（相对于画布），与 Type J 导出逻辑一致
  const bottomY = photoY + photoH * 0.97;
  const lineHeight = Math.round(fontSize * 1.4);
  const gap = Math.round(fontSize * 0.5);
  const hasParamsRow = modelText || paramsText || timeText;
  const paramsY = bottomY - (hasParamsRow ? lineHeight / 2 : 0);
  const signatureY = hasParamsRow
    ? paramsY - lineHeight / 2 - gap - lineHeight / 2
    : bottomY - lineHeight / 2;

  // 署名行（Medium 字重，和样式J一样）
  const signatureText = settings.signatureText || 'OneFrame';
  const textColor = settings.textColor || '#ffffff';

  if (signatureText) {
    drawText(ctx, `© ${signatureText}`, photoCenterX, signatureY, fontSize, {
      color: textColor, fontWeight: '500', align: 'center'
    });
  }

  // 参数行三栏（和样式J一样，画布相对位置）
  if (modelText) {
    drawText(ctx, modelText, photoX + photoW * 0.05, paramsY, fontSize, {
      color: textColor, fontWeight: 'normal', align: 'left'
    });
  }
  if (paramsText) {
    drawText(ctx, paramsText, photoCenterX, paramsY, fontSize, {
      color: textColor, fontWeight: 'normal', align: 'center'
    });
  }
  if (timeText) {
    drawText(ctx, timeText, photoX + photoW * 0.95, paramsY, fontSize, {
      color: textColor, fontWeight: 'normal', align: 'right'
    });
  }
}

/**
 * 渲染 Type M 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;

  const fonts = await loadFonts();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  // 画布大小 = 图片原始大小
  const canvasWidth = img.naturalWidth;
  const canvasHeight = img.naturalHeight;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 全画幅模糊背景
  const blurRadius = Math.max(10, Math.round(canvasWidth * 0.02));
  drawBlurredBackground(ctx, img, canvasWidth, canvasHeight, blurRadius);

  // 2. 清晰照片（90%×90%，四边各 5% 模糊）
  const photoX = canvasWidth * 0.05;
  const photoY = canvasHeight * 0.05;
  const photoWidth = canvasWidth * 0.90;
  const photoHeight = canvasHeight * 0.90;

  // cover 裁剪
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

  // 圆角裁剪（按比例缩放）
  const baseScaleForRadius = canvasWidth / 900;
  const cornerRadius = Math.round(12 * baseScaleForRadius);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoWidth, photoHeight, cornerRadius);
  ctx.clip();
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);
  ctx.restore();

  // 3. 绘制内容（Logo + 署名 + 参数行）
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts);

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type M 导出样式配置
 */
export const typeMExport = {
  id: 'type-m-export',
  name: 'Type M Export',
  renderImage
};
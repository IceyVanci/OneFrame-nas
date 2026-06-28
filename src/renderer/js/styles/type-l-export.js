/**
 * Type L 导出渲染模块
 * 布局：基于 Type G，白色背景替换为照片高斯模糊
 * - 全画幅模糊背景
 * - 中部 92%×80% 清晰照片
 * - 底部 15% 文字信息区（白色文字）
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
 * 格式化日期
 */
function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

/**
 * 绘制 Logo（Type L 专用，居中）
 */
function drawLogoL(ctx, logoName, centerX, centerY, maxHeight) {
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
 * 绘制模糊背景（cover 裁剪）
 */
function drawBlurredBackground(ctx, img, canvasWidth, canvasHeight, blurRadius) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;
  
  if (imgRatio > canvasRatio) {
    srcW = Math.round(img.naturalHeight * canvasRatio);
    srcX = Math.round((img.naturalWidth - srcW) / 2);
  } else {
    srcH = Math.round(img.naturalWidth / canvasRatio);
    srcY = Math.round((img.naturalHeight - srcH) / 2);
  }
  
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvasWidth, canvasHeight);
  ctx.filter = 'none';
}

/**
 * 绘制 Type L 底部内容
 * 第一行：厂商 Logo
 * 第二行：拍摄日期 | 拍摄参数 | 相机名称
 * 第三行：© 署名
 * 文字颜色默认白色
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait = false) {
  const textRatio = isPortrait ? 0.075 : 0.15;
  const textAreaHeight = canvasHeight * textRatio;
  const textAreaTop = canvasHeight * (1 - textRatio);
  const textCenterY = textAreaTop + textAreaHeight / 2;
  const centerX = canvasWidth / 2;
  
  const baseScale = canvasWidth / 900;
  const line1FontSize = Math.round(14 * baseScale);
  const line2FontSize = Math.round(14 * baseScale);
  const lineHeight1 = Math.round(line1FontSize * 1.2);
  const lineHeight2 = Math.round(line2FontSize * 1.4);
  const lineGap = Math.round(6 * baseScale);
  const signatureGap = Math.round(6 * baseScale);
  
  const hasLogo = settings.selectedLogo && settings.showLogo;
  
  // 第二行：拍摄日期 | 拍摄参数 | 相机名称
  const line2Parts = [];
  if (settings.dateTime && settings.showTime) {
    line2Parts.push(formatDateForDisplay(settings.dateTime));
  }
  const paramParts = [];
  if (settings.showParams && settings.fNumber) paramParts.push(`f/${settings.fNumber}`);
  if (settings.showParams && settings.focalLength) paramParts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.showParams && settings.exposureTime) paramParts.push(`${settings.exposureTime}s`);
  if (settings.showParams && settings.iso) paramParts.push(`ISO${settings.iso}`);
  if (paramParts.length > 0) line2Parts.push(paramParts.join(' '));
  if (settings.showModel && settings.customModel) line2Parts.push(settings.customModel);
  const line2Text = line2Parts.join(' | ');
  
  // 第三行：署名
  const signatureText = settings.signatureText || '';
  const line3Text = signatureText ? `© ${signatureText}` : '';
  
  // 计算布局位置
  const groupHeight = (hasLogo ? lineHeight1 : 0) + lineGap + (line2Text ? lineHeight2 : 0);
  const line1Y = textCenterY - groupHeight / 2 + (hasLogo ? lineHeight1 / 2 : 0);
  const line2Y = line1Y + lineHeight1 / 2 + lineGap + lineHeight2 / 2;
  
  // 绘制第一行：Logo
  if (hasLogo) {
    const logoMaxHeight = Math.round(canvasHeight * (isPortrait ? 0.0125 : 0.025));
    await drawLogoL(ctx, settings.selectedLogo, centerX, line1Y, logoMaxHeight);
  }
  
  // 绘制第二行（白色文字）
  const textColor = settings.textColor || '#ffffff';
  if (line2Text) {
    drawText(ctx, line2Text, centerX, line2Y, line2FontSize, {
      color: textColor, fontWeight: '500', align: 'center'
    });
  }
  
  // 绘制第三行（署名，白色文字）
  if (line3Text) {
    const line3Y = line2Text ? line2Y + lineHeight2 / 2 + signatureGap + lineHeight2 / 2 : line2Y + signatureGap;
    drawText(ctx, line3Text, centerX, line3Y, Math.round(12 * baseScale), {
      color: textColor, fontWeight: 'normal', align: 'center'
    });
  }
}

/**
 * 渲染 Type L 导出图片
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
  
  // 画布尺寸
  const canvasWidth = img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  const heightRatio = isPortrait ? 0.9 : 0.8;
  const canvasHeight = Math.round(img.naturalHeight / heightRatio);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 1. 全画幅模糊背景
  const blurRadius = Math.max(10, Math.round(canvasWidth * 0.02));
  drawBlurredBackground(ctx, img, canvasWidth, canvasHeight, blurRadius);
  
  // 2. 清晰照片（92% 宽度，纵向 90%/横向 80% 高度）
  const photoX = canvasWidth * 0.04;
  const photoY = canvasHeight * (isPortrait ? 0.025 : 0.05);
  const photoWidth = canvasWidth * 0.92;
  const photoHeight = canvasHeight * (isPortrait ? 0.90 : 0.80);
  
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
  
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);
  
  // 3. 绘制底部文字内容
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type L 导出样式配置
 */
export const typeLExport = {
  id: 'type-l-export',
  name: 'Type L Export',
  renderImage
};
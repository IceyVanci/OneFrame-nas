/**
 * Type L Export Render Module
 * Layout: Based on Type G, white border replaced with Gaussian blur background
 * - Full-canvas Gaussian blur background
 * - Center 92%x80% clear photo
 * - Bottom 15% text area (white text)
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

function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

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
  ctx.filter = 'blur(' + blurRadius + 'px)';
  ctx.drawImage(img, srcX, srcY, srcW, srcH, offsetX, offsetY, scaledW, scaledH);
  ctx.filter = 'none';
}

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
  const signatureText = settings.signatureText || '';
  const line3Text = signatureText ? `© ${signatureText}` : '';
  const groupHeight = (hasLogo ? lineHeight1 : 0) + lineGap + (line2Text ? lineHeight2 : 0);
  const line1Y = textCenterY - groupHeight / 2 + (hasLogo ? lineHeight1 / 2 : 0);
  const line2Y = line1Y + lineHeight1 / 2 + lineGap + lineHeight2 / 2;
  if (hasLogo) {
    const logoMaxHeight = Math.round(canvasHeight * (isPortrait ? 0.0125 : 0.025));
    await drawLogoL(ctx, settings.selectedLogo, centerX, line1Y, logoMaxHeight);
  }
  const textColor = settings.textColor || '#ffffff';
  if (line2Text) {
    drawText(ctx, line2Text, centerX, line2Y, line2FontSize, {
      color: textColor, fontWeight: '500', align: 'center'
    });
  }
  if (line3Text) {
    const line3Y = line2Text ? line2Y + lineHeight2 / 2 + signatureGap + lineHeight2 / 2 : line2Y + signatureGap;
    drawText(ctx, line3Text, centerX, line3Y, Math.round(12 * baseScale), {
      color: textColor, fontWeight: 'normal', align: 'center'
    });
  }
}

export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;
  const fonts = await loadFonts();
  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('Image not loaded');
  }
  const canvasWidth = img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  const heightRatio = isPortrait ? 0.9 : 0.8;
  const canvasHeight = Math.round(img.naturalHeight / heightRatio);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const blurRadius = Math.max(10, Math.round(canvasWidth * 0.02));
  drawBlurredBackground(ctx, img, canvasWidth, canvasHeight, blurRadius);
  const photoX = canvasWidth * 0.04;
  const photoY = canvasHeight * (isPortrait ? 0.025 : 0.05);
  const photoWidth = canvasWidth * 0.92;
  const photoHeight = canvasHeight * (isPortrait ? 0.90 : 0.80);
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
  const baseScaleL = canvasWidth / 900;
  const cornerRadiusL = Math.round(12 * baseScaleL);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoWidth, photoHeight, cornerRadiusL);
  ctx.clip();
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);
  ctx.restore();
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait);
  return canvas.toDataURL('image/jpeg', quality);
}

export const typeLExport = {
  id: 'type-l-export',
  name: 'Type L Export',
  renderImage
};
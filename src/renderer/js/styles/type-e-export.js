/**
 * Type E 导出渲染模块
 * 布局：3:2 纵向画布，顶部 1:1 正方形显示图片，底部白色区域显示参数
 */

/**
 * Type E 样式常量 - 与 CSS 定义保持一致
 * 修改 CSS 时必须同步修改此处
 */
const TYPE_E_STYLES = {
  month: { fontSize: 48, color: '#000000' },      // .type-e-month: font-weight 500, color #000000
  year:  { fontSize: 24, color: '#FF6B00' },      // .type-e-year: font-weight 500, color #FF6B00
  param: { fontSize: 18, color: '#000000' },      // .type-e-param-line: font-weight 500, color #000000
  model: { fontSize: 18, color: '#666666' },      // .type-e-model: color #666666
  signature: { fontSize: 18, color: '#888888' },  // .type-e-signature: color #888888
};

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

function borderColorIsLight(color) {
  if (!color) return true;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

function detectLogoBrightness(logoPath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;
        for (let i = 0; i < data.length; i += 8) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        resolve(pixelCount > 0 ? totalBrightness / pixelCount > 100 : true);
      } catch (e) { resolve(true); }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

async function drawLogo(ctx, logoName, x, centerY, borderHeight, imgWidth, borderColor, onComplete) {
  const isDark = !borderColorIsLight(borderColor);
  const normalPath = `logos/${logoName}.svg`;
  const logoIsLight = await detectLogoBrightness(normalPath);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    let logoHeight = borderHeight * 0.6;
    let logoWidth = (img.width / img.height) * logoHeight;
    const maxLogoWidth = imgWidth * 0.15;
    if (logoWidth > maxLogoWidth) {
      logoWidth = maxLogoWidth;
      logoHeight = (logoWidth / img.width) * img.height;
    }
    if (isDark && !logoIsLight) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, x, centerY - logoHeight / 2, logoWidth, logoHeight);
    } else {
      ctx.drawImage(img, x, centerY - logoHeight / 2, logoWidth, logoHeight);
    }
    if (onComplete) onComplete();
  };
  img.onerror = () => { if (onComplete) onComplete(); };
  img.src = normalPath;
}

/**
 * 绘制 Type E 边框内容
 */
async function drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts, previewSquareSize) {
  
  const squareSize = canvasWidth;
  const footerHeight = canvasHeight - squareSize;
  
  // 缩放比例：以预览 squareSize 为基准，确保导出与预览一致
  const scale = previewSquareSize > 0 ? canvasWidth / previewSquareSize : 1;
  
  const monthFontSize = Math.round(TYPE_E_STYLES.month.fontSize * scale);
  const yearFontSize = Math.round(TYPE_E_STYLES.year.fontSize * scale);
  const paramFontSize = Math.round(TYPE_E_STYLES.param.fontSize * scale);
  const fNumberFontSize = Math.round(TYPE_E_STYLES.param.fontSize * scale);
  // 匹配 CSS line-height: 1.5（18px × 1.5 = 27px，减去字号 18px = 9px 间距）
  const lineGap = Math.round(9 * scale);
  
  const paddingLeft = canvasWidth * 0.05;
  const paddingRight = canvasWidth * 0.05;
  const paddingTop = canvasWidth * 0.05;
  
  // 使用 ctx.fillText 绘制文字（与 CSS 样式一致，与 Type A 保持相同的渲染方式）
  const drawText = (text, x, y, fontSize, options = {}) => {
    const color = options.color || '#000000';
    const fontWeight = options.fontWeight || '500';
    const align = options.align || 'left';
    
    // 设置字体样式（与 CSS 保持一致）
    ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    
    if (align === 'right') {
      ctx.textAlign = 'right';
    } else if (align === 'center') {
      ctx.textAlign = 'center';
    } else {
      ctx.textAlign = 'left';
    }
    
    ctx.fillText(text, x, y);
  };
  
  const leftX = paddingLeft;
  const rightX = canvasWidth - paddingRight;
  
  // Y 坐标需要加上 squareSize，因为 ctx 是整个画布，原点(0,0)在画布左上角
  const yearTopY = squareSize + paddingTop;
  
  let yearY = yearTopY;
  
  if (settings.dateTime && settings.showTime) {
    const dt = new Date(settings.dateTime);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[dt.getMonth()];
    const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    
    drawText(formattedMonth, leftX, yearTopY, monthFontSize, { color: TYPE_E_STYLES.month.color, fontWeight: '500' });
    // 修复：月份 margin-bottom: 8px，匹配 CSS
    yearY = yearTopY + monthFontSize + Math.round(8 * scale);
    const year = dt.getFullYear().toString();
    drawText(year, leftX, yearY, yearFontSize, { color: TYPE_E_STYLES.year.color, fontWeight: '500' });
  }
  
  if (settings.selectedLogo && settings.showLogo) {
    const logoBottomY = squareSize + footerHeight * 0.95;
    const dateTimeStr = settings.dateTime || '';
    await drawLogoTypeEFixed(ctx, settings.selectedLogo, leftX, logoBottomY, scale, yearFontSize, fonts, dateTimeStr);
  }
  
  // 修复：右侧参数从年份顶部开始（与年份对齐）
  let y = yearY;
  
  const parts = [];
  if (settings.fNumber) parts.push(`f/${settings.fNumber}`);
  if (settings.focalLength) parts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.exposureTime) parts.push(`${settings.exposureTime}s`);
  if (settings.iso) parts.push(`ISO ${settings.iso}`);
  
  if (parts.length > 0) {
    drawText(parts.join(' '), rightX, y, fNumberFontSize, { align: 'right', color: TYPE_E_STYLES.param.color, fontWeight: '500' });
    y += fNumberFontSize + lineGap;
  }
  
  if (settings.customModel && settings.showModel) {
    drawText(settings.customModel, rightX, y, paramFontSize, { align: 'right', color: TYPE_E_STYLES.model.color, fontWeight: '500' });
    y += paramFontSize + lineGap;
  }
  
  if (settings.signatureText) {
    drawText(settings.signatureText, rightX, y, paramFontSize, { align: 'right', color: TYPE_E_STYLES.signature.color, fontWeight: '500' });
  }
}

async function drawLogoTypeEFixed(ctx, logoName, x, bottomY, scale, yearFontSize, fonts, dateTimeStr) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      let logoHeight, logoWidth;
      if (ratio >= 0.8 && ratio <= 1.2) {
        // 方形 Logo：高度 = 年份文字宽度（像素），与预览保持一致
        let yearTextWidth = yearFontSize * 4; // fallback
        try {
          if (fonts?.fontMedium && dateTimeStr) {
            const dt = new Date(dateTimeStr);
            const year = dt.getFullYear().toString();
            const yearPath = fonts.fontMedium.getPath(year, 0, 0, yearFontSize);
            const yearBbox = yearPath.getBoundingBox();
            yearTextWidth = yearBbox.x2 - yearBbox.x1;
          }
        } catch (e) {}
        logoHeight = yearTextWidth;
        logoWidth = yearTextWidth * ratio;
      } else {
        let yearWidth = yearFontSize * 4;
        try {
          if (fonts?.fontMedium && dateTimeStr) {
            const dt = new Date(dateTimeStr);
            const year = dt.getFullYear().toString();
            const yearPath = fonts.fontMedium.getPath(year, 0, 0, yearFontSize);
            const yearBbox = yearPath.getBoundingBox();
            yearWidth = yearBbox.x2 - yearBbox.x1;
          }
        } catch (e) {}
        logoWidth = yearWidth * 2;
        logoHeight = img.naturalHeight * (logoWidth / img.naturalWidth);
      }
      const drawY = bottomY - logoHeight;
      ctx.drawImage(img, x, drawY, logoWidth, logoHeight);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `logos/${logoName}.svg`;
  });
}

export async function renderImage(img, options) {
  const { quality = 1.0, settings = {}, imageOffset = { x: 0, y: 0 }, previewSquareSize = 0 } = options;
  const fonts = await loadFonts();
  if (!img.complete || img.naturalWidth === 0) throw new Error('图片尚未加载完成');
  
  const imgShortEdge = Math.min(img.naturalWidth, img.naturalHeight);
  const canvasWidth = imgShortEdge;
  const canvasHeight = Math.round(canvasWidth * 1.5);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  const squareSize = canvasWidth;
  const imgAspectRatio = img.naturalHeight / img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  
  let drawWidth, drawHeight;
  if (isPortrait) {
    drawWidth = squareSize;
    drawHeight = Math.round(drawWidth * imgAspectRatio);
  } else {
    drawHeight = squareSize;
    drawWidth = Math.round(drawHeight / imgAspectRatio);
  }
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, squareSize, squareSize);
  ctx.clip();
  
  const baseOffsetX = (squareSize - drawWidth) / 2;
  const baseOffsetY = (squareSize - drawHeight) / 2;
  const drawOffsetX = baseOffsetX + imageOffset.x * squareSize;
  const drawOffsetY = baseOffsetY + imageOffset.y * squareSize;
  
  ctx.drawImage(img, drawOffsetX, drawOffsetY, drawWidth, drawHeight);
  ctx.restore();
  
  if (settings) {
    await drawBorderContentTypeE(ctx, canvasWidth, canvasHeight, settings, fonts, previewSquareSize);
  }
  
  return canvas.toDataURL('image/jpeg', quality);
}

export const typeEExport = {
  id: 'type-e-export',
  name: 'Type E Export',
  renderImage
};
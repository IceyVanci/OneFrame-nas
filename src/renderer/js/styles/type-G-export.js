/**
 * Type G 导出渲染模块
 * 布局：白色背景 + 顶部5%留白 + 中部92%×80%照片 + 底部15%文字
 * 文字：第一行 Logo，第二行日期|参数|机型，第三行署名
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
 * 检测 logo 图片的平均亮度
 */
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

/**
 * 判断颜色是否为浅色
 */
function borderColorIsLight(color) {
  if (!color) return true;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
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
 * 绘制 Type G 底部内容
 * 第一行：厂商 Logo
 * 第二行：拍摄日期 | 拍摄参数 | 相机名称
 * 第三行：© 署名
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait = false) {
  // 底部文字区域：纵向 7.5%，横向 15%
  const textRatio = isPortrait ? 0.075 : 0.15;
  const textAreaHeight = canvasHeight * textRatio;
  const textAreaTop = canvasHeight * (1 - textRatio);
  const textCenterY = textAreaTop + textAreaHeight / 2;
  const centerX = canvasWidth / 2;
  
  // 字号按画布宽度缩放
  const baseScale = canvasWidth / 900;
  const line1FontSize = Math.round(14 * baseScale);
  const line2FontSize = Math.round(14 * baseScale); // 与第一行相同字号
  const lineHeight1 = Math.round(line1FontSize * 1.2); // Logo 行高
  const lineHeight2 = Math.round(line2FontSize * 1.4);
  const lineGap = Math.round(6 * baseScale);
  const signatureGap = Math.round(6 * baseScale);
  
  // 第一行：Logo
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
  
  // 绘制第一行：Logo（纵向高度再减半，横向 = canvasHeight × 2.5%，纵向 = canvasHeight × 1.25%）
  if (hasLogo) {
    const logoMaxHeight = Math.round(canvasHeight * (isPortrait ? 0.0125 : 0.025));
    await drawLogoG(ctx, settings.selectedLogo, centerX, line1Y, logoMaxHeight);
  }
  
  // 绘制第二行
  if (line2Text) {
    drawText(ctx, line2Text, centerX, line2Y, line2FontSize, {
      color: '#000000', fontWeight: '500', align: 'center'
    });
  }
  
  // 绘制第三行（署名）
  if (line3Text) {
    const line3Y = line2Text ? line2Y + lineHeight2 / 2 + signatureGap + lineHeight2 / 2 : line2Y + signatureGap;
    drawText(ctx, line3Text, centerX, line3Y, Math.round(12 * baseScale), {
      color: '#000000', fontWeight: 'normal', align: 'center'
    });
  }
}

/**
 * 绘制 Logo（Type G 专用）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} logoName - Logo 文件名
 * @param {number} centerX - 居中 X 坐标
 * @param {number} centerY - Y 坐标（文字基线）
 * @param {number} maxHeight - 最大高度
 */
function drawLogoG(ctx, logoName, centerX, centerY, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let drawWidth = img.naturalWidth;
      let drawHeight = img.naturalHeight;
      
      // 始终缩放到目标高度（保持比例）
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
 * 渲染 Type G 导出图片
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
  
  // 画布尺寸：纵向图片照片占 90%，横向图片照片占 80%
  const canvasWidth = img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  const heightRatio = isPortrait ? 0.9 : 0.8;
  const canvasHeight = Math.round(img.naturalHeight / heightRatio);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 1. 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 2. 绘制照片（92% 宽度，纵向 90%/横向 80% 高度，纵向 2.5%/横向 5% 顶部，左右 4%）
  const photoX = canvasWidth * 0.04;
  const photoY = canvasHeight * (isPortrait ? 0.025 : 0.05);
  const photoWidth = canvasWidth * 0.92;
  const photoHeight = canvasHeight * (isPortrait ? 0.90 : 0.80);
  
  // 使用 object-fit: cover 逻辑裁剪图片
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
 * Type G 导出样式配置
 */
export const typeGExport = {
  id: 'type-g-export',
  name: 'Type G Export',
  renderImage
};
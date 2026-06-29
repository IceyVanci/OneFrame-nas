/**
 * Type F 导出渲染模块
 * 布局：白色背景 + 顶部5%留白 + 中部92%×80%照片 + 底部15%文字
 * 文字：第一行 "Shot on" 灰色 + 品牌黑色 + 机型黑色，第二行参数灰色
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
 * 绘制 Type F 底部文字内容
 * 第一行："Shot on"（灰色）+ 品牌名称（黑色）+ 机型（黑色）
 * 第二行：日期 光圈 焦距 快门 ISO（全部灰色）
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth - 画布宽度
 * @param {number} canvasHeight - 画布高度
 * @param {Object} settings - 设置
 * @param {Object} fonts - 字体对象
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait = false) {
  // 底部文字区域：纵向 7.5%，横向 15%
  const textRatio = isPortrait ? 0.075 : 0.15;
  const textAreaHeight = canvasHeight * textRatio;
  const textAreaTop = canvasHeight * (1 - textRatio);
  const textCenterY = textAreaTop + textAreaHeight / 2;
  const centerX = canvasWidth / 2;
  
  // 字号按画布宽度缩放（与 Type A 一致的方式：基于预览基准尺寸）
  const baseScale = canvasWidth / 900;  // 预览基准宽度
  const line1FontSize = Math.round(14 * baseScale);   // CSS: 14px
  const line2FontSize = Math.round(12 * baseScale);   // CSS: 12px
  const lineHeight1 = Math.round(line1FontSize * 1.4);  // CSS line-height: 1.4
  const lineHeight2 = Math.round(line2FontSize * 1.4);
  const lineGap = Math.round(6 * baseScale);           // CSS .type-f-lines-group gap: 6px
  const signatureGap = Math.round(6 * baseScale);      // CSS .type-f-line3 margin-top: 6px
  
  // 设备型号（已含品牌名，如 "Sony A7M4"）
  const modelName = (settings.showModel && settings.customModel) ? settings.customModel : '';
  const line1Text = modelName ? `Shot on ${modelName}` : '';
  
  // 构建第二行文字
  const line2Parts = [];
  if (settings.dateTime && settings.showTime) {
    line2Parts.push(formatDateForDisplay(settings.dateTime));
  }
  if (settings.showParams && settings.fNumber) line2Parts.push(`f/${settings.fNumber}`);
  if (settings.showParams && settings.focalLength) line2Parts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.showParams && settings.exposureTime) line2Parts.push(`${settings.exposureTime}s`);
  if (settings.showParams && settings.iso) line2Parts.push(`ISO${settings.iso}`);
  const line2Text = line2Parts.join(' ');
  
  // 构建第三行文字
  const signatureText = settings.signatureText || '';
  const line3Text = signatureText ? `© ${signatureText}` : '';
  
  // 计算前两行的总高度（lines-group）
  const groupHeight = (line1Text ? lineHeight1 : 0) + lineGap + (line2Text ? lineHeight2 : 0);
  // lines-group 垂直居中，第一行的 Y 坐标
  const line1Y = textCenterY - groupHeight / 2 + (line1Text ? lineHeight1 / 2 : 0);
  // 第二行的 Y 坐标 = 第一行 Y + 半行1高 + gap + 半行2高
  const line2Y = line1Y + lineHeight1 / 2 + lineGap + lineHeight2 / 2;
  
  // 绘制第一行
  if (line1Text) {
    const shotOnPart = 'Shot on ';
    const modelPart = modelName;
    
    ctx.font = `500 ${line1FontSize}px 'MiSans', sans-serif`;
    const shotOnWidth = ctx.measureText(shotOnPart).width;
    const totalWidth = ctx.measureText(line1Text).width;
    const startX = centerX - totalWidth / 2;
    
    // "Shot on" 灰色
    drawText(ctx, shotOnPart, startX + shotOnWidth / 2, line1Y, line1FontSize, {
      color: '#888888', fontWeight: '500', align: 'center'
    });
    // 机型黑色
    drawText(ctx, modelPart, startX + shotOnWidth + ctx.measureText(modelPart).width / 2, line1Y, line1FontSize, {
      color: '#000000', fontWeight: '500', align: 'center'
    });
  }
  
  // 绘制第二行
  if (line2Text) {
    drawText(ctx, line2Text, centerX, line2Y, line2FontSize, {
      color: '#888888', fontWeight: 'normal', align: 'center'
    });
  }
  
  // 绘制第三行（署名，独立在下方）
  if (line3Text) {
    const line3Y = line2Text ? line2Y + lineHeight2 / 2 + signatureGap + lineHeight2 / 2 : line2Y + signatureGap;
    drawText(ctx, line3Text, centerX, line3Y, line2FontSize, {
      color: '#888888', fontWeight: 'normal', align: 'center'
    });
  }
}

/**
 * 渲染 Type F 导出图片
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
    // 图片更宽，裁剪左右
    srcW = Math.round(img.naturalHeight * areaRatio);
    srcX = Math.round((img.naturalWidth - srcW) / 2);
  } else {
    // 图片更高，裁剪上下
    srcH = Math.round(img.naturalWidth / areaRatio);
    srcY = Math.round((img.naturalHeight - srcH) / 2);
  }
  
  // 圆角裁剪（按比例缩放）
  const baseScaleF = canvasWidth / 900;
  const cornerRadiusF = Math.round(12 * baseScaleF);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoWidth, photoHeight, cornerRadiusF);
  ctx.clip();
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);
  ctx.restore();
  
  // 3. 绘制底部文字内容
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type F 导出样式配置
 */
export const typeFExport = {
  id: 'type-f-export',
  name: 'Type F Export',
  renderImage
};
/**
 * Type N 导出渲染模块
 * 布局：白色背景 + 顶部7.5% Logo + 中部85%照片 + 底部7.5%文字
 * 纵向图片：顶部3.75% + 中部92.5% + 底部3.75%
 * 文字：第一行拍摄参数（标签Medium+数值Normal），第二行署名
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
 * 绘制 Logo（Type N 专用）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} logoName - Logo 文件名
 * @param {number} centerX - 居中 X 坐标
 * @param {number} centerY - Y 坐标（文字基线）
 * @param {number} maxHeight - 最大高度
 */
function drawLogoN(ctx, logoName, centerX, centerY, maxHeight) {
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
 * 绘制 Type N 边框内容
 * 顶部：Logo 居中
 * 底部：参数行 + 署名行
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait = false) {
  const centerX = canvasWidth / 2;
  
  // 字号按画布宽度缩放
  const baseScale = canvasWidth / 900;
  const lineFontSize = Math.round(14 * baseScale);
  const lineHeight = Math.round(lineFontSize * 1.4);
  const signatureGap = Math.round(6 * baseScale);
  
  // ===== 顶部 Logo 区域 =====
  const hasLogo = settings.selectedLogo && settings.showLogo;
  if (hasLogo) {
    const topAreaHeight = canvasHeight * (isPortrait ? 0.0375 : 0.075);
    const logoMaxHeight = Math.round(topAreaHeight * 0.5);
    const logoCenterY = topAreaHeight / 2;
    await drawLogoN(ctx, settings.selectedLogo, centerX, logoCenterY, logoMaxHeight);
  }
  
  // ===== 底部文字区域 =====
  const textRatio = isPortrait ? 0.0375 : 0.075;
  const textAreaHeight = canvasHeight * textRatio;
  const textAreaTop = canvasHeight - textAreaHeight;
  const textCenterY = textAreaTop + textAreaHeight / 2;
  
  // 第一行：拍摄参数（标签 Medium，数值 Normal）
  const paramParts = [];
  if (settings.showParams && settings.fNumber) paramParts.push({ label: 'Aperture', value: `f/${settings.fNumber}` });
  if (settings.showParams && settings.focalLength) paramParts.push({ label: 'Focal', value: `${String(settings.focalLength).replace(/mm$/i, '')}mm` });
  if (settings.showParams && settings.exposureTime) paramParts.push({ label: 'Shutter', value: `${settings.exposureTime}s` });
  if (settings.showParams && settings.iso) paramParts.push({ label: 'ISO', value: `${settings.iso}` });
  
  // 第二行：署名
  const signatureText = settings.signatureText || '';
  const line2Text = signatureText ? `© ${signatureText}` : '';
  
  // 计算布局位置：两行文字整体在底部区域垂直居中
  const signatureLineHeight = Math.round(12 * baseScale);
  const totalGroupHeight = lineHeight + signatureGap + signatureLineHeight;
  const line1Y = textCenterY - totalGroupHeight / 2 + lineHeight / 2;
  const line2Y = line1Y + lineHeight / 2 + signatureGap + signatureLineHeight / 2;
  
  // 绘制第一行（参数）— 逐段绘制以实现混合字重
  if (paramParts.length > 0) {
    const separator = '  ';
    const segments = [];
    paramParts.forEach((p, i) => {
      segments.push({ text: p.label, weight: '500' });
      segments.push({ text: ' ' + p.value, weight: 'normal' });
      if (i < paramParts.length - 1) {
        segments.push({ text: separator, weight: 'normal' });
      }
    });
    let totalWidth = 0;
    segments.forEach(seg => {
      ctx.font = `${seg.weight} ${lineFontSize}px 'MiSans', sans-serif`;
      totalWidth += ctx.measureText(seg.text).width;
    });
    let x = centerX - totalWidth / 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    segments.forEach(seg => {
      ctx.font = `${seg.weight} ${lineFontSize}px 'MiSans', sans-serif`;
      ctx.fillText(seg.text, x, line1Y);
      x += ctx.measureText(seg.text).width;
    });
  }
  
  // 绘制第二行（署名）
  if (line2Text) {
    drawText(ctx, line2Text, centerX, line2Y, Math.round(12 * baseScale), {
      color: '#000000', fontWeight: 'normal', align: 'center'
    });
  }
}

/**
 * 渲染 Type N 导出图片
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
  
  const canvasWidth = img.naturalWidth;
  const isPortrait = img.naturalHeight > img.naturalWidth;
  const heightRatio = isPortrait ? 0.925 : 0.85;
  const canvasHeight = Math.round(img.naturalHeight / heightRatio);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 1. 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 2. 绘制照片
  const photoX = canvasWidth * 0.04;
  const photoY = canvasHeight * (isPortrait ? 0.0375 : 0.075);
  const photoWidth = canvasWidth * 0.92;
  const photoHeight = canvasHeight * (isPortrait ? 0.925 : 0.85);
  
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
  
  const baseScaleN = canvasWidth / 900;
  const cornerRadiusN = Math.round(12 * baseScaleN);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoWidth, photoHeight, cornerRadiusN);
  ctx.clip();
  ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoWidth, photoHeight);
  ctx.restore();
  
  // 3. 绘制边框内容
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts, isPortrait);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type N 导出样式配置
 */
export const typeNExport = {
  id: 'type-n-export',
  name: 'Type N Export',
  renderImage
};
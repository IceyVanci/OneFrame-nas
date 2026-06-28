/**
 * Type K 导出渲染模块
 * 布局：照片 100% 填满画布，底部左下角 Logo + 双行文字
 * Logo 右侧第一行：署名 + 日期
 * Logo 右侧第二行：机型名称 + 拍摄参数
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
 * 绘制 Logo（Type K 专用，左对齐）
 * @returns {number} Logo 右侧 x 坐标
 */
function drawLogoK(ctx, logoName, x, centerY, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let drawWidth = img.naturalWidth;
      let drawHeight = img.naturalHeight;
      
      // 缩放到目标高度（保持比例）
      drawWidth = drawWidth * (maxHeight / drawHeight);
      drawHeight = maxHeight;
      
      // 左对齐：x 即为左边缘
      const drawY = centerY - drawHeight / 2;
      ctx.drawImage(img, x, drawY, drawWidth, drawHeight);
      resolve(x + drawWidth);
    };
    img.onerror = () => resolve(x);
    img.src = `logos/${logoName}.svg`;
  });
}

/**
 * 绘制 Type K 底部内容
 * 底部左下角 Logo + 双行文字
 */
async function drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts) {
  // 字号按画布宽度缩放
  const baseScale = canvasWidth / 900;
  let fontSize = Math.round(14 * baseScale);
  
  // 纵向图片：底部字体增加 50%
  const isPortrait = canvasHeight > canvasWidth;
  if (isPortrait) {
    fontSize = Math.round(fontSize * 1.5);
  }
  const lineHeight = fontSize;
  const gap = Math.round(fontSize * 0.7);
  const lineGap = Math.round(fontSize * 0.3);
  
  const textColor = settings.textColor || '#ffffff';
  
  // 底部锚定：与 CSS bottom: 3% 对齐
  const bottomAnchorY = canvasHeight * 0.97;
  const leftX = canvasWidth * 0.05;
  
  // Logo 高度，纵向居中于两行文字之间
  const logoHeight = Math.round(fontSize * 1.2);
  const line2Y = bottomAnchorY - lineHeight / 2;
  const line1Y = line2Y - lineHeight / 2 - lineGap - lineHeight / 2;
  const logoCenterY = (line1Y + line2Y) / 2;
  
  // 绘制 Logo
  let textStartX = leftX;
  const hasLogo = settings.selectedLogo && settings.showLogo !== false;
  if (hasLogo) {
    textStartX = await drawLogoK(ctx, settings.selectedLogo, leftX, logoCenterY, logoHeight);
    textStartX += gap;
  }
  
  // 第一行：署名（medium）+ 日期（normal）
  const signatureText = settings.signatureText || 'OneFrame';
  const dateText = formatDateForDisplay(settings.dateTime);
  
  // 第二行：机型（medium）+ 拍摄参数（normal）
  const modelText = settings.customModel || '';
  const paramParts = [];
  if (settings.focalLength) paramParts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.fNumber) paramParts.push(`f/${settings.fNumber}`);
  if (settings.exposureTime) paramParts.push(`${settings.exposureTime}s`);
  if (settings.iso) paramParts.push(`ISO${settings.iso}`);
  const paramsText = paramParts.join(' ');
  
  // 绘制第一行：署名(medium) + 日期(normal)
  if (signatureText || dateText) {
    // 先绘制署名（medium）
    const sigFull = signatureText ? `© ${signatureText}` : '';
    if (sigFull) {
      drawText(ctx, sigFull, textStartX, line1Y, fontSize, {
        color: textColor, fontWeight: '500', align: 'left'
      });
    }
    // 再绘制日期（normal），紧随署名之后
    if (dateText) {
      const sigWidth = sigFull ? ctx.measureText(sigFull).width + fontSize * 0.7 : 0;
      ctx.font = `500 ${fontSize}px 'MiSans', sans-serif`;
      const actualSigWidth = sigFull ? ctx.measureText(sigFull).width : 0;
      drawText(ctx, dateText, textStartX + actualSigWidth + fontSize * 0.7, line1Y, fontSize, {
        color: textColor, fontWeight: 'normal', align: 'left'
      });
    }
  }
  
  // 绘制第二行：机型(medium) + 参数(normal)
  if (modelText || paramsText) {
    // 先绘制机型（medium）
    if (modelText) {
      drawText(ctx, modelText, textStartX, line2Y, fontSize, {
        color: textColor, fontWeight: '500', align: 'left'
      });
    }
    // 再绘制参数（normal），紧随机型之后
    if (paramsText) {
      ctx.font = `500 ${fontSize}px 'MiSans', sans-serif`;
      const modelWidth = modelText ? ctx.measureText(modelText).width : 0;
      drawText(ctx, paramsText, textStartX + modelWidth + (modelText ? fontSize * 0.7 : 0), line2Y, fontSize, {
        color: textColor, fontWeight: 'normal', align: 'left'
      });
    }
  }
}

/**
 * 渲染 Type K 导出图片
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
  
  // 画布大小 = 图片原始大小（无额外白色区域）
  const canvasWidth = img.naturalWidth;
  const canvasHeight = img.naturalHeight;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 绘制照片（100% 填满画布，保持比例裁剪）
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
  
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvasWidth, canvasHeight);
  
  // 绘制底部内容
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type K 导出样式配置
 */
export const typeKExport = {
  id: 'type-k-export',
  name: 'Type K Export',
  renderImage
};
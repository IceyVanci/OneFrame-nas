/**
 * Type J 导出渲染模块
 * 布局：照片 100% 填满画布，署名在底部第一行，参数行三栏布局
 * 基于 Type H 调整：不显示 Logo，署名替代 Logo 位置，参数行左机型/中参数/右时间
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
 * 绘制 Type J 底部内容
 * 署名在底部第一行（原 Logo 位置）
 * 参数行三栏：左机型/中参数/右时间
 * 定位方式：底部锚定（与 CSS bottom: 3% 对齐）
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
  // line-height: 1 与 CSS 一致
  const lineHeight = fontSize;
  // margin-bottom: 0.5em 与 CSS 一致
  const gap = Math.round(fontSize * 0.5);
  
  const textColor = settings.textColor || '#ffffff';
  
  // 底部锚定：CSS .type-j-bottom { bottom: 3% }
  // 内容从底部向上排列：参数行在下，署名在上
  const bottomAnchorY = canvasHeight * 0.97;
  
  // 署名（与参数同字号，位于底部第一行即上方）
  const signatureText = settings.signatureText || 'OneFrame';
  
  // 参数行内容
  const modelText = settings.customModel || '';
  const paramParts = [];
  if (settings.focalLength) paramParts.push(`${String(settings.focalLength).replace(/mm$/i, '')}mm`);
  if (settings.fNumber) paramParts.push(`f/${settings.fNumber}`);
  if (settings.exposureTime) paramParts.push(`${settings.exposureTime}s`);
  if (settings.iso) paramParts.push(`ISO${settings.iso}`);
  const paramsText = paramParts.join(' ');
  const timeText = formatDateForDisplay(settings.dateTime);
  const hasParamsRow = modelText || paramsText || timeText;
  
  // 从底部锚点向上布局：参数行在下，署名在上
  const paramsY = bottomAnchorY - (hasParamsRow ? lineHeight / 2 : 0);
  const signatureY = hasParamsRow
    ? paramsY - lineHeight / 2 - gap - lineHeight / 2
    : bottomAnchorY - lineHeight / 2;
  
  // 绘制署名
  if (signatureText) {
    drawText(ctx, `© ${signatureText}`, canvasWidth / 2, signatureY, fontSize, {
      color: textColor, fontWeight: '500', align: 'center'
    });
  }
  
  // 绘制参数行三栏
  if (hasParamsRow) {
    const leftX = canvasWidth * 0.05;
    const centerX = canvasWidth / 2;
    const rightX = canvasWidth * 0.95;
    
    // 左栏：机型
    if (modelText) {
      drawText(ctx, modelText, leftX, paramsY, fontSize, {
        color: textColor, fontWeight: 'normal', align: 'left'
      });
    }
    
    // 中栏：参数
    if (paramsText) {
      drawText(ctx, paramsText, centerX, paramsY, fontSize, {
        color: textColor, fontWeight: 'normal', align: 'center'
      });
    }
    
    // 右栏：时间
    if (timeText) {
      drawText(ctx, timeText, rightX, paramsY, fontSize, {
        color: textColor, fontWeight: 'normal', align: 'right'
      });
    }
  }
}

/**
 * 渲染 Type J 导出图片
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;
  
  const fonts = await loadFonts();
  
  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }
  
  const canvasWidth = img.naturalWidth;
  const canvasHeight = img.naturalHeight;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
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
  
  await drawBorderContent(ctx, canvasWidth, canvasHeight, settings, fonts);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type J 导出样式配置
 */
export const typeJExport = {
  id: 'type-j-export',
  name: 'Type J Export',
  renderImage
};
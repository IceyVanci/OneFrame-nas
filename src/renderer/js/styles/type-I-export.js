/**
 * Type I 导出渲染模块
 * 布局：照片 100% 填满画布，Logo 在顶部居中，底部仅显示署名
 * 基于 Type H 调整：Logo 移至顶部，移除参数、机型和时间
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
 * 绘制 Type I 底部内容
 * 顶部：厂商 Logo（居中）
 * 底部：© 署名
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
  
  // 顶部 Logo
  const hasLogo = settings.selectedLogo && settings.showLogo;
  if (hasLogo) {
    const logoMaxHeight = Math.round(canvasHeight * 0.025);
    const logoCenterY = canvasHeight * 0.03 + logoMaxHeight / 2;
    await drawLogoI(ctx, settings.selectedLogo, canvasWidth / 2, logoCenterY, logoMaxHeight);
  }
  
  // 底部署名
  const textColor = settings.textColor || '#ffffff';
  const signatureText = settings.signatureText || 'OneFrame';
  
  if (signatureText) {
    const bottomY = canvasHeight * 0.97;
    drawText(ctx, `© ${signatureText}`, canvasWidth / 2, bottomY, fontSize, {
      color: textColor, fontWeight: 'normal', align: 'center'
    });
  }
}

/**
 * 绘制 Logo（Type I 专用）
 */
function drawLogoI(ctx, logoName, centerX, centerY, maxHeight) {
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
 * 渲染 Type I 导出图片
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
 * Type I 导出样式配置
 */
export const typeIExport = {
  id: 'type-i-export',
  name: 'Type I Export',
  renderImage
};
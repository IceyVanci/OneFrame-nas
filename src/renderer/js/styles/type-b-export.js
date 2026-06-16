/**
 * Type B 导出渲染模块
 * 负责在 Canvas 上绘制边框和内容
 * 当前与 Type A 相同，稍后可自定义
 */

// 使用全局 opentype 变量（从 CDN 加载）
const opentype = window.opentype;

// 预加载字体
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
 * 使用 ctx.fillText 绘制文字（与 CSS 样式一致）
 */
function drawText(ctx, font, text, x, y, fontSize, options = {}) {
  const color = options.color || '#000000';
  const fontWeight = options.fontWeight || 'normal';
  
  ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  
  if (options.align === 'right') {
    ctx.textAlign = 'right';
  } else if (options.align === 'center') {
    ctx.textAlign = 'center';
  } else {
    ctx.textAlign = 'left';
  }
  
  ctx.fillText(text, x, y);
}

/**
 * 绘制边框内容
 */
async function drawBorderContent(ctx, imgWidth, imgHeight, borderHeight, settings, fonts) {
  const borderTop = imgHeight;
  const textColor = borderColorIsLight(settings.borderColor) ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  
  const isLandscape = imgWidth > imgHeight;
  const baseScale = isLandscape ? imgWidth : imgHeight;
  const previewBase = 900;
  const scale = baseScale / previewBase;
  
  const fontSize = Math.round(12 * scale);
  const largeFontSize = Math.round(24 * scale);
  
  const baseWidth = imgWidth;
  const infoRightX = baseWidth * 0.5;
  const focalX = baseWidth * 0.525;
  const rightEdgeX = baseWidth * 0.975;
  
  const centerY = borderTop + borderHeight / 2;
  const lineGap = Math.round(2 * scale);
  const lineOffset = fontSize / 2 + lineGap / 2;
  
  // Logo
  const logoX = baseWidth * 0.025;
  if (settings.selectedLogo && settings.showLogo) {
    const promise = new Promise((resolve) => {
      drawLogo(ctx, settings.selectedLogo, logoX, centerY, borderHeight, baseWidth, settings.borderColor, resolve);
    });
    await promise;
  }
  
  // 机型 + 参数
  const hasModel = !!(settings.showModel && settings.customModel);
  const hasParams = !!(settings.showParams && (settings.fNumber || settings.exposureTime || settings.iso));
  
  if (hasModel || hasParams) {
    const rightX = infoRightX;
    
    if (hasModel && hasParams) {
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY - lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      drawText(ctx, fonts.fontNormal, params.join(' '), rightX, centerY + lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    } else if (hasModel) {
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
    } else if (hasParams) {
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      drawText(ctx, fonts.fontNormal, params.join(' '), rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    }
  }
  
  // 焦距
  if (settings.focalLength) {
    drawText(ctx, fonts.fontMedium, settings.focalLength, focalX, centerY, largeFontSize, { color: textColor, fontWeight: '500' });
  }
  
  // 署名 + 时间
  const hasSignature = !!settings.signatureText;
  const hasTime = !!(settings.showTime && settings.dateTime);
  
  if (hasSignature || hasTime) {
    const rightX = rightEdgeX;
    
    if (hasSignature && hasTime) {
      drawText(ctx, fonts.fontSemibold, settings.signatureText, rightX, centerY - lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: '600' });
      drawText(ctx, fonts.fontNormal, formatDateForDisplay(settings.dateTime), rightX, centerY + lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    } else if (hasSignature) {
      drawText(ctx, fonts.fontSemibold, settings.signatureText, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: '600' });
    } else if (hasTime) {
      drawText(ctx, fonts.fontNormal, formatDateForDisplay(settings.dateTime), rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    }
  }
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
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        
        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128;
        resolve(avgBrightness > 100);
      } catch (e) {
        resolve(true);
      }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

/**
 * 绘制 Logo
 */
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
  
  img.onerror = () => {
    if (onComplete) onComplete();
  };
  
  img.src = normalPath;
}

/**
 * 判断边框颜色是否为浅色
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
 * 格式化日期用于显示
 */
function formatDateForDisplay(dateTimeStr) {
  if (!dateTimeStr) return '';
  const dt = new Date(dateTimeStr);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 将 DataURL 转换为 Blob
 */
function dataURLtoBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return new Blob([], { type: 'image/jpeg' });
  }
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 渲染导出图片（仅渲染，不处理 EXIF）
 */
export async function renderImage(img, options) {
  const {
    borderColor = '#ffffff',
    borderHeight = 12,
    quality = 1.0,
    settings = {}
  } = options;

  const fonts = await loadFonts();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  // Type B: 正方形画布，边长 = 图片高度 × 110%
  const squareSize = Math.round(img.naturalHeight * 1.1);
  const margin = Math.round(squareSize * 0.025); // 2.5% 边距
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = squareSize;
  canvas.height = squareSize;
  
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, squareSize, squareSize);
  
  // 图片居左显示，上下左三边距为 2.5%
  const imgAvailableWidth = squareSize - margin * 2;
  const imgAvailableHeight = squareSize - margin * 2;
  
  // 根据图片原始比例计算正确的显示尺寸
  let drawWidth, drawHeight;
  const aspectRatio = img.naturalHeight / img.naturalWidth;
  
  // 以宽度为准计算高度
  drawWidth = imgAvailableWidth;
  drawHeight = Math.round(drawWidth * aspectRatio);
  
  // 如果高度超出限制，以高度为准计算宽度
  if (drawHeight > imgAvailableHeight) {
    drawHeight = imgAvailableHeight;
    drawWidth = Math.round(drawHeight / aspectRatio);
  }
  
  // 计算居左的偏移量（上下居中）
  const drawX = margin;
  const drawY = margin + (imgAvailableHeight - drawHeight) / 2;
  
  // 绘制图片在左侧
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  
  // Type B 的边框内容位置调整（右侧白色区域）
  // 右侧预留约 15% 宽度
  const rightAreaPercent = 0.15;
  const leftAreaWidth = squareSize * (1 - rightAreaPercent);
  const contentLeft = leftAreaWidth;
  const contentWidth = squareSize - leftAreaWidth;
  
  if (contentWidth > 0 && settings) {
    // 计算缩放比例：基于预览画布尺寸（原始正方形尺寸）进行缩放
    const previewSquareSize = squareSize;
    
    // 在右侧白色区域绘制边框内容
    await drawBorderContentTypeB(ctx, squareSize, squareSize, settings, margin, drawWidth, previewSquareSize, fonts);
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type B 专用边框内容绘制（与预览完全一致）
 * 布局：两列显示，左列灰色标签(75px) + 右列黑色数值(75px)
 * 顺序：ShotAt → Focal → Aperture → Shutter → ISO → ShotOn → PhotoBy
 * ShotAt 和 ISO 后有分隔线，Logo 在最下方
 * @param {number} margin - 图片边距（2.5%）
 * @param {number} drawWidth - 实际图片显示宽度
 * @param {number} previewSquareSize - 预览时的画布尺寸（用于计算缩放比例）
 */
async function drawBorderContentTypeB(ctx, canvasWidth, canvasHeight, settings, margin, drawWidth, previewSquareSize, fonts) {
  const textColor = '#000000';
  const grayColor = '#888888';
  
  // 计算缩放比例：预览文字是 12px，缩放到导出画布
  const previewBaseSize = 900; // 预览基准
  const scale = canvasWidth / previewBaseSize;
  
  // 字体大小基于 12px 基准
  const fontSize = Math.round(12 * scale);
  const lineGap = Math.round(9 * scale); // 9px 行距
  const colWidth = Math.round(75 * scale); // 75px 列宽
  const colGap = Math.round(8 * scale);   // 8px 列间距
  const dividerWidth = colWidth * 2 + colGap;
  
  // 使用 opentype 绘制文字的辅助函数（支持对齐）
  const drawOTFText = (font, text, x, y, size, color, align = 'left') => {
    if (!font) return;
    
    // 先获取 path，再从 path 获取边界框
    const tempPath = font.getPath(text, 0, 0, size);
    const bbox = tempPath.getBoundingBox();
    const textWidth = bbox.x2 - bbox.x1;
    
    // 根据对齐调整 x 位置
    let drawX = x;
    if (align === 'right') {
      drawX = x - textWidth;
    } else if (align === 'center') {
      drawX = x - textWidth / 2;
    }
    
    // 绘制文字（opentype y 是 baseline，需要 +size/3 居中）
    const path = font.getPath(text, drawX, y + size / 3, size);
    ctx.fillStyle = color;
    path.draw(ctx);
  };
  
  // 与预览一致的居中计算
  // 文字区域 = squareSize - margin*2 - drawWidth
  // 文字中心 = margin + drawWidth + textAreaWidth/2
  const textAreaWidth = canvasWidth - margin * 2 - drawWidth;
  const textCenterOffset = margin + drawWidth + textAreaWidth / 2;
  
  // 垂直方向：靠下，从底部 5% 开始
  const bottomMarginPx = canvasHeight * 0.05;
  let y = canvasHeight - bottomMarginPx;
  
  // Logo - 在最下方，距离底部 5%
  let logoY = y;
  
  // 先计算需要多少行来确定起始位置（从下往上排）
  const rows = [];
  
  if (settings.signatureText) {
    rows.push({ label: 'PhotoBy', value: settings.signatureText, type: 'photoby' });
  }
  if (settings.customModel && settings.showModel) {
    rows.unshift({ label: 'ShotOn', value: settings.customModel, type: 'shoton' });
  }
  if (settings.iso) {
    rows.unshift({ label: 'ISO', value: String(settings.iso), type: 'iso' });
  }
  if (settings.exposureTime) {
    rows.unshift({ label: 'Shutter', value: `${settings.exposureTime}s`, type: 'shutter' });
  }
  if (settings.fNumber) {
    rows.unshift({ label: 'Aperture', value: `f/${settings.fNumber}`, type: 'aperture' });
  }
  if (settings.focalLength) {
    rows.unshift({ label: 'Focal', value: `${String(settings.focalLength).replace(/mm$/i, '')}mm`, type: 'focal' });
  }
  if (settings.dateTime && settings.showTime) {
    rows.unshift({ label: 'ShotAt', value: `${new Date(settings.dateTime).getFullYear()}/${String(new Date(settings.dateTime).getMonth() + 1).padStart(2, '0')}/${String(new Date(settings.dateTime).getDate()).padStart(2, '0')}`, type: 'shotat' });
  }
  
  // 计算总高度（用于垂直居中）
  const rowHeight = fontSize + lineGap;
  let totalHeight = rows.length * rowHeight;
  // 加上分隔线高度
  if (settings.dateTime && settings.showTime) totalHeight += lineGap;
  if (settings.iso) totalHeight += lineGap;
  // 加上 Logo 空间（缩放）
  if (settings.selectedLogo && settings.showLogo) totalHeight += Math.round(36 * scale) + Math.round(40 * scale);
  
  // 从底部向上计算起始位置
  y = canvasHeight - bottomMarginPx - totalHeight;
  
  // 两列布局的 X 坐标
  const leftColX = textCenterOffset - colGap / 2 - colWidth;
  const rightColX = textCenterOffset + colGap / 2;
  const dividerStartX = textCenterOffset - dividerWidth / 2;
  
  ctx.textBaseline = 'middle';
  
  // ShotAt - 时间
  if (settings.dateTime && settings.showTime) {
    const dt = new Date(settings.dateTime);
    const timeStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    // 使用 opentype 绘制：标签右对齐 + 数值左对齐
    drawOTFText(fonts.fontNormal, 'ShotAt', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontNormal, timeStr, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
    
    // 分隔线 - ShotAt 后
    ctx.fillStyle = grayColor;
    ctx.fillRect(dividerStartX, y - lineGap / 2, dividerWidth, 1);
    y += lineGap;
  }
  
  // Focal - 焦距
  if (settings.focalLength) {
    const focalVal = String(settings.focalLength).replace(/mm$/i, '');
    drawOTFText(fonts.fontNormal, 'Focal', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontNormal, `${focalVal}mm`, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
  }
  
  // Aperture - 光圈
  if (settings.fNumber) {
    drawOTFText(fonts.fontNormal, 'Aperture', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontNormal, `f/${settings.fNumber}`, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
  }
  
  // Shutter - 快门
  if (settings.exposureTime) {
    drawOTFText(fonts.fontNormal, 'Shutter', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontNormal, `${settings.exposureTime}s`, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
  }
  
  // ISO
  if (settings.iso) {
    drawOTFText(fonts.fontNormal, 'ISO', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontNormal, String(settings.iso), rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
    
    // 分隔线 - ISO 后
    ctx.fillStyle = grayColor;
    ctx.fillRect(dividerStartX, y - lineGap / 2, dividerWidth, 1);
    y += lineGap;
  }
  
  // ShotOn - 机型
  if (settings.customModel && settings.showModel) {
    drawOTFText(fonts.fontMedium, 'ShotOn', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontMedium, settings.customModel, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
  }
  
  // PhotoBy - 署名（仅在有值时显示）
  if (settings.signatureText) {
    drawOTFText(fonts.fontSemibold, 'PhotoBy', leftColX + colWidth, y, fontSize, grayColor, 'right');
    drawOTFText(fonts.fontSemibold, settings.signatureText, rightColX, y, fontSize, textColor, 'left');
    y += fontSize + lineGap;
  }
  
  // Logo - 在最下方，距离参数 36px
  if (settings.selectedLogo && settings.showLogo) {
    y += Math.round(36 * scale);
    await drawLogoTypeB(ctx, settings.selectedLogo, textCenterOffset, y, scale);
  }
}

/**
 * 绘制 Logo (Type B)
 * 方形 logo 放大到 40px，非方形 20px
 */
async function drawLogoTypeB(ctx, logoName, x, y, scale) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      let logoHeight;
      if (ratio >= 0.8 && ratio <= 1.2) {
        // 方形 logo，放大到 40px
        logoHeight = Math.round(40 * scale);
      } else {
        // 非方形 logo，20px
        logoHeight = Math.round(20 * scale);
      }
      const logoWidth = (img.width / img.height) * logoHeight;
      ctx.drawImage(img, x - logoWidth / 2, y - logoHeight / 2, logoWidth, logoHeight);
      resolve();
    };
    
    img.onerror = () => resolve();
    img.src = `logos/${logoName}.svg`;
  });
}

/**
 * Type B 导出样式配置
 */
export const typeBExport = {
  id: 'type-b-export',
  name: 'Type B Export',
  
  renderImage
};

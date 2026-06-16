/**
 * Type C 导出渲染模块
 * 负责在 Canvas 上绘制边框和内容
 * 当前与 Type A 相同，后续可自定义
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} font - opentype 字体（仅用于获取 fontFamily）
 * @param {string} text - 文字
 * @param {number} x - X 坐标（right 对齐时为右边界）
 * @param {number} y - Y 坐标
 * @param {number} fontSize - 字号
 * @param {Object} options - 选项 { align: 'left'|'right'|'center', color: '#000000', fontWeight: 'normal' }
 */
function drawText(ctx, font, text, x, y, fontSize, options = {}) {
  const color = options.color || '#000000';
  const fontWeight = options.fontWeight || 'normal';
  
  // 设置字体样式（与 CSS 保持一致）
  ctx.font = `${fontWeight} ${fontSize}px 'MiSans', sans-serif`;
  ctx.fillStyle = color;
  
  // 设置文字基线为中线，与 CSS flexbox 垂直居中匹配
  ctx.textBaseline = 'middle';
  
  // 根据对齐方式设置 textAlign
  if (options.align === 'right') {
    ctx.textAlign = 'right';
  } else if (options.align === 'center') {
    ctx.textAlign = 'center';
  } else {
    ctx.textAlign = 'left';
  }
  
  // 直接使用 fillText 绘制文字
  ctx.fillText(text, x, y);
}

/**
 * 绘制边框内容 - 与 CSS 样式完全匹配
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} imgWidth - 图片宽度
 * @param {number} imgHeight - 图片高度
 * @param {number} borderHeight - 边框高度
 * @param {Object} settings - 设置
 * @param {Object} fonts - { fontSemibold, fontNormal }
 */
async function drawBorderContent(ctx, imgWidth, imgHeight, borderHeight, settings, fonts) {
  // 调试日志
  console.log('=== drawBorderContent ===');
  console.log('imgWidth:', imgWidth, 'borderHeight:', borderHeight);
  console.log('showModel:', settings.showModel, 'customModel:', settings.customModel);
  console.log('showParams:', settings.showParams, 'fNumber:', settings.fNumber, 'exposureTime:', settings.exposureTime, 'iso:', settings.iso);
  console.log('signatureText:', settings.signatureText);
  console.log('showTime:', settings.showTime, 'dateTime:', settings.dateTime);
  console.log('========================');
  
  const borderTop = imgHeight;
  const textColor = borderColorIsLight(settings.borderColor) ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  
  // 字号 - 与 CSS 保持完全一致，但需要按比例放大以匹配原图尺寸
  // 横向图片：基于图片宽度计算；纵向图片：基于图片高度计算
  const isLandscape = imgWidth > imgHeight;
  const baseScale = isLandscape ? imgWidth : imgHeight;  // 基准尺寸
  const previewBase = 900;  // CSS 基准尺寸
  const scale = baseScale / previewBase;
  
  // 纵向图片时字体大小额外减小 30%
  const isPortrait = imgWidth < imgHeight;
  const fontScale = isPortrait ? 0.7 : 1.0;
  const fontSize = Math.round(12 * scale * fontScale);     // 基础字号（CSS: 12px）放大
  const largeFontSize = Math.round(24 * scale * fontScale); // 焦距大字（CSS: 24px）放大
  
  // 使用图片宽度计算百分比位置
  const baseWidth = imgWidth;
  
  // Type C 布局位置（与 css/type-c.css 完全一致）
  // 左下：署名 + 时间 { left: 2.5%; width: 17.5% }
  // 中间：Logo { left: 58.75%; width: 12.5% }（Logo 中心在 65%）
  // 右下：机型 + 参数 { left: 77.5%; right: 2.5% }
  const leftX = baseWidth * 0.025;     // 2.5% - 左下区域左边界
  const leftWidth = baseWidth * 0.175; // 17.5% - 左下区域宽度
  const logoX = baseWidth * 0.5875;    // 58.75% - Logo 区域左边界（中心在 65%）
  const logoWidth = baseWidth * 0.125; // 12.5% - Logo 区域宽度
  const infoRightX = baseWidth * 0.975; // 97.5% - 右下区域右边界
  
  // 垂直居中 - 边框顶部 + 一半高度
  const centerY = borderTop + borderHeight / 2;
  const lineGap = Math.round(2 * scale);  // CSS: gap: 2px，按比例放大
  // 两行文字的偏移：各自偏离中心半个行高+gap
  const lineOffset = fontSize / 2 + lineGap / 2;
  
  // 1. Logo（中间位置，中心在 65% 处）
  const logoPromises = [];
  if (settings.selectedLogo && settings.showLogo) {
    const promise = new Promise((resolve) => {
      drawLogo(ctx, settings.selectedLogo, logoX, centerY, borderHeight, logoWidth, settings.borderColor, resolve);
    });
    logoPromises.push(promise);
  }
  
  // 2. 机型 + 拍摄参数（机型和参数合并显示，参数包含焦距）
  // .border-info { left: 77.5%; right: 2.5% }，内容靠右对齐
  const hasModel = !!(settings.showModel && settings.customModel);
  const hasParams = !!(settings.showParams && (settings.fNumber || settings.exposureTime || settings.focalLength || settings.iso));
  
  if (hasModel || hasParams) {
    const rightX = baseWidth * 0.975;  // 97.5% 位置
    
    if (hasModel && hasParams) {
      // 两行：机型在上，参数在下（参数包含焦距）
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY - lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.focalLength) params.push(settings.focalLength);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      const paramsText = params.join(' ');
      drawText(ctx, fonts.fontNormal, paramsText, rightX, centerY + lineOffset, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    } else if (hasModel) {
      // 只有机型：居中（Medium）
      drawText(ctx, fonts.fontMedium, settings.customModel, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: '500' });
    } else if (hasParams) {
      // 只有参数：居中（参数包含焦距）
      const params = [];
      if (settings.fNumber) params.push(`f/${settings.fNumber}`);
      if (settings.exposureTime) params.push(`${settings.exposureTime}s`);
      if (settings.focalLength) params.push(settings.focalLength);
      if (settings.iso) params.push(`ISO${settings.iso}`);
      const paramsText = params.join(' ');
      drawText(ctx, fonts.fontNormal, paramsText, rightX, centerY, fontSize, { align: 'right', color: textColor, fontWeight: 'normal' });
    }
  }
  
  // 3. 署名 + 时间（左下角位置，.border-left { left: 2.5%; width: 17.5% }）
  // CSS .border-left-inner { justify-content: flex-start } 使内容居左
  // 当只有一行时居中，有两行时上下分布
  const hasSignature = !!settings.signatureText;
  const hasTime = !!(settings.showTime && settings.dateTime);
  
  if (hasSignature || hasTime) {
    const leftX = baseWidth * 0.025;  // 2.5% 位置
    
    if (hasSignature && hasTime) {
      // 两行：署名在上，时间在下（居左对齐）
      drawText(ctx, fonts.fontSemibold, settings.signatureText, leftX, centerY - lineOffset, fontSize, { align: 'left', color: textColor, fontWeight: '600' });
      const timeStr = formatDateForDisplay(settings.dateTime);
      drawText(ctx, fonts.fontNormal, timeStr, leftX, centerY + lineOffset, fontSize, { align: 'left', color: textColor, fontWeight: 'normal' });
    } else if (hasSignature) {
      // 只有署名：居中（居左对齐）
      drawText(ctx, fonts.fontSemibold, settings.signatureText, leftX, centerY, fontSize, { align: 'left', color: textColor, fontWeight: '600' });
    } else if (hasTime) {
      // 只有时间：居中（居左对齐）
      const timeStr = formatDateForDisplay(settings.dateTime);
      drawText(ctx, fonts.fontNormal, timeStr, leftX, centerY, fontSize, { align: 'left', color: textColor, fontWeight: 'normal' });
    }
  }
  
  // 等待所有 Logo 加载完成后再返回
  if (logoPromises.length > 0) {
    await Promise.all(logoPromises);
  }
}

/**
 * 检测 logo 是否为浅色（从 DOM 中获取缓存）
 */
function isLogoLightFromCache(logoName) {
  // 通过 DOM 获取缓存
  const logoSrc = `logos/${logoName}.svg`;
  return true; // 默认返回浅色，让 img.onload 处理实际绘制
}

/**
 * 检测 logo 图片的平均亮度
 * @param {string} logoPath - logo 文件路径
 * @returns {Promise<boolean>} 是否为浅色 logo
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
 * 绘制 Logo（根据背景颜色智能选择）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} logoName - Logo 名称
 * @param {number} x - X 坐标
 * @param {number} centerY - 中心 Y 坐标
 * @param {number} borderHeight - 边框高度
 * @param {number} imgWidth - 图片宽度（用于计算 max-width: 15%）
 * @param {string} borderColor - 边框颜色
 * @param {Function} onComplete - 加载完成回调
 */
async function drawLogo(ctx, logoName, x, centerY, borderHeight, imgWidth, borderColor, onComplete) {
  const isDark = !borderColorIsLight(borderColor);
  const normalPath = `logos/${logoName}.svg`;
  
  // 检测原始 logo 亮度
  const logoIsLight = await detectLogoBrightness(normalPath);
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    let logoHeight = borderHeight * 0.6;
    let logoWidth = (img.width / img.height) * logoHeight;
    
    // 应用 CSS 中的 max-width: 100% 限制（相对于 logo 区域宽度）
    const maxLogoWidth = imgWidth;  // logo 区域宽度
    if (logoWidth > maxLogoWidth) {
      logoWidth = maxLogoWidth;
      // 相应调整高度，保持宽高比
      logoHeight = (logoWidth / img.width) * img.height;
    }
    
    // 如果需要颜色反转（深色背景 + 深色 logo）
    if (isDark && !logoIsLight) {
      // 创建临时 canvas 进行颜色反转
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // 绘制原始 logo
      tempCtx.drawImage(img, 0, 0);
      
      // 获取像素数据并反转颜色
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // 反转 RGB，保留 Alpha
        data[i] = 255 - data[i];     // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
        // alpha 保持不变
      }
      tempCtx.putImageData(imageData, 0, 0);
      
      // 绘制反转后的 logo
      ctx.drawImage(tempCanvas, x, centerY - logoHeight / 2, logoWidth, logoHeight);
    } else {
      // 直接绘制
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
 * @param {string} dataUrl - DataURL 字符串
 * @returns {Blob}
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
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度百分比
 * @param {number} options.quality - JPG 质量
 * @param {Object} options.settings - 导出设置
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const {
    borderColor = '#ffffff',
    borderHeight = 12,
    quality = 1.0,
    settings = {}
  } = options;

  // 加载字体
  const fonts = await loadFonts();

  // 确保图片已加载
  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 判断图片方向
  const isLandscape = img.naturalWidth > img.naturalHeight;
  
  // 计算画布尺寸
  canvas.width = img.naturalWidth;
  // borderHeight 是百分比（如 12 表示 12%），需要转换为实际像素值
  const shortSide = Math.min(img.naturalWidth, img.naturalHeight);
  const exportBorderHeight = Math.round(shortSide * (Number(borderHeight) / 100));
  
  // 根据比例设置计算最终尺寸
  const aspectRatio = settings?.aspectRatio || 'default';
  let imageDrawArea;  // 图片绘制区域信息，用于边框内容定位
  
  if (aspectRatio === 'default') {
    // 默认模式：图片完整保留，在下方添加边框
    canvas.height = img.naturalHeight + exportBorderHeight;
    
    // 绘制完整图片
    ctx.drawImage(img, 0, 0);
    
    // 记录绘制区域信息
    imageDrawArea = {
      height: img.naturalHeight,
      borderTop: img.naturalHeight
    };
  } else if (aspectRatio === 'original') {
    // 原始比例模式：上下各裁剪 borderHeight/2，再添加底部边框
    // 横向和纵向图片都使用相同的逻辑
    const cropAmount = Math.round(exportBorderHeight / 2);
    const croppedHeight = img.naturalHeight - exportBorderHeight;
    canvas.height = img.naturalHeight;
    
    // 绘制裁剪后的图片区域
    ctx.drawImage(img, 0, cropAmount, img.naturalWidth, croppedHeight, 
                  0, 0, img.naturalWidth, croppedHeight);
    
    imageDrawArea = {
      height: croppedHeight,
      borderTop: croppedHeight
    };
  } else {
    // 其他比例模式（4:3, 3:2, 16:9）- 默认行为
    canvas.height = img.naturalHeight + exportBorderHeight;
    ctx.drawImage(img, 0, 0);
    imageDrawArea = {
      height: img.naturalHeight,
      borderTop: img.naturalHeight
    };
  }

  // 绘制边框
  ctx.fillStyle = borderColor;
  // 底部边框
  ctx.fillRect(0, imageDrawArea.borderTop, canvas.width, exportBorderHeight);

  // 如果有边框内容需要绘制
  const shouldDrawContent = settings && (
    settings.selectedLogo || 
    settings.showModel || 
    settings.showParams || 
    settings.showTime || 
    settings.showSignature ||
    settings.focalLength
  );
  
  if (shouldDrawContent) {
    await drawBorderContent(ctx, img.naturalWidth, imageDrawArea.height, exportBorderHeight, settings, fonts);
  }

  // 导出为 DataURL
  console.log('Canvas 尺寸:', canvas.width, canvas.height);
  console.log('原始图片尺寸:', img.naturalWidth, img.naturalHeight);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Type C 导出样式配置
 */
export const typeCExport = {
  id: 'type-c-export',
  name: 'Type C Export',
  
  renderImage
};

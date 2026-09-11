/**
 * Type P 导出渲染模块（参数布局）
 * 白色背景 + 照片区（左右 3.5% / 上 4% / 高 76.5%）+ 底部 19.5% 文字区
 * - 第 1 行：机型（Semibold #000）+ 细分隔线 + 品牌 Logo（彩色 SVG）
 * - 第 2 行：圆角参数胶囊（细灰描边）+ 下方浅灰小标签（s / ISO / mm / f）
 * 布局常量与预览侧 type-P-preview.js 共用，保证两侧一致
 */

import { ensureCssFontsReady } from './font-loader.js';
import { roundedRectPath } from './canvas-utils.js';
import { TYPE_P_LAYOUT } from './type-P-preview.js';

/**
 * 加载品牌 Logo 图片（失败时返回 null，跳过绘制）
 */
function loadLogo(logoName) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `logos/${encodeURIComponent(logoName)}.svg`;
  });
}

/**
 * 渲染 Type P 导出图片
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 渲染选项
 * @returns {Promise<string>} DataURL
 */
export async function renderImage(img, options) {
  const { quality = 1.0, settings = {} } = options;

  await ensureCssFontsReady();

  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  const L = TYPE_P_LAYOUT;
  const canvasWidth = Math.round(img.naturalWidth / L.photoWidth);
  const canvasHeight = Math.round(img.naturalHeight / L.photoHeight);
  const baseFontSize = Math.round(canvasWidth * L.baseFont);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. 绘制照片（全图 1:1 绘制：宽 = 画布宽×93% = 原图宽，高按原图比例推导 = 原图高）
  // 保证完整显示原图、宽高比与原图一致，无裁切
  const photoX = Math.round(canvasWidth * L.photoLeft);
  const photoY = Math.round(canvasHeight * L.photoTop);
  const photoWidth = Math.round(canvasWidth * L.photoWidth);
  const photoHeight = Math.round(photoWidth * img.naturalHeight / img.naturalWidth);

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, photoX, photoY, photoWidth, photoHeight);

  // 3. 第 1 行：机型 + 分隔线 + 品牌 Logo
  const centerX = canvasWidth / 2;
  const line1CY = canvasHeight * L.line1CY;
  const customModel = settings.customModel || '';
  const hasLogo = settings.selectedLogo && settings.showLogo;
  const gapDivider = baseFontSize * L.gapDivider;
  const dividerW = Math.max(1, Math.round(canvasWidth * 0.0012));

  let logoImg = null;
  if (hasLogo) {
    logoImg = await loadLogo(settings.selectedLogo);
  }

  if (customModel || (hasLogo && logoImg)) {
    ctx.textBaseline = 'middle';
    let segments = [];
    if (customModel) {
      ctx.font = `600 ${baseFontSize}px 'MiSans', sans-serif`;
      segments.push({ type: 'text', text: customModel, width: ctx.measureText(customModel).width });
    }
    if (customModel && hasLogo && logoImg) {
      segments.push({ type: 'divider', width: gapDivider * 2 + dividerW });
    }
    if (hasLogo && logoImg) {
      const logoH = baseFontSize * L.logoHeight;
      const logoW = logoImg.naturalWidth * (logoH / logoImg.naturalHeight);
      segments.push({ type: 'logo', img: logoImg, width: logoW, height: logoH });
    }

    const totalWidth = segments.reduce((s, seg) => s + seg.width, 0);
    let x = centerX - totalWidth / 2;
    for (const seg of segments) {
      if (seg.type === 'text') {
        ctx.font = `600 ${baseFontSize}px 'MiSans', sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(seg.text, x, line1CY);
      } else if (seg.type === 'divider') {
        ctx.fillStyle = '#dddddd';
        ctx.fillRect(x + gapDivider, line1CY - baseFontSize * L.dividerHeight / 2, dividerW, baseFontSize * L.dividerHeight);
      } else if (seg.type === 'logo') {
        ctx.drawImage(seg.img, x, line1CY - seg.height / 2, seg.width, seg.height);
      }
      x += seg.width;
    }
  }

  // 4. 参数胶囊行
  if (settings.showParams) {
    const focal = String(settings.focalLength || '').replace(/mm$/i, '');
    const params = [
      { value: settings.exposureTime || '', label: 's' },
      { value: settings.iso || '', label: 'ISO' },
      { value: focal, label: 'mm' },
      { value: settings.fNumber || '', label: 'f' }
    ].filter(p => p.value !== '');

    if (params.length > 0) {
      const labelFont = Math.round(baseFontSize * L.labelFont);
      const pillH = baseFontSize * L.pillHeight;
      const padX = baseFontSize * L.pillPadX;
      const gap = baseFontSize * L.pillGap;
      const radius = pillH * L.pillRadiusRatio;
      const borderWidth = Math.max(1, Math.round(canvasWidth * 0.0012));

      // 预量各胶囊宽度
      const widths = params.map(p => {
        ctx.font = `normal ${pillFontPx(L.pillFont, baseFontSize)}px 'MiSans', sans-serif`;
        const valueW = ctx.measureText(p.value).width;
        ctx.font = `normal ${labelFont}px 'MiSans', sans-serif`;
        const labelW = ctx.measureText(p.label).width;
        return Math.max(valueW, labelW) + padX * 2;
      });
      const totalW = widths.reduce((s, w) => s + w, 0) + gap * (params.length - 1);
      let px = centerX - totalW / 2;
      const pillTop = canvasHeight * L.pillCY - pillH / 2;

      params.forEach((p, i) => {
        // 胶囊描边
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        roundedRectPath(ctx, px, pillTop, widths[i], pillH, radius);
        ctx.stroke();

        // 胶囊内参数值
        ctx.font = `normal ${pillFontPx(L.pillFont, baseFontSize)}px 'MiSans', sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(p.value, px + widths[i] / 2, pillTop + pillH / 2);

        // 胶囊下方标签
        const labelCY = canvasHeight * L.labelCY;
        ctx.font = `normal ${labelFont}px 'MiSans', sans-serif`;
        ctx.fillStyle = '#999999';
        ctx.fillText(p.label, px + widths[i] / 2, labelCY);

        px += widths[i] + gap;
      });
    }
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * 胶囊字号（× 基准字号）
 */
function pillFontPx(ratio, baseFontSize) {
  return Math.round(baseFontSize * ratio);
}

/**
 * Type P 导出样式配置
 */
export const typePExport = {
  id: 'type-p-export',
  name: 'Type P Export',
  renderImage
};

/**
 * Type P 预览样式模块（参数布局）
 * 布局：白色边框 + 照片区（左右 3.5% / 上 4% / 高 76.5%）+ 底部 19.5% 文字区
 * - 第 1 行：机型（Semibold #000）+ 细分隔线 + 品牌 Logo（彩色 SVG，水平居中）
 * - 第 2 行：4 个圆角参数胶囊（细灰描边），下方浅灰小标签（s / ISO / mm / f）
 * 文字基准字号 = 0.030 × 画布宽度（预览/导出同比例）
 * 参数值沿用现有 EXIF 流程（快门 / ISO / 焦距 / 光圈），空值隐藏对应胶囊
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null,
  canvasWidth: 0,
  canvasHeight: 0,
  isPortrait: false
};

/**
 * 布局常量（与导出侧 type-P-export.js 保持一致，均为画布尺寸比例）
 */
export const TYPE_P_LAYOUT = {
  photoLeft: 0.035,    // 照片左白边
  photoTop: 0.04,      // 照片上白边
  photoWidth: 0.93,    // 照片宽占比
  photoHeight: 0.765,  // 照片高占比
  baseFont: 0.030,     // 基准字号 = 0.030 × 画布宽
  line1CY: 0.852,      // 第 1 行中心 Y
  pillCY: 0.912,       // 胶囊中心 Y
  labelCY: 0.952,      // 标签中心 Y
  pillFont: 0.72,      // 胶囊字号（× 基准）
  pillHeight: 1.75,    // 胶囊高（× 基准）
  pillPadX: 0.75,      // 胶囊水平内边距（× 基准）
  pillGap: 1.2,        // 胶囊间距（× 基准）
  pillRadiusRatio: 0.22, // 胶囊圆角（× 胶囊高）
  labelFont: 0.42,     // 标签字号（× 基准）
  dividerHeight: 1.0,  // 分隔线高（× 基准）
  logoHeight: 1.15,    // Logo 高（× 基准）
  gapDivider: 0.55     // 分隔线两侧间距（× 基准）
};

/**
 * 初始化 Type P 预览
 * @param {Object} elements - DOM 元素
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type P：照片占宽 93%（左右 3.5%）、占高 76.5%（上 4%、底部文字区 19.5%）
 * @param {Object} settings - { naturalWidth, naturalHeight }
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;

  const isPortrait = naturalHeight > naturalWidth;
  const canvasWidth = Math.round(naturalWidth / TYPE_P_LAYOUT.photoWidth);
  const canvasHeight = Math.round(naturalHeight / TYPE_P_LAYOUT.photoHeight);

  return { squareSize: canvasWidth, canvasHeight, isPortrait };
}

/**
 * 设置 frameWrapper 样式
 * @param {number} squareSize - 画布宽度
 * @param {number} canvasHeight - 画布高度
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;

  state.frameWrapper.classList.add('type-p');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k', 'type-l', 'type-m', 'type-n', 'type-o', 'type-q');

  state.canvasWidth = squareSize;
  state.canvasHeight = canvasHeight;

  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  // 动态设置文字基准字号 = 0.030 × 画布宽度
  if (state.borderContent) {
    const baseFontSize = Math.max(8, Math.round(TYPE_P_LAYOUT.baseFont * squareSize));
    state.borderContent.style.fontSize = `${baseFontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * @param {number} squareSize - 画布宽度
 * @param {number} canvasHeight - 画布高度
 * @param {Object} imgDimensions - 图片原始尺寸 { naturalWidth, naturalHeight }
 */
export function updatePreview(squareSize, canvasHeight, imgDimensions = {}) {
  if (!state.img) return;

  // 重置图片样式，让 CSS 控制布局
  state.img.style.position = '';
  state.img.style.left = '';
  state.img.style.top = '';
  state.img.style.width = '';
  state.img.style.height = '';
  state.img.style.maxWidth = '';
  state.img.style.maxHeight = '';
  state.img.style.objectFit = '';
  state.img.style.objectPosition = '';
  state.img.style.clipPath = '';
  state.img.style.transform = '';
  state.img.style.borderWidth = '';
  state.img.style.borderStyle = '';
  state.img.style.borderColor = '';

  state.isPortrait = imgDimensions.naturalHeight > imgDimensions.naturalWidth;

  // 照片矩形按原图比例精确计算（内联 px 设置）：
  // 宽 = 画布显示宽 × 93%（= 原图宽），高 = 宽 × 原图高宽比（= 原图高）
  // 保证完整显示原图、宽高比与原图一致、1:1 像素映射，无裁切
  const naturalWidth = imgDimensions.naturalWidth || 0;
  const naturalHeight = imgDimensions.naturalHeight || 0;
  if (naturalWidth > 0 && naturalHeight > 0) {
    const photoW = Math.round(squareSize * TYPE_P_LAYOUT.photoWidth);
    const photoH = Math.round(photoW * naturalHeight / naturalWidth);
    state.img.style.left = `${Math.round(squareSize * TYPE_P_LAYOUT.photoLeft)}px`;
    state.img.style.top = `${Math.round(canvasHeight * TYPE_P_LAYOUT.photoTop)}px`;
    state.img.style.width = `${photoW}px`;
    state.img.style.height = `${photoH}px`;
    state.img.style.objectFit = 'fill';
  }

  // photoFooter 隐藏（Type P 不需要独立的底部区域）
  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * @param {Object} elements - 边框元素（未使用，使用 state）
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  if (!state.borderContent || !state.frameWrapper) return;

  const canvasWidth = state.canvasWidth || state.frameWrapper.clientWidth;
  const canvasHeight = state.canvasHeight || state.frameWrapper.clientHeight;
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || Math.max(8, Math.round(TYPE_P_LAYOUT.baseFont * canvasWidth));
  const L = TYPE_P_LAYOUT;

  // ===== 第 1 行：机型 + 分隔线 + 品牌 Logo =====
  const customModel = settings.customModel || '';
  const hasLogo = settings.selectedLogo && settings.showLogo;
  const line1Height = Math.round(baseFontSize * 1.2);
  const line1Top = Math.round(canvasHeight * L.line1CY - line1Height / 2);

  let line1Html = '';
  const lineWidth = Math.max(1, Math.round(canvasWidth * 0.0012));
  if (customModel || hasLogo) {
    const dividerH = Math.round(baseFontSize * L.dividerHeight);
    const logoH = Math.round(baseFontSize * L.logoHeight);
    let inner = '';
    if (customModel) {
      inner += `<span class="type-p-model">${escapeHtml(customModel)}</span>`;
    }
    if (customModel && hasLogo) {
      inner += `<span class="type-p-divider" style="height:${dividerH}px;width:${lineWidth}px"></span>`;
    }
    if (hasLogo) {
      inner += `<img class="type-p-logo" src="logos/${encodeURIComponent(settings.selectedLogo)}.svg" alt="" style="height:${logoH}px">`;
    }
    line1Html = `<div class="type-p-line1" style="top:${line1Top}px;height:${line1Height}px">${inner}</div>`;
  }

  // ===== 第 2 行：参数胶囊 =====
  let pillsHtml = '';
  if (settings.showParams) {
    const focal = String(settings.focalLength || '').replace(/mm$/i, '');
    const params = [
      { value: settings.exposureTime || '', label: 's' },
      { value: settings.iso || '', label: 'ISO' },
      { value: focal, label: 'mm' },
      { value: settings.fNumber || '', label: 'f' }
    ].filter(p => p.value !== '');

    if (params.length > 0) {
      const pillH = Math.round(baseFontSize * L.pillHeight);
      const pillsTop = Math.round(canvasHeight * L.pillCY - pillH / 2);
      const labelGap = Math.round(canvasHeight * (L.labelCY - L.pillCY) - pillH / 2 - baseFontSize * L.labelFont * 0.6);
      // 胶囊尺寸全部用内联 px，与导出侧 type-P-export.js 公式逐项一致（预览/导出一致）
      const pillFont = Math.round(baseFontSize * L.pillFont);
      const labelFont = Math.round(baseFontSize * L.labelFont);
      const padX = Math.round(baseFontSize * L.pillPadX);
      const pillGap = Math.round(baseFontSize * L.pillGap);
      const radius = Math.round(pillH * L.pillRadiusRatio);
      const colsHtml = params.map(p =>
        `<div class="type-p-pill-col">` +
          `<div class="type-p-pill" style="height:${pillH}px;font-size:${pillFont}px;padding:0 ${padX}px;border-radius:${radius}px;border-width:${lineWidth}px">${escapeHtml(p.value)}</div>` +
          `<div class="type-p-label" style="margin-top:${Math.max(2, labelGap)}px;font-size:${labelFont}px">${escapeHtml(p.label)}</div>` +
        `</div>`
      ).join('');
      pillsHtml = `<div class="type-p-pills" style="top:${pillsTop}px;gap:${pillGap}px">${colsHtml}</div>`;
    }
  }

  state.borderContent.innerHTML = line1Html + pillsHtml;
}

/**
 * 转义 HTML 特殊字符，防止用户输入破坏布局
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 重置样式
 */
export function reset() {
  if (state.img) {
    state.img.style.position = '';
    state.img.style.left = '';
    state.img.style.top = '';
    state.img.style.width = '';
    state.img.style.height = '';
    state.img.style.maxWidth = '';
    state.img.style.maxHeight = '';
    state.img.style.objectFit = '';
    state.img.style.objectPosition = '';
    state.img.style.clipPath = '';
    state.img.style.transform = '';
    state.img.style.borderWidth = '';
    state.img.style.borderStyle = '';
    state.img.style.borderColor = '';
  }

  if (state.photoFooter) {
    state.photoFooter.style.display = '';
  }

  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-p');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }

  if (state.borderContent) {
    state.borderContent.style.position = '';
    state.borderContent.style.top = '';
    state.borderContent.style.bottom = '';
    state.borderContent.style.left = '';
    state.borderContent.style.width = '';
    state.borderContent.style.height = '';
    state.borderContent.style.overflow = '';
    state.borderContent.style.fontSize = '';
    state.borderContent.innerHTML = `
      <div class="border-content-inner">
        <div class="border-logo" id="borderLogo"></div>
        <div class="border-info">
          <div class="border-info-inner">
            <div class="border-text border-model" id="borderModel"></div>
            <div class="border-text border-params" id="borderParams"></div>
          </div>
        </div>
        <div class="border-focal">
          <div class="border-text border-focal-text" id="borderFocal"></div>
        </div>
        <div class="border-right">
          <div class="border-right-inner">
            <div class="border-text border-signature" id="borderSignature"></div>
            <div class="border-text" id="borderTime"></div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Type P 预览样式配置
 */
export const typePPreview = {
  id: 'type-p',
  name: 'Type P Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};

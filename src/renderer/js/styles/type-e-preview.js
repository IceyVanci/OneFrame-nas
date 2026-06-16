/**
 * Type E 预览样式模块
 * 布局：3:2 纵向画布，顶部 1:1 正方形显示图片，底部白色区域显示参数
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null,
  squareSize: 0,
  canvasHeight: 0,
  footerHeight: 0,
  imageOffset: { x: 0, y: 0 },
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  offsetStart: { x: 0, y: 0 }
};

// 保存原始图片尺寸用于尺寸计算
let originalImageDimensions = { naturalWidth: 0, naturalHeight: 0 };

// 保存年份文字和字号（用于 Logo 尺寸计算）
let yearText = '';

// Logo 加载完成后检测形状并应用对应样式
window.handleLogoLoad = function(img) {
  const ratio = img.naturalWidth / img.naturalHeight;
  console.log('[TypeE] Logo loaded, ratio:', ratio, 'naturalSize:', img.naturalWidth, 'x', img.naturalHeight);
  
  // 动态测量年份文字的像素宽度
  const yearFontSize = 24; // 与 CSS 中的 font-size 一致
  const yearFont = `${yearFontSize}px MiSans Medium, sans-serif`;
  
  // 创建临时 canvas 测量文字
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = yearFont;
  const yearMetrics = ctx.measureText(yearText || '2024');
  const yearWidth = yearMetrics.width;
  const yearHeight = yearFontSize;
  
  console.log('[TypeE] Year metrics:', yearText, 'width:', yearWidth, 'height:', yearHeight);
  
  // 方形 Logo：宽高比在 0.8-1.2 之间，高度 = 年份文字宽度
  if (ratio >= 0.8 && ratio <= 1.2) {
    img.style.height = yearWidth + 'px';
    img.style.width = Math.round(yearWidth * ratio) + 'px';
    console.log('[TypeE] Square logo: height =', yearWidth, 'width =', Math.round(yearWidth * ratio));
  } else {
    // 横向 Logo：宽度 = 年份宽度 × 2
    const logoWidth = Math.round(yearWidth * 2);
    img.style.width = logoWidth + 'px';
    img.style.height = ''; // 清空
    console.log('[TypeE] Landscape logo: width =', logoWidth);
  }
};

/**
 * 初始化 Type E 预览
 */
export function init(elements) {
  console.log('[TypeE] init called', elements);
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
  console.log('[TypeE] state after init:', {
    img: !!state.img,
    frameWrapper: !!state.frameWrapper,
    photoFooter: !!state.photoFooter,
    borderContent: !!state.borderContent
  });
  
  // 添加拖动事件监听
  state.img.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
}

/**
 * 设置原始图片尺寸（用于 resize 时重算）
 */
export function setOriginalDimensions(width, height) {
  originalImageDimensions = { naturalWidth: width, naturalHeight: height };
  console.log('[TypeE] original dimensions set:', originalImageDimensions);
}

/**
 * 计算尺寸
 * @param {Object} settings - 设置
 * @param {number} settings.naturalHeight - 图片原始高度
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @returns {Object} { squareSize, margin, canvasHeight }
 */
export function calcSize(settings) {
  const { naturalHeight, naturalWidth } = settings;

  // 使用图片短边作为正方形边长
  const imgShortEdge = Math.min(naturalWidth, naturalHeight);

  // 获取预览区域可用尺寸
  const previewArea = state.frameWrapper?.parentElement;
  const availWidth = previewArea?.clientWidth || 500;
  const availHeight = previewArea?.clientHeight || 600;

  // 第一步：用短边和可用区域计算（留 4% 边距）
  let maxSize = Math.min(availWidth, availHeight) * 0.96;
  let scale = maxSize / imgShortEdge;
  let squareSize = scale < 1 ? Math.round(imgShortEdge * scale) : imgShortEdge;

  // 第二步：检查 canvasHeight (3:2) 是否超出可用高度，如果超出则用高度限制重新计算
  const maxCanvasHeight = availHeight * 0.96;
  const canvasHeightWithCurrentSquare = Math.round(squareSize * 1.5);
  if (canvasHeightWithCurrentSquare > maxCanvasHeight) {
    // 用可用高度重新计算 squareSize（确保 3:2 比例）
    squareSize = Math.round(maxCanvasHeight / 1.5);
  }

  const canvasHeight = Math.round(squareSize * 1.5);
  const margin = 0; // Type E 不需要边距

  console.log('[TypeE] calcSize:', { imgShortEdge, availWidth, availHeight, squareSize, canvasHeight });

  return { squareSize, margin, canvasHeight };
}

/**
 * 设置 frameWrapper 为 3:2 矩形
 * @param {number} squareSize - 正方形边长
 */
export function updateFrameWrapper(squareSize) {
  if (!state.frameWrapper) return;

  console.log('[TypeE] updateFrameWrapper called with squareSize:', squareSize);

  // 移除所有类型类名后再添加当前类型
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
  state.frameWrapper.classList.add('type-e');

  // 设置尺寸为 3:2
  const canvasHeight = Math.round(squareSize * 1.5);
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  console.log('[TypeE] frameWrapper size:', squareSize, 'x', canvasHeight);
}

/**
 * 更新 DOM 预览
 * 布局：顶部 1:1 正方形显示图片，底部白色区域
 * @param {number} squareSize - 正方形边长
 * @param {number} margin - 边距
 * @param {Object} imgDimensions - 图片原始尺寸 { naturalWidth, naturalHeight }
 */
export function updatePreview(squareSize, margin, imgDimensions = {}) {
  if (!state.img || !state.photoFooter) {
    console.log('[TypeE] updatePreview: missing img or photoFooter', { img: !!state.img, photoFooter: !!state.photoFooter });
    return;
  }

  console.log('[TypeE] updatePreview called', { squareSize, margin, imgDimensions });

  // 保存原始尺寸用于 resize 时重算
  if (imgDimensions.naturalWidth && imgDimensions.naturalHeight) {
    originalImageDimensions = { naturalWidth: imgDimensions.naturalWidth, naturalHeight: imgDimensions.naturalHeight };
  }

  const { naturalWidth = 0, naturalHeight = 0 } = imgDimensions;
  const canvasHeight = Math.round(squareSize * 1.5);
  const footerHeight = canvasHeight - squareSize;

  state.squareSize = squareSize;
  state.canvasHeight = canvasHeight;
  state.footerHeight = footerHeight;

  // 设置图片为正方形裁剪
  state.img.style.position = 'absolute';
  state.img.style.left = '0px';
  state.img.style.top = '0px';
  state.img.style.width = `${squareSize}px`;
  state.img.style.height = `${squareSize}px`;
  state.img.style.maxWidth = 'none';
  state.img.style.maxHeight = 'none';
  state.img.style.objectFit = 'cover';
  state.img.style.objectPosition = 'center center';
  state.img.style.clipPath = 'none';
  state.img.style.transform = 'none';

  // 底部白色区域
  state.photoFooter.style.position = 'absolute';
  state.photoFooter.style.left = '0px';
  state.photoFooter.style.top = `${squareSize}px`;
  state.photoFooter.style.width = `${squareSize}px`;
  state.photoFooter.style.height = `${footerHeight}px`;
  state.photoFooter.style.backgroundColor = '#ffffff';
  state.photoFooter.style.overflow = 'visible';

  // 更新 borderContent 位置
  if (state.borderContent) {
    state.borderContent.style.position = 'absolute';
    state.borderContent.style.left = '0px';
    state.borderContent.style.top = `${squareSize}px`;
    state.borderContent.style.width = `${squareSize}px`;
    state.borderContent.style.height = `${footerHeight}px`;
    state.borderContent.style.overflow = 'visible';
  }

  // 添加/更新拖动提示文字
  updateDragHint();

  console.log('[TypeE] preview updated: footer at', squareSize, 'height', footerHeight);
}

/**
 * 更新边框内容预览
 * 布局：
 * ┌─────────────────────────────────┐
 * │  March             f/2.8       │
 * │  2024            50mm 1/125   │
 * │                   ISO 400       │
 * │ [Logo]           Model          │
 * │                 Signature        │
 * └─────────────────────────────────┘
 * @param {Object} elements - 边框元素
 * @param {Object} settings - 显示设置
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, showLogo, showModel, customModel, fNumber, exposureTime, iso, focalLength, showTime, dateTime, signatureText } = settings;

  console.log('[TypeE] updateContentPreview called', settings);

  // 清空并重建 borderContent
  if (state.borderContent) {
    state.borderContent.innerHTML = `
      <div class="type-e-content-wrapper">
        <div class="type-e-left">
          ${dateTime && showTime ? getDateRows(dateTime) : ''}
          ${selectedLogo && showLogo ? `<div class="type-e-logo"><img src="logos/${selectedLogo}.svg" alt="" onload="handleLogoLoad(this)"></div>` : ''}
        </div>
        <div class="type-e-right" id="typeEParams">
          ${getRightParams(fNumber, focalLength, exposureTime, iso, customModel, showModel, signatureText)}
        </div>
      </div>
    `;
    
    // 计算年份顶部位置，让右侧参数与年份顶部对齐
    // 使用 document.fonts.ready + requestAnimationFrame 确保字体加载且浏览器完成布局后再测量
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        const yearEl = state.borderContent.querySelector('.type-e-year');
        const paramsEl = state.borderContent.querySelector('#typeEParams');
        if (yearEl && paramsEl) {
          const yearRect = yearEl.getBoundingClientRect();
          const paramsRect = paramsEl.getBoundingClientRect();
          // 计算年份与参数的相对位置差，而非年份的绝对位置
          paramsEl.style.marginTop = `${yearRect.top - paramsRect.top}px`;
          console.log('[TypeE] Params aligned to year top, offset:', yearRect.top - paramsRect.top);
        }
      });
    });

    console.log('[TypeE] borderContent updated');
  } else {
    console.log('[TypeE] borderContent is null!');
  }
}

/**
 * 获取日期行 HTML
 */
function getDateRows(dateTimeStr) {
  const dt = new Date(dateTimeStr);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[dt.getMonth()];
  const year = dt.getFullYear().toString();
  
  // 保存年份用于 Logo 尺寸计算
  yearText = year;
  console.log('[TypeE] getDateRows: yearText =', yearText);
  
  // 首字母大写
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  
  return `
    <div class="type-e-date">
      <div class="type-e-month">${formattedMonth}</div>
      <div class="type-e-year">${year}</div>
    </div>
  `;
}

/**
 * 获取右侧参数 HTML
 * 布局：光圈 + 焦距 + 快门 + ISO 合并在同一行
 */
function getRightParams(fNumber, focalLength, exposureTime, iso, customModel, showModel, signatureText) {
  let html = '<div class="type-e-params">';
  
  // 第一行：光圈 + 焦距 + 快门 + ISO（合并在一行）
  const parts = [];
  if (fNumber) {
    parts.push(`f/${fNumber}`);
  }
  if (focalLength) {
    const focal = String(focalLength).replace(/mm$/i, '');
    parts.push(`${focal}mm`);
  }
  if (exposureTime) {
    parts.push(`${exposureTime}s`);
  }
  if (iso) {
    parts.push(`ISO ${iso}`);
  }
  if (parts.length > 0) {
    html += `<div class="type-e-param-line type-e-fnumber">${parts.join(' ')}</div>`;
  }
  
  // 第二行：机型（如果有）
  if (customModel && showModel) {
    html += `<div class="type-e-param-line type-e-model">${customModel}</div>`;
  }
  
  // 第三行：署名（如果有）
  if (signatureText) {
    html += `<div class="type-e-param-line type-e-signature">${signatureText}</div>`;
  }
  
  html += '</div>';
  return html;
}

/**
 * 重置样式
 * 注意：不清空 state 对象，保留元素引用
 */
export function reset() {
  console.log('[TypeE] reset called');

  // 保存元素引用
  const { img, frameWrapper, photoFooter, borderContent } = state;

  if (img) {
    img.style.position = '';
    img.style.left = '';
    img.style.top = '';
    img.style.width = '';
    img.style.height = '';
    img.style.maxWidth = '';
    img.style.maxHeight = '';
    img.style.objectFit = '';
    img.style.objectPosition = '';
  }

  if (photoFooter) {
    photoFooter.style.position = '';
    photoFooter.style.left = '';
    photoFooter.style.top = '';
    photoFooter.style.width = '';
    photoFooter.style.height = '';
    photoFooter.style.backgroundColor = '';
    photoFooter.style.overflow = '';
  }

  if (frameWrapper) {
    // 移除拖动提示
    const hints = frameWrapper.parentElement?.querySelectorAll('.type-e-drag-hint');
    hints?.forEach(hint => hint.remove());
    
    frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
    frameWrapper.classList.add('type-a');
    frameWrapper.style.width = '';
    frameWrapper.style.height = '';
  }

  if (borderContent) {
    borderContent.style.position = '';
    borderContent.style.left = '';
    borderContent.style.top = '';
    borderContent.style.width = '';
    borderContent.style.height = '';
    borderContent.style.overflow = '';
    borderContent.innerHTML = `
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

  // 只重置尺寸相关的 state 属性，不清空元素引用
  state.squareSize = 0;
  state.canvasHeight = 0;
  state.footerHeight = 0;
}

/**
 * 获取图片裁剪区域的最大偏移量（预览像素）
 * 图片使用 object-fit: cover，在预览区域被缩放
 * 可拖动范围 = (原始图片尺寸 - 预览显示尺寸) / 2
 */
function getMaxOffset() {
  const { naturalWidth, naturalHeight } = originalImageDimensions;
  const isPortrait = naturalHeight > naturalWidth;
  
  let maxOffsetX = 0;
  let maxOffsetY = 0;
  
  // 预览区域尺寸（squareSize x squareSize）
  const displaySize = state.squareSize;
  
  if (isPortrait) {
    // 纵向图片：只能上下拖动
    // 原始图片高度 > 显示高度，所以可以上下偏移
    // 可拖动偏移（预览像素）= (原始图片高度 - 显示高度) / 2
    maxOffsetY = Math.max(0, (naturalHeight - displaySize) / 2);
    console.log('[TypeE] getMaxOffset: portrait, naturalHeight:', naturalHeight, 'displaySize:', displaySize, 'maxOffsetY:', maxOffsetY);
  } else {
    // 横向/方形图片：只能左右拖动
    maxOffsetX = Math.max(0, (naturalWidth - displaySize) / 2);
    console.log('[TypeE] getMaxOffset: landscape, naturalWidth:', naturalWidth, 'displaySize:', displaySize, 'maxOffsetX:', maxOffsetX);
  }
  
  return { maxOffsetX, maxOffsetY };
}

/**
 * 计算 object-position 值
 */
function calculateObjectPosition() {
  const { x, y } = state.imageOffset;
  return `${50 + (x / state.squareSize) * 100}% ${50 + (y / state.squareSize) * 100}%`;
}

/**
 * 开始拖动
 */
function startDrag(e) {
  if (!state.img) return;
  e.preventDefault();
  
  state.isDragging = true;
  state.dragStart = { x: e.clientX, y: e.clientY };
  state.offsetStart = { ...state.imageOffset };
  
  console.log('[TypeE] start drag:', state.dragStart);
}

/**
 * 拖动中
 */
function onDrag(e) {
  if (!state.isDragging || !state.img) return;
  e.preventDefault();
  
  const deltaX = e.clientX - state.dragStart.x;
  const deltaY = e.clientY - state.dragStart.y;
  
  const { maxOffsetX, maxOffsetY } = getMaxOffset();
  const isPortrait = originalImageDimensions.naturalHeight > originalImageDimensions.naturalWidth;
  
  console.log('[TypeE] onDrag:', { deltaX, deltaY, maxOffsetX, maxOffsetY, isPortrait });
  
  // 根据图片方向限制偏移
  let newX = state.offsetStart.x;
  let newY = state.offsetStart.y;
  
  if (isPortrait) {
    // 纵向图片：只能上下拖动
    // 鼠标向下拖动时，deltaY > 0，应该看到图片下半部分，即 object-position 向上偏移
    newY = state.offsetStart.y - deltaY;
    newY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));
  } else {
    // 横向/方形图片：只能左右拖动
    // 鼠标向右拖动时，deltaX > 0，应该看到图片右半部分，即 object-position 向左偏移
    newX = state.offsetStart.x - deltaX;
    newX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
  }
  
  state.imageOffset = { x: newX, y: newY };
  
  // 应用 object-position
  const newPosition = calculateObjectPosition();
  console.log('[TypeE] applying object-position:', newPosition);
  state.img.style.objectPosition = newPosition;
}

/**
 * 结束拖动
 */
function endDrag() {
  if (state.isDragging) {
    console.log('[TypeE] end drag, offset:', state.imageOffset);
  }
  state.isDragging = false;
}

/**
 * 获取当前图片偏移量（用于导出）
 */
export function getImageOffset() {
  return { ...state.imageOffset };
}

/**
 * 获取当前状态（只读副本）
 */
export function getState() {
  return {
    squareSize: state.squareSize,
    canvasHeight: state.canvasHeight,
    footerHeight: state.footerHeight,
    imageOffset: { ...state.imageOffset }
  };
}

/**
 * 获取归一化的图片偏移量（-0.5 到 0.5 范围）
 * 用于跨分辨率一致地传递裁剪偏移到导出模块
 */
export function getNormalizedOffset() {
  if (state.squareSize > 0) {
    return {
      x: state.imageOffset.x / state.squareSize,
      y: state.imageOffset.y / state.squareSize
    };
  }
  return { x: 0, y: 0 };
}

/**
 * 重置图片偏移量
 */
export function resetImageOffset() {
  state.imageOffset = { x: 0, y: 0 };
  if (state.img) {
    state.img.style.objectPosition = '50% 50%';
  }
}

/**
 * 更新拖动提示文字
 */
function updateDragHint() {
  if (!state.frameWrapper) {
    console.log('[TypeE] updateDragHint: frameWrapper is null');
    return;
  }
  
  console.log('[TypeE] updateDragHint called, img dimensions:', originalImageDimensions);
  
  // 先移除所有已存在的拖动提示，避免重复创建
  const existingHints = state.frameWrapper.parentElement?.querySelectorAll('.type-e-drag-hint');
  existingHints?.forEach(hint => hint.remove());
  
  // 判断图片方向
  const isPortrait = originalImageDimensions.naturalHeight > originalImageDimensions.naturalWidth;
  
  // 计算偏移范围（用于判断是否需要显示提示）
  const { maxOffsetX, maxOffsetY } = getMaxOffset();
  console.log('[TypeE] updateDragHint: isPortrait:', isPortrait, 'maxOffset:', { maxOffsetX, maxOffsetY });
  
  // 只有当可以拖动时才显示提示
  if (maxOffsetX > 5 || maxOffsetY > 5) {
    // 创建提示元素
    const hint = document.createElement('div');
    hint.className = 'type-e-drag-hint';
    
    if (isPortrait) {
      hint.textContent = '↑↓ 拖动选择区域 ↓↑';
    } else {
      hint.textContent = '←→ 拖动选择区域 →←';
    }
    
    // 插入到 frameWrapper 后面（画布外）
    state.frameWrapper.parentElement?.insertBefore(hint, state.frameWrapper.nextSibling);
    console.log('[TypeE] drag hint added outside frameWrapper');
  } else {
    console.log('[TypeE] drag hint not needed (image fits exactly)');
  }
}

/**
 * Type E 预览样式配置
 */
export const typeEPreview = {
  id: 'type-e',
  name: 'Type E Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  update: null,
  reset,
  getImageOffset,
  getState,
  getNormalizedOffset,
  resetImageOffset
};

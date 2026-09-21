/**
 * Type S 预览样式模块（留白排版 / 参考图）
 * 布局：白色画布 + 居中照片 + 左上两行文字 + 右侧竖排日期与三角标记 + 右下参数行
 * - 画布比例可切换（1:1 / 1:1.35）；照片区固定 1:1（画布宽 82% 正方形，居中）
 * - 照片以 cover 填入照片区，并按归一化偏移拖动
 * - 左上：第一行（默认空）+ 第二行「PHOTO BY {handle}」
 * - 右侧：竖排日期（YYYYMMDD，自上而下）+ 细长实心倒三角标记，垂直居中
 * - 右下：ISO / 焦距 / 光圈 / 快门 一行（EXIF 预填，可手改）
 * - 文字颜色：图片主色 / 黑色 / 自定义（点选图片或原生选色器）
 * - 忽略：左下 Logo、右上装饰标题
 */

import { getDominantColor } from '../utils/dominant-color.js';

export const TYPE_S_LAYOUT = {
  marginLeft: 0.09,        // 照片左边距（占画布宽）
  marginRight: 0.09,       // 照片右边距（照片宽 = 画布宽 82%，正方形，水平垂直居中）
  topLeftX: 0.045,         // 左上文字左位置（占画布宽）
  topLeftY: 0.02,          // 左上文字上位置（占画布高）
  topFont: 0.017,          // 左上文字字号（× 画布宽）
  topLineHeight: 1.6,      // 左上文字行高
  topLetterSpacing: 0.06,  // 左上文字字距（em）
  dateRight: 0.028,        // 右侧日期右缩进（× 画布宽）
  dateFont: 0.018,         // 日期字号（× 画布宽）
  dateLetterSpacing: 0.25, // 日期字距（em）
  paramsRight: 0.09,       // 右下参数右缩进（× 画布宽）
  paramsBottom: 0.96,      // 参数行中心 Y（× 画布高）
  paramsFont: 0.02,        // 参数行字号（× 画布宽）
  paramsLetterSpacing: 0.25 // 参数行字距（em）
};

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null,
  displayWidth: 0,
  displayHeight: 0,
  photoRect: { x: 0, y: 0, w: 0, h: 0 },
  imageDims: { naturalWidth: 0, naturalHeight: 0 },
  canvasAspect: '1:1',
  offset: { x: 0, y: 0 },      // 归一化偏移 [-1, 1]
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  offsetStart: { x: 0, y: 0 }
};

/**
 * 初始化 Type S 预览
 * @param {Object} elements - DOM 元素
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;

  if (state.img) {
    state.img.removeEventListener('mousedown', startDrag);
    state.img.addEventListener('mousedown', startDrag);
  }
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
}

/**
 * 比例字符串 → 数值
 * @param {string} aspect - '1:1' | '1:1.35'
 * @returns {number} 高/宽
 */
function aspectHOverW(aspect) {
  return aspect === '1:1.35' ? 1.35 : 1;
}

/**
 * 计算画布尺寸（不放大：照片恒为画布宽 82% 的正方形，取原图短边为照片边长）
 * @param {Object} settings - { naturalWidth, naturalHeight, canvasRatioS }
 * @returns {Object} { squareSize, canvasHeight }
 */
export function calcSize(settings = {}) {
  const { naturalWidth = 0, naturalHeight = 0 } = settings;
  const canvasAspect = settings.canvasRatioS === '1:1.35' ? '1:1.35' : '1:1';
  state.canvasAspect = canvasAspect;

  const cHW = aspectHOverW(canvasAspect);                 // 画布 高/宽
  const L = TYPE_S_LAYOUT;
  const photoWidthFrac = 1 - L.marginLeft - L.marginRight; // 0.82
  const shortSide = Math.min(naturalWidth, naturalHeight);
  const canvasWidth = shortSide > 0 ? shortSide / photoWidthFrac : 0;

  return {
    squareSize: Math.round(canvasWidth),
    canvasHeight: Math.round(canvasWidth * cHW)
  };
}

/**
 * 计算照片区矩形（画布宽 82% 的正方形，水平垂直居中）
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{x:number,y:number,w:number,h:number}}
 */
export function getPhotoRect(canvasWidth, canvasHeight) {
  const L = TYPE_S_LAYOUT;
  const side = canvasWidth * (1 - L.marginLeft - L.marginRight);
  return {
    x: (canvasWidth - side) / 2,
    y: (canvasHeight - side) / 2,
    w: side,
    h: side
  };
}

/**
 * 设置 frameWrapper 样式（接收显示尺寸）
 * @param {number} squareSize - 显示画布宽
 * @param {number} canvasHeight - 显示画布高
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;

  state.frameWrapper.classList.add('type-s');
  state.frameWrapper.classList.remove(
    'type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h',
    'type-i', 'type-j', 'type-k', 'type-l', 'type-m', 'type-n', 'type-o', 'type-p',
    'type-q', 'type-r'
  );

  state.displayWidth = squareSize;
  state.displayHeight = canvasHeight;

  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
}

/**
 * 更新 DOM 预览
 * @param {number} displayW - 显示画布宽
 * @param {number} displayH - 显示画布高
 * @param {Object} imgDimensions - { naturalWidth, naturalHeight }
 */
export function updatePreview(displayW, displayH, imgDimensions = {}) {
  if (!state.img) return;

  if (imgDimensions.naturalWidth && imgDimensions.naturalHeight) {
    state.imageDims = {
      naturalWidth: imgDimensions.naturalWidth,
      naturalHeight: imgDimensions.naturalHeight
    };
  }
  state.displayWidth = displayW;
  state.displayHeight = displayH;

  const rect = getPhotoRect(displayW, displayH);
  state.photoRect = rect;

  const img = state.img;
  img.style.position = 'absolute';
  img.style.left = `${rect.x}px`;
  img.style.top = `${rect.y}px`;
  img.style.width = `${rect.w}px`;
  img.style.height = `${rect.h}px`;
  img.style.maxWidth = 'none';
  img.style.maxHeight = 'none';
  img.style.objectFit = 'cover';
  img.style.display = '';
  img.style.clipPath = 'none';
  img.style.transform = 'none';

  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }

  applyOffset();
  updateDragHint();
}

/**
 * 解析文字颜色（图片主色 / 指定色）
 * @param {Object} settings
 * @returns {string}
 */
export function resolveTextColor(settings = {}, img = state.img) {
  const choice = settings.textColorS || '#000000';
  if (choice === 'dominant') return getDominantColor(img);
  return choice;
}

/**
 * 组装右下参数行：ISO {iso} | {focal}mm | F/{f} | {shutter}s
 * @param {Object} settings
 * @returns {string}
 */
export function buildParamsLine(settings = {}) {
  const segs = [];
  const iso = String(settings.isoS || '').trim();
  const focal = String(settings.focalS || '').trim().replace(/mm$/i, '');
  const fnumRaw = String(settings.fNumberS || '').trim();
  const shutter = String(settings.shutterS || '').trim();

  if (iso) segs.push(`ISO ${iso}`);
  if (focal) segs.push(`${focal}mm`);
  if (fnumRaw) {
    const f = fnumRaw.replace(/^f\s*\/?\s*/i, '').replace(/\.0$/, '');
    if (f) segs.push(`F/${f}`);
  }
  if (shutter) segs.push(`${shutter}s`);

  return segs.join(' | ');
}

/**
 * 日期格式化为 YYYYMMDD（输入 YYYY-MM-DD，即原生 date 控件值）
 * @param {string} raw
 * @returns {string}
 */
export function formatDateS(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}${m[2]}${m[3]}`;
  return s.replace(/[-/]/g, '');
}

/**
 * 更新边框内容预览
 * @param {Object} elements - 边框元素（未使用，使用 state）
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings = {}) {
  if (!state.borderContent) return;

  const W = state.displayWidth;
  const H = state.displayHeight;
  if (!W || !H) return;

  const L = TYPE_S_LAYOUT;
  const color = resolveTextColor(settings);

  const topLine = String(settings.topLineS || '').trim();
  const handle = String(settings.photoByS || '').trim();
  const date = formatDateS(settings.dateS);
  const params = buildParamsLine(settings);

  const topFont = Math.max(7, Math.round(L.topFont * W));
  const dateFont = Math.max(7, Math.round(L.dateFont * W));
  const paramsFont = Math.max(7, Math.round(L.paramsFont * W));

  const topLeftX = W * L.topLeftX;
  const topLeftY = H * L.topLeftY;
  const dateRight = W * L.dateRight;
  const paramsRight = W * L.paramsRight;
  const paramsTop = H * L.paramsBottom;

  let html = `<div class="type-s-layer" style="color:${color}">`;

  if (topLine || handle) {
    html += `<div class="type-s-top" style="left:${topLeftX}px;top:${topLeftY}px;font-size:${topFont}px;letter-spacing:${(L.topLetterSpacing * topFont).toFixed(2)}px;line-height:${L.topLineHeight}">`;
    if (topLine) html += `<div class="type-s-top-line">${escapeHtml(topLine)}</div>`;
    else html += `<div class="type-s-top-line">&nbsp;</div>`;
    if (handle) html += `<div class="type-s-top-line">PHOTO BY ${escapeHtml(handle)}</div>`;
    html += `</div>`;
  }

  if (date) {
    html += `<div class="type-s-right" style="right:${dateRight}px;font-size:${dateFont}px;letter-spacing:${(L.dateLetterSpacing * dateFont).toFixed(2)}px">`;
    html += `<div class="type-s-date">${escapeHtml(date)}</div>`;
    html += `<div class="type-s-mark"></div>`;
    html += `</div>`;
  }

  if (params) {
    html += `<div class="type-s-params" style="right:${paramsRight}px;top:${paramsTop}px;font-size:${paramsFont}px;letter-spacing:${(L.paramsLetterSpacing * paramsFont).toFixed(2)}px">${escapeHtml(params)}</div>`;
  }

  html += `</div>`;
  state.borderContent.innerHTML = html;
}

/**
 * 计算 cover 后图片的绘制尺寸与最大偏移（显示像素）
 */
function getMaxOffset() {
  const { naturalWidth, naturalHeight } = state.imageDims;
  const { w: winW, h: winH } = state.photoRect;
  if (!naturalWidth || !naturalHeight || !winW || !winH) {
    return { x: 0, y: 0, drawnW: 0, drawnH: 0 };
  }
  const imgRatio = naturalWidth / naturalHeight;
  const winRatio = winW / winH;
  let drawnW, drawnH;
  if (imgRatio > winRatio) {
    drawnH = winH;
    drawnW = winH * imgRatio;
  } else {
    drawnW = winW;
    drawnH = winW / imgRatio;
  }
  return {
    x: Math.max(0, (drawnW - winW) / 2),
    y: Math.max(0, (drawnH - winH) / 2),
    drawnW,
    drawnH
  };
}

/**
 * 应用归一化偏移到 object-position
 */
function applyOffset() {
  const m = getMaxOffset();
  const px = m.x > 0 ? 50 + state.offset.x * 50 : 50;
  const py = m.y > 0 ? 50 + state.offset.y * 50 : 50;
  if (state.img) {
    state.img.style.objectPosition = `${px}% ${py}%`;
  }
}

/**
 * 开始拖动
 */
function startDrag(e) {
  if (!state.img) return;
  e.preventDefault();
  state.isDragging = true;
  state.dragStart = { x: e.clientX, y: e.clientY };
  state.offsetStart = { ...state.offset };
}

/**
 * 拖动中（二维）
 */
function onDrag(e) {
  if (!state.isDragging || !state.img) return;
  e.preventDefault();
  const m = getMaxOffset();
  const deltaX = e.clientX - state.dragStart.x;
  const deltaY = e.clientY - state.dragStart.y;
  if (m.x > 0) {
    state.offset.x = clamp(state.offsetStart.x - deltaX / m.x, -1, 1);
  }
  if (m.y > 0) {
    state.offset.y = clamp(state.offsetStart.y - deltaY / m.y, -1, 1);
  }
  applyOffset();
}

/**
 * 结束拖动
 */
function endDrag() {
  state.isDragging = false;
}

/**
 * 数值钳制
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 更新拖动提示
 */
function updateDragHint() {
  if (!state.frameWrapper) return;
  const parent = state.frameWrapper.parentElement;
  if (!parent) return;

  parent.querySelectorAll('.type-s-drag-hint').forEach(hint => hint.remove());

  const m = getMaxOffset();
  if (m.x > 5 || m.y > 5) {
    const hint = document.createElement('div');
    hint.className = 'type-s-drag-hint';
    hint.textContent = '拖动选择显示区域';
    parent.insertBefore(hint, state.frameWrapper.nextSibling);
  }
}

/**
 * HTML 转义
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
 * 获取归一化偏移量（[-1,1]，用于导出）
 */
export function getNormalizedOffset() {
  return { ...state.offset };
}

/**
 * 重置图片偏移量
 */
export function resetImageOffset() {
  state.offset = { x: 0, y: 0 };
  applyOffset();
}

/**
 * 获取当前状态（只读副本）
 */
export function getState() {
  return {
    displayWidth: state.displayWidth,
    displayHeight: state.displayHeight,
    photoRect: { ...state.photoRect },
    offset: { ...state.offset }
  };
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
  }

  if (state.photoFooter) {
    state.photoFooter.style.display = '';
  }

  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-s');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }

  if (state.borderContent) {
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

  state.displayWidth = 0;
  state.displayHeight = 0;
  state.photoRect = { x: 0, y: 0, w: 0, h: 0 };
  state.offset = { x: 0, y: 0 };
}

/**
 * Type S 预览样式配置
 */
export const typeSPreview = {
  id: 'type-s',
  name: 'Type S Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset,
  getNormalizedOffset,
  resetImageOffset,
  getState
};

/**
 * Type Q 预览样式模块（简洁布局）
 * 布局：主色边框（四边等宽 2.5%，颜色 = 图片主色）+ 照片区（95%×95%）
 * - 署名 "Foto by {署名}" 叠照片内右下角（Semibold）
 * - 署名颜色三选一：黑 / 白 / 图片主色；可通过开关隐藏
 * 署名字号 = 0.021 × 画布宽度（预览/导出同比例）
 */

import { getDominantColor } from '../utils/dominant-color.js';

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
 * 布局常量（与导出侧 type-Q-export.js 保持一致，均为画布尺寸比例）
 */
export const TYPE_Q_LAYOUT = {
  border: 0.025,        // 四边等宽边框（占画布宽比例）
  photoSize: 0.95,      // 照片宽高占比（画布为正比例扩展）
  sigFont: 0.021,       // 署名字号 = 0.021 × 画布宽
  sigRight: 0.035,      // 署名右缩进（× 画布宽）
  sigCY: 0.953          // 署名中心 Y（× 画布高）
};

/**
 * 初始化 Type Q 预览
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
 * Type Q：照片占宽高均 95%（四边等宽 2.5% 主色边框）
 * @param {Object} settings - { naturalWidth, naturalHeight }
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;

  const isPortrait = naturalHeight > naturalWidth;
  const canvasWidth = Math.round(naturalWidth / TYPE_Q_LAYOUT.photoSize);
  const canvasHeight = Math.round(naturalHeight / TYPE_Q_LAYOUT.photoSize);

  return { squareSize: canvasWidth, canvasHeight, isPortrait };
}

/**
 * 设置 frameWrapper 样式
 * @param {number} squareSize - 画布宽度
 * @param {number} canvasHeight - 画布高度
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;

  state.frameWrapper.classList.add('type-q');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k', 'type-l', 'type-m', 'type-n', 'type-o', 'type-p');

  state.canvasWidth = squareSize;
  state.canvasHeight = canvasHeight;

  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  // 边框底色 = 图片主色（CSS 无法得知，由 JS 设置）
  if (state.img) {
    state.frameWrapper.style.background = getDominantColor(state.img);
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

  // photoFooter 隐藏（Type Q 不需要独立的底部区域）
  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览：署名（照片内右下角）
 * @param {Object} elements - 边框元素（未使用，使用 state）
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  if (!state.borderContent || !state.frameWrapper) return;

  const canvasWidth = state.canvasWidth || state.frameWrapper.clientWidth;
  const canvasHeight = state.canvasHeight || state.frameWrapper.clientHeight;
  const L = TYPE_Q_LAYOUT;

  const signatureText = (settings.signatureText || '').trim();
  const showSignature = settings.showSignatureQ !== false;
  const sigFontSize = Math.max(8, Math.round(L.sigFont * canvasWidth));

  // 解析署名颜色：黑 / 白 / 图片主色
  const colorChoice = settings.signatureColorQ || '#000000';
  const sigColor = colorChoice === 'dominant' ? getDominantColor(state.img) : colorChoice;

  let html = '';
  if (showSignature && signatureText) {
    const sigRight = Math.round(canvasWidth * L.sigRight);
    const sigTop = Math.round(canvasHeight * L.sigCY);
    html = `<div class="type-q-signature" style="top:${sigTop}px;right:${sigRight}px;font-size:${sigFontSize}px;color:${sigColor}">Foto by ${escapeHtml(signatureText)}</div>`;
  }

  state.borderContent.innerHTML = html;
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
    state.frameWrapper.classList.remove('type-q');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
    state.frameWrapper.style.background = '';
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
 * Type Q 预览样式配置
 */
export const typeQPreview = {
  id: 'type-q',
  name: 'Type Q Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};

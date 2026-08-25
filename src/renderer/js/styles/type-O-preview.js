/**
 * Type O 预览样式模块
 * 布局：白底 + 照片区（横 84%×68% / 纵 81%×76.7%，左右白边减半、底部白边减 1/3）+ 三行文字 + 底部水印带
 * - 第 1 行：胶片型号（0.80em Regular #333，水平居中）
 * - 第 2 行：厂商 + 机型（1em Semibold #000，水平居中）
 * - 第 3 行：署名水印（0.36em 黑色，底部 6% 带，水平居中）
 * 文字基准字号 = 0.030 × 显示宽度（预览/导出同比例）
 * 第 1+2 行文字组在 15% 文字区内垂直居中
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
 * 初始化 Type O 预览
 * @param {Object} elements - DOM 元素
 * @param {HTMLElement} elements.img - 用户图片元素
 * @param {HTMLElement} elements.frameWrapper - frameWrapper 元素
 * @param {HTMLElement} elements.photoFooter - photoFooter 元素
 * @param {HTMLElement} elements.borderContent - borderContent 元素
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type O：横向照片占 84% 宽 / 68% 高，纵向照片占 81% 宽 / 76.7% 高（左右白边减半、底部白边减 1/3）
 * @param {Object} settings - 设置
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @param {number} settings.naturalHeight - 图片原始高度
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;

  const isPortrait = naturalHeight > naturalWidth;
  // 横图照片宽 84%（左右 8%）；纵图照片宽 81%（左右 9.5%，白边减半）
  const photoWidthRatio = isPortrait ? 0.81 : 0.84;
  // 纵图照片高 76.7%（底部白边减 1/3），横图照片高 68%
  const photoHeightRatio = isPortrait ? 0.7667 : 0.68;
  const canvasWidth = Math.round(naturalWidth / photoWidthRatio);
  const canvasHeight = Math.round(naturalHeight / photoHeightRatio);

  return { squareSize: canvasWidth, canvasHeight, isPortrait };
}

/**
 * 设置 frameWrapper 样式
 * @param {number} squareSize - 画布宽度
 * @param {number} canvasHeight - 画布高度
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;

  // 使用类名切换样式
  state.frameWrapper.classList.add('type-o');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k', 'type-l', 'type-m', 'type-n');

  // 存储画布尺寸（供 updateContentPreview 计算文字位置）
  state.canvasWidth = squareSize;
  state.canvasHeight = canvasHeight;

  // 设置画布尺寸
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  // 照片描边宽度：与导出同比例（基准 900px 宽对应 2px）
  if (state.img) {
    const borderWidth = Math.max(2, Math.round(squareSize * (2 / 900)));
    state.img.style.borderWidth = `${borderWidth}px`;
    state.img.style.borderStyle = 'solid';
  }

  // 动态设置文字基准字号 = 0.030 × 画布宽度（第 2 行厂商+机型字号）
  if (state.borderContent) {
    const baseFontSize = Math.max(8, Math.round(0.030 * squareSize));
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

  // 纵向图片：覆盖 CSS 默认的 left:8% width:84% height:68% 为 left:9.5% width:81% height:76.67%
  // （左右白边减半、底部白边减 1/3）
  const isPortrait = imgDimensions.naturalHeight > imgDimensions.naturalWidth;
  state.isPortrait = isPortrait;
  if (isPortrait) {
    state.img.style.left = '9.5%';
    state.img.style.width = '81%';
    state.img.style.height = '76.67%';
  }

  // 设置 photoFooter 隐藏（Type O 不需要独立的底部区域）
  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * 第 1 行：胶片型号；第 2 行：厂商 + 机型；第 3 行：署名水印
 * 三行均水平居中（由 CSS left:0;right:0;text-align:center 控制），JS 仅计算垂直位置 top
 * @param {Object} elements - 边框元素
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  if (!state.borderContent || !state.frameWrapper) return;

  const canvasWidth = state.canvasWidth || state.frameWrapper.clientWidth;
  const canvasHeight = state.canvasHeight || state.frameWrapper.clientHeight;

  // 基准字号（第 2 行字号），由 updateFrameWrapper 设置
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || Math.max(8, Math.round(0.030 * canvasWidth));

  // ===== 三行文字 =====
  const filmStyle = settings.filmStyle || '';
  const manufacturer = settings.manufacturer || '';
  const customModel = settings.customModel || '';
  const line2Text = `${manufacturer}${customModel ? ' ' + customModel : ''}`;
  const signatureText = settings.signatureText || '';
  const line3Text = signatureText ? `© ${signatureText}` : '';

  // 垂直布局（与导出一致）：按方向取布局常量
  // 横图：照片高 68%（底 74%）、间距 5%、文字区 79%/15%、水印带 94%/6%
  // 纵图：照片高 76.7%（底 82.7%）、间距 3.3%、文字区 86%/10%、水印带 96%/4%
  const L = state.isPortrait
    ? { textTop: 0.86, textHeight: 0.10, watermarkTop: 0.96, watermarkHeight: 0.04 }
    : { textTop: 0.79, textHeight: 0.15, watermarkTop: 0.94, watermarkHeight: 0.06 };
  const textAreaTop = Math.round(canvasHeight * L.textTop);
  const textAreaHeight = Math.round(canvasHeight * L.textHeight);
  const line1Height = Math.round(baseFontSize * 0.80 * 1.2);
  const gap = Math.round(baseFontSize * 0.1);
  const line2Height = Math.round(baseFontSize * 1.2);
  // 第 1+2 行文字组在文字区内垂直居中
  const groupHeight = line1Height + gap + line2Height;
  const groupTop = textAreaTop + Math.round((textAreaHeight - groupHeight) / 2);
  const line1Top = groupTop;
  const line2Top = groupTop + line1Height + gap;

  // 水印行：底部水印带垂直居中
  const line3Height = Math.round(baseFontSize * 0.36 * 1.2);
  const line3Top = Math.round(canvasHeight * L.watermarkTop + (canvasHeight * L.watermarkHeight - line3Height) / 2);

  // 照片描边颜色（边框色可调，默认黑）
  if (state.img) {
    state.img.style.borderColor = settings.borderColor || '#000000';
  }

  // 生成 HTML（水平居中由 CSS 控制，仅设 top）
  let html = '';
  if (filmStyle) {
    html += `<div class="type-o-line type-o-line1" style="top:${line1Top}px">${escapeHtml(filmStyle)}</div>`;
  }
  if (line2Text) {
    html += `<div class="type-o-line type-o-line2" style="top:${line2Top}px">${escapeHtml(line2Text)}</div>`;
  }
  if (line3Text) {
    html += `<div class="type-o-line type-o-line3" style="top:${line3Top}px">${escapeHtml(line3Text)}</div>`;
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
    state.frameWrapper.classList.remove('type-o');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }

  if (state.borderContent) {
    // 重置为 CSS 定义的样式
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
 * Type O 预览样式配置
 */
export const typeOPreview = {
  id: 'type-o',
  name: 'Type O Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};

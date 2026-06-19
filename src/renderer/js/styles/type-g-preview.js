/**
 * Type G 预览样式模块
 * 布局：上方 5% 白色留白 + 中部 92%×80% 照片区 + 下方 15% 文字信息区
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

// 缓存图框尺寸（图片加载时计算一次，resize 时直接使用）
let cachedSize = null;

/**
 * 初始化 Type G 预览
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
 * Type G：画布宽度 = 图片宽度，画布高度 = 图片高度 / 0.8（照片占 80%）
 * @param {Object} settings - 设置
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @param {number} settings.naturalHeight - 图片原始高度
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;
  
  // 画布宽度 = 图片宽度
  const canvasWidth = naturalWidth;
  // 纵向图片：照片占 90%（白色区域减半），横向图片：照片占 80%（默认）
  const isPortrait = naturalHeight > naturalWidth;
  const heightRatio = isPortrait ? 0.9 : 0.8;
  const canvasHeight = Math.round(naturalHeight / heightRatio);
  
  // 返回原始画布尺寸，显示缩放在 app.js 中根据预览区域大小计算
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
  state.frameWrapper.classList.add('type-g');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f');
  
  // 设置画布尺寸
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  // 动态设置文字字号（跟随画布缩放，基准 900px 宽度对应 14px）
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type G 布局：照片区域由 CSS 控制（top:5%, left:4%, width:92%, height:80%）
 * 这里只需要确保图片样式正确
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

  // 纵向图片：覆盖 CSS 默认的 top:5% height:80% 为 top:2.5% height:90%
  const isPortrait = imgDimensions.naturalHeight > imgDimensions.naturalWidth;
  if (isPortrait) {
    state.img.style.top = '2.5%';
    state.img.style.height = '90%';
  }

  // 同步设置文字区域高度（纵向 7.5%，横向由 CSS 默认 15%）
  if (state.borderContent) {
    state.borderContent.style.height = isPortrait ? '7.5%' : '';
  }

  // 设置 photoFooter 隐藏（Type G 不需要独立的底部区域）
  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * 使用绝对定位（与导出逻辑一致），确保署名不影响前两行位置
 * @param {Object} elements - 边框元素
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, showModel, customModel, fNumber, exposureTime, iso, focalLength, dateTime } = settings;
  
  if (!state.borderContent) return;
  
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14;
  const textAreaHeight = state.borderContent.clientHeight;
  
  // 第一行：显示厂商 Logo（高度 = 画布顶部边框高度 = canvasHeight × 5%）
  // textAreaHeight = canvasHeight × 15%，所以 canvasHeight × 5% = textAreaHeight / 3
  const logoHeight = Math.round(textAreaHeight / 6);
  // Type G 始终显示所有元素（无开关控制）
  let line1Html = '';
  if (selectedLogo) {
    // 使用 onload 获取实际尺寸后设置宽度（与导出端逻辑一致）
    line1Html = `<div class="type-g-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  }
  
  // 第二行：拍摄日期 | 拍摄参数 | 相机名称
  const line2Parts = [];
  if (dateTime) {
    const dt = new Date(dateTime);
    line2Parts.push(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`);
  }
  const paramParts = [];
  if (fNumber) paramParts.push(`f/${fNumber}`);
  if (focalLength) paramParts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
  if (exposureTime) paramParts.push(`${exposureTime}s`);
  if (iso) paramParts.push(`ISO${iso}`);
  if (paramParts.length > 0) line2Parts.push(paramParts.join(' '));
  if (customModel) line2Parts.push(customModel);
  const line2Html = line2Parts.join(' <span class="type-g-separator">|</span> ');
  
  // 第三行：署名
  const signatureText = settings.signatureText || '';
  const line3Html = signatureText ? `© ${signatureText}` : '';
  
  // 计算布局位置
  const line2FontSize = baseFontSize; // 与第一行相同字号
  // Logo 行高 = logo 实际高度，确保不裁切
  const lineHeight1 = line1Html ? logoHeight : baseFontSize * 1.2;
  const lineHeight2 = line2FontSize;
  const lineGap = baseFontSize * (6 / 14);
  const signatureGap = baseFontSize * (6 / 14);
  
  const groupHeight = (line1Html ? lineHeight1 : 0) + lineGap + (line2Html ? lineHeight2 : 0);
  const centerY = state.borderContent.clientHeight / 2;
  const line1Top = centerY - groupHeight / 2;
  const line2Top = line1Top + lineHeight1 + lineGap;
  const line3Top = line2Top + lineHeight2 + signatureGap;
  
  // 生成 HTML
  let html = '';
  if (line1Html) {
    html += `<div class="type-g-line type-g-line1" style="top:${line1Top}px;height:${lineHeight1}px">${line1Html}</div>`;
  }
  if (line2Html) {
    html += `<div class="type-g-line type-g-line2" style="top:${line2Top}px">${line2Html}</div>`;
  }
  if (line3Html) {
    html += `<div class="type-g-line type-g-line3" style="top:${line3Top}px">${line3Html}</div>`;
  }
  
  state.borderContent.innerHTML = html;
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
    state.frameWrapper.classList.remove('type-g');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }
  
  if (state.borderContent) {
    // 重置为 CSS 定义的样式
    state.borderContent.style.position = '';
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
 * Type G 预览样式配置
 */
export const typeGPreview = {
  id: 'type-g',
  name: 'Type G Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
/**
 * Type N 预览样式模块
 * 布局：上方 7.5% 白色边框（Logo）+ 中部 85% 照片区 + 下方 7.5% 文字信息区
 * 纵向图片：上方 3.75% + 中部 92.5% + 下方 3.75%
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
 * 初始化 Type N 预览
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
 * Type N：横向照片占 85%，纵向照片占 92.5%
 * @param {Object} settings - 设置
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @param {number} settings.naturalHeight - 图片原始高度
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;
  
  // 画布宽度 = 图片宽度
  const canvasWidth = naturalWidth;
  // 纵向图片：照片占 92.5%（上下各 3.75%），横向图片：照片占 85%（上下各 7.5%）
  const isPortrait = naturalHeight > naturalWidth;
  const heightRatio = isPortrait ? 0.925 : 0.85;
  const canvasHeight = Math.round(naturalHeight / heightRatio);
  
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
  state.frameWrapper.classList.add('type-n');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k', 'type-l', 'type-m');
  
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
 * Type N 布局：顶部 Logo 区域由 .type-n-top 控制，照片区域由 CSS 控制
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

  // 纵向图片：覆盖 CSS 默认的 top:7.5% height:85% 为 top:3.75% height:92.5%
  const isPortrait = imgDimensions.naturalHeight > imgDimensions.naturalWidth;
  if (isPortrait) {
    state.img.style.top = '3.75%';
    state.img.style.height = '92.5%';
  }

  // 同步设置底部文字区域高度（纵向 3.75%，横向由 CSS 默认 7.5%）
  if (state.borderContent) {
    state.borderContent.style.height = isPortrait ? '3.75%' : '';
  }
  
  // 同步设置顶部 Logo 区域高度（纵向 3.75%，横向由 CSS 默认 7.5%）
  // 确保元素已创建（首次渲染时 updateContentPreview 尚未执行，避免首帧顺序耦合）
  let topArea = state.frameWrapper?.querySelector('.type-n-top');
  if (!topArea && state.frameWrapper && state.img) {
    topArea = document.createElement('div');
    topArea.className = 'type-n-top';
    state.frameWrapper.insertBefore(topArea, state.img);
  }
  if (topArea) {
    topArea.style.height = isPortrait ? '3.75%' : '';
  }

  // 设置 photoFooter 隐藏（Type N 不需要独立的底部区域）
  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * 顶部：Logo 居中
 * 底部：参数行 + 署名行（无日期、无机型）
 * @param {Object} elements - 边框元素
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, fNumber, exposureTime, iso, focalLength } = settings;
  
  if (!state.borderContent || !state.frameWrapper) return;
  
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14;
  const textAreaHeight = state.borderContent.clientHeight;
  
  // ===== 顶部 Logo 区域 =====
  let topArea = state.frameWrapper.querySelector('.type-n-top');
  if (!topArea) {
    topArea = document.createElement('div');
    topArea.className = 'type-n-top';
    state.frameWrapper.insertBefore(topArea, state.img);
  }
  
  const topAreaHeight = topArea.clientHeight || (state.frameWrapper.clientHeight * 0.075);
  const logoHeight = Math.round(topAreaHeight * 0.5);
  
  if (selectedLogo) {
    topArea.innerHTML = `<div class="type-n-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  } else {
    topArea.innerHTML = '';
  }
  
  // ===== 底部文字区域 =====
  // 第一行：拍摄参数（每个参数带英文标签）
  const paramParts = [];
  if (fNumber) paramParts.push({ label: 'Aperture', value: `f/${fNumber}` });
  if (focalLength) paramParts.push({ label: 'Focal', value: `${String(focalLength).replace(/mm$/i, '')}mm` });
  if (exposureTime) paramParts.push({ label: 'Shutter', value: `${exposureTime}s` });
  if (iso) paramParts.push({ label: 'ISO', value: `${iso}` });
  const line1Html = paramParts.map(p => `<span class="type-n-label">${p.label}</span> ${p.value}`).join(' ');
  
  // 第二行：署名
  const signatureText = settings.signatureText || '';
  const line2Html = signatureText ? `© ${signatureText}` : '';
  
  // 计算布局位置：参数行固定居中，署名固定在参数行下方
  const line1FontSize = baseFontSize;
  const lineHeight1 = line1FontSize;
  const lineHeight2 = Math.round(baseFontSize * 0.8571);
  const signatureGap = baseFontSize * (6 / 14);
  
  // 参数行始终固定在底部区域垂直居中
  const line1Top = (textAreaHeight - lineHeight1) / 2;
  // 署名始终在参数行下方固定间距
  const line2Top = line1Top + lineHeight1 + signatureGap;
  
  // 生成 HTML
  let html = '';
  if (line1Html) {
    html += `<div class="type-n-line type-n-line1" style="top:${line1Top}px">${line1Html}</div>`;
  }
  if (line2Html) {
    html += `<div class="type-n-line type-n-line2" style="top:${line2Top}px">${line2Html}</div>`;
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
    state.frameWrapper.classList.remove('type-n');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
    // 移除顶部 Logo 区域
    const topArea = state.frameWrapper.querySelector('.type-n-top');
    if (topArea) topArea.remove();
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
 * Type N 预览样式配置
 */
export const typeNPreview = {
  id: 'type-n',
  name: 'Type N Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
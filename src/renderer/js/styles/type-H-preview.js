/**
 * Type H 预览样式模块
 * 布局：照片 100% 填满画布，Logo 和文字叠加在照片底部
 * 画布大小 = 图片原始大小
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type H 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type H：画布大小 = 图片原始大小（无额外白色区域）
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;
  return { squareSize: naturalWidth, canvasHeight: naturalHeight };
}

/**
 * 设置 frameWrapper 样式
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;
  
  state.frameWrapper.classList.add('type-h');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g');
  
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type H：照片 100% 填满画布，无纵向图片覆盖逻辑
 */
export function updatePreview(squareSize, canvasHeight, imgDimensions = {}) {
  if (!state.img) return;
  
  // 重置图片样式，CSS 控制 100%×100%
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

  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * 与 Type G 相同的三行布局（Logo + 日期|参数|机型 + 签名）
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, customModel, fNumber, exposureTime, iso, focalLength, dateTime, textColor } = settings;
  const color = textColor || '#ffffff';
  
  if (!state.borderContent) return;
  
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14;
  const textAreaHeight = state.borderContent.clientHeight;
  
  const logoHeight = Math.round(textAreaHeight / 6);
  let line1Html = '';
  if (selectedLogo) {
    line1Html = `<div class="type-h-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px;width:auto" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  }
  
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
  const line2Html = line2Parts.join(` <span class="type-h-separator" style="color:${color}">|</span> `);
  
  const signatureText = settings.signatureText || '';
  const line3Html = signatureText ? `© ${signatureText}` : '';
  
  const line2FontSize = baseFontSize;
  const lineHeight1 = line1Html ? logoHeight : baseFontSize * 1.2;
  const lineHeight2 = line2FontSize;
  const lineGap = baseFontSize * (6 / 14);
  const signatureGap = baseFontSize * (6 / 14);
  
  const groupHeight = (line1Html ? lineHeight1 : 0) + lineGap + (line2Html ? lineHeight2 : 0);
  const centerY = state.borderContent.clientHeight / 2;
  const line1Top = centerY - groupHeight / 2;
  const line2Top = line1Top + lineHeight1 + lineGap;
  const line3Top = line2Top + lineHeight2 + signatureGap;
  
  let html = '';
  if (line1Html) {
    html += `<div class="type-h-line type-h-line1" style="top:${line1Top}px;height:${lineHeight1}px">${line1Html}</div>`;
  }
  if (line2Html) {
    html += `<div class="type-h-line type-h-line2" style="top:${line2Top}px;color:${color}">${line2Html}</div>`;
  }
  if (line3Html) {
    html += `<div class="type-h-line type-h-line3" style="top:${line3Top}px;color:${color}">${line3Html}</div>`;
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
    state.frameWrapper.classList.remove('type-h');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }
  
  if (state.borderContent) {
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
 * Type H 预览样式配置
 */
export const typeHPreview = {
  id: 'type-h',
  name: 'Type H Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
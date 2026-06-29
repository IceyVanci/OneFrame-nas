/**
 * Type J 预览样式模块
 * 布局：照片 100% 填满画布，署名在底部第一行，参数行三栏布局
 * 基于 Type H 调整：不显示 Logo，署名替代 Logo 位置，参数行左机型/中参数/右时间
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type J 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type J：画布大小 = 图片原始大小（无额外白色区域）
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
  
  state.frameWrapper.classList.add('type-j');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i');
  
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type J：照片 100% 填满画布
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
 * Type J：署名在底部第一行 + 参数行三栏（左机型/中参数/右时间）
 */
export function updateContentPreview(elements, settings) {
  const { textColor, customModel, fNumber, exposureTime, iso, focalLength, dateTime } = settings;
  const color = textColor || '#ffffff';
  
  if (!state.borderContent) return;
  
  // 从 frameWrapper 宽度计算基准字号（避免累乘）
  const fw = state.frameWrapper;
  const fwWidth = fw ? parseFloat(fw.style.width) || fw.clientWidth : 900;
  let baseFontSize = Math.max(8, Math.round(14 * fwWidth / 900));
  
  // 纵向图片：底部字体增加 50%
  const isPortrait = state.img && state.img.naturalHeight > state.img.naturalWidth;
  if (isPortrait) {
    baseFontSize = Math.round(baseFontSize * 1.5);
    state.borderContent.style.fontSize = `${baseFontSize}px`;
  }
  
  // 署名（Medium 字重）
  const signatureText = settings.signatureText || 'OneFrame';
  let signatureHtml = '';
  if (signatureText) {
    signatureHtml = `<div class="type-j-signature" style="color:${color};font-weight:500">© ${signatureText}</div>`;
  }
  
  // 参数行三栏（绝对定位，参数始终画布正中）
  // 左栏：机型（含厂商名）
  const modelText = customModel || '';
  
  // 中栏：焦距 光圈 快门 ISO
  const paramParts = [];
  if (focalLength) paramParts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
  if (fNumber) paramParts.push(`f/${fNumber}`);
  if (exposureTime) paramParts.push(`${exposureTime}s`);
  if (iso) paramParts.push(`ISO${iso}`);
  const paramsText = paramParts.join(' ');
  
  // 右栏：时间
  let timeText = '';
  if (dateTime) {
    const dt = new Date(dateTime);
    timeText = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  }
  
  let paramsRowHtml = '';
  if (modelText || paramsText || timeText) {
    paramsRowHtml = `<div class="type-j-params-row">`;
    if (modelText) paramsRowHtml += `<span class="type-j-model" style="color:${color}">${modelText}</span>`;
    if (paramsText) paramsRowHtml += `<span class="type-j-params" style="color:${color}">${paramsText}</span>`;
    if (timeText) paramsRowHtml += `<span class="type-j-time" style="color:${color}">${timeText}</span>`;
    paramsRowHtml += `</div>`;
  }
  
  // 构建 HTML
  let html = '';
  if (signatureHtml || paramsRowHtml) {
    html += '<div class="type-j-bottom">';
    if (signatureHtml) html += signatureHtml;
    if (paramsRowHtml) html += paramsRowHtml;
    html += '</div>';
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
    state.frameWrapper.classList.remove('type-j');
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
 * Type J 预览样式配置
 */
export const typeJPreview = {
  id: 'type-j',
  name: 'Type J Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
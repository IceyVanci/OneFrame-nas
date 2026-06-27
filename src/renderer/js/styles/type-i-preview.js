/**
 * Type I 预览样式模块
 * 布局：照片 100% 填满画布，Logo 在顶部居中，底部仅显示署名
 * 基于 Type H 调整：Logo 移至顶部，移除参数、机型和时间
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type I 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type I：画布大小 = 图片原始大小（无额外白色区域）
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
  
  state.frameWrapper.classList.add('type-i');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-j');
  
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type I：照片 100% 填满画布
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
 * Type I：Logo 顶部居中 + 底部仅署名
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, textColor } = settings;
  const color = textColor || '#ffffff';
  
  if (!state.borderContent) return;
  
  // 从 frameWrapper 宽度计算基准字号（避免读取可能已被修改的 borderContent fontSize 导致累乘）
  const fw = state.frameWrapper;
  const fwWidth = fw ? parseFloat(fw.style.width) || fw.clientWidth : 900;
  let baseFontSize = Math.max(8, Math.round(14 * fwWidth / 900));
  
  // 纵向图片：底部字体增加 50%
  const isPortrait = state.img && state.img.naturalHeight > state.img.naturalWidth;
  if (isPortrait) {
    baseFontSize = Math.round(baseFontSize * 1.5);
    state.borderContent.style.fontSize = `${baseFontSize}px`;
  }
  
  // 顶部 Logo
  let logoHtml = '';
  if (selectedLogo) {
    const logoHeight = Math.round(baseFontSize * 2);
    logoHtml = `<div class="type-i-top-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px;width:auto" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  }
  
  // 底部署名
  const signatureText = settings.signatureText || 'OneFrame';
  let signatureHtml = '';
  if (signatureText) {
    signatureHtml = `<div class="type-i-signature" style="color:${color}">© ${signatureText}</div>`;
  }
  
  // 构建 HTML
  let html = '';
  if (logoHtml) {
    html += logoHtml;
  }
  if (signatureHtml) {
    html += '<div class="type-i-bottom">';
    html += signatureHtml;
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
    state.frameWrapper.classList.remove('type-i');
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
 * Type I 预览样式配置
 */
export const typeIPreview = {
  id: 'type-i',
  name: 'Type I Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
/**
 * Type K 预览样式模块
 * 布局：照片 100% 填满画布，底部左下角 Logo + 双行文字
 * Logo 右侧第一行：署名 + 日期
 * Logo 右侧第二行：机型名称 + 拍摄参数
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type K 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type K：画布大小 = 图片原始大小（无额外白色区域）
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
  
  state.frameWrapper.classList.add('type-k');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-l');
  
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type K：照片 100% 填满画布
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
 * Type K：底部左下角 Logo + 双行文字
 * 第一行：署名 + 日期
 * 第二行：机型名称 + 拍摄参数
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, customModel, fNumber, exposureTime, iso, focalLength, dateTime, textColor } = settings;
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
  
  const logoHeight = Math.round(baseFontSize * 1.2);
  
  // Logo
  let logoHtml = '';
  if (selectedLogo && settings.showLogo !== false) {
    logoHtml = `<div class="type-k-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px;width:auto" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  }
  
  // 第一行：署名(medium) + 日期(normal)
  const signatureText = settings.signatureText || 'OneFrame';
  let dateText = '';
  if (dateTime) {
    const dt = new Date(dateTime);
    dateText = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  }
  let line1Html = '';
  if (signatureText || dateText) {
    let line1Content = '';
    if (signatureText) line1Content += `<span style="font-weight:500">© ${signatureText}</span>`;
    if (dateText) line1Content += (signatureText ? '  ' : '') + `<span style="font-weight:normal">${dateText}</span>`;
    line1Html = `<div class="type-k-line1" style="color:${color}">${line1Content}</div>`;
  }
  
  // 第二行：机型(medium) + 拍摄参数(normal)
  const shootParts = [];
  if (focalLength) shootParts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
  if (fNumber) shootParts.push(`f/${fNumber}`);
  if (exposureTime) shootParts.push(`${exposureTime}s`);
  if (iso) shootParts.push(`ISO${iso}`);
  let line2Html = '';
  if (customModel || shootParts.length > 0) {
    let line2Content = '';
    if (customModel) line2Content += `<span style="font-weight:500">${customModel}</span>`;
    if (shootParts.length > 0) line2Content += (customModel ? '  ' : '') + `<span style="font-weight:normal">${shootParts.join(' ')}</span>`;
    line2Html = `<div class="type-k-line2" style="color:${color}">${line2Content}</div>`;
  }
  
  // 构建 HTML
  let html = '';
  if (logoHtml || line1Html || line2Html) {
    html += '<div class="type-k-bottom">';
    if (logoHtml) html += logoHtml;
    if (line1Html || line2Html) {
      html += '<div class="type-k-text">';
      if (line1Html) html += line1Html;
      if (line2Html) html += line2Html;
      html += '</div>';
    }
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
    state.frameWrapper.classList.remove('type-k');
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
 * Type K 预览样式配置
 */
export const typeKPreview = {
  id: 'type-k',
  name: 'Type K Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
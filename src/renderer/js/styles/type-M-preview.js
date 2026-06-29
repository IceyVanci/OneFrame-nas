/**
 * Type M 预览样式模块
 * 布局：基于 Type I + Type L 模糊边框（四边等高 5%）
 * - 照片 90%×90% 居中，四条边高斯模糊背景
 * - 顶部 Logo（和样式J一样）
 * - 底部文字（和样式J一样：署名 + 参数行三栏）
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type M 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type M：画布大小 = 图片原始大小（无额外白色区域）
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

  state.frameWrapper.classList.add('type-m');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k', 'type-l');

  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type M：创建模糊背景层，设置清晰照片区域（CSS 控制 90%×90%）
 */
export function updatePreview(squareSize, canvasHeight, imgDimensions = {}) {
  if (!state.img) return;

  // 重置图片样式，CSS 控制 90%×90% 定位
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

  // 创建或获取模糊背景元素
  let blurBg = state.frameWrapper.querySelector('.type-m-blur-bg');
  if (!blurBg) {
    blurBg = document.createElement('img');
    blurBg.className = 'type-m-blur-bg';
    state.frameWrapper.insertBefore(blurBg, state.img);
  }
  // 设置背景图片 src 与前景相同
  blurBg.src = state.img.src;
  // 计算模糊半径（按画布宽度缩放）
  const blurRadius = Math.max(10, Math.round(squareSize * 0.02));
  blurBg.style.filter = `blur(${blurRadius}px)`;
}

/**
 * 更新边框内容预览
 * Type M：Logo 顶部居中 + 底部文字（和样式J一样：署名 + 参数行三栏）
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, textColor, customModel, fNumber, exposureTime, iso, focalLength, dateTime } = settings;
  const color = textColor || '#ffffff';

  if (!state.borderContent) return;

  // 基于照片区域宽度计算基准字号（照片区域 = 画布 90%）
  const fw = state.frameWrapper;
  const fwWidth = fw ? parseFloat(fw.style.width) || fw.clientWidth : 900;
  const photoAreaWidth = fwWidth * 0.90;
  let baseFontSize = Math.max(8, Math.round(14 * photoAreaWidth / 900));

  // 纵向图片：底部字体增加 50%
  const isPortrait = state.img && state.img.naturalHeight > state.img.naturalWidth;
  if (isPortrait) {
    baseFontSize = Math.round(baseFontSize * 1.5);
    state.borderContent.style.fontSize = `${baseFontSize}px`;
  }

  // 顶部 Logo（基于照片区域，与样式J一致的尺寸计算）
  let logoHtml = '';
  if (selectedLogo) {
    const logoHeight = Math.round(baseFontSize * 1.2);
    logoHtml = `<div class="type-m-top-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px;width:auto" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
  }

  // 底部署名（Medium 字重，和样式J一样）
  const signatureText = settings.signatureText || 'OneFrame';
  let signatureHtml = '';
  if (signatureText) {
    signatureHtml = `<div class="type-m-signature" style="color:${color};font-weight:500">© ${signatureText}</div>`;
  }

  // 参数行三栏（左机型/中参数/右时间，和样式J一样）
  const modelText = customModel || '';
  const paramParts = [];
  if (focalLength) paramParts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
  if (fNumber) paramParts.push(`f/${fNumber}`);
  if (exposureTime) paramParts.push(`${exposureTime}s`);
  if (iso) paramParts.push(`ISO${iso}`);
  const paramsText = paramParts.join(' ');

  let timeText = '';
  if (dateTime) {
    const dt = new Date(dateTime);
    timeText = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
  }

  let paramsRowHtml = '';
  if (modelText || paramsText || timeText) {
    paramsRowHtml = `<div class="type-m-params-row">`;
    if (modelText) paramsRowHtml += `<span class="type-m-model" style="color:${color}">${modelText}</span>`;
    if (paramsText) paramsRowHtml += `<span class="type-m-params" style="color:${color}">${paramsText}</span>`;
    if (timeText) paramsRowHtml += `<span class="type-m-time" style="color:${color}">${timeText}</span>`;
    paramsRowHtml += `</div>`;
  }

  // 构建 HTML
  let html = '';
  if (logoHtml) html += logoHtml;
  if (signatureHtml || paramsRowHtml) {
    html += '<div class="type-m-bottom">';
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

  // 移除模糊背景层
  const blurBg = state.frameWrapper?.querySelector('.type-m-blur-bg');
  if (blurBg) blurBg.remove();

  if (state.photoFooter) {
    state.photoFooter.style.display = '';
  }

  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-m');
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
 * Type M 预览样式配置
 */
export const typeMPreview = {
  id: 'type-m',
  name: 'Type M Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
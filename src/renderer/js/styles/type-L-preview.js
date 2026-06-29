/**
 * Type L 预览样式模块
 * 布局：基于 Type G，白色外框替换为照片高斯模糊背景
 * - 顶部 5% 模糊背景
 * - 中部照片展示区（92% 宽度，80% 高度），清晰
 * - 底部 15% 文字信息区
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type L 预览
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
}

/**
 * 计算画布尺寸
 * Type L：画布宽度 = 图片宽度，画布高度 = 图片高度 / heightRatio
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;
  const canvasWidth = naturalWidth;
  const isPortrait = naturalHeight > naturalWidth;
  const heightRatio = isPortrait ? 0.9 : 0.8;
  const canvasHeight = Math.round(naturalHeight / heightRatio);
  return { squareSize: canvasWidth, canvasHeight, isPortrait };
}

/**
 * 设置 frameWrapper 样式
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;
  
  state.frameWrapper.classList.add('type-l');
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h', 'type-i', 'type-j', 'type-k');
  
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;
  
  // overflow hidden 确保 blur 背景不溢出（CSS 已处理边框标识和 background）
  
  if (state.borderContent) {
    const fontSize = Math.max(8, Math.round(14 * squareSize / 900));
    state.borderContent.style.fontSize = `${fontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * Type L：动态创建 blur 背景层，设置清晰照片区域
 */
export function updatePreview(squareSize, canvasHeight, imgDimensions = {}) {
  if (!state.img || !state.frameWrapper) return;
  
  // 创建或获取 blur 背景元素
  let blurBg = state.frameWrapper.querySelector('.type-l-blur-bg');
  if (!blurBg) {
    blurBg = document.createElement('img');
    blurBg.className = 'type-l-blur-bg';
    state.frameWrapper.insertBefore(blurBg, state.img);
  }
  // 设置背景图片 src 与前景相同
  blurBg.src = state.img.src;
  // 计算模糊半径（按画布宽度缩放）
  const blurRadius = Math.max(10, Math.round(squareSize * 0.02));
  blurBg.style.filter = `blur(${blurRadius}px)`;
  
  // 重置前景图片样式，让 CSS 控制布局
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
  state.img.style.zIndex = '1';

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

  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }
}

/**
 * 更新边框内容预览
 * 与 Type G 相同的三行布局，文字颜色白色
 */
export function updateContentPreview(elements, settings) {
  const { selectedLogo, showModel, customModel, fNumber, exposureTime, iso, focalLength, dateTime, textColor } = settings;
  const color = textColor || '#ffffff';
  
  if (!state.borderContent) return;
  
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14;
  const textAreaHeight = state.borderContent.clientHeight;
  
  // Logo 高度
  const logoHeight = Math.round(textAreaHeight / 6);
  let line1Html = '';
  if (selectedLogo && settings.showLogo !== false) {
    line1Html = `<div class="type-l-logo"><img src="logos/${selectedLogo}.svg" alt="${selectedLogo}" style="height:${logoHeight}px" onload="this.style.width=Math.round(this.naturalWidth*(${logoHeight}/this.naturalHeight))+'px'"></div>`;
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
  const line2Html = line2Parts.join(` <span class="type-l-separator" style="color:${color}">|</span> `);
  
  // 第三行：署名
  const signatureText = settings.signatureText || '';
  const line3Html = signatureText ? `© ${signatureText}` : '';
  
  // 计算布局位置
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
  
  // 生成 HTML
  let html = '';
  if (line1Html) {
    html += `<div class="type-l-line type-l-line1" style="top:${line1Top}px;height:${lineHeight1}px">${line1Html}</div>`;
  }
  if (line2Html) {
    html += `<div class="type-l-line type-l-line2" style="top:${line2Top}px;color:${color}">${line2Html}</div>`;
  }
  if (line3Html) {
    html += `<div class="type-l-line type-l-line3" style="top:${line3Top}px;color:${color}">${line3Html}</div>`;
  }
  
  state.borderContent.innerHTML = html;
}

/**
 * 重置样式
 */
export function reset() {
  // 移除 blur 背景层
  const blurBg = state.frameWrapper?.querySelector('.type-l-blur-bg');
  if (blurBg) blurBg.remove();
  
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
    state.img.style.zIndex = '';
  }
  
  if (state.photoFooter) {
    state.photoFooter.style.display = '';
  }
  
  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-l');
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
    state.borderContent.style.zIndex = '';
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
 * Type L 预览样式配置
 */
export const typeLPreview = {
  id: 'type-l',
  name: 'Type L Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
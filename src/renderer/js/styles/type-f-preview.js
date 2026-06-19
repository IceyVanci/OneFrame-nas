/**
 * Type F 预览样式模块
 * 布局：上方 5% 白色留白 + 中部 92%×80% 照片区 + 下方 15% 文字信息区
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type F 预览
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
 * Type F：画布宽度 = 图片宽度，画布高度 = 图片高度 / 0.8（照片占 80%）
 * @param {Object} settings - 设置
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @param {number} settings.naturalHeight - 图片原始高度
 * @returns {Object} { squareSize, margin, canvasHeight }
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
  
  // 移除所有类型类名后再添加当前类型
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f');
  state.frameWrapper.classList.add('type-f');
  
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
 * Type F 布局：照片区域由 CSS 控制（top:5%, left:4%, width:92%, height:80%）
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

  // 设置 photoFooter 隐藏（Type F 不需要独立的底部区域）
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
  const { showModel, customModel, showParams, fNumber, exposureTime, iso, focalLength, showTime, dateTime } = settings;
  
  if (!state.borderContent) return;
  
  // 设备型号（已含品牌名，如 "Sony A7M4"）
  const modelName = (showModel && customModel) ? customModel : '';
  
  // 构建第一行内容
  let line1Html = '';
  if (modelName) {
    line1Html = `<span class="type-f-shot-on">Shot on </span><span class="type-f-brand-model">${modelName}</span>`;
  }
  
  // 构建第二行内容（参数信息）
  const line2Parts = [];
  if (dateTime && showTime) {
    const dt = new Date(dateTime);
    line2Parts.push(`${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`);
  }
  if (showParams && fNumber) line2Parts.push(`f/${fNumber}`);
  if (showParams && focalLength) line2Parts.push(`${String(focalLength).replace(/mm$/i, '')}mm`);
  if (showParams && exposureTime) line2Parts.push(`${exposureTime}s`);
  if (showParams && iso) line2Parts.push(`ISO${iso}`);
  const line2Html = line2Parts.join(' ');
  
  // 构建第三行内容（署名，带 © 图标）
  const signatureText = settings.signatureText || '';
  const line3Html = signatureText ? `© ${signatureText}` : '';
  
  // 使用绝对定位（与导出 drawBorderContent 逻辑完全一致）
  const baseFontSize = parseFloat(getComputedStyle(state.borderContent).fontSize) || 14;
  const line1FontSize = baseFontSize;
  const line2FontSize = baseFontSize * (12 / 14);
  const lineHeight1 = line1FontSize;
  const lineHeight2 = line2FontSize;
  const lineGap = baseFontSize * (6 / 14);
  const signatureGap = baseFontSize * (6 / 14);
  
  // 计算 lines-group 高度和居中位置
  const groupHeight = (line1Html ? lineHeight1 : 0) + lineGap + (line2Html ? lineHeight2 : 0);
  const centerY = state.borderContent.clientHeight / 2;
  const line1Top = centerY - groupHeight / 2;
  const line2Top = line1Top + lineHeight1 + lineGap;
  const line3Top = line2Top + lineHeight2 + signatureGap;
  
  // 生成 HTML（绝对定位，与导出完全一致）
  let html = '';
  if (line1Html) {
    html += `<div class="type-f-line type-f-line1" style="top:${line1Top}px">${line1Html}</div>`;
  }
  if (line2Html) {
    html += `<div class="type-f-line type-f-line2" style="top:${line2Top}px">${line2Html}</div>`;
  }
  if (line3Html) {
    html += `<div class="type-f-line type-f-line3" style="top:${line3Top}px">${line3Html}</div>`;
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
    // 移除所有类型类名后再恢复默认
    state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
    state.frameWrapper.style.transform = '';
    state.frameWrapper.style.transformOrigin = '';
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
 * Type F 预览样式配置
 */
export const typeFPreview = {
  id: 'type-f',
  name: 'Type F Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};
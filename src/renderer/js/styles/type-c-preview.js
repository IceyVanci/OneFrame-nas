/**
 * Type C 预览样式模块
 * 负责 DOM 预览相关的功能
 * 当前与 Type A 相同，后续可自定义
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null
};

/**
 * 初始化 Type C 预览
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
 * 计算边框尺寸
 * @param {number} imgWidth - 图片宽度
 * @param {number} imgHeight - 图片高度
 * @param {number} borderPercent - 边框百分比
 * @returns {number} 边框高度（像素）
 */
export function calcBorderSize(imgWidth, imgHeight, borderPercent) {
  const shortSide = Math.min(imgWidth, imgHeight);
  return Math.round(shortSide * (borderPercent / 100));
}

/**
 * 更新 frameWrapper 样式
 * @param {HTMLElement} frameWrapper - frameWrapper 元素
 */
export function updateFrameWrapper(frameWrapper) {
  if (!frameWrapper) return;
  
  // 移除所有类型类名后再添加当前类型
  frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
  frameWrapper.classList.add('type-c');
}

/**
 * 更新 DOM 预览
 * @param {HTMLElement} img - 用户图片元素
 * @param {HTMLElement} photoFooter - 底部边框元素
 * @param {Object} options - 配置选项
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度（像素）
 * @param {HTMLElement} options.borderHeightLabel - 边框高度标签元素
 * @param {string} options.aspectRatio - 比例设置
 */
export function updatePreview(img, photoFooter, options) {
  const { borderColor, borderHeight, borderHeightLabel, aspectRatio } = options;
  
  photoFooter.style.backgroundColor = borderColor;
  photoFooter.style.height = `${borderHeight}px`;
  photoFooter.style.width = '100%';
  
  const isLandscape = img.clientWidth > img.clientHeight;
  const shortSide = Math.min(img.clientWidth, img.clientHeight);
  
  if (!isLandscape) {
    photoFooter.style.width = `${shortSide}px`;
  }
  
  if (borderHeightLabel) {
    borderHeightLabel.textContent = `${borderHeight / shortSide * 100}%`;
  }
  
  // 处理比例设置
  if (aspectRatio === 'original') {
    const offset = Math.round(borderHeight / 4);
    const cropPercent = (borderHeight / 2) / img.clientHeight * 100;
    img.style.clipPath = `inset(${cropPercent}% 0)`;
    img.style.transform = `translateY(${offset}px)`;
    photoFooter.style.transform = `translateY(-${offset}px)`;
  } else {
    img.style.clipPath = 'none';
    img.style.transform = 'none';
    photoFooter.style.transform = 'none';
  }
  
  // 更新 borderContent 位置，使其只在 photoFooter 内显示
  updateBorderContentPosition(photoFooter, img, { aspectRatio });
  
  // 保存图片方向到 state 中，供 updateContentPreview 使用
  state.isPortrait = !isLandscape;
}

/**
 * 更新边框内容位置
 * 让 borderContent 只覆盖 photoFooter 区域
 * @param {HTMLElement} photoFooter - 底部边框元素
 * @param {HTMLElement} img - 用户图片元素
 * @param {Object} options - 配置选项
 * @param {string} options.aspectRatio - 比例设置
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度
 */
function updateBorderContentPosition(photoFooter, img, options = {}) {
  if (!state.borderContent) return;
  
  // 限制边框内容的高度等于 photoFooter 的高度
  state.borderContent.style.height = `${photoFooter.clientHeight}px`;
  
  // 宽度直接使用 photoFooter 的宽度（纵向时已设置为图片宽度，横向时为 100%）
  state.borderContent.style.width = photoFooter.style.width || '100%';
  
  // 纵向图片时，photoFooter 居中，borderContent 需要跟随对齐
  const isLandscape = img.clientWidth > img.clientHeight;
  if (!isLandscape && state.frameWrapper) {
    const frameWidth = state.frameWrapper.clientWidth;
    const photoWidth = photoFooter.clientWidth;
    const left = (frameWidth - photoWidth) / 2;
    state.borderContent.style.left = `${left}px`;
  } else {
    state.borderContent.style.left = '0';
  }
  
  // 跟随 photoFooter 的 transform（用于原始比例模式）
  // 这样文字会与底部边框一起向上移动
  state.borderContent.style.transform = photoFooter.style.transform || 'none';
}

/**
 * 更新边框内容预览（Type C 横向布局）
 * @param {Object} elements - DOM 元素
 * @param {HTMLElement} elements.borderLogo - Logo 容器
 * @param {HTMLElement} elements.borderModel - 机型容器
 * @param {HTMLElement} elements.borderParams - 参数容器
 * @param {HTMLElement} elements.borderFocal - 焦距容器
 * @param {HTMLElement} elements.borderSignature - 署名容器
 * @param {HTMLElement} elements.borderTime - 时间容器
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  const { borderLogo, borderModel, borderParams, borderFocal, borderSignature, borderTime } = elements;
  const { selectedLogo, isLightLogo, showLogo, showModel, customModel, showParams, fNumber, exposureTime, iso, focalLength, showTime, dateTime, signatureText, borderColor } = settings;
  
  const isLight = borderColor === '#ffffff' || borderColor === '#fff';
  const textColor = isLight ? '#000' : '#fff';
  
  // 纵向图片时字体大小减小 30%
  const isPortrait = state.isPortrait;
  const baseFontSize = 12;
  const fontSize = isPortrait ? Math.round(baseFontSize * 0.7) : baseFontSize;
  
  // Logo
  if (selectedLogo && showLogo) {
    const logoPath = `logos/${selectedLogo}.svg`;
    const logoClass = (!isLight && !isLightLogo) ? 'logo-invert' : '';
    
    if (isLight) {
      borderLogo.innerHTML = `<img src="${logoPath}" alt="">`;
    } else {
      borderLogo.innerHTML = `<img src="${logoPath}" alt="" class="${logoClass}">`;
    }
    
    // Logo 形状检测：根据宽高比设置不同的尺寸限制
    const img = borderLogo.querySelector('img');
    if (img) {
      const tempImg = new Image();
      tempImg.onload = () => {
        const ratio = tempImg.width / tempImg.height;
        const SQUARE_THRESHOLD_LOW = 0.8;
        const SQUARE_THRESHOLD_HIGH = 1.2;
        
        if (ratio >= SQUARE_THRESHOLD_LOW && ratio <= SQUARE_THRESHOLD_HIGH) {
          // 正方形 Logo：高度优先 60%
          img.style.maxHeight = '60%';
          img.style.maxWidth = 'none';
        } else {
          // 长方形 Logo：宽度优先 100%
          img.style.maxWidth = '100%';
          img.style.maxHeight = 'none';
        }
      };
      tempImg.src = logoPath;
    }
  } else {
    borderLogo.innerHTML = '';
  }
  
  // 机型
  if (customModel && showModel) {
    borderModel.textContent = customModel;
    borderModel.style.color = textColor;
    borderModel.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
    borderModel.style.fontWeight = '500';
    borderModel.style.fontSize = `${fontSize}px`;
  } else {
    borderModel.textContent = '';
  }
  
  // 参数（包含光圈、快门速度、焦距、ISO）
  if (showParams && (fNumber || exposureTime || focalLength || iso)) {
    const params = [];
    if (fNumber) params.push(`f/${fNumber}`);
    if (exposureTime) params.push(`${exposureTime}s`);
    if (focalLength) {
      const focalVal = String(focalLength).replace(/mm$/i, '').trim();
      if (focalVal) params.push(`${focalVal}mm`);
    }
    if (iso) params.push(`ISO${iso}`);
    borderParams.textContent = params.join(' ');
    borderParams.style.color = textColor;
    borderParams.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
    borderParams.style.fontWeight = 'normal';
    borderParams.style.fontSize = `${fontSize}px`;
  } else {
    borderParams.textContent = '';
  }
  
  // 焦距区域已隐藏（焦距合并到参数中显示）
  borderFocal.textContent = '';
  
  // 署名
  if (signatureText) {
    borderSignature.textContent = signatureText;
    borderSignature.style.color = textColor;
    borderSignature.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
    borderSignature.style.fontWeight = '600';
    borderSignature.style.fontSize = `${fontSize}px`;
  } else {
    borderSignature.textContent = '';
  }
  
  // 时间
  if (dateTime && showTime) {
    const dt = new Date(dateTime);
    borderTime.textContent = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    borderTime.style.color = textColor;
    borderTime.style.fontFamily = "'MiSans', 'Segoe UI', sans-serif";
    borderTime.style.fontWeight = 'normal';
    borderTime.style.fontSize = `${fontSize}px`;
  } else {
    borderTime.textContent = '';
  }
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
    state.img.style.clipPath = '';
    state.img.style.transform = '';
  }
  
  if (state.photoFooter) {
    state.photoFooter.style.position = '';
    state.photoFooter.style.left = '';
    state.photoFooter.style.top = '';
    state.photoFooter.style.width = '';
    state.photoFooter.style.height = '';
    state.photoFooter.style.backgroundColor = '';
    state.photoFooter.style.transform = '';
  }
  
  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
    state.frameWrapper.classList.add('type-c');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }
  
  if (state.borderContent) {
    // 重置动态设置的样式，保留 CSS 定义的 position: absolute
    state.borderContent.style.bottom = '';
    state.borderContent.style.left = '';
    state.borderContent.style.width = '';
    state.borderContent.style.height = '';
    state.borderContent.style.overflow = '';
    state.borderContent.style.transform = '';
    // 重置其他可能设置的样式
    state.borderContent.style.top = '';
    state.borderContent.style.display = '';
    state.borderContent.style.flexDirection = '';
    state.borderContent.style.justifyContent = '';
    state.borderContent.style.alignItems = '';
    state.borderContent.style.gap = '';
    state.borderContent.innerHTML = `
      <div class="border-content-inner">
        <div class="border-left" id="borderLeft">
          <div class="border-left-inner">
            <div class="border-text border-signature" id="borderSignature"></div>
            <div class="border-text" id="borderTime"></div>
          </div>
        </div>
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
      </div>
    `;
    
    // 重置 border-content-inner 样式
    const inner = state.borderContent.querySelector('.border-content-inner');
    if (inner) {
      inner.style.display = '';
      inner.style.flexDirection = '';
    }
  }
}

/**
 * Type C 预览样式配置
 */
export const typeCPreview = {
  id: 'type-c',
  name: 'Type C Preview',
  init,
  calcBorderSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset
};

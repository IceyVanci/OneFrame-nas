/**
 * Type B 预览样式模块
 * 正方形画布，图片居左，右侧白色区域显示内容
 */

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null,
  settings: {},
  squareSize: 0,
  margin: 0
};

/**
 * 初始化 Type B 预览
 * @param {Object} elements - DOM 元素
 * @param {HTMLElement} elements.img - 用户图片元素
 * @param {HTMLElement} elements.frameWrapper - frameWrapper 元素
 * @param {HTMLElement} elements.photoFooter - photoFooter 元素
 * @param {HTMLElement} elements.borderContent - borderContent 元素
 */
export function init(elements) {
  console.log('[TypeB] init called', elements);
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;
  console.log('[TypeB] state after init:', { 
    img: !!state.img, 
    frameWrapper: !!state.frameWrapper, 
    photoFooter: !!state.photoFooter,
    borderContent: !!state.borderContent
  });
}

/**
 * 计算尺寸（包含自适应缩放）
 * @param {Object} settings - 设置
 * @param {number} settings.naturalHeight - 图片原始高度
 * @param {number} settings.naturalWidth - 图片原始宽度
 * @returns {Object} { squareSize, margin, originalSquareSize }
 */
export function calcSize(settings) {
  const { naturalHeight } = settings;
  
  // 原始尺寸（正方形边长 = 高度 × 110%）
  const originalSquareSize = Math.round(naturalHeight * 1.1);
  
  // 获取预览区域可用尺寸
  const previewArea = state.frameWrapper?.parentElement;
  const availWidth = previewArea?.clientWidth || 500;
  const availHeight = previewArea?.clientHeight || 600;
  
  // 计算缩放比例（留 4% 边距）
  const maxSize = Math.min(availWidth, availHeight) * 0.96;
  const scale = maxSize / originalSquareSize;
  
  // 预览使用缩放尺寸
  const squareSize = scale < 1 ? Math.round(originalSquareSize * scale) : originalSquareSize;
  const margin = Math.round(squareSize * 0.025);
  
  return { squareSize, margin, originalSquareSize };
}

/**
 * 设置 frameWrapper 为正方形并居中
 * @param {number} squareSize - 正方形边长
 */
export function updateFrameWrapper(squareSize) {
  if (!state.frameWrapper) return;
  
  // 移除所有类型类名后再添加当前类型
  state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
  state.frameWrapper.classList.add('type-b');
  
  // 设置尺寸
  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${squareSize}px`;
}

/**
 * 更新 DOM 预览
 * 布局说明：
 * - frameWrapper 是正方形容器
 * - 图片使用 object-fit: contain 保持原始比例
 * - 图片靠左，object-position: left center
 * - 图片上下左右各有 2.5% 边距
 * - 右侧区域显示参数和Logo
 * 
 * @param {number} squareSize - 正方形边长
 * @param {number} margin - 边距
 * @param {Object} imgDimensions - 图片原始尺寸 { naturalWidth, naturalHeight }
 * @returns {Object} - 包含 previewImgWidth 等计算结果
 */
export function updatePreview(squareSize, margin, imgDimensions = {}) {
  if (!state.img || !state.photoFooter) return { previewImgWidth: 0 };
  
  const { naturalWidth = 0, naturalHeight = 0 } = imgDimensions;
  
  // 右侧区域预留约 15% 宽度
  const rightAreaPercent = 0.15;
  const leftAreaWidth = squareSize * (1 - rightAreaPercent);
  
  // 可用空间
  const availWidth = leftAreaWidth - margin * 2;
  const availHeight = squareSize - margin * 2;
  
  // 根据图片原始比例计算正确的显示尺寸
  let previewImgWidth, previewImgHeight;
  
  if (naturalHeight > naturalWidth) {
    // 竖向图片：以宽度为准
    previewImgWidth = availWidth;
    previewImgHeight = Math.round(availWidth * (naturalHeight / naturalWidth));
    // 如果高度超出限制，以高度为准
    if (previewImgHeight > availHeight) {
      previewImgHeight = availHeight;
      previewImgWidth = Math.round(availHeight * (naturalWidth / naturalHeight));
    }
  } else {
    // 横向/方形图片：以高度为准
    previewImgHeight = availHeight;
    previewImgWidth = Math.round(availHeight * (naturalWidth / naturalHeight));
    // 如果宽度超出限制，以宽度为准
    if (previewImgWidth > availWidth) {
      previewImgWidth = availWidth;
      previewImgHeight = Math.round(availWidth * (naturalHeight / naturalWidth));
    }
  }
  
  // 右侧区域实际宽度
  const rightAreaWidth = squareSize - leftAreaWidth;
  
  // 设置图片
  state.img.style.position = 'absolute';
  state.img.style.left = `${margin}px`;
  state.img.style.top = `${margin}px`;
  state.img.style.width = `${previewImgWidth}px`;
  state.img.style.height = `${previewImgHeight}px`;
  state.img.style.maxWidth = 'none';
  state.img.style.maxHeight = 'none';
  state.img.style.objectFit = 'contain';
  state.img.style.objectPosition = 'left center';
  state.img.style.clipPath = 'none';
  state.img.style.transform = 'none';
  
  // 设置 photoFooter（白色背景）
  state.photoFooter.style.position = 'absolute';
  state.photoFooter.style.left = `${leftAreaWidth}px`;
  state.photoFooter.style.top = '0';
  state.photoFooter.style.width = `${rightAreaWidth}px`;
  state.photoFooter.style.height = '100%';
  state.photoFooter.style.backgroundColor = '#ffffff';
  state.photoFooter.style.transform = 'none';
  
  // 设置 borderContent（右侧白色区域）
  if (state.borderContent) {
    state.borderContent.style.position = 'absolute';
    state.borderContent.style.left = `${leftAreaWidth}px`;
    state.borderContent.style.top = '0';
    state.borderContent.style.width = `${rightAreaWidth}px`;
    state.borderContent.style.height = '100%';
    state.borderContent.style.zIndex = '10';  // 确保在最上层
  }
  
  // 返回计算结果供 updateContentPreview 使用
  return { previewImgWidth };
}

/**
 * 更新边框内容预览
 * @param {Object} settings - 显示设置
 */
export function updateContentPreview(settings) {
  console.log('[TypeB] updateContentPreview called');
  
  if (!state.borderContent) {
    console.log('[TypeB] borderContent is null!');
    return;
  }
  
  const { 
    selectedLogo, 
    showLogo, 
    showModel, 
    customModel, 
    showParams, 
    fNumber, 
    exposureTime, 
    focalLength, 
    iso, 
    showTime, 
    dateTime, 
    signatureText,
    squareSize,
    margin,
    previewImgWidth
  } = settings;
  
  console.log('[TypeB] settings:', { squareSize, margin, previewImgWidth, dateTime, showTime, focalLength, fNumber, exposureTime, iso, customModel, showModel });
  
  console.log('[TypeB] borderContent before setting:', {
    left: state.borderContent.style.left,
    width: state.borderContent.style.width,
    innerHTML: state.borderContent.innerHTML.substring(0, 100)
  });
  
  // 清除旧的 mainContainer（它在 frameWrapper 中）
  const oldMainContainer = state.frameWrapper?.querySelector('.type-b-main-container');
  if (oldMainContainer) oldMainContainer.remove();
  
  // 清除 borderContent 内容
  state.borderContent.innerHTML = '';
  
  const textColor = '#000000';
  const grayColor = '#888888';
  const fontFamily = "'MiSans Normal', 'MiSans', 'Segoe UI', sans-serif";
  
  // 底部边距（相对于 frameWrapper）
  const bottomMarginPx = squareSize * 0.05;
  
  // 正确的居中计算：文字相对于 frameWrapper
  // 文字区域 = squareSize - margin*2 - previewImgWidth
  // 文字中心位置 = margin + previewImgWidth + 文字区域/2
  const textAreaWidth = squareSize - margin * 2 - previewImgWidth;
  const textCenterOffset = margin + previewImgWidth + textAreaWidth / 2;
  
  // 创建主容器 - 水平居中于文字区域，垂直靠下
  const mainContainer = document.createElement('div');
  mainContainer.className = 'type-b-main-container';
  mainContainer.style.position = 'absolute';
  mainContainer.style.left = `${textCenterOffset}px`;
  mainContainer.style.bottom = `${bottomMarginPx}px`;
  mainContainer.style.transform = 'translateX(-50%)';
  mainContainer.style.display = 'flex';
  mainContainer.style.flexDirection = 'column';
  mainContainer.style.alignItems = 'center';
  mainContainer.style.padding = '8px 4px';
  mainContainer.style.boxSizing = 'border-box';
  mainContainer.style.zIndex = '20';  // 确保在 borderContent 之上
  
  // 创建参数表格容器
  const paramsTable = document.createElement('div');
  paramsTable.className = 'type-b-params-table';
  paramsTable.style.display = 'flex';
  paramsTable.style.flexDirection = 'column';
  paramsTable.style.gap = '9px';
  paramsTable.style.width = '100%';
  
  const leftLabels = [];
  const rightValues = [];
  const rowTypes = [];  // 记录每行的类型，用于判断是否加横线
  
  // ShotAt - 时间（只显示年月日）
  if (dateTime && showTime) {
    const dt = new Date(dateTime);
    const timeStr = `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
    leftLabels.push('ShotAt');
    rightValues.push(timeStr);
    rowTypes.push('shotat');
  }
  
  // Focal - 焦距
  if (focalLength) {
    leftLabels.push('Focal');
    const focalVal = String(focalLength).replace(/mm$/i, '');
    rightValues.push(`${focalVal}mm`);
    rowTypes.push('focal');
  }
  
  // Aperture - 光圈
  if (fNumber) {
    leftLabels.push('Aperture');
    rightValues.push(`f/${fNumber}`);
    rowTypes.push('aperture');
  }
  
  // Shutter - 快门
  if (exposureTime) {
    leftLabels.push('Shutter');
    rightValues.push(`${exposureTime}s`);
    rowTypes.push('shutter');
  }
  
  // ISO
  if (iso) {
    leftLabels.push('ISO');
    rightValues.push(String(iso));
    rowTypes.push('iso');
  }
  
  // ShotOn - 机型
  if (customModel && showModel) {
    leftLabels.push('ShotOn');
    rightValues.push(customModel);
    rowTypes.push('shoton');
  }
  
  // PhotoBy - 署名（仅在有值时显示，否则保留空位但跳过渲染）
  const showShotOn = !!signatureText;
  leftLabels.push('PhotoBy');
  rightValues.push(signatureText || '');
  rowTypes.push('photoby');
  
  // 计算最长文本宽度（用于横线）
  const maxLabelWidth = 75;
  const maxValueWidth = 75;
  const gap = 8;
  const dividerWidth = maxLabelWidth + maxValueWidth + gap;
  
  // 创建横线的函数
  const createDivider = () => {
    const divider = document.createElement('div');
    divider.className = 'type-b-divider';
    divider.style.width = `${dividerWidth}px`;
    divider.style.height = '1px';
    divider.style.backgroundColor = grayColor;
    return divider;
  };
  
  // 添加参数行
  for (let i = 0; i < leftLabels.length; i++) {
    const label = leftLabels[i];
    const value = rightValues[i];
    const rowType = rowTypes[i];
    
    // 跳过 PhotoBy 为空的情况
    if (rowType === 'photoby' && !value) continue;
    
    const row = document.createElement('div');
    row.className = 'type-b-params-row';
    row.style.display = 'flex';
    row.style.justifyContent = 'center';
    row.style.gap = '8px';
    
    const leftCell = document.createElement('div');
    leftCell.className = 'type-b-param-label';
    leftCell.textContent = label;
    leftCell.style.color = grayColor;
    leftCell.style.fontFamily = fontFamily;
    leftCell.style.fontSize = '12px';
    leftCell.style.textAlign = 'right';
    leftCell.style.width = '75px';
    leftCell.style.flexShrink = '0';
    
    const rightCell = document.createElement('div');
    rightCell.className = 'type-b-param-value';
    rightCell.textContent = value;
    rightCell.style.color = textColor;
    rightCell.style.fontFamily = fontFamily;
    rightCell.style.fontSize = '12px';
    rightCell.style.textAlign = 'left';
    rightCell.style.width = '75px';
    rightCell.style.flexShrink = '0';
    
    row.appendChild(leftCell);
    row.appendChild(rightCell);
    paramsTable.appendChild(row);
    
    // 在 ShotAt 和 ISO 行后添加横线
    if (rowType === 'shotat' || rowType === 'iso') {
      paramsTable.appendChild(createDivider());
    }
  }
  
  // Logo 容器（上方添加3倍行距 = 18px）
  const logoContainer = document.createElement('div');
  logoContainer.className = 'type-b-logo-container';
  logoContainer.style.marginTop = '36px';
  logoContainer.style.display = 'flex';
  logoContainer.style.justifyContent = 'center';
  logoContainer.style.alignItems = 'center';
  
  if (selectedLogo && showLogo) {
    const logoImg = document.createElement('img');
    logoImg.src = `logos/${selectedLogo}.svg`;
    logoImg.alt = selectedLogo;
    logoImg.style.maxWidth = '90%';
    logoImg.style.objectFit = 'contain';
    logoContainer.appendChild(logoImg);
    
    // 自动判断是否为方形 logo，方形则放大显示
    logoImg.onload = () => {
      const ratio = logoImg.naturalWidth / logoImg.naturalHeight;
      if (ratio >= 0.8 && ratio <= 1.2) {
        // 方形 logo，放大显示
        logoImg.style.maxHeight = '40px';
      } else {
        // 非方形 logo，正常大小
        logoImg.style.maxHeight = '20px';
      }
    };
  }
  
  mainContainer.appendChild(paramsTable);
  mainContainer.appendChild(logoContainer);
  
  // 将 mainContainer 添加到 frameWrapper（而非 borderContent），因为坐标相对于 frameWrapper
  if (state.frameWrapper) {
    state.frameWrapper.appendChild(mainContainer);
  }
}

/**
 * 更新预览（完整流程）
 * @param {Object} imgSettings - 图片相关设置
 * @param {number} imgSettings.naturalHeight - 图片原始高度
 * @param {number} imgSettings.naturalWidth - 图片原始宽度
 * @param {Object} displaySettings - 显示设置
 */
export function update(imgSettings, displaySettings) {
  console.log('[TypeB] update called', { imgSettings, displaySettings });
  const { squareSize, margin } = calcSize(imgSettings);
  console.log('[TypeB] calcSize result:', { squareSize, margin });
  
  // 更新容器
  updateFrameWrapper(squareSize);
  console.log('[TypeB] frameWrapper classList:', state.frameWrapper?.classList.toString());
  console.log('[TypeB] frameWrapper style:', {
    width: state.frameWrapper?.style.width,
    height: state.frameWrapper?.style.height
  });
  
  // 更新图片预览（传入图片原始尺寸）
  const { previewImgWidth } = updatePreview(squareSize, margin, {
    naturalWidth: imgSettings.naturalWidth,
    naturalHeight: imgSettings.naturalHeight
  });
  
  // 更新内容预览（传入 previewImgWidth 用于居中计算）
  updateContentPreview({ ...displaySettings, squareSize, margin, previewImgWidth });
  
  console.log('[TypeB] update complete, borderContent innerHTML length:', state.borderContent?.innerHTML.length);
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
    state.photoFooter.style.position = '';
    state.photoFooter.style.left = '';
    state.photoFooter.style.top = '';
    state.photoFooter.style.width = '';
    state.photoFooter.style.height = '';
    state.photoFooter.style.backgroundColor = '';
    state.photoFooter.style.transform = '';
  }
  
  if (state.frameWrapper) {
    // 移除 Type B 的 mainContainer
    const mainContainer = state.frameWrapper.querySelector('.type-b-main-container');
    if (mainContainer) mainContainer.remove();
    
    // 恢复 Type A 类名（移除所有类型类名）
    state.frameWrapper.classList.remove('type-a', 'type-b', 'type-c', 'type-d', 'type-e');
    state.frameWrapper.classList.add('type-a');
    // 清除内联样式
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }
  
  if (state.borderContent) {
    state.borderContent.style.position = '';
    state.borderContent.style.left = '';
    state.borderContent.style.top = '';
    state.borderContent.style.width = '';
    state.borderContent.style.height = '';
    state.borderContent.style.zIndex = '';
    state.borderContent.innerHTML = '';
  }
  
  // 重置状态
  state = {
    img: null,
    frameWrapper: null,
    photoFooter: null,
    borderContent: null,
    settings: {},
    squareSize: 0,
    margin: 0
  };
}

/**
 * Type B 预览样式配置
 */
export const typeBPreview = {
  id: 'type-b',
  name: 'Type B Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  update,
  reset
};

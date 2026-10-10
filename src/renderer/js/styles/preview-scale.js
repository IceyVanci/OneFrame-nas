/**
 * 预览画布统一缩放模块
 * P1：Type A 试点接入；后续批次（C/D → B/E → F–T）逐步迁移到同一套适配逻辑。
 */

/**
 * 计算预览区可用尺寸（通用模式：可用区 × margin）
 * @param {HTMLElement} previewArea - 预览区元素
 * @param {number} margin - 边距系数（默认 0.96）
 * @returns {{availWidth: number, availHeight: number}}
 */
export function getPreviewAvail(previewArea, margin = 0.96) {
  return {
    availWidth: (previewArea?.clientWidth || 500) * margin,
    availHeight: (previewArea?.clientHeight || 600) * margin
  };
}

/**
 * 将设计画布等比缩放适配到预览区
 * @param {number} canvasWidth - 设计画布宽
 * @param {number} canvasHeight - 设计画布高
 * @param {HTMLElement} previewArea - 预览区元素
 * @param {Object} [options] - 配置
 * @param {number} [options.margin=0.96] - 通用模式的边距系数
 * @param {{availWidth: number, availHeight: number}} [options.avail] - 直接指定可用尺寸（legacy-css 模式使用）
 * @returns {{width: number, height: number, scale: number}} 取整后的显示尺寸与缩放比
 */
export function fitCanvasToPreview(canvasWidth, canvasHeight, previewArea, options = {}) {
  const { margin = 0.96, avail } = options;
  const box = avail || getPreviewAvail(previewArea, margin);
  const scale = Math.min(box.availWidth / canvasWidth, box.availHeight / canvasHeight, 1);
  return {
    width: Math.round(canvasWidth * scale),
    height: Math.round(canvasHeight * scale),
    scale
  };
}

// ===== [LEGACY A P1] computeLegacyCssAvail：legacy-css 适配复刻（已废弃，改填满式；保留用于回滚，U3 统一清理） =====
/*
复刻 A-D 旧 CSS 机制下的可用显示尺寸（P1 初版用于 Type A）
约束来源：
- preview-area 的 padding（桌面 40/120、移动 12/12/80/12，含 .is-mobile 与粗指针媒体查询）
- frame-wrapper 的 max-width（A/C/D 均为 900px）
- img 的 max-height（桌面 80vh、移动 calc(100vh - 160px)，读取 computed style 自动覆盖各断点）
参数：previewArea 预览区元素；frameWrapper 元素
返回：{ availWidth, availHeight }
export function computeLegacyCssAvail(previewArea, frameWrapper) {
  if (!previewArea) return { availWidth: 500, availHeight: 600 };
  const areaCs = getComputedStyle(previewArea);
  const padL = parseFloat(areaCs.paddingLeft) || 0;
  const padR = parseFloat(areaCs.paddingRight) || 0;
  const padT = parseFloat(areaCs.paddingTop) || 0;
  const padB = parseFloat(areaCs.paddingBottom) || 0;
  const contentW = previewArea.clientWidth - padL - padR;
  const contentH = previewArea.clientHeight - padT - padB;

  let availWidth = contentW;
  let availHeight = contentH;
  if (frameWrapper) {
    const maxW = parseFloat(getComputedStyle(frameWrapper).maxWidth);
    if (Number.isFinite(maxW)) availWidth = Math.min(availWidth, maxW);
    const img = frameWrapper.querySelector('img');
    if (img) {
      const maxH = parseFloat(getComputedStyle(img).maxHeight);
      if (Number.isFinite(maxH)) availHeight = maxH;
    }
  }
  return { availWidth, availHeight };
}
*/
// ===== [LEGACY END] =====

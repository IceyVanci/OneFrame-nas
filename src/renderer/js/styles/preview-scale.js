/**
 * 预览画布统一缩放模块
 * 20 种样式的设计画布统一按预览区 96% 等比适配（scale ≤ 1，小图不上采样）。
 */

/**
 * 计算预览区可用尺寸（可用区 × margin）
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
 * @param {number} [options.margin=0.96] - 边距系数
 * @returns {{width: number, height: number, scale: number}} 取整后的显示尺寸与缩放比
 */
export function fitCanvasToPreview(canvasWidth, canvasHeight, previewArea, options = {}) {
  const { margin = 0.96 } = options;
  const box = getPreviewAvail(previewArea, margin);
  const scale = Math.min(box.availWidth / canvasWidth, box.availHeight / canvasHeight, 1);
  return {
    width: Math.round(canvasWidth * scale),
    height: Math.round(canvasHeight * scale),
    scale
  };
}


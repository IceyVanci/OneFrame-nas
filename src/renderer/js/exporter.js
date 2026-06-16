/**
 * 图片导出模块
 * 支持保留 EXIF 信息的高质量 JPG 输出
 */

import { readExifFromFile, embedExif, dumpExif, hasExifData } from './exif-exporter.js';
import { typeAExport } from './styles/type-a-export.js';
import { typeBExport } from './styles/type-b-export.js';
import { typeCExport } from './styles/type-c-export.js';
import { typeDExport } from './styles/type-d-export.js';
import { typeEExport } from './styles/type-e-export.js';

// 导出样式映射
const exportStyles = {
  'type-a': typeAExport,
  'type-b': typeBExport,
  'type-c': typeCExport,
  'type-d': typeDExport,
  'type-e': typeEExport
};

/**
 * 获取导出渲染函数
 * @param {string} styleId - 样式 ID
 * @returns {Function} 渲染函数
 */
function getExportRenderer(styleId) {
  return exportStyles[styleId]?.renderImage || typeAExport.renderImage;
}

/**
 * 将 DataURL 转换为 Blob
 * @param {string} dataUrl - DataURL 字符串
 * @returns {Blob}
 */
function dataURLtoBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return new Blob([], { type: 'image/jpeg' });
  }
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    return new Blob([], { type: 'image/jpeg' });
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 创建带边框的图片并导出
 * @param {HTMLImageElement} img - 原始图片元素
 * @param {Object} options - 导出选项
 * @param {File} options.file - 原始图片文件（用于读取 EXIF）
 * @param {string|null} options.imagePath - 图片路径（当前未使用，保留接口兼容性）
 * @param {string} options.borderColor - 边框颜色
 * @param {number} options.borderHeight - 边框高度(px)
 * @param {number} options.quality - JPG 质量 (0-1)
 * @param {Object} options.settings - 导出设置
 * @returns {Promise<Blob>} 导出的图片 Blob
 */
export async function exportImage(img, options) {
  const {
    file = null,
    imagePath = null,
    borderColor = '#ffffff',
    borderHeight = 100,
    quality = 1.0,
    settings = {}
  } = options;

  // 确保图片已加载
  if (!img.complete || img.naturalWidth === 0) {
    throw new Error('图片尚未加载完成');
  }

  // 获取当前样式的渲染函数
  const renderImage = getExportRenderer(settings?.styleId || 'type-a');

  // 调用样式模块的渲染函数获取 DataURL
  const dataUrl = await renderImage(img, {
    borderColor,
    borderHeight,
    quality,
    settings,
    imageOffset: options.imageOffset || { x: 0, y: 0 },
    previewSquareSize: options.previewSquareSize || 0
  });

  // 从原图文件读取 EXIF
  let exifObj = null;
  if (file) {
    // 浏览器环境
    try {
      exifObj = await readExifFromFile(file);
    } catch (err) {
      console.error('从文件读取 EXIF 失败:', err);
    }
  }
  
  if (exifObj && hasExifData(exifObj)) {
    try {
      // 调试：确认 dataUrl 格式
      console.log('dataUrl 前 50 字符:', dataUrl.substring(0, 50));
      console.log('dataUrl 长度:', dataUrl.length);
      const newDataUrl = embedExif(dataUrl, exifObj);
      return dataURLtoBlob(newDataUrl);
    } catch (err) {
      console.error('EXIF 处理失败:', err);
    }
  }
  
  return dataURLtoBlob(dataUrl);
}


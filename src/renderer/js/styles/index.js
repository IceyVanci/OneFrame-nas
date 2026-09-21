/**
 * 样式模块统一导出
 * 
 * 模块职责：
 * - 样式注册表：管理所有边框样式的预览和导出模块
 * - 工厂函数：提供获取样式模块的统一接口
 * 
 * 注意：EXIF 处理是独立的双轨机制，不要在此模块中引入
 * - 显示用 EXIF：exif.js (exifreader)
 * - 导出用 EXIF：exif-exporter.js (piexifjs)
 */

import { typeAPreview } from './type-A-preview.js';
import { typeAExport } from './type-A-export.js';
import { typeBPreview } from './type-B-preview.js';
import { typeBExport } from './type-B-export.js';
import { typeCPreview } from './type-C-preview.js';
import { typeCExport } from './type-C-export.js';
import { typeDPreview } from './type-D-preview.js';
import { typeDExport } from './type-D-export.js';
import { typeEPreview } from './type-E-preview.js';
import { typeEExport } from './type-E-export.js';
import { typeFPreview } from './type-F-preview.js';
import { typeFExport } from './type-F-export.js';
import { typeGPreview } from './type-G-preview.js';
import { typeGExport } from './type-G-export.js';
import { typeHPreview } from './type-H-preview.js';
import { typeHExport } from './type-H-export.js';
import { typeIPreview } from './type-I-preview.js';
import { typeIExport } from './type-I-export.js';
import { typeJPreview } from './type-J-preview.js';
import { typeJExport } from './type-J-export.js';
import { typeKPreview } from './type-K-preview.js';
import { typeKExport } from './type-K-export.js';
import { typeLPreview } from './type-L-preview.js';
import { typeLExport } from './type-L-export.js';
import { typeMPreview } from './type-M-preview.js';
import { typeMExport } from './type-M-export.js';
import { typeNPreview } from './type-N-preview.js';
import { typeNExport } from './type-N-export.js';
import { typeOPreview } from './type-O-preview.js';
import { typeOExport } from './type-O-export.js';
import { typePPreview } from './type-P-preview.js';
import { typePExport } from './type-P-export.js';
import { typeQPreview } from './type-Q-preview.js';
import { typeQExport } from './type-Q-export.js';
import { typeRPreview } from './type-R-preview.js';
import { typeRExport } from './type-R-export.js';
import { typeSPreview } from './type-S-preview.js';
import { typeSExport } from './type-S-export.js';
import { typeTPreview } from './type-T-preview.js';
import { typeTExport } from './type-T-export.js';

/**
 * @typedef {Object} StyleModule
 * @property {Object} preview - 预览模块
 * @property {Object} export - 导出模块
 */

/** 统一样式注册表 */
export const styles = {
  'type-a': {
    preview: typeAPreview,
    export: typeAExport
  },
  'type-b': {
    preview: typeBPreview,
    export: typeBExport
  },
  'type-c': {
    preview: typeCPreview,
    export: typeCExport
  },
  'type-d': {
    preview: typeDPreview,
    export: typeDExport
  },
  'type-e': {
    preview: typeEPreview,
    export: typeEExport
  },
  'type-f': {
    preview: typeFPreview,
    export: typeFExport
  },
  'type-g': {
    preview: typeGPreview,
    export: typeGExport
  },
  'type-h': {
    preview: typeHPreview,
    export: typeHExport
  },
  'type-i': {
    preview: typeIPreview,
    export: typeIExport
  },
  'type-j': {
    preview: typeJPreview,
    export: typeJExport
  },
  'type-k': {
    preview: typeKPreview,
    export: typeKExport
  },
  'type-l': {
    preview: typeLPreview,
    export: typeLExport
  },
  'type-m': {
    preview: typeMPreview,
    export: typeMExport
  },
  'type-n': {
    preview: typeNPreview,
    export: typeNExport
  },
  'type-o': {
    preview: typeOPreview,
    export: typeOExport
  },
  'type-p': {
    preview: typePPreview,
    export: typePExport
  },
  'type-q': {
    preview: typeQPreview,
    export: typeQExport
  },
  'type-r': {
    preview: typeRPreview,
    export: typeRExport
  },
  'type-s': {
    preview: typeSPreview,
    export: typeSExport
  },
  'type-t': {
    preview: typeTPreview,
    export: typeTExport
  }
};
/**
 * 获取样式预览模块
 * @param {string} styleId - 样式 ID (如 'type-a', 'type-b')
 * @returns {Object} 预览模块
 */
export function getPreview(styleId) {
  return styles[styleId]?.preview || styles['type-a'].preview;
}

/**
 * 获取样式导出模块
 * @param {string} styleId - 样式 ID
 * @returns {Object} 导出模块
 */
export function getExport(styleId) {
  return styles[styleId]?.export || styles['type-a'].export;
}

// 重新导出 app.js 直接使用的 Preview 模块
export { typeBPreview } from './type-B-preview.js';
export { typeEPreview } from './type-E-preview.js';
export { typeRPreview } from './type-R-preview.js';
export { typeSPreview } from './type-S-preview.js';
export { typeTPreview } from './type-T-preview.js';

/**
 * 相机厂商 Logo 工具
 * 
 * 同步自 copicseal-copy 项目：
 * - *.svg 作为图片 URL (<img src="...">)
 * - *.auto.svg 作为原始 SVG 字符串（可动态修改颜色）
 */

// 厂商列表
export const logoList = [
  'Apple', 'Canon', 'DJI', 'Fujifilm', 'Google', 'GoPro', 'Hasselblad',
  'Huawei', 'Insta360', 'Leica', 'Lumix', 'Nikon', 'Nokia', 'Olympus',
  'Oneplus', 'OPPO', 'Pentax', 'Ricoh', 'Samsung', 'Sigma', 'Sony', 'Vivo', 'Xiaomi', 'xuzhou'
];

// 简化版 Logo SVG（备用）
export const logoSvgMap = {
  Sony: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">SONY</text></svg>`,
  Canon: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Canon</text></svg>`,
  Nikon: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">NIKON</text></svg>`,
  Fujifilm: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14" font-weight="bold">FUJIFILM</text></svg>`,
  Apple: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Apple</text></svg>`,
  Huawei: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">HUAWEI</text></svg>`,
  Xiaomi: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Xiaomi</text></svg>`,
  DJI: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">DJI</text></svg>`,
  GoPro: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">GoPro</text></svg>`,
  Insta360: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14" font-weight="bold">Insta360</text></svg>`,
  Google: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Google</text></svg>`,
  Oneplus: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">OnePlus</text></svg>`,
  OPPO: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">OPPO</text></svg>`,
  Vivo: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Vivo</text></svg>`,
  Samsung: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Samsung</text></svg>`,
  Leica: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Leica</text></svg>`,
  Hasselblad: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14" font-weight="bold">Hasselblad</text></svg>`,
  Olympus: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Olympus</text></svg>`,
  Lumix: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Lumix</text></svg>`,
  Pentax: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Pentax</text></svg>`,
  Ricoh: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Ricoh</text></svg>`,
  Sigma: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Sigma</text></svg>`,
  Nokia: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="16" font-weight="bold">Nokia</text></svg>`,
  xuzhou: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14" font-weight="bold">xuzhou</text></svg>`,
  default: `<svg viewBox="0 0 100 30" fill="currentColor"><text x="5" y="22" font-size="14">Camera</text></svg>`
};

// 厂商名称映射
const makeNameMap = {
  SONY: 'Sony',
  Leica: 'Leica',
  OM: 'Olympus',
  NIKON: 'Nikon',
  Panasonic: 'Lumix',
  PENTAX: 'Pentax',
  RICOH: 'Ricoh',
  OnePlus: 'Oneplus',
  XIAOMI: 'Xiaomi',
  HUAWEI: 'Huawei',
};

/**
 * 标准化厂商名称
 * @param {string} make - 原始厂商名称
 * @returns {string}
 */
export function getMakeName(make) {
  if (!make) return '';
  make = make.trim();
  if (makeNameMap[make]) return makeNameMap[make];
  const matchKey = Object.keys(makeNameMap).find((key) => 
    new RegExp(`\\b${key}\\b`, 'i').test(make)
  );
  if (matchKey) return makeNameMap[matchKey];
  return make;
}

/**
 * 获取所有可用的 logo 列表
 * @returns {string[]}
 */
export function getAllLogos() {
  return logoList;
}

/**
 * 获取 Logo 文件名（用于 URL）
 * @param {string} make - 厂商名称
 * @returns {string}
 */
export function getLogoFilename(make) {
  if (!make) return '';
  const normalized = getMakeName(make);
  return `${normalized}.svg`;
}

/**
 * 获取 Logo 文件名（用于 SVG 字符串）
 * @param {string} make - 厂商名称
 * @returns {string}
 */
export function getAutoLogoFilename(make) {
  if (!make) return '';
  const normalized = getMakeName(make);
  return `${normalized}.auto.svg`;
}

/**
 * 获取 Logo URL 路径（用于 <img src="">）
 * @param {string} make - 厂商名称
 * @returns {string}
 */
export function getMakeLogoPath(make) {
  if (!make) return undefined;
  const normalizedMake = getMakeName(make);
  return `/logos/${normalizedMake}.svg`;
}

/**
 * 获取 Logo SVG（作为图片 URL）
 * @param {Object|string} exif - EXIF数据或Make值
 * @returns {string|undefined} Logo URL
 */
export function getMakeLogo(exif) {
  let make = '';
  if (typeof exif === 'string') {
    make = getMakeName(exif);
  } else if (exif) {
    make = getMakeName(exif?.Model) || getMakeName(exif?.Make);
  }
  return getMakeLogoPath(make);
}

/**
 * 获取 Logo SVG 字符串（用于动态修改颜色）
 * @param {Object|string} exif - EXIF数据或Make值
 * @returns {string} Logo SVG 内容
 */
export function getMakeLogoSvg(exif) {
  let make = '';
  
  if (typeof exif === 'string') {
    make = exif;
  } else if (exif) {
    make = getMakeName(exif?.Model) || getMakeName(exif?.Make);
  }
  
  const normalizedMake = make.toUpperCase();
  
  if (logoSvgMap[make]) return logoSvgMap[make];
  
  for (const key in logoSvgMap) {
    if (key.toUpperCase() === normalizedMake) {
      return logoSvgMap[key];
    }
  }
  
  return logoSvgMap.default;
}

/**
 * 格式化相机型号名称
 * @param {string} model - 原始型号
 * @returns {string}
 */
export function getModelName(model) {
  if (!model) return '';
  
  let result = model
    .replace(/CORPORATION/gi, '')
    .replace(/Camera AG/gi, '')
    .replace(/Digital Solutions/gi, '')
    .replace(/Digital Camera/gi, '')
    .trim();
  
  return result;
}

/**
 * 替换文本中的变量占位符
 * @param {string} text - 包含 {Key} 格式占位符的文本
 * @param {Object} info - EXIF 数据对象
 * @returns {string}
 */
export function replaceTextVars(text, info) {
  if (!text || !info) return '';
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = info[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match;
  });
}

/**
 * EXIF 读取工具
 * 使用 exifreader 库（通过 index.html 中 <script> 标签全局加载）
 */

// 支持的厂商列表
export const SUPPORTED_MAKES = [
  'Apple',
  'Canon',
  'DJI',
  'Fujifilm',
  'Google',
  'GoPro',
  'Hasselblad',
  'Huawei',
  'Insta360',
  'Leica',
  'Lumix',
  'Nikon',
  'Nokia',
  'Olympus',
  'OnePlus',
  'OPPO',
  'Pentax',
  'Ricoh',
  'Samsung',
  'Sigma',
  'Sony',
  'Vivo',
  'Xiaomi',
  'xuzhou'
];

/** @type {string[]} */
export const exifPrimaryKeys = [
  'ImageWidth',
  'ImageHeight',
  'Make',
  'Model',
  'Software',
  'DateTimeOriginal',
  'LensModel',
  'FocalLength',
  'FNumber',
  'ExposureTime',
  'ExposureBiasValue',
  'ExposureMode',
  'WhiteBalance',
  'MeteringMode',
  'ISOSpeedRatings',
];

/** @type {{name: string, key: string}[]} */
export const primaryExif = [
  { name: '相机厂商', key: 'Make' },
  { name: '相机型号', key: 'Model' },
  { name: '软件', key: 'Software' },
  { name: '拍摄日期', key: 'DateTimeOriginal' },
  { name: '镜头型号', key: 'LensModel' },
  { name: '焦距', key: 'FocalLength' },
  { name: '光圈', key: 'FNumber' },
  { name: '快门', key: 'ExposureTime' },
  { name: '曝光补偿', key: 'ExposureBiasValue' },
  { name: '曝光模式', key: 'ExposureMode' },
  { name: '白平衡', key: 'WhiteBalance' },
  { name: '测光模式', key: 'MeteringMode' },
  { name: '感光度', key: 'ISOSpeedRatings' },
];

/**
 * 标准化厂商名称
 * @param {string} make - 原始厂商名称
 * @returns {string} 标准化后的名称
 */
export function getMakeName(make) {
  if (!make) return '';

  make = make.trim();

  const makeMap = {
    SONY: 'Sony',
    Leica: 'Leica',
    OM: 'Olympus',
    NIKON: 'Nikon',
    Panasonic: 'Lumix',
    PENTAX: 'Pentax',
    RICOH: 'Ricoh',
  };

  if (makeMap[make]) return makeMap[make];

  const matchKey = Object.keys(makeMap).find((key) => {
    return new RegExp(`\\b${key}\\b`, 'i').test(make);
  });
  if (matchKey) return makeMap[matchKey];

  return make;
}

/**
 * 获取 EXIF 字段的中文名称
 * @param {string} key
 * @returns {string}
 */
export function getExifName(key) {
  const item = primaryExif.find(item => item.key === key);
  return item ? item.name : key;
}

/**
 * 格式化 EXIF 值
 * @param {any} val
 * @returns {string|number|undefined}
 */
function formatValue(val) {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val;
  if (val && typeof val === 'object') {
    if (typeof val.value === 'number') return val.value;
    if (val.description) return val.description;
  }
  return undefined;
}

/**
 * 格式化日期时间
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  // ExifReader 返回格式: "YYYY:MM:DD HH:mm:ss"
  const parts = dateStr.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    return `${parts[1]}-${parts[2]}-${parts[3]} ${parts[4]}:${parts[5]}:${parts[6]}`;
  }
  return dateStr;
}

/**
 * 获取焦距（优先等效焦距）
 * @param {Object} exif - EXIF 数据
 * @returns {string|null}
 */
export function getFocalLength(exif) {
  let focal;
  // 优先使用等效焦距
  if (exif['FocalLengthIn35mmFilm']) {
    focal = exif.FocalLengthIn35mmFilm;
  } else if (exif.FocalLength) {
    // 回退到物理焦距
    focal = exif.FocalLength;
  }
  if (!focal) return null;
  // 统一确保带 mm 后缀（FocalLengthIn35mmFilm 可能返回纯数字）
  const str = String(focal).trim();
  return str.endsWith('mm') ? str : `${str}mm`;
}

/**
 * 特殊字段格式化
 */
const exifKeyFormatter = {
  'Image Width': (exif) => {
    const val = +(exif['Image Width']?.value || 0);
    if (exif.Orientation?.value && +exif.Orientation.value > 4) {
      return { ImageHeight: val };
    }
    return { ImageWidth: val };
  },
  'Image Height': (exif) => {
    const val = +(exif['Image Height']?.value || 0);
    if (exif.Orientation?.value && +exif.Orientation.value > 4) {
      return { ImageWidth: val };
    }
    return { ImageHeight: val };
  },
  'PixelXDimension': (exif) => {
    const val = +(exif['Image Width']?.value || exif.PixelXDimension?.value || 0);
    if (exif.Orientation?.value && +exif.Orientation.value > 4) {
      return { ImageHeight: val };
    }
    return { ImageWidth: val };
  },
  'PixelYDimension': (exif) => {
    const val = +(exif['Image Height']?.value || exif.PixelYDimension?.value || 0);
    if (exif.Orientation?.value && +exif.Orientation.value > 4) {
      return { ImageWidth: val };
    }
    return { ImageHeight: val };
  },
  'FocalLength': (exif) => {
    return { FocalLength: exif.FocalLength?.description?.replace(' ', '') };
  },
  'DateTimeOriginal': (exif) => {
    return { DateTimeOriginal: formatDateTime(exif.DateTimeOriginal?.description) };
  },
};

/**
 * 从图片文件读取 EXIF 数据
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function getExif(file) {
  try {
    const ExifReaderModule = typeof window !== 'undefined' ? window.ExifReader : null;
    if (!ExifReaderModule) {
      console.warn('ExifReader not available');
      return {};
    }
    const tags = await ExifReaderModule.load(file);
    const result = {};

    // 遍历所有原始字段
    for (const key in tags) {
      const val = formatValue(tags[key]);
      if (val !== undefined) {
        result[key] = val;
      }
    }

    // 处理特殊字段
    for (const key in tags) {
      if (exifKeyFormatter[key]) {
        Object.assign(result, exifKeyFormatter[key](tags));
      }
    }

    console.log('EXIF loaded:', result);
    return result;
  } catch (e) {
    console.error('Failed to load EXIF:', e);
    return {};
  }
}

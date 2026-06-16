/**
 * EXIF Handler - EXIF 信息处理模块
 * 参照 colorphoto 项目实现，用于读取和保存 JPG 图片的 EXIF 信息
 */

class ExifHandler {
  constructor() {
    this.exifData = null;
  }

  /**
   * 从数据 URL 提取 EXIF 信息
   * @param {string} dataUrl - 图片的 data URL
   * @returns {Object|null} EXIF 对象
   */
  async extractFromDataUrl(dataUrl) {
    try {
      if (typeof piexif === 'undefined') {
        console.warn('piexifjs not loaded');
        return null;
      }
      
      const exifObj = piexif.load(dataUrl);
      this.exifData = exifObj;
      return exifObj;
    } catch (error) {
      console.error('Error extracting EXIF:', error);
      return null;
    }
  }

  /**
   * 将 EXIF 信息嵌入到图片
   * @param {string} dataUrl - 原始图片 data URL
   * @param {Object} exifObj - EXIF 对象
   * @returns {string} 带有 EXIF 的新 data URL
   */
  embedExif(dataUrl, exifObj) {
    try {
      if (typeof piexif === 'undefined') {
        console.warn('piexifjs not loaded');
        return dataUrl;
      }

      const exifBytes = piexif.dump(exifObj);
      const newDataUrl = piexif.insert(exifBytes, dataUrl);
      return newDataUrl;
    } catch (error) {
      console.error('Error embedding EXIF:', error);
      return dataUrl;
    }
  }

  /**
   * 清除 EXIF 信息
   * @param {string} dataUrl - 图片 data URL
   * @returns {string} 没有 EXIF 的 data URL
   */
  removeExif(dataUrl) {
    try {
      if (typeof piexif === 'undefined') {
        return dataUrl;
      }

      const newDataUrl = piexif.remove(dataUrl);
      return newDataUrl;
    } catch (error) {
      console.error('Error removing EXIF:', error);
      return dataUrl;
    }
  }

  /**
   * 获取保存的 EXIF 数据
   */
  getExifData() {
    return this.exifData;
  }

  /**
   * 设置 EXIF 数据
   */
  setExifData(exifObj) {
    this.exifData = exifObj;
  }
}

// 导出单例供 exporter.js 使用
const exifHandler = new ExifHandler();

export { ExifHandler, exifHandler };

/**
 * 从原图文件读取 EXIF 数据（使用 piexif）
 * @param {File} file - 原始图片文件
 * @returns {Promise<Object|null>} piexif 格式的 EXIF 对象
 */
export async function readExifFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const exifObj = await exifHandler.extractFromDataUrl(e.target.result);
        resolve(exifObj);
      } catch (err) {
        console.error('读取 EXIF 失败:', err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * 将 EXIF 嵌入到图片 DataURL（兼容函数）
 * @param {string} dataUrl - 图片 DataURL
 * @param {Object} exifObj - EXIF 对象
 * @returns {string} 带有 EXIF 的新 DataURL
 */
export function embedExif(dataUrl, exifObj) {
  return exifHandler.embedExif(dataUrl, exifObj);
}

/**
 * 检查 EXIF 对象是否包含有效数据
 * @param {Object} exifObj - piexif 格式的 EXIF 对象
 * @returns {boolean}
 */
export function hasExifData(exifObj) {
  if (!exifObj) return false;
  
  const sections = ['0th', 'Exif', 'GPS', '1st'];
  for (const section of sections) {
    if (exifObj[section] && Object.keys(exifObj[section]).length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * 将 EXIF 对象转换为 piexif.dump 格式
 * @param {Object} exifObj - piexif 格式的 EXIF 对象
 * @returns {string} piexif.dump() 格式的字节数组
 */
export function dumpExif(exifObj) {
  if (typeof piexif === 'undefined') {
    console.warn('piexifjs not loaded');
    return null;
  }
  try {
    return piexif.dump(exifObj);
  } catch (err) {
    console.error('转换 EXIF 失败:', err);
    return null;
  }
}

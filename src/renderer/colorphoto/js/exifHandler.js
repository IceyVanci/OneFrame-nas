/**
 * EXIF Handler - EXIF信息处理模块
 * 用于读取和保存JPG图片的EXIF信息
 */

class ExifHandler {
  constructor() {
    this.exifData = null;
  }

  /**
   * 从数据URL提取EXIF信息
   * @param {string} dataUrl - 图片的data URL
   * @returns {Object|null} EXIF对象
   */
  async extractFromDataUrl(dataUrl) {
    try {
      // piexifjs需要在浏览器环境中使用
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
   * 将EXIF信息嵌入到图片
   * @param {string} dataUrl - 原始图片data URL
   * @param {Object} exifObj - EXIF对象
   * @returns {string} 带有EXIF的新data URL
   */
    embedExif(dataUrl, exifObj) {
      try {
        if (typeof piexif === 'undefined') {
          console.warn('piexifjs not loaded');
          return dataUrl;
        }

        // 清除略缩图，避免显示旧图片的预览
        // piexif.js 中略缩图存储在 exifObj.thumbnail
        exifObj.thumbnail = null;

        const exifBytes = piexif.dump(exifObj);
        const newDataUrl = piexif.insert(exifBytes, dataUrl);
        return newDataUrl;
      } catch (error) {
        console.error('Error embedding EXIF:', error);
        return dataUrl;
      }
    }

  /**
   * 清除EXIF信息
   * @param {string} dataUrl - 图片data URL
   * @returns {string} 没有EXIF的data URL
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
   * 获取保存的EXIF数据
   */
  getExifData() {
    return this.exifData;
  }

  /**
   * 设置EXIF数据
   */
  setExifData(exifObj) {
    this.exifData = exifObj;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExifHandler;
}

/**
 * ColorExtractor - 颜色提取类
 * 使用K-means聚类算法从图片中提取主要颜色
 */
class ColorExtractor {
  constructor(colorCount = 5) {
    this.colorCount = colorCount;
  }

  /**
   * 从图片数据中提取主要颜色
   * @param {ImageData} imageData - Canvas ImageData对象
   * @returns {Array} 提取的颜色数组
   */
  extract(imageData) {
    const pixels = this.getPixelArray(imageData);
    const clusters = this.kMeansClustering(pixels, this.colorCount);
    const colors = this.formatColors(clusters);
    return colors;
  }

  /**
   * 将ImageData转换为像素数组
   */
  getPixelArray(imageData) {
    const pixels = [];
    const data = imageData.data;
    
    // 动态计算采样步长：小图片保持步长10，大图片适当增大以提高性能
    // 确保采样像素数在合理范围内（约10000-100000个像素）
    const totalPixels = imageData.width * imageData.height;
    const step = Math.max(10, Math.floor(Math.sqrt(totalPixels / 20000)));
    
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // 跳过透明像素
      if (a < 128) continue;
      
      pixels.push([r, g, b]);
    }
    
    return pixels;
  }

  /**
   * K-means聚类算法
   */
  kMeansClustering(pixels, k, maxIterations = 20) {
    if (pixels.length === 0) {
      return Array(k).fill([128, 128, 128]);
    }

    // 初始化聚类中心（使用K-means++）
    let centroids = this.initializeCentroids(pixels, k);
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 分配像素到最近的聚类中心
      const clusters = Array(k).fill(null).map(() => []);
      
      for (const pixel of pixels) {
        let minDist = Infinity;
        let closestIdx = 0;
        
        for (let i = 0; i < centroids.length; i++) {
          const dist = this.colorDistance(pixel, centroids[i]);
          if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
          }
        }
        
        clusters[closestIdx].push(pixel);
      }
      
      // 更新聚类中心
      const newCentroids = clusters.map((cluster, idx) => {
        if (cluster.length === 0) {
          return centroids[idx];
        }
        return this.calculateCentroid(cluster);
      });
      
      // 检查收敛
      let converged = true;
      for (let i = 0; i < k; i++) {
        if (this.colorDistance(centroids[i], newCentroids[i]) > 1) {
          converged = false;
          break;
        }
      }
      
      centroids = newCentroids;
      
      if (converged) break;
    }
    
    return centroids;
  }

  /**
   * K-means++初始化
   */
  initializeCentroids(pixels, k) {
    const centroids = [];
    
    // 随机选择第一个中心
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    
    // 选择剩余的中心
    while (centroids.length < k) {
      const distances = pixels.map(pixel => {
        let minDist = Infinity;
        for (const centroid of centroids) {
          const dist = this.colorDistance(pixel, centroid);
          if (dist < minDist) minDist = dist;
        }
        return minDist * minDist; // 平方距离
      });
      
      const totalDist = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalDist;
      
      for (let i = 0; i < pixels.length; i++) {
        random -= distances[i];
        if (random <= 0) {
          centroids.push(pixels[i]);
          break;
        }
      }
    }
    
    return centroids;
  }

  /**
   * 计算颜色距离（欧氏距离）
   */
  colorDistance(c1, c2) {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * 计算聚类中心
   */
  calculateCentroid(pixels) {
    let r = 0, g = 0, b = 0;
    for (const pixel of pixels) {
      r += pixel[0];
      g += pixel[1];
      b += pixel[2];
    }
    const len = pixels.length;
    return [
      Math.round(r / len),
      Math.round(g / len),
      Math.round(b / len)
    ];
  }

  /**
   * 格式化颜色输出
   */
  formatColors(centroids) {
    return centroids.map((centroid, index) => ({
      hex: this.rgbToHex(centroid[0], centroid[1], centroid[2]),
      rgb: [centroid[0], centroid[1], centroid[2]],
      position: index,
      label: this.rgbToHex(centroid[0], centroid[1], centroid[2]),
      brightness: this.getBrightness(centroid),
      hue: this.getHue(centroid),
      saturation: this.getSaturation(centroid)
    }));
  }

  /**
   * RGB转HEX
   */
  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  /**
   * 计算亮度
   */
  getBrightness(rgb) {
    return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
  }

  /**
   * 计算色相
   */
  getHue(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) return 0;
    
    let h;
    if (max === r) {
      h = (g - b) / (max - min);
    } else if (max === g) {
      h = 2 + (b - r) / (max - min);
    } else {
      h = 4 + (r - g) / (max - min);
    }
    
    h *= 60;
    if (h < 0) h += 360;
    
    return h;
  }

  /**
   * 计算饱和度
   */
  getSaturation(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === 0) return 0;
    
    return (max - min) / max;
  }

  /**
   * 排序颜色
   */
  sortColors(colors, sortType) {
    const sortedColors = [...colors];
    
    switch (sortType) {
      case 'brightness':
        sortedColors.sort((a, b) => b.brightness - a.brightness);
        break;
      case 'hue':
        sortedColors.sort((a, b) => a.hue - b.hue);
        break;
      case 'saturation':
        sortedColors.sort((a, b) => b.saturation - a.saturation);
        break;
      default:
        // 保持原顺序
        break;
    }
    
    // 更新位置
    sortedColors.forEach((color, index) => {
      color.position = index;
    });
    
    return sortedColors;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorExtractor;
}

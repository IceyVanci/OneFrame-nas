/**
 * 图片主色提取工具（Type Q 边框/署名色共用）
 * 将图片缩绘到 32×32 canvas，按 4bit/通道 分桶统计，
 * 取样本数最多的桶，再对桶内像素求平均，得到主色（#rrggbb）。
 * 结果按 img.src 缓存，同一张图只计算一次。
 */

const cache = new Map();

/**
 * 提取图片主色
 * @param {HTMLImageElement} img - 已加载完成的图片元素
 * @returns {string} 主色十六进制值（如 '#f0e0c8'），失败时返回 '#ffffff'
 */
export function getDominantColor(img) {
  try {
    if (!img || !img.complete || img.naturalWidth === 0) return '#ffffff';

    const key = img.src || '';
    if (key && cache.has(key)) return cache.get(key);

    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    // 分桶统计（每通道 16 级，共 4096 桶）
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const k = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
      const bucket = buckets.get(k);
      if (bucket) {
        bucket.r += r; bucket.g += g; bucket.b += b; bucket.n++;
      } else {
        buckets.set(k, { r, g, b, n: 1 });
      }
    }

    let best = null;
    for (const bucket of buckets.values()) {
      if (!best || bucket.n > best.n) best = bucket;
    }
    if (!best) return '#ffffff';

    const r = Math.round(best.r / best.n);
    const g = Math.round(best.g / best.n);
    const b = Math.round(best.b / best.n);
    const hex = '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');

    if (key) cache.set(key, hex);
    return hex;
  } catch (err) {
    console.warn('主色提取失败，回退白色：', err);
    return '#ffffff';
  }
}

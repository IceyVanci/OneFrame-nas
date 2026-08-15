/**
 * MiSans 字体加载公共模块
 * - loadMiSansFonts(): opentype 加载 woff2，模块级缓存 + in-flight Promise 去重（供需要矢量轮廓的模块使用，如 Type B/E）
 * - ensureCssFontsReady(): 等待 CSS @font-face 字体就绪，返回 null 字体对象（供 fillText 渲染的模块使用）
 */

const opentype = window.opentype;

let fontSemibold = null;
let fontMedium = null;
let fontNormal = null;
let loadingPromise = null;

/**
 * 使用 opentype 加载 MiSans 三种字重（woff2）。
 * 缓存已加载结果；加载中并发调用共享同一 Promise；加载失败不抛出，返回 null 字体（调用方降级）。
 * @returns {Promise<{fontSemibold: Object|null, fontMedium: Object|null, fontNormal: Object|null}>}
 */
export function loadMiSansFonts() {
  if (fontSemibold && fontMedium && fontNormal) {
    return Promise.resolve({ fontSemibold, fontMedium, fontNormal });
  }
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const result = { fontSemibold: null, fontMedium: null, fontNormal: null };
      try {
        const [semibold, medium, normal] = await Promise.all([
          opentype.load(new URL('../../fonts/MiSans-Semibold.woff2', import.meta.url).href),
          opentype.load(new URL('../../fonts/MiSans-Medium.woff2', import.meta.url).href),
          opentype.load(new URL('../../fonts/MiSans-Normal.woff2', import.meta.url).href)
        ]);
        result.fontSemibold = semibold;
        result.fontMedium = medium;
        result.fontNormal = normal;
      } catch (error) {
        console.error('Font loading failed, fallback to CSS fonts:', error);
      }
      fontSemibold = result.fontSemibold;
      fontMedium = result.fontMedium;
      fontNormal = result.fontNormal;
      return result;
    })();
  }
  return loadingPromise;
}

/**
 * 等待 CSS @font-face 注册的 MiSans woff2 就绪（fillText 渲染依赖）。
 * 返回 null 字体对象，兼容旧 drawText(ctx, fonts, ...) 签名中未使用的 font 参数。
 * @returns {Promise<{fontSemibold: null, fontMedium: null, fontNormal: null}>}
 */
export async function ensureCssFontsReady() {
  try {
    if (document?.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch (error) {
    console.error('document.fonts.ready failed:', error);
  }
  return { fontSemibold: null, fontMedium: null, fontNormal: null };
}

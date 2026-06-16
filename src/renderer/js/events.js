/**
 * 事件总线 - 模块间通信的发布订阅机制
 * 用于解耦各模块之间的通信
 */

const listeners = new Map();

/**
 * 发送事件
 * @param {string} event - 事件名称
 * @param {*} data - 事件数据
 */
export function emit(event, data) {
  const callbacks = listeners.get(event);
  if (callbacks) {
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
}

/**
 * 订阅事件
 * @param {string} event - 事件名称
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消订阅的函数
 */
export function on(event, callback) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(callback);
  
  // 返回取消订阅函数
  return () => off(event, callback);
}

/**
 * 取消订阅
 * @param {string} event - 事件名称
 * @param {Function} callback - 回调函数
 */
export function off(event, callback) {
  const callbacks = listeners.get(event);
  if (callbacks) {
    callbacks.delete(callback);
  }
}

/**
 * 订阅一次性事件
 * @param {string} event - 事件名称
 * @param {Function} callback - 回调函数
 */
export function once(event, callback) {
  const wrapper = (data) => {
    off(event, wrapper);
    callback(data);
  };
  on(event, wrapper);
}

// 预定义事件名称
export const Events = {
  // 图片相关
  IMAGE_LOADED: 'image:loaded',
  IMAGE_CHANGED: 'image:changed',
  
  // 样式相关
  STYLE_CHANGED: 'style:changed',
  STYLE_PREVIEW_UPDATE: 'style:preview:update',
  STYLE_CONTENT_UPDATE: 'style:content:update',
  
  // 编辑器相关
  EDITOR_SHOW: 'editor:show',
  EDITOR_HIDE: 'editor:hide',
  
  // 设置相关
  SETTINGS_CHANGED: 'settings:changed',
  LOGO_CHANGED: 'logo:changed',
  
  // 导出相关
  EXPORT_START: 'export:start',
  EXPORT_COMPLETE: 'export:complete',
  EXPORT_ERROR: 'export:error'
};

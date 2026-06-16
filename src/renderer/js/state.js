/**
 * 统一状态管理模块
 * 提供响应式状态管理，支持状态订阅和更新通知
 */

// 初始状态
const initialState = {
  // 图片相关
  currentExif: null,
  currentFile: null,
  currentImagePath: null,
  currentStyle: null,  // 'type-a' | 'type-b'
  
  // Logo 相关
  selectedLogo: null,
  logoBrightnessCache: {},  // { logoName: { isLight: boolean } }
  
  // 编辑器相关
  isEditorVisible: false
};

// 内部状态
let state = { ...initialState };

// 订阅者
const subscribers = new Set();

/**
 * 获取当前状态
 * @param {string} [key] - 可选，要获取的状态键
 * @returns {*} 状态值或完整状态对象
 */
export function getState(key) {
  if (key !== undefined) {
    return state[key];
  }
  return { ...state };
}

/**
 * 设置状态
 * @param {string|Object} key - 状态键或状态对象
 * @param {*} value - 状态值（当 key 为字符串时）
 */
export function setState(key, value) {
  if (typeof key === 'object') {
    // 批量更新
    state = { ...state, ...key };
  } else {
    // 单个更新
    state = { ...state, [key]: value };
  }
  
  // 通知所有订阅者
  notifySubscribers();
}

/**
 * 订阅状态变化
 * @param {Function} callback - 状态变化回调
 * @returns {Function} 取消订阅函数
 */
export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * 通知所有订阅者
 */
function notifySubscribers() {
  subscribers.forEach(callback => {
    try {
      callback(state);
    } catch (error) {
      console.error('Error in state subscriber:', error);
    }
  });
}

/**
 * 重置状态
 */
export function resetState() {
  state = { ...initialState };
  // 重置 logo 缓存（保留）
  state.logoBrightnessCache = initialState.logoBrightnessCache;
  notifySubscribers();
}

/**
 * 特定于 Logo 的状态操作
 */
export const logoState = {
  /**
   * 获取 Logo 亮度缓存
   * @param {string} logoName
   * @returns {boolean|undefined}
   */
  getBrightness(logoName) {
    return state.logoBrightnessCache[logoName]?.isLight;
  },
  
  /**
   * 设置 Logo 亮度缓存
   * @param {string} logoName
   * @param {boolean} isLight
   */
  setBrightness(logoName, isLight) {
    state.logoBrightnessCache[logoName] = { isLight };
    notifySubscribers();
  },
  
  /**
   * 检查 Logo 是否已缓存
   * @param {string} logoName
   * @returns {boolean}
   */
  hasBrightness(logoName) {
    return state.logoBrightnessCache[logoName] !== undefined;
  }
};

export default {
  getState,
  setState,
  subscribe,
  resetState,
  logoState
};

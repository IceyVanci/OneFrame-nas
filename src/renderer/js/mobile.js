// OneFrame 移动端检测和适配模块
// 通过 UA 检测注入 is-mobile class，提供滑动手势和滚动锁定

const UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/** UA 检测是否为移动设备 */
export function detectMobile() {
  return UA_REGEX.test(navigator.userAgent);
}

/** 导出标志，供 app.js 判断 */
export const isMobile = detectMobile();

/** 注入 is-mobile class + 监听 resize/orientationchange */
export function initMobileLayout() {
  document.documentElement.classList.add('is-mobile');
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('orientationchange', onViewportChange);
}

function onViewportChange() {
  // 更新 CSS 自定义属性供 dvh fallback 使用
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

/** 锁定 body 滚动（编辑面板打开时） */
export function lockBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
}

/** 解锁 body 滚动（编辑面板关闭时） */
export function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
}

/**
 * 为编辑面板添加向下滑动手势关闭
 * @param {HTMLElement} panel - .edit-panel 元素
 * @param {Function} onClose - 关闭回调
 */
export function initSwipeToClose(panel, onClose) {
  if (!panel || panel._swipeInit) return;
  panel._swipeInit = true;

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  panel.addEventListener('touchstart', (e) => {
    // 只在面板顶部区域（header）开始拖动
    if (e.target.closest('.panel-header') || e.target.closest('.edit-section') === null) {
      startY = e.touches[0].clientY;
      dragging = true;
    }
  }, { passive: true });

  panel.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      panel.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  panel.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const deltaY = currentY - startY;
    panel.style.transform = '';
    if (deltaY > 80) {
      onClose && onClose();
    }
  }, { passive: true });
}
/**
 * Type N 编辑面板配置模块
 * 顶部显示 Logo，底部显示参数 + 署名
 * 无日期、无机型显示
 */

/**
 * 配置 Type N 编辑面板
 */
export function configureEditPanel() {
  // 边框颜色设置：隐藏（Type N 固定白色背景）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  // 边框高度设置：隐藏
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  // 比例设置：隐藏
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  // Logo 设置区域：显示
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = '';
  
  // 隐藏所有显示开关（Type N 默认显示所有保留元素）
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
  
  // 设备型号输入框：隐藏整个 section（Type N 不显示机型）
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = 'none';
  
  // 时间设置 section：隐藏（Type N 不显示时间）
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = 'none';
}
/**
 * Type G 编辑面板配置模块
 * 第一行显示 Logo，第二行显示日期 | 参数 | 相机名称
 * 所有元素默认显示，无需开关
 */

/**
 * 配置 Type G 编辑面板
 */
export function configureEditPanel() {
  // 边框颜色设置：隐藏（Type G 固定白色背景）
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
  
  // 隐藏所有显示开关（Type G 默认显示所有元素）
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // 确保开关默认激活（Type G 始终显示所有元素）
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
  
  // 设备型号标签：更新提示文字（Type G 不带品牌名称）
  const customModel = document.getElementById('customModel');
  if (customModel) {
    customModel.placeholder = '型号（如 A7M4）';
  }
}
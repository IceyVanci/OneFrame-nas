/**
 * Type H 编辑面板配置模块
 * 沿用 Type G 设定，额外显示文字颜色选择
 */

export function configureEditPanel() {
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = '';
  
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
  
  const customModel = document.getElementById('customModel');
  if (customModel) {
    customModel.placeholder = '型号（如 A7M4）';
  }
  
  // 文字颜色选择：显示（Type H 文字叠加在照片上，需要颜色选择）
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) {
    textColorSection.style.display = '';
    // 默认激活白色按钮（Type H 文字默认白色）
    const textPresets = textColorSection.querySelectorAll('.color-preset');
    textPresets.forEach(b => b.classList.remove('active'));
    const whiteBtn = textColorSection.querySelector('[data-text-color="#ffffff"]');
    if (whiteBtn) whiteBtn.classList.add('active');
    const textColorInput = document.getElementById('textColor');
    if (textColorInput) textColorInput.value = '#ffffff';
  }
}
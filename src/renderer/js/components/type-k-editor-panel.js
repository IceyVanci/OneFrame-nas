/**
 * Type K 编辑面板配置模块
 * 与 Type H 类似：显示 Logo 选择、署名、文字颜色
 * 隐藏边框颜色/高度/比例、设备型号、所有显示开关
 */

export function configureEditPanel() {
  // 边框颜色/高度/比例：隐藏
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  // Logo 设置区域：显示
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = '';
  
  // 设备型号：显示（EXIF 自动读取，用户可手动修改）
  const customModel = document.getElementById('customModel');
  if (customModel) {
    customModel.placeholder = '型号（如 A7M4）';
  }
  
  // 隐藏所有显示开关（默认激活）
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
  
  // 署名默认值：OneFrame
  const sigInput = document.getElementById('signatureText');
  if (sigInput && !sigInput.value) {
    sigInput.value = 'OneFrame';
  }
  
  // 文字颜色选择：显示
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) {
    textColorSection.style.display = '';
    const textPresets = textColorSection.querySelectorAll('.color-preset');
    textPresets.forEach(b => b.classList.remove('active'));
    const whiteBtn = textColorSection.querySelector('[data-text-color="#ffffff"]');
    if (whiteBtn) whiteBtn.classList.add('active');
    const textColorInput = document.getElementById('textColor');
    if (textColorInput) textColorInput.value = '#ffffff';
  }
}
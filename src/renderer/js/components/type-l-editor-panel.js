/**
 * Type L 编辑面板配置模块
 * 与 Type G 类似：隐藏边框颜色/高度/比例、所有显示开关
 * 保留 Logo 选择、署名、文字颜色选择
 * 文字颜色默认白色
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
  
  // 设备型号：隐藏（EXIF 自动读取）
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = 'none';
  
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
  
  // 文字颜色选择：显示，默认白色
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
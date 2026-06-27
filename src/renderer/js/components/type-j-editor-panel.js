/**
 * Type J 编辑面板配置模块
 * 基于 Type H，署名在底部第一行，参数行三栏布局
 * 隐藏 Logo、所有开关、设备型号输入（自动从 EXIF 读取含厂商名）
 * 保留署名、文字颜色选择
 */

export function configureEditPanel() {
  // 边框颜色/高度/比例：隐藏
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  // Logo 设置区域：隐藏
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = 'none';
  
  // 设备型号：隐藏（自动从 EXIF 读取含厂商名）
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
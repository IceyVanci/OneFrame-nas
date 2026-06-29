/**
 * Type M 编辑面板配置模块
 * 基于 Type J，Logo 在顶部居中，底部署名+参数行
 * 显示参数、机型、时间、署名、Logo、文字颜色
 */

export function configureEditPanel() {
  // 边框颜色/高度/比例：隐藏
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  // 设备型号：显示
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = '';
  
  // 拍摄参数：显示
  const paramsSection = document.querySelector('.edit-section:has(#fNumber)');
  if (paramsSection) paramsSection.style.display = '';
  
  // 时间：显示
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = '';
  
  // Logo 设置区域：显示
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = '';
  
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
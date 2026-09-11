/**
 * Type Q 编辑面板配置模块（简洁布局）
 * 显示：Q 署名区（显示开关 + 颜色三选一）/ 署名文字
 * 隐藏：边框 / 比例 / Logo / 设备型号 / 拍摄参数 / 时间 / 文字颜色 / 厂商 / 胶片
 */

/**
 * 配置 Type Q 编辑面板
 */
export function configureEditPanel() {
  // 边框设置（颜色+高度）：隐藏（边框自动取图片主色）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';

  // 比例设置：隐藏
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';

  // Logo 设置区域：隐藏
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = 'none';
  const switchLogo = document.getElementById('switchLogo');
  if (switchLogo) {
    switchLogo.classList.add('active');
    const switchGroup = switchLogo.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }

  // 设备型号输入框：隐藏
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = 'none';
  const switchModel = document.getElementById('switchModel');
  if (switchModel) {
    switchModel.classList.add('active');
    const switchGroup = switchModel.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }

  // 拍摄参数设置：隐藏
  const paramsSection = document.querySelector('.edit-section:has(#fNumber)');
  if (paramsSection) paramsSection.style.display = 'none';
  const switchParams = document.getElementById('switchParams');
  if (switchParams) {
    switchParams.classList.add('active');
    const switchGroup = switchParams.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }

  // 时间设置：隐藏
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = 'none';
  const switchTime = document.getElementById('switchTime');
  if (switchTime) {
    switchTime.classList.add('active');
    const switchGroup = switchTime.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }

  // 文字颜色设置：隐藏
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) textColorSection.style.display = 'none';

  // 厂商 / 胶片设置：隐藏
  const manufacturerSection = document.getElementById('manufacturerSection');
  if (manufacturerSection) manufacturerSection.style.display = 'none';
  const filmSection = document.getElementById('filmSection');
  if (filmSection) filmSection.style.display = 'none';

  // Q 署名设置区：显示（显示开关 + 颜色三选一，默认黑色）
  const qSignatureSection = document.getElementById('qSignatureSection');
  if (qSignatureSection) qSignatureSection.style.display = '';
  const switchSignatureQ = document.getElementById('switchSignatureQ');
  if (switchSignatureQ) switchSignatureQ.classList.add('active');
  const qColorInput = document.getElementById('qSignatureColor');
  if (qColorInput) qColorInput.value = '#000000';
  document.querySelectorAll('#qSignatureColorPresets .color-preset').forEach(b => {
    b.classList.toggle('active', b.dataset.qcolor === '#000000');
  });

  // 署名文字输入框：显示
  const signatureSection = document.querySelector('.edit-section:has(#signatureText)');
  if (signatureSection) signatureSection.style.display = '';
  const switchSignature = document.getElementById('switchSignature');
  if (switchSignature) {
    switchSignature.classList.add('active');
    const switchGroup = switchSignature.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }
}

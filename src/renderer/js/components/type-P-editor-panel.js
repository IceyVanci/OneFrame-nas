/**
 * Type P 编辑面板配置模块（参数布局）
 * 显示：Logo（开关+选择器）/ 设备型号（EXIF 自动读取）/ 拍摄参数（开关+参数值）
 * 隐藏：边框 / 比例 / 时间 / 文字颜色 / 厂商 / 胶片 / Q 署名区 / 署名
 */

/**
 * 配置 Type P 编辑面板
 */
export function configureEditPanel() {
  // 边框设置（颜色+高度）：隐藏（Type P 为固定白边框，照片无描边）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';

  // 比例设置：隐藏
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';

  // Logo 设置区域：显示（品牌 Logo，第 1 行）
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = '';
  const switchLogo = document.getElementById('switchLogo');
  if (switchLogo) {
    switchLogo.classList.add('active');
    const switchGroup = switchLogo.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = '';
  }

  // 设备型号输入框：显示（沿用 EXIF 自动读取流程）
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = '';
  const customModelInput = document.getElementById('customModel');
  if (customModelInput) customModelInput.placeholder = '自动从EXIF读取';
  const switchModel = document.getElementById('switchModel');
  if (switchModel) {
    switchModel.classList.add('active');
    const switchGroup = switchModel.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }

  // 拍摄参数设置：显示（参数胶囊，沿用 EXIF 流程）
  const paramsSection = document.querySelector('.edit-section:has(#fNumber)');
  if (paramsSection) paramsSection.style.display = '';
  const switchParams = document.getElementById('switchParams');
  if (switchParams) {
    switchParams.classList.add('active');
    const switchGroup = switchParams.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = '';
  }

  // 时间设置：隐藏
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = 'none';

  // 文字颜色设置：隐藏
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) textColorSection.style.display = 'none';

  // 厂商 / 胶片设置：隐藏
  const manufacturerSection = document.getElementById('manufacturerSection');
  if (manufacturerSection) manufacturerSection.style.display = 'none';
  const filmSection = document.getElementById('filmSection');
  if (filmSection) filmSection.style.display = 'none';

  // Q 署名设置区（Type Q 专用）：隐藏
  const qSignatureSection = document.getElementById('qSignatureSection');
  if (qSignatureSection) qSignatureSection.style.display = 'none';

  // 署名设置：隐藏（Type P 无署名）
  const signatureSection = document.querySelector('.edit-section:has(#signatureText)');
  if (signatureSection) signatureSection.style.display = 'none';
  const switchSignature = document.getElementById('switchSignature');
  if (switchSignature) {
    switchSignature.classList.add('active');
    const switchGroup = switchSignature.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }
}

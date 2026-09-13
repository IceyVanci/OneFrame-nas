/**
 * Type R 编辑面板配置模块（Pentax 645N 胶片边缘打印）
 * 显示：打印参数（序号/曝光模式/快门/光圈/曝光偏差/焦距）+ 署名
 * 隐藏：比例 / 边框 / Logo / 设备型号 / 原拍摄参数 / 时间 / 文字颜色 / 厂商 / 胶片 / Q 署名区
 */

/**
 * 配置 Type R 编辑面板
 */
export function configureEditPanel() {
  // 比例设置：隐藏（画布比例随原图方向自动 4:3 / 3:4）
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';

  // 边框设置（颜色+高度）：隐藏（固定黑底 + 固定橙字）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';

  // Logo 设置：隐藏
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = 'none';

  // 设备型号：隐藏
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = 'none';

  // 原「拍摄参数」区：隐藏（Type R 使用独立的打印参数区）
  const paramsSection = document.querySelector('.edit-section:has(#fNumber)');
  if (paramsSection) paramsSection.style.display = 'none';

  // 时间设置：隐藏
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = 'none';

  // 文字颜色：隐藏
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) textColorSection.style.display = 'none';

  // 厂商 / 胶片：隐藏
  const manufacturerSection = document.getElementById('manufacturerSection');
  if (manufacturerSection) manufacturerSection.style.display = 'none';
  const filmSection = document.getElementById('filmSection');
  if (filmSection) filmSection.style.display = 'none';

  // Q 署名设置区：隐藏
  const qSignatureSection = document.getElementById('qSignatureSection');
  if (qSignatureSection) qSignatureSection.style.display = 'none';

  // Type R 打印参数区：显示
  const printSection = document.getElementById('typeRPrintSection');
  if (printSection) printSection.style.display = '';

  // 序号默认 01
  const frameNumber = document.getElementById('frameNumber');
  if (frameNumber && !frameNumber.value) frameNumber.value = '01';

  // 署名区：显示（点阵字体 Doto 仅支持英文署名）
  const signatureSection = document.querySelector('.edit-section:has(#signatureText)');
  if (signatureSection) signatureSection.style.display = '';
  const signatureInput = document.getElementById('signatureText');
  if (signatureInput) {
    signatureInput.placeholder = '英文署名（如 koswo）';
    if (signatureSection && !signatureSection.querySelector('.type-r-sign-hint')) {
      const hint = document.createElement('div');
      hint.className = 'type-r-sign-hint';
      hint.textContent = '点阵字体（Doto）仅支持英文署名';
      signatureInput.insertAdjacentElement('afterend', hint);
    }
  }

  // 隐藏所有显示开关
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
}

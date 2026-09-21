/**
 * Type S 编辑面板配置模块（留白排版 / 参考图）
 * 显示：比例（画布/图片区）+ 文字（第一行/PHOTO BY/日期）+ 右下参数 + 文字颜色
 * 隐藏：边框 / Logo / 设备型号 / 原拍摄参数 / 时间 / 通用文字颜色 / 厂商 / 胶片 / Q 署名 / R 打印 / 通用署名
 */

/**
 * 配置 Type S 编辑面板
 */
export function configureEditPanel() {
  const hideSection = (selector) => {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  };
  const hideById = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  };

  hideById('aspectRatioSection');
  hideSection('.edit-section:has(#borderColor)');
  hideSection('.edit-section:has(#logoGrid)');
  hideSection('.edit-section:has(#customModel)');
  hideSection('.edit-section:has(#fNumber)');
  hideSection('.edit-section:has(#dateTime)');
  hideById('textColorSection');
  hideById('manufacturerSection');
  hideById('filmSection');
  hideById('qSignatureSection');
  hideById('typeRPrintSection');
  hideById('typeTSection');
  hideSection('.edit-section:has(#signatureText)');

  const section = document.getElementById('typeSSection');
  if (section) section.style.display = '';

  // 文字颜色默认「图片主色」
  const colorInput = document.getElementById('typeSColor');
  if (colorInput) colorInput.value = 'dominant';
  const picker = document.getElementById('typeSColorPicker');
  if (picker) picker.value = '#000000';
  document.querySelectorAll('#typeSColorPresets .color-preset').forEach(b => {
    b.classList.toggle('active', b.dataset.scolor === 'dominant');
  });

  // 画布比例默认 1:1
  const canvasSelect = document.getElementById('canvasRatioS');
  if (canvasSelect && !canvasSelect.value) canvasSelect.value = '1:1';

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

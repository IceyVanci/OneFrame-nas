/**
 * Type T 编辑面板配置模块（满幅无边框 / 参考图）
 * 显示：照片比例 + 文字（第一行/PHOTO BY/日期）+ 右下参数 + 文字颜色
 * 隐藏：边框 / Logo / 设备型号 / 原拍摄参数 / 时间 / 通用文字颜色 / 厂商 / 胶片 / Q 署名 / R 打印 / S 排版 / 通用署名
 */

/**
 * 配置 Type T 编辑面板
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
  hideById('typeSSection');
  hideSection('.edit-section:has(#signatureText)');

  const section = document.getElementById('typeTSection');
  if (section) section.style.display = '';

  // 文字颜色默认白色
  const colorInput = document.getElementById('typeTColor');
  if (colorInput) colorInput.value = '#ffffff';
  const picker = document.getElementById('typeTColorPicker');
  if (picker) picker.value = '#ffffff';
  document.querySelectorAll('#typeTColorPresets .color-preset').forEach(b => {
    b.classList.toggle('active', b.dataset.tcolor === '#ffffff');
  });

  // 照片比例默认 1:1
  const ratioSelect = document.getElementById('ratioT');
  if (ratioSelect && !ratioSelect.value) ratioSelect.value = '1:1';

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

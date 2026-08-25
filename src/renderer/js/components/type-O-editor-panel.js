/**
 * Type O 编辑面板配置模块
 * 显示：边框颜色（照片描边）/ 厂商 / 机型 / 胶片 / 署名
 * 隐藏：边框高度 / 比例 / Logo / 拍摄参数 / 时间 / 文字颜色 / 显示开关
 */

/**
 * 配置 Type O 编辑面板
 */
export function configureEditPanel() {
  // 面板顺序：胶片在最顶部（header 之后），厂商在设备型号上方
  // （页面在切换模板时 reload，无需还原；重复调用 insertBefore 幂等）
  const panel = document.getElementById('editPanel');
  if (panel) {
    const filmSection = document.getElementById('filmSection');
    const manufacturerSection = document.getElementById('manufacturerSection');
    const modelSection = document.querySelector('.edit-section:has(#customModel)');
    const firstEditSection = panel.querySelector('.edit-section');
    // 胶片 → 面板最上方（header 之后，即第一个 edit-section 之前）
    if (filmSection && firstEditSection && filmSection !== firstEditSection) {
      panel.insertBefore(filmSection, firstEditSection);
    }
    // 厂商 → 设备型号上方
    if (manufacturerSection && modelSection) {
      panel.insertBefore(manufacturerSection, modelSection);
    }
  }

  // 边框颜色设置：显示（Type O 照片描边色，默认黑）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = '';
  const borderColor = document.getElementById('borderColor');
  if (borderColor) {
    borderColor.value = '#000000';
    document.querySelectorAll('.color-preset[data-color]').forEach(b => {
      b.classList.toggle('active', b.dataset.color === '#000000');
    });
  }

  // 边框高度设置：隐藏
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';

  // 比例设置：隐藏
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';

  // Logo 设置区域：隐藏
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = 'none';

  // 厂商设置区域：显示
  const manufacturerSection = document.getElementById('manufacturerSection');
  if (manufacturerSection) manufacturerSection.style.display = '';

  // 设备型号输入框：显示（机型，配合厂商拼接第 2 行大字）
  const modelSection = document.querySelector('.edit-section:has(#customModel)');
  if (modelSection) modelSection.style.display = '';
  // Type O 不读取 EXIF，去除"自动从EXIF读取"占位提示
  const customModelInput = document.getElementById('customModel');
  if (customModelInput) customModelInput.placeholder = '输入设备型号';

  // 胶片设置区域：显示
  const filmSection = document.getElementById('filmSection');
  if (filmSection) filmSection.style.display = '';

  // 拍摄参数设置：隐藏
  const paramsSection = document.querySelector('.edit-section:has(#fNumber)');
  if (paramsSection) paramsSection.style.display = 'none';

  // 时间设置：隐藏
  const timeSection = document.querySelector('.edit-section:has(#dateTime)');
  if (timeSection) timeSection.style.display = 'none';

  // 文字颜色设置：隐藏
  const textColorSection = document.getElementById('textColorSection');
  if (textColorSection) textColorSection.style.display = 'none';

  // 隐藏所有显示开关（Type O 无开关项）
  ['switchLogo', 'switchModel', 'switchParams', 'switchTime', 'switchSignature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      const switchGroup = el.closest('.switch-group');
      if (switchGroup) switchGroup.style.display = 'none';
    }
  });
}

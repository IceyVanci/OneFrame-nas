/**
 * Type C 编辑面板配置模块
 * 负责配置 Type C 模式的编辑面板显示
 * 当前与 Type A 相同，后续可自定义
 */

/**
 * 配置 Type C 编辑面板
 * 显示所有高级设置选项
 */
export function configureEditPanel() {
  // 边框颜色设置：显示
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'block';
  
  // 边框高度设置：显示
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'block';
  
  // Logo 显示开关：显示
  const logoSwitch = document.getElementById('switchLogo');
  if (logoSwitch) logoSwitch.style.display = 'flex';
  
  // 拍摄参数显示开关：显示
  const paramsSwitch = document.getElementById('switchParams');
  if (paramsSwitch) paramsSwitch.style.display = 'flex';
  
  // 时间显示开关：显示
  const timeSwitch = document.getElementById('switchTime');
  if (timeSwitch) timeSwitch.style.display = 'flex';
  
  // 输出比例：包含 "默认" 和 "原始比例" 选项
  const aspectRatio = document.getElementById('aspectRatio');
  if (aspectRatio) {
    aspectRatio.innerHTML = '<option value="default" selected>默认</option><option value="original">原始比例</option>';
  }
  
  // 拍摄时间类型：datetime-local（包含时间）
  const dateTime = document.getElementById('dateTime');
  if (dateTime) {
    dateTime.type = 'datetime-local';
  }
}

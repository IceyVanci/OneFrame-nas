/**
 * Type B 编辑面板配置模块
 * 负责配置 Type B 模式的编辑面板显示
 */

/**
 * 配置 Type B 编辑面板
 * 简化模式，仅显示基本选项
 */
export function configureEditPanel() {
  // 边框颜色设置：隐藏
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  // 边框高度设置：隐藏
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  // Logo 显示开关：隐藏
  const logoSwitch = document.getElementById('switchLogo');
  if (logoSwitch) logoSwitch.style.display = 'none';
  
  // 拍摄参数显示开关：隐藏
  const paramsSwitch = document.getElementById('switchParams');
  if (paramsSwitch) paramsSwitch.style.display = 'none';
  
  // 时间显示开关：隐藏
  const timeSwitch = document.getElementById('switchTime');
  if (timeSwitch) timeSwitch.style.display = 'none';
  
  // 输出比例：仅包含 "默认" 选项
  const aspectRatio = document.getElementById('aspectRatio');
  if (aspectRatio) {
    aspectRatio.innerHTML = '<option value="default" selected>默认</option>';
  }
  
  // 拍摄时间类型：date（仅日期）
  const dateTime = document.getElementById('dateTime');
  if (dateTime) {
    dateTime.type = 'date';
  }
}

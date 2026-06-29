/**
 * Type F 编辑面板配置模块
 * 布局：上方留白 + 照片区 + 底部文字区
 * 边框颜色固定为白色，不显示边框高度调节
 * 不显示比例设置和 Logo 区域
 * 设备型号文本框中自动加入品牌名称
 * 显示拍摄参数开关、时间开关
 */

/**
 * 配置 Type F 编辑面板
 */
export function configureEditPanel() {
  // 边框颜色设置：隐藏（Type F 固定白色背景）
  const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
  if (borderColorSection) borderColorSection.style.display = 'none';
  
  // 边框高度设置：隐藏（Type F 使用固定比例）
  const borderHeightSection = document.querySelector('.edit-section:has(#borderHeight)');
  if (borderHeightSection) borderHeightSection.style.display = 'none';
  
  // 比例设置：隐藏（Type F 不需要比例选择）
  const aspectRatioSection = document.getElementById('aspectRatioSection');
  if (aspectRatioSection) aspectRatioSection.style.display = 'none';
  
  // Logo 设置区域：隐藏（Type F 不显示 Logo）
  const logoSection = document.querySelector('.edit-section:has(#logoGrid)');
  if (logoSection) logoSection.style.display = 'none';
  
  // Logo 显示开关：隐藏
  const logoSwitch = document.getElementById('switchLogo');
  if (logoSwitch) {
    const switchGroup = logoSwitch.closest('.switch-group');
    if (switchGroup) switchGroup.style.display = 'none';
  }
  
  // 拍摄参数显示开关：显示
  const paramsSwitch = document.getElementById('switchParams');
  if (paramsSwitch) paramsSwitch.style.display = '';
  
  // 时间显示开关：显示
  const timeSwitch = document.getElementById('switchTime');
  if (timeSwitch) timeSwitch.style.display = '';
  
  // 设备型号标签：更新提示文字
  const customModel = document.getElementById('customModel');
  if (customModel) {
    customModel.placeholder = '品牌 + 型号（如 Sony A7M4）';
  }
}
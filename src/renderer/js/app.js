// OneFrame 主程序
import { getExif, formatDateTime, getFocalLength } from './exif.js';
import { getModelName, getAllLogos, getLogoFilename, getMakeName } from './logo-utils.js';
import { getStyle, getPreview, typeBPreview, typeEPreview, typeFPreview } from './styles/index.js';
import { configureEditPanel as configureTypeF } from './components/type-F-editor-panel.js';
import { configureEditPanel as configureTypeG } from './components/type-G-editor-panel.js';
import { configureEditPanel as configureTypeH } from './components/type-H-editor-panel.js';
import { configureEditPanel as configureTypeI } from './components/type-I-editor-panel.js';
import { configureEditPanel as configureTypeJ } from './components/type-J-editor-panel.js';
import { configureEditPanel as configureTypeK } from './components/type-K-editor-panel.js';
import { configureEditPanel as configureTypeL } from './components/type-L-editor-panel.js';
import { configureEditPanel as configureTypeM } from './components/type-M-editor-panel.js';
import { exportImage } from './exporter.js';

let currentExif = null;
let currentFile = null;
let currentImagePath = null;
let currentStyle = null;

/**
 * 提取图片主色调并设置为编辑器背景色
 * @param {HTMLImageElement} img - 已加载的图片元素
 */
function applyDynamicBackground(img) {
  const target = document.querySelector('.preview-area');
  if (!target) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 10, 10);
    const imageData = ctx.getImageData(0, 0, 10, 10).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i + 1];
      b += imageData[i + 2];
      count++;
    }
    r = Math.round(r / count * 0.4);
    g = Math.round(g / count * 0.4);
    b = Math.round(b / count * 0.4);
    target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    target.style.backgroundColor = '#16213e';
  }
}

// Logo 亮度缓存 { logoName: { isLight: boolean } }
const logoBrightnessCache = {};

/**
 * 检查图片是否为纵向图片
 */
async function checkImageOrientation(fileOrPath) {
  return new Promise((resolve) => {
    const img = new Image();
    const isBlob = typeof fileOrPath !== 'string';
    const src = isBlob ? URL.createObjectURL(fileOrPath) : `file://${fileOrPath}`;
    img.onload = () => {
      if (isBlob) URL.revokeObjectURL(src);
      resolve({
        isPortrait: img.naturalHeight > img.naturalWidth,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => { if (isBlob) URL.revokeObjectURL(src); resolve({ isPortrait: false, width: 0, height: 0 }); };
    img.src = src;
  });
}

/**
 * 检测 logo 图片的平均亮度
 */
function detectLogoBrightness(logoPath) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalBrightness = 0;
        let pixelCount = 0;
        for (let i = 0; i < data.length; i += 8) {
          const a = data[i + 3];
          if (a < 128) continue;
          const brightness = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
          totalBrightness += brightness;
          pixelCount++;
        }
        resolve(pixelCount > 0 ? totalBrightness / pixelCount > 100 : true);
      } catch (e) { resolve(true); }
    };
    img.onerror = () => resolve(true);
    img.src = logoPath;
  });
}

async function isLogoLight(logoName) {
  if (logoBrightnessCache[logoName] !== undefined) {
    return logoBrightnessCache[logoName].isLight;
  }
  const brightness = await detectLogoBrightness(`logos/${logoName}.svg`);
  logoBrightnessCache[logoName] = { isLight: brightness };
  return brightness;
}

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('.app-container');
  const editorView = document.getElementById('editor-view');
  const styleCards = document.querySelectorAll('.style-card:not(.disabled)');
  const userImage = document.getElementById('userImage');
  const photoFooter = document.getElementById('photoFooter');
  const btnTemplate = document.getElementById('btnTemplate');
  const btnReselect = document.getElementById('btnReselect');
  const btnEdit = document.getElementById('btnEdit');
  const btnSave = document.getElementById('btnSave');
  const editPanel = document.getElementById('editPanel');
  const borderColor = document.getElementById('borderColor');
  const borderHeight = document.getElementById('borderHeight');
  const borderHeightLabel = document.getElementById('borderHeightLabel');
  const logoGrid = document.getElementById('logoGrid');
  const logoPreview = document.getElementById('logoPreview');
  const customModel = document.getElementById('customModel');
  const fNumber = document.getElementById('fNumber');
  const exposureTime = document.getElementById('exposureTime');
  const focalLength = document.getElementById('focalLength');
  const iso = document.getElementById('iso');
  const dateTime = document.getElementById('dateTime');
  const signatureText = document.getElementById('signatureText');

  let selectedLogo = null;
  let typeFCachedSize = null;  // Type F 图框尺寸缓存
  let typeGCachedSize = null;  // Type G 图框尺寸缓存
  let typeHCachedSize = null;  // Type H 图框尺寸缓存
  let typeICachedSize = null;  // Type I 图框尺寸缓存
  let typeJCachedSize = null;  // Type J 图框尺寸缓存
  let typeKCachedSize = null;  // Type K 图框尺寸缓存
  let typeLCachedSize = null;  // Type L 图框尺寸缓存
  let typeMCachedSize = null;  // Type M 图框尺寸缓存

  async function initLogoGrid() {
    let logos = getAllLogos();
    if (window.electronAPI) {
      try {
        const serverLogos = await window.electronAPI.getLogos();
        if (serverLogos?.length > 0) logos = serverLogos;
      } catch (e) { /* ignore */ }
    }
    logoGrid.innerHTML = '';
    logos.forEach(name => {
      const item = document.createElement('div');
      item.className = 'logo-grid-item';
      item.dataset.logo = name;
      const img = document.createElement('img');
      img.alt = name;
      img.loading = 'lazy';
      img.src = `logos/${getLogoFilename(name)}`;
      item.appendChild(img);
      item.addEventListener('click', () => selectLogo(name));
      logoGrid.appendChild(item);
    });
  }

  function selectLogo(name) {
    selectedLogo = name;
    document.querySelectorAll('.logo-grid-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.logo === name);
    });
    if (name) {
      const previewImg = document.createElement('img');
      previewImg.alt = name;
      previewImg.style.maxWidth = '100%';
      previewImg.style.maxHeight = '100%';
      previewImg.style.objectFit = 'contain';
      previewImg.src = `logos/${getLogoFilename(name)}`;
      logoPreview.innerHTML = '';
      logoPreview.appendChild(previewImg);
      isLogoLight(name);
    } else {
      logoPreview.innerHTML = '';
    }
    updateBorderContent();
  }

  async function loadImageWithExif(file) {
    if (currentStyle === 'type-b') {
      const orientation = await checkImageOrientation(file);
      if (!orientation.isPortrait) {
        alert('目前本样式只适配纵向图像哦');
        return false;
      }
    }
    currentFile = file;
    currentImagePath = null;
    typeFCachedSize = null;  // 清除 Type F 图框缓存
    typeGCachedSize = null;  // 清除 Type G 图框缓存
    typeHCachedSize = null;  // 清除 Type H 图框缓存
    typeICachedSize = null;  // 清除 Type I 图框缓存
    typeJCachedSize = null;  // 清除 Type J 图框缓存
    typeKCachedSize = null;  // 清除 Type K 图框缓存
    typeLCachedSize = null;  // 清除 Type L 图框缓存
    typeMCachedSize = null;  // 清除 Type M 图框缓存
    // 释放旧的 Object URL 内存
    if (userImage.src && userImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(userImage.src);
    }
    resetForm();
    userImage.src = URL.createObjectURL(file);
    try {
      currentExif = await getExif(file);
      updateExifDisplay();
    } catch (error) {
      currentExif = {};
    }
    return true;
  }

  async function loadImageInElectron(imagePath) {
    if (currentStyle === 'type-b') {
      const orientation = await checkImageOrientation(imagePath);
      if (!orientation.isPortrait) {
        alert('目前本样式只适配纵向图像哦');
        return false;
      }
    }
    currentImagePath = imagePath;
    currentFile = null;
    typeFCachedSize = null;  // 清除 Type F 图框缓存
    typeGCachedSize = null;  // 清除 Type G 图框缓存
    typeHCachedSize = null;  // 清除 Type H 图框缓存
    typeICachedSize = null;  // 清除 Type I 图框缓存
    typeJCachedSize = null;  // 清除 Type J 图框缓存
    typeKCachedSize = null;  // 清除 Type K 图框缓存
    typeLCachedSize = null;  // 清除 Type L 图框缓存
    try {
      const exifTags = await window.electronAPI.readExif(imagePath);
      if (exifTags && Object.keys(exifTags).length > 0) {
        currentExif = {};
        for (const key in exifTags) {
          if (exifTags[key]?.description) currentExif[key] = exifTags[key].description;
          else if (exifTags[key]?.value !== undefined) currentExif[key] = exifTags[key].value;
        }
      } else {
        currentExif = {};
        const fileMtime = await window.electronAPI.getFileMtime(imagePath);
        if (fileMtime) {
          const dt = new Date(fileMtime);
          dateTime.value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }
      }
    } catch (error) {
      currentExif = {};
    }
    resetForm();
    userImage.src = `file://${imagePath}`;
    if (userImage.complete) {
      updateExifDisplay();
      updateBorder();
      applyDynamicBackground(userImage);
    } else {
      userImage.addEventListener('load', () => { updateExifDisplay(); updateBorder(); applyDynamicBackground(userImage); }, { once: true });
    }
  }

  function updateExifDisplay() {
    if (!currentExif) return;
    const make = currentExif.Make || currentExif.Model;
    if (make) {
      const makeName = getMakeName(make);
      const allLogos = getAllLogos();
      const matchedLogo = allLogos.find(logo => makeName.toLowerCase().includes(logo.toLowerCase()));
      if (matchedLogo) selectLogo(matchedLogo);
    }
    if (currentExif.Model) {
      const modelName = getModelName(currentExif.Model);
      if (currentStyle === 'type-f' || currentStyle === 'type-j') {
        const makeName = make ? getMakeName(make) : '';
        customModel.value = makeName ? `${makeName} ${modelName}` : modelName;
      } else {
        customModel.value = modelName;
      }
    }
    if (currentExif.FNumber) fNumber.value = typeof currentExif.FNumber === 'string' ? currentExif.FNumber.replace('f/', '').replace('F', '') : currentExif.FNumber;
    if (currentExif.ExposureTime) exposureTime.value = currentExif.ExposureTime;
    const focal = getFocalLength(currentExif);
    if (focal) focalLength.value = focal;
    if (currentExif.ISOSpeedRatings) iso.value = currentExif.ISOSpeedRatings;
    if (currentExif.DateTimeOriginal) {
      const parts = currentExif.DateTimeOriginal.match(/(\d{4})[-:](\d{2})[-:](\d{2}) (\d{2}):(\d{2})/);
      if (parts) dateTime.value = `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}`;
    }
  }

  styleCards.forEach(card => {
    card.addEventListener('click', async () => {
      currentStyle = card.dataset.style;
      if (window.electronAPI) {
        const imagePath = await window.electronAPI.selectImage();
        if (imagePath) {
          const success = await loadImageInElectron(imagePath);
          if (success !== false) showEditor();
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          if (e.target.files[0]) {
            const success = await loadImageWithExif(e.target.files[0]);
            if (success !== false) showEditor();
          }
        };
        input.click();
      }
    });
  });

  function showEditor() {
    appContainer.style.display = 'none';
    editorView.classList.remove('hidden');
    // 监听窗口大小变化，重新计算预览布局
    window.addEventListener('resize', updateBorder);
    const borderColorSection = document.querySelector('.edit-section:has(#borderColor)');
    if (borderColorSection) borderColorSection.style.display = (currentStyle === 'type-b' || currentStyle === 'type-e' || currentStyle === 'type-f' || currentStyle === 'type-g' || currentStyle === 'type-h' || currentStyle === 'type-i' || currentStyle === 'type-j' || currentStyle === 'type-k' || currentStyle === 'type-l' || currentStyle === 'type-m') ? 'none' : 'block';
    
    // 调用对应样式的面板配置模块
    const panelConfigurers = {
      'type-f': configureTypeF, 'type-g': configureTypeG,
      'type-h': configureTypeH, 'type-i': configureTypeI,
      'type-j': configureTypeJ, 'type-k': configureTypeK,
      'type-l': configureTypeL,
      'type-m': configureTypeM
    };
    panelConfigurers[currentStyle]?.();
    
    // Type B: 隐藏 Logo、拍摄参数、时间开关
    if (currentStyle === 'type-b') {
      const switchLogo = document.getElementById('switchLogo');
      if (switchLogo) switchLogo.style.display = 'none';
      const switchParams = document.getElementById('switchParams');
      if (switchParams) switchParams.style.display = 'none';
      const switchTime = document.getElementById('switchTime');
      if (switchTime) switchTime.style.display = 'none';
    }
    
    // Type E: 删除"原始比例"选项，隐藏所有"显示"开关
    if (currentStyle === 'type-e') {
      const aspectRatio = document.getElementById('aspectRatio');
      if (aspectRatio) {
        const originalOption = aspectRatio.querySelector('option[value="original"]');
        if (originalOption) originalOption.remove();
      }
      // 隐藏"显示相机 Logo"、"显示拍摄参数"、"显示拍摄时间"开关
      ['switchLogo', 'switchParams', 'switchTime'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const switchGroup = el.closest('.switch-group');
          if (switchGroup) switchGroup.style.display = 'none';
        }
      });
    }
    if (userImage.complete) {
      updateBorder();
      applyDynamicBackground(userImage);
    }
  }

  function hideEditor() {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', updateBorder);
    // 释放 Object URL 内存
    if (userImage.src && userImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(userImage.src);
    }
    // 重载页面，彻底重置所有 DOM 状态（避免样式切换后 UI 互相干扰）
    location.reload();
  }

  function resetForm() {
    selectedLogo = null;
    logoPreview.innerHTML = '';
    customModel.value = '';
    fNumber.value = '';
    exposureTime.value = '';
    focalLength.value = '';
    iso.value = '';
    dateTime.value = '';
    document.querySelectorAll('.logo-grid-item').forEach(item => item.classList.remove('selected'));
  }

  btnTemplate.addEventListener('click', hideEditor);
  btnReselect.addEventListener('click', async () => {
    if (window.electronAPI) {
      const imagePath = await window.electronAPI.selectImage();
      if (imagePath) await loadImageInElectron(imagePath);
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => { if (e.target.files[0]) loadImageWithExif(e.target.files[0]); };
      input.click();
    }
  });
  btnEdit.addEventListener('click', () => editPanel.classList.toggle('visible'));
  document.getElementById('btnClosePanel')?.addEventListener('click', () => editPanel.classList.remove('visible'));

  // 边框颜色预设按钮事件（仅 data-color 属性）
  document.querySelectorAll('.color-preset[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-preset[data-color]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      borderColor.value = btn.dataset.color;
      updateBorder();
    });
  });
  
  // 文字颜色预设按钮事件（仅 Type G 使用）
  document.getElementById('textColorPresets')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-text-color]');
    if (!btn) return;
    document.querySelectorAll('#textColorPresets .color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('textColor').value = btn.dataset.textColor;
    updateBorderContent();
  });
  
  document.getElementById('aspectRatio')?.addEventListener('change', updateBorder);

  function updateBorder() {
    if (!userImage.complete) return;
    const preview = getPreview(currentStyle || 'type-a');
    const shortSide = Math.min(userImage.clientWidth, userImage.clientHeight);
    const borderPercent = parseInt(borderHeight.value) || 12;

    if (currentStyle === 'type-b') {
      // 使用 Type B Preview 模块
      typeBPreview.init({
        img: userImage,
        frameWrapper: document.getElementById('frameWrapper'),
        photoFooter: photoFooter,
        borderContent: document.getElementById('borderContent')
      });
      typeBPreview.update({ naturalHeight: userImage.naturalHeight, naturalWidth: userImage.naturalWidth }, getDisplaySettings());
    } else if (currentStyle === 'type-e') {
      // 使用 Type E Preview 模块（与 Type B 一致的 API）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      preview.reset();
      
      // 计算尺寸
      const { squareSize, margin, canvasHeight } = preview.calcSize({
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      
      preview.updateFrameWrapper(squareSize);
      preview.updatePreview(squareSize, margin, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      updateBorderContent();
    } else if (currentStyle === 'type-f') {
      // 使用 Type F Preview 模块
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      // 只在首次加载或切换图片时计算原始画布尺寸
      if (!typeFCachedSize) {
        typeFCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: canvasW, canvasHeight: canvasH } = typeFCachedSize;
      // 根据当前预览区域大小计算显示尺寸
      const previewArea = frameWrapper?.parentElement;
      const availW = (previewArea?.clientWidth || 500) * 0.96;
      const availH = (previewArea?.clientHeight || 600) * 0.96;
      const displayScale = Math.min(availW / canvasW, availH / canvasH, 1);
      const displayW = Math.round(canvasW * displayScale);
      const displayH = Math.round(canvasH * displayScale);
      // 设置 frameWrapper 为显示尺寸（与预览区域匹配）
      preview.updateFrameWrapper(displayW, displayH);
      preview.updatePreview(displayW, displayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-g') {
      // 使用 Type G Preview 模块（与 Type F 相同的缩放逻辑）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      // 只在首次加载或切换图片时计算原始画布尺寸
      if (!typeGCachedSize) {
        typeGCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: gCanvasW, canvasHeight: gCanvasH } = typeGCachedSize;
      // 根据当前预览区域大小计算显示尺寸
      const gPreviewArea = frameWrapper?.parentElement;
      const gAvailW = (gPreviewArea?.clientWidth || 500) * 0.96;
      const gAvailH = (gPreviewArea?.clientHeight || 600) * 0.96;
      const gDisplayScale = Math.min(gAvailW / gCanvasW, gAvailH / gCanvasH, 1);
      const gDisplayW = Math.round(gCanvasW * gDisplayScale);
      const gDisplayH = Math.round(gCanvasH * gDisplayScale);
      // 设置 frameWrapper 为显示尺寸（与预览区域匹配）
      preview.updateFrameWrapper(gDisplayW, gDisplayH);
      preview.updatePreview(gDisplayW, gDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-h') {
      // 使用 Type H Preview 模块
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      if (!typeHCachedSize) {
        typeHCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: hCanvasW, canvasHeight: hCanvasH } = typeHCachedSize;
      const hPreviewArea = frameWrapper?.parentElement;
      const hAvailW = (hPreviewArea?.clientWidth || 500) * 0.96;
      const hAvailH = (hPreviewArea?.clientHeight || 600) * 0.96;
      const hDisplayScale = Math.min(hAvailW / hCanvasW, hAvailH / hCanvasH, 1);
      const hDisplayW = Math.round(hCanvasW * hDisplayScale);
      const hDisplayH = Math.round(hCanvasH * hDisplayScale);
      preview.updateFrameWrapper(hDisplayW, hDisplayH);
      preview.updatePreview(hDisplayW, hDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-i') {
      // 使用 Type I Preview 模块（与 Type H 相同的缩放逻辑）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      if (!typeICachedSize) {
        typeICachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: iCanvasW, canvasHeight: iCanvasH } = typeICachedSize;
      const iPreviewArea = frameWrapper?.parentElement;
      const iAvailW = (iPreviewArea?.clientWidth || 500) * 0.96;
      const iAvailH = (iPreviewArea?.clientHeight || 600) * 0.96;
      const iDisplayScale = Math.min(iAvailW / iCanvasW, iAvailH / iCanvasH, 1);
      const iDisplayW = Math.round(iCanvasW * iDisplayScale);
      const iDisplayH = Math.round(iCanvasH * iDisplayScale);
      preview.updateFrameWrapper(iDisplayW, iDisplayH);
      preview.updatePreview(iDisplayW, iDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-j') {
      // 使用 Type J Preview 模块（与 Type H 相同的缩放逻辑）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      if (!typeJCachedSize) {
        typeJCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: jCanvasW, canvasHeight: jCanvasH } = typeJCachedSize;
      const jPreviewArea = frameWrapper?.parentElement;
      const jAvailW = (jPreviewArea?.clientWidth || 500) * 0.96;
      const jAvailH = (jPreviewArea?.clientHeight || 600) * 0.96;
      const jDisplayScale = Math.min(jAvailW / jCanvasW, jAvailH / jCanvasH, 1);
      const jDisplayW = Math.round(jCanvasW * jDisplayScale);
      const jDisplayH = Math.round(jCanvasH * jDisplayScale);
      preview.updateFrameWrapper(jDisplayW, jDisplayH);
      preview.updatePreview(jDisplayW, jDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-k') {
      // 使用 Type K Preview 模块（与 Type H 相同的缩放逻辑）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      if (!typeKCachedSize) {
        typeKCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: kCanvasW, canvasHeight: kCanvasH } = typeKCachedSize;
      const kPreviewArea = frameWrapper?.parentElement;
      const kAvailW = (kPreviewArea?.clientWidth || 500) * 0.96;
      const kAvailH = (kPreviewArea?.clientHeight || 600) * 0.96;
      const kDisplayScale = Math.min(kAvailW / kCanvasW, kAvailH / kCanvasH, 1);
      const kDisplayW = Math.round(kCanvasW * kDisplayScale);
      const kDisplayH = Math.round(kCanvasH * kDisplayScale);
      preview.updateFrameWrapper(kDisplayW, kDisplayH);
      preview.updatePreview(kDisplayW, kDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-l') {
      // 使用 Type L Preview 模块（与 Type G 相同的缩放逻辑）
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      if (!typeLCachedSize) {
        typeLCachedSize = preview.calcSize({
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        });
      }
      const { squareSize: lCanvasW, canvasHeight: lCanvasH } = typeLCachedSize;
      const lPreviewArea = frameWrapper?.parentElement;
      const lAvailW = (lPreviewArea?.clientWidth || 500) * 0.96;
      const lAvailH = (lPreviewArea?.clientHeight || 600) * 0.96;
      const lDisplayScale = Math.min(lAvailW / lCanvasW, lAvailH / lCanvasH, 1);
      const lDisplayW = Math.round(lCanvasW * lDisplayScale);
      const lDisplayH = Math.round(lCanvasH * lDisplayScale);
      preview.updateFrameWrapper(lDisplayW, lDisplayH);
      preview.updatePreview(lDisplayW, lDisplayH, {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight
      });
      frameWrapper.style.transform = 'none';
      updateBorderContent();
    } else if (currentStyle === 'type-m') {
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({img: userImage, frameWrapper, photoFooter, borderContent});
      preview.reset();
      if (!typeMCachedSize) { typeMCachedSize = preview.calcSize({naturalWidth: userImage.naturalWidth, naturalHeight: userImage.naturalHeight}); }
      const { squareSize: mW, canvasHeight: mH } = typeMCachedSize;
      const mPA = frameWrapper?.parentElement; const mA = Math.min((mPA?.clientWidth||500)*0.96/mW, (mPA?.clientHeight||600)*0.96/mH, 1);
      const mDW = Math.round(mW*mA); const mDH = Math.round(mH*mA);
      preview.updateFrameWrapper(mDW, mDH); preview.updatePreview(mDW, mDH, {naturalWidth: userImage.naturalWidth, naturalHeight: userImage.naturalHeight});
      frameWrapper.style.transform = 'none'; updateBorderContent();
    } else {
      // 使用对应样式 Preview 模块
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      // 先 init 设置 state，再 reset 重置 HTML 结构
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      preview.reset();
      preview.updateFrameWrapper(frameWrapper);
      const footerHeight = Math.round(shortSide * (borderPercent / 100));
      preview.updatePreview(userImage, photoFooter, {
        borderColor: borderColor.value,
        borderHeight: footerHeight,
        borderHeightLabel,
        aspectRatio: document.getElementById('aspectRatio')?.value || 'default'
      });
      updateBorderContent();
    }
  }
  
  function getDisplaySettings() {
    return {
      selectedLogo,
      showLogo: document.getElementById('switchLogo')?.classList.contains('active'),
      showModel: document.getElementById('switchModel')?.classList.contains('active'),
      customModel: customModel?.value || '',
      showParams: document.getElementById('switchParams')?.classList.contains('active'),
      fNumber: fNumber?.value || '',
      exposureTime: exposureTime?.value || '',
      focalLength: focalLength?.value || '',
      iso: iso?.value || '',
      showTime: document.getElementById('switchTime')?.classList.contains('active'),
      dateTime: dateTime?.value || '',
      signatureText: signatureText?.value || '',
      textColor: document.getElementById('textColor')?.value || '#000000'
    };
  }

  async function updateBorderContent() {
    const preview = getPreview(currentStyle || 'type-a');
    if (currentStyle === 'type-b') {
      // Type B 使用模块更新（已在 updateBorder 中初始化）
      typeBPreview.update({ naturalHeight: userImage.naturalHeight, naturalWidth: userImage.naturalWidth }, getDisplaySettings());
    } else {
      preview.updateContentPreview(
        {
          borderLogo: document.getElementById('borderLogo'),
          borderModel: document.getElementById('borderModel'),
          borderParams: document.getElementById('borderParams'),
          borderFocal: document.getElementById('borderFocal'),
          borderSignature: document.getElementById('borderSignature'),
          borderTime: document.getElementById('borderTime')
        },
        {
          selectedLogo,
          isLightLogo: logoBrightnessCache[selectedLogo]?.isLight,
          showLogo: document.getElementById('switchLogo')?.classList.contains('active'),
          showModel: document.getElementById('switchModel')?.classList.contains('active'),
          customModel: customModel?.value || '',
          showParams: document.getElementById('switchParams')?.classList.contains('active'),
          fNumber: fNumber?.value || '',
          exposureTime: exposureTime?.value || '',
          iso: iso?.value || '',
          focalLength: focalLength?.value || '',
          showTime: document.getElementById('switchTime')?.classList.contains('active'),
          dateTime: dateTime?.value || '',
      signatureText: signatureText?.value || '',
      borderColor: borderColor.value,
      textColor: document.getElementById('textColor')?.value || '#000000'
        }
      );
    }
  }

  borderColor.addEventListener('input', updateBorder);
  borderHeight.addEventListener('input', updateBorder);
  userImage.addEventListener('load', () => {
    updateBorder();
    applyDynamicBackground(userImage);
  });

  ['customModel', 'fNumber', 'exposureTime', 'focalLength', 'iso', 'dateTime', 'signatureText'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateBorderContent);
  });
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => { sw.classList.toggle('active'); updateBorderContent(); });
  });

  function getEditSettings() {
    return {
      styleId: currentStyle || 'type-a',
      showLogo: document.getElementById('switchLogo')?.classList.contains('active') ?? false,
      selectedLogo: selectedLogo || '',
      showModel: document.getElementById('switchModel')?.classList.contains('active') ?? false,
      customModel: customModel?.value || '',
      showParams: document.getElementById('switchParams')?.classList.contains('active') ?? false,
      fNumber: fNumber?.value || '',
      exposureTime: exposureTime?.value || '',
      focalLength: focalLength?.value || '',
      iso: iso?.value || '',
      showTime: document.getElementById('switchTime')?.classList.contains('active') ?? false,
      dateTime: dateTime?.value || '',
      showSignature: document.getElementById('switchSignature')?.classList.contains('active') ?? false,
      signatureText: signatureText?.value || '',
      borderColor: borderColor?.value || '#ffffff',
      borderHeight: borderHeight?.value || 12,
      aspectRatio: document.getElementById('aspectRatio')?.value || 'default',
      textColor: document.getElementById('textColor')?.value || '#000000'
    };
  }

  async function exportImageHandler() {
    if (!userImage.src || !userImage.complete) {
      alert('请先选择图片');
      return;
    }
    try {
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      const settings = getEditSettings();
      const exportOptions = {
        file: currentFile,
        imagePath: currentImagePath,
        borderColor: settings.borderColor,
        borderHeight: settings.borderHeight,
        quality: 1.0,
        settings: settings
      };
      
      // Type E 需要传递图片偏移量和预览 squareSize（用于裁剪区域和文字缩放）
      if (currentStyle === 'type-e') {
        exportOptions.imageOffset = typeEPreview.getNormalizedOffset();
        exportOptions.previewSquareSize = typeEPreview.getState().squareSize;
      }
      
      const blob = await exportImage(userImage, exportOptions);
      if (window.electronAPI) {
        // Electron 环境
        let exportFilename = 'output-OneFrame.jpg';
        if (currentImagePath) {
          const nameWithoutExt = currentImagePath.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
          exportFilename = `${nameWithoutExt}-OneFrame.jpg`;
        } else if (currentFile?.name) {
          exportFilename = `${currentFile.name.replace(/\.[^.]+$/, '')}-OneFrame.jpg`;
        }
        const savePath = await window.electronAPI.saveImage(exportFilename);
        if (savePath) {
          const buffer = Array.from(new Uint8Array(await blob.arrayBuffer()));
          const result = await window.electronAPI.saveBlob(buffer, savePath);
          if (result.success) alert('导出成功！\n保存至: ' + result.path);
          else alert('导出失败: ' + result.error);
        }
      } else {
        // 浏览器环境：直接下载
        const exportFilename = currentFile?.name
          ? `${currentFile.name.replace(/\.[^.]+$/, '')}-OneFrame.jpg`
          : 'output-OneFrame.jpg';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('导出失败: ' + error.message);
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fas fa-save"></i><span>保存</span>';
    }
  }

  btnSave.addEventListener('click', exportImageHandler);
  document.getElementById('btnExport')?.addEventListener('click', exportImageHandler);
  document.getElementById('btnExportTop')?.addEventListener('click', exportImageHandler);
  initLogoGrid();

  document.querySelectorAll('.style-preview .frame-container img').forEach(img => {
    img.addEventListener('load', function() {
      const footer = this.nextElementSibling;
      if (footer?.classList.contains('photo-footer')) {
        footer.style.height = `${Math.round(Math.min(this.clientWidth, this.clientHeight) * 0.12)}px`;
      }
    });
  });


  // ========== 关于模态框逻辑 ==========
  const aboutBtn = document.getElementById('aboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const modalClose = document.getElementById('modalClose');

  if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', () => {
      aboutModal.classList.remove('hidden');
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
      });
    }

    // 点击遮罩区域关闭模态框
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.add('hidden');
      }
    });
  }
});

// OneFrame 主程序
import { getExif, formatDateTime, getFocalLength, getPhysicalFocalLength, getExposureModeLabel, formatExposureBias } from './exif.js';
import { getModelName, getAllLogos, getLogoFilename, getMakeName } from './logo-utils.js';
import { getPreview, typeEPreview, typeRPreview, typeSPreview, typeTPreview } from './styles/index.js';
import { fitCanvasToPreview } from './styles/preview-scale.js';
import { configureEditPanel as configureTypeF } from './components/type-F-editor-panel.js';
import { configureEditPanel as configureTypeG } from './components/type-G-editor-panel.js';
import { configureEditPanel as configureTypeH } from './components/type-H-editor-panel.js';
import { configureEditPanel as configureTypeI } from './components/type-I-editor-panel.js';
import { configureEditPanel as configureTypeJ } from './components/type-J-editor-panel.js';
import { configureEditPanel as configureTypeK } from './components/type-K-editor-panel.js';
import { configureEditPanel as configureTypeL } from './components/type-L-editor-panel.js';
import { configureEditPanel as configureTypeM } from './components/type-M-editor-panel.js';
import { configureEditPanel as configureTypeN } from './components/type-N-editor-panel.js';
import { configureEditPanel as configureTypeO } from './components/type-O-editor-panel.js';
import { configureEditPanel as configureTypeP } from './components/type-P-editor-panel.js';
import { configureEditPanel as configureTypeQ } from './components/type-Q-editor-panel.js';
import { configureEditPanel as configureTypeR } from './components/type-R-editor-panel.js';
import { configureEditPanel as configureTypeS } from './components/type-S-editor-panel.js';
import { configureEditPanel as configureTypeT } from './components/type-T-editor-panel.js';
import { exportImage } from './exporter.js';
import { initHomepageThumbnails } from './thumbnail-selector.js';
import { EXPORT_NAMING_MODE } from './config.js';
import { isMobile, initMobileLayout, initSwipeToClose, lockBodyScroll, unlockBodyScroll } from './mobile.js';

let currentExif = null;
let currentFile = null;
let currentImagePath = null;
let currentStyle = null;
let imageLoadSequence = 0;

/**
 * styleId（如 'type-a'）转换为 Type 名称（如 'TypeA'）。
 * 用于导出文件命名。
 * @param {string} styleId
 * @returns {string}
 */
function styleIdToTypeName(styleId) {
  const match = styleId.match(/^type-(.)(.*)$/);
  if (!match) return styleId.charAt(0).toUpperCase() + styleId.slice(1);
  return 'Type' + match[1].toUpperCase() + match[2];
}

/**
 * 将 EXIF 日期或文件时间转换为 datetime-local 输入框格式
 * @param {string|Date|number} value
 * @returns {string}
 */
function formatDateTimeForInput(value) {
  if (!value) return '';

  const str = String(value).trim();
  const parts = str.match(/(\d{4})[-:](\d{2})[-:](\d{2})[ T](\d{2}):(\d{2})/);
  if (parts) {
    return `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4]}:${parts[5]}`;
  }

  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return '';

  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

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
  // 移动端检测和初始化
  if (isMobile) initMobileLayout();
  
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

  // P4：设计画布缓存 Map（F–T 迁移后统一由此缓存；图片加载与 S/T 比例切换时失效）
  const previewDesignCache = new Map();

  // Type O 胶片数据 { version, manufacturers, films }
  let filmsData = { version: 3, manufacturers: [], films: {} };

  /**
   * 重建胶片型号 datalist：按所选胶片品牌从 films[品牌] 填充 #filmPresets（#filmStyle 可输入也可下拉）
   */
  function rebuildFilmModelOptions() {
    const brandSelect = document.getElementById('filmBrand');
    const datalist = document.getElementById('filmPresets');
    if (!datalist) return;
    const brand = brandSelect?.value || '';
    const films = (filmsData.films && filmsData.films[brand]) || [];
    datalist.innerHTML = '';
    films.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f;
      datalist.appendChild(opt);
    });
  }

  /**
   * 加载 films.json（Type O 厂商/胶片数据），失败时回退空表不影响其他样式
   */
  async function initFilms() {
    try {
      const resp = await fetch('films.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      if (data && Array.isArray(data.manufacturers) && data.films) {
        filmsData = data;
        const select = document.getElementById('manufacturerSelect');
        if (select) {
          select.innerHTML = '';
          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = '-- 请选择厂商 --';
          select.appendChild(placeholder);
          data.manufacturers.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            select.appendChild(opt);
          });
        }
        // 胶片品牌：取有胶片条目的品牌（多级下拉第 1 级）
        const brandSelect = document.getElementById('filmBrand');
        if (brandSelect) {
          brandSelect.innerHTML = '';
          const bPlaceholder = document.createElement('option');
          bPlaceholder.value = '';
          bPlaceholder.textContent = '-- 选择品牌 --';
          brandSelect.appendChild(bPlaceholder);
          Object.keys(data.films).forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            brandSelect.appendChild(opt);
          });
        }
        rebuildFilmModelOptions();
      }
    } catch (err) {
      console.warn('films.json 加载失败，Type O 胶片下拉回退为空：', err);
    }
  }

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

  async function loadImageWithExif(file, options = {}) {
    const loadId = ++imageLoadSequence;

    if (currentStyle === 'type-b') {
      const orientation = await checkImageOrientation(file);
      if (loadId !== imageLoadSequence) return false;
      if (!orientation.isPortrait) {
        alert('目前本样式只适配纵向图像哦');
        return false;
      }
    }
    currentFile = file;
    currentImagePath = null;
    previewDesignCache.clear();  // P4：清空设计画布缓存（F–T）
    // 释放旧的 Object URL 内存
    if (userImage.src && userImage.src.startsWith('blob:')) {
      URL.revokeObjectURL(userImage.src);
    }
    const preservedTopFields = options.preserveTopLines ? captureTopLineFields() : null;
    resetForm();
    restoreTopLineFields(preservedTopFields);
    if (currentStyle === 'type-e') {
      typeEPreview.resetImageOffset();
    } else if (currentStyle === 'type-r') {
      typeRPreview.resetImageOffset();
    } else if (currentStyle === 'type-s') {
      typeSPreview.resetImageOffset();
    } else if (currentStyle === 'type-t') {
      typeTPreview.resetImageOffset();
    }
    userImage.src = URL.createObjectURL(file);
    try {
      const nextExif = await getExif(file);
      if (loadId !== imageLoadSequence) return false;
      currentExif = nextExif || {};
      updateExifDisplay();
      updateBorderContent();
    } catch (error) {
      if (loadId !== imageLoadSequence) return false;
      currentExif = {};
    }
    return true;
  }

  async function loadImageInElectron(imagePath, options = {}) {
    const loadId = ++imageLoadSequence;

    if (currentStyle === 'type-b') {
      const orientation = await checkImageOrientation(imagePath);
      if (loadId !== imageLoadSequence) return false;
      if (!orientation.isPortrait) {
        alert('目前本样式只适配纵向图像哦');
        return false;
      }
    }
    currentImagePath = imagePath;
    currentFile = null;
    previewDesignCache.clear();  // P4：清空设计画布缓存（F–T）
    let nextExif = {};
    let fallbackDateTimeValue = '';
    try {
      const exifTags = await window.electronAPI.readExif(imagePath);
      if (loadId !== imageLoadSequence) return false;
      if (exifTags && Object.keys(exifTags).length > 0) {
        nextExif = {};
        for (const key in exifTags) {
          if (exifTags[key]?.description) nextExif[key] = exifTags[key].description;
          else if (exifTags[key]?.value !== undefined) nextExif[key] = exifTags[key].value;
        }
      } else {
        nextExif = {};
        const fileMtime = await window.electronAPI.getFileMtime(imagePath);
        if (loadId !== imageLoadSequence) return false;
        if (fileMtime) {
          fallbackDateTimeValue = formatDateTimeForInput(fileMtime);
        }
      }
    } catch (error) {
      nextExif = {};
    }
    if (loadId !== imageLoadSequence) return false;

    currentExif = nextExif;
    const preservedTopFields = options.preserveTopLines ? captureTopLineFields() : null;
    resetForm();
    restoreTopLineFields(preservedTopFields);
    if (currentStyle === 'type-e') {
      typeEPreview.resetImageOffset();
    } else if (currentStyle === 'type-r') {
      typeRPreview.resetImageOffset();
    } else if (currentStyle === 'type-s') {
      typeSPreview.resetImageOffset();
    } else if (currentStyle === 'type-t') {
      typeTPreview.resetImageOffset();
    }
    updateExifDisplay();
    if (!currentExif.DateTimeOriginal && fallbackDateTimeValue) {
      dateTime.value = fallbackDateTimeValue;
    }
    userImage.src = `file://${imagePath}`;
    if (userImage.complete) {
      updateBorder();
      applyDynamicBackground(userImage);
    } else {
      userImage.addEventListener('load', () => {
        if (loadId !== imageLoadSequence) return;
        updateBorder();
        applyDynamicBackground(userImage);
      }, { once: true });
    }
    return true;
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
      } else if (currentStyle !== 'type-o') {
        customModel.value = modelName;
      }
    }
    if (currentExif.FNumber) fNumber.value = typeof currentExif.FNumber === 'string' ? currentExif.FNumber.replace('f/', '').replace('F', '') : currentExif.FNumber;
    if (currentExif.ExposureTime) exposureTime.value = currentExif.ExposureTime;
    const focal = getFocalLength(currentExif);
    if (focal) focalLength.value = focal;
    if (currentExif.ISOSpeedRatings) iso.value = currentExif.ISOSpeedRatings;
    if (currentExif.DateTimeOriginal) {
      const formattedDateTime = formatDateTimeForInput(currentExif.DateTimeOriginal);
      if (formattedDateTime) dateTime.value = formattedDateTime;
    }
    // Type R：预填胶片边缘打印参数（全部可手输覆盖）
    if (currentStyle === 'type-r') {
      const frameInput = document.getElementById('frameNumber');
      if (frameInput && !frameInput.value) frameInput.value = '01';
      const modeInput = document.getElementById('printExposureMode');
      if (modeInput) {
        const mode = getExposureModeLabel(currentExif);
        if (mode) modeInput.value = mode;
      }
      const shutterInput = document.getElementById('printExposureTime');
      if (shutterInput && currentExif.ExposureTime) shutterInput.value = currentExif.ExposureTime;
      const apertureInput = document.getElementById('printFNumber');
      if (apertureInput && currentExif.FNumber) {
        const f = typeof currentExif.FNumber === 'string' ? currentExif.FNumber.replace('f/', '').replace('F', '') : currentExif.FNumber;
        apertureInput.value = `F${f}`;
      }
      const biasInput = document.getElementById('printExposureBias');
      if (biasInput) {
        const bias = formatExposureBias(currentExif);
        if (bias) biasInput.value = bias;
      }
      const focalInput = document.getElementById('printFocalLength');
      if (focalInput) {
        const pf = getPhysicalFocalLength(currentExif);
        if (pf) focalInput.value = pf;
      }
      // 日期：EXIF DateTimeOriginal 预填；无则默认今天
      const dateInput = document.getElementById('printDate');
      if (dateInput) {
        const m = String(currentExif.DateTimeOriginal || '').match(/(\d{4})[-:/](\d{2})[-:/](\d{2})/);
        if (m) {
          dateInput.value = `${m[1]}-${m[2]}-${m[3]}`;
        } else if (!dateInput.value) {
          const now = new Date();
          dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
      }
    }
    // Type S：预填右下参数与日期（全部可手输覆盖）
    if (currentStyle === 'type-s') {
      const isoSInput = document.getElementById('isoS');
      if (isoSInput && currentExif.ISOSpeedRatings) isoSInput.value = currentExif.ISOSpeedRatings;
      const focalSInput = document.getElementById('focalS');
      if (focalSInput) {
        const pf = getPhysicalFocalLength(currentExif);
        if (pf) focalSInput.value = pf;
      }
      const fNumSInput = document.getElementById('fNumberS');
      if (fNumSInput && currentExif.FNumber) {
        fNumSInput.value = typeof currentExif.FNumber === 'string'
          ? currentExif.FNumber.replace(/^f\s*\/?\s*/i, '').replace(/^F/, '')
          : currentExif.FNumber;
      }
      const shutterSInput = document.getElementById('shutterS');
      if (shutterSInput && currentExif.ExposureTime) shutterSInput.value = currentExif.ExposureTime;
      const dateSInput = document.getElementById('dateS');
      if (dateSInput) {
        const m = String(currentExif.DateTimeOriginal || '').match(/(\d{4})[-:/](\d{2})[-:/](\d{2})/);
        if (m) {
          dateSInput.value = `${m[1]}-${m[2]}-${m[3]}`;
        } else if (!dateSInput.value) {
          const now = new Date();
          dateSInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
      }
    }
    // Type T：预填右下参数与日期（全部可手输覆盖）
    if (currentStyle === 'type-t') {
      const isoTInput = document.getElementById('isoT');
      if (isoTInput && currentExif.ISOSpeedRatings) isoTInput.value = currentExif.ISOSpeedRatings;
      const focalTInput = document.getElementById('focalT');
      if (focalTInput) {
        const pf = getPhysicalFocalLength(currentExif);
        if (pf) focalTInput.value = pf;
      }
      const fNumTInput = document.getElementById('fNumberT');
      if (fNumTInput && currentExif.FNumber) {
        fNumTInput.value = typeof currentExif.FNumber === 'string'
          ? currentExif.FNumber.replace(/^f\s*\/?\s*/i, '').replace(/^F/, '')
          : currentExif.FNumber;
      }
      const shutterTInput = document.getElementById('shutterT');
      if (shutterTInput && currentExif.ExposureTime) shutterTInput.value = currentExif.ExposureTime;
      const dateTInput = document.getElementById('dateT');
      if (dateTInput) {
        const m = String(currentExif.DateTimeOriginal || '').match(/(\d{4})[-:/](\d{2})[-:/](\d{2})/);
        if (m) {
          dateTInput.value = `${m[1]}-${m[2]}-${m[3]}`;
        } else if (!dateTInput.value) {
          const now = new Date();
          dateTInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
      }
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
    if (borderColorSection) borderColorSection.style.display = (currentStyle === 'type-b' || currentStyle === 'type-e' || currentStyle === 'type-f' || currentStyle === 'type-g' || currentStyle === 'type-h' || currentStyle === 'type-i' || currentStyle === 'type-j' || currentStyle === 'type-k' || currentStyle === 'type-l' || currentStyle === 'type-m' || currentStyle === 'type-n' || currentStyle === 'type-p' || currentStyle === 'type-q' || currentStyle === 'type-r' || currentStyle === 'type-s' || currentStyle === 'type-t') ? 'none' : 'block';
    
    // 调用对应样式的面板配置模块
    const panelConfigurers = {
      'type-f': configureTypeF, 'type-g': configureTypeG,
      'type-h': configureTypeH, 'type-i': configureTypeI,
      'type-j': configureTypeJ, 'type-k': configureTypeK,
      'type-l': configureTypeL,
      'type-m': configureTypeM,
      'type-n': configureTypeN,
      'type-o': configureTypeO,
      'type-p': configureTypeP,
      'type-q': configureTypeQ,
      'type-r': configureTypeR,
      'type-s': configureTypeS,
      'type-t': configureTypeT
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

  // Type S/T：重选图片时保留左上第一行与 PHOTO BY 的手输内容
  function captureTopLineFields() {
    const groups = {
      'type-s': ['topLineS', 'photoByS'],
      'type-t': ['topLineT', 'photoByT']
    };
    const ids = groups[currentStyle];
    if (!ids) return null;
    const saved = {};
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value;
    });
    return saved;
  }

  function restoreTopLineFields(saved) {
    if (!saved) return;
    Object.keys(saved).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = saved[id];
    });
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
    // Type R 打印参数：序号重置为 01，其余清空（随后由 EXIF 预填）
    const frameNumberEl = document.getElementById('frameNumber');
    if (frameNumberEl) frameNumberEl.value = '01';
    ['printExposureMode', 'printExposureTime', 'printFNumber', 'printExposureBias', 'printFocalLength', 'printDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Type S 文字与右下参数：清空（随后由 EXIF 预填）
    ['topLineS', 'photoByS', 'dateS', 'isoS', 'focalS', 'fNumberS', 'shutterS'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Type T 文字与右下参数：清空（随后由 EXIF 预填）
    ['topLineT', 'photoByT', 'dateT', 'isoT', 'focalT', 'fNumberT', 'shutterT'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const manufacturerSelect = document.getElementById('manufacturerSelect');
    if (manufacturerSelect) manufacturerSelect.value = '';
    const filmBrandSelect = document.getElementById('filmBrand');
    if (filmBrandSelect) filmBrandSelect.value = '';
    const filmStyleSelect = document.getElementById('filmStyle');
    if (filmStyleSelect) filmStyleSelect.value = '';
    document.querySelectorAll('.logo-grid-item').forEach(item => item.classList.remove('selected'));
  }

  btnTemplate.addEventListener('click', hideEditor);
  btnReselect.addEventListener('click', async () => {
    if (window.electronAPI) {
      const imagePath = await window.electronAPI.selectImage();
      if (imagePath) await loadImageInElectron(imagePath, { preserveTopLines: true });
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => { if (e.target.files[0]) await loadImageWithExif(e.target.files[0], { preserveTopLines: true }); };
      input.click();
    }
  });
  btnEdit.addEventListener('click', () => {
    editPanel.classList.toggle('visible');
    if (isMobile && editPanel.classList.contains('visible')) {
      lockBodyScroll();
      initSwipeToClose(editPanel, () => {
        editPanel.classList.remove('visible');
        unlockBodyScroll();
      });
    } else if (isMobile) {
      unlockBodyScroll();
    }
  });
  document.getElementById('btnClosePanel')?.addEventListener('click', () => {
    editPanel.classList.remove('visible');
    if (isMobile) unlockBodyScroll();
  });
  // 移动端：点击画布区域关闭编辑面板
  if (isMobile) {
    document.querySelector('.preview-area')?.addEventListener('click', (e) => {
      if (editPanel.classList.contains('visible')) {
        editPanel.classList.remove('visible');
        unlockBodyScroll();
      }
    });
  }

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

  // Q 署名颜色预设按钮事件（仅 Type Q 使用：黑/白/主色）
  document.getElementById('qSignatureColorPresets')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qcolor]');
    if (!btn) return;
    document.querySelectorAll('#qSignatureColorPresets .color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('qSignatureColor').value = btn.dataset.qcolor;
    updateBorderContent();
  });
  
  document.getElementById('aspectRatio')?.addEventListener('change', updateBorder);

  function updateBorder() {
    if (!userImage.complete) return;
    // P3 修订：清除 Type B 设置的照片圆角（B 在自身 updatePreview 中重新设置；避免 B→其他样式行内残留）
    userImage.style.borderRadius = '';
    const preview = getPreview(currentStyle || 'type-a');

    if (currentStyle === 'type-a' || currentStyle === 'type-b' || currentStyle === 'type-c' || currentStyle === 'type-d' || currentStyle === 'type-e' ||
               currentStyle === 'type-f' || currentStyle === 'type-g' || currentStyle === 'type-h' || currentStyle === 'type-i' || currentStyle === 'type-j' ||
               currentStyle === 'type-k' || currentStyle === 'type-l' || currentStyle === 'type-m' || currentStyle === 'type-n' || currentStyle === 'type-o' ||
               currentStyle === 'type-p' || currentStyle === 'type-q' || currentStyle === 'type-r' || currentStyle === 'type-s' || currentStyle === 'type-t') {
      // [UNIFIED P1–P4] Type A–T 填满式统一缩放路径（全部 20 样式统一机制）
      // 设计画布 = A/C/D：图片+底栏（borderPercent 计入）；B：设计方形（naturalHeight×1.1）；E：短边×1.5 纵向画布；F–T：各自 calcSize 设计尺寸（S/T 含比例参数）；适配 = 统一 0.96 fit
      const frameWrapper = document.getElementById('frameWrapper');
      const borderContent = document.getElementById('borderContent');
      preview.init({
        img: userImage,
        frameWrapper: frameWrapper,
        photoFooter: photoFooter,
        borderContent: borderContent
      });
      preview.reset();
      const designSettings = {
        naturalWidth: userImage.naturalWidth,
        naturalHeight: userImage.naturalHeight,
        borderPercent: parseInt(borderHeight.value) || 12,
        // P4 批3：S/T 比例参数（S 用 canvasRatioS；T 用 ratioT；其余样式忽略）
        canvasRatioS: document.getElementById('canvasRatioS')?.value || '1:1',
        ratioT: document.getElementById('ratioT')?.value || '1:1'
      };
      // P4：F–T 保留旧版“按图片加载周期缓存设计尺寸”语义（图片加载与 S/T 比例切换时失效）；A–E 维持现算
      const usesDesignCache = ['type-f', 'type-g', 'type-h', 'type-i', 'type-j',
                               'type-k', 'type-l', 'type-m', 'type-n', 'type-o',
                               'type-p', 'type-q', 'type-r', 'type-s', 'type-t'].includes(currentStyle);
      let design;
      if (usesDesignCache) {
        if (!previewDesignCache.has(currentStyle)) {
          previewDesignCache.set(currentStyle, preview.calcSize(designSettings));
        }
        design = previewDesignCache.get(currentStyle);
      } else {
        design = preview.calcSize(designSettings);
      }
      if (design) {
        const previewArea = frameWrapper ? frameWrapper.parentElement : null;
        // P4：A–E 返回 canvasWidth/canvasHeight；F–T 返回 squareSize（= 设计宽）/canvasHeight —— 统一归一（0px）
        const designWidth = design.canvasWidth != null ? design.canvasWidth : design.squareSize;
        const designHeight = design.canvasHeight;
        const { width: displayWidth, height: displayHeight } = fitCanvasToPreview(
          designWidth,
          designHeight,
          previewArea
        );
        preview.updateFrameWrapper(displayWidth, displayHeight);
        preview.updatePreview(displayWidth, displayHeight, {
          naturalWidth: userImage.naturalWidth,
          naturalHeight: userImage.naturalHeight
        }, {
          borderColor: borderColor.value,
          borderPercent: parseInt(borderHeight.value) || 12,
          borderHeightLabel,
          aspectRatio: document.getElementById('aspectRatio')?.value || 'default'
        });
      }
      updateBorderContent();
    }
  }
  
  async function updateBorderContent() {
    const preview = getPreview(currentStyle || 'type-a');
    // P3：统一清理 Type B 残留容器（修复 B→其他样式泄漏；B 自身随后经统一路径重建）
    document.querySelector('.type-b-main-container')?.remove();
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
          textColor: document.getElementById('textColor')?.value || '#000000',
          manufacturer: document.getElementById('manufacturerSelect')?.value || '',
          filmStyle: document.getElementById('filmStyle')?.value || '',
          showSignatureQ: document.getElementById('switchSignatureQ')?.classList.contains('active') ?? true,
          signatureColorQ: document.getElementById('qSignatureColor')?.value || '#000000',
          frameNumber: document.getElementById('frameNumber')?.value || '01',
          printExposureMode: document.getElementById('printExposureMode')?.value || '',
          printExposureTime: document.getElementById('printExposureTime')?.value || '',
          printFNumber: document.getElementById('printFNumber')?.value || '',
          printExposureBias: document.getElementById('printExposureBias')?.value || '',
          printFocalLength: document.getElementById('printFocalLength')?.value || '',
          printDate: document.getElementById('printDate')?.value || '',
          canvasRatioS: document.getElementById('canvasRatioS')?.value || '1:1',
          topLineS: document.getElementById('topLineS')?.value || '',
          photoByS: document.getElementById('photoByS')?.value || '',
          dateS: document.getElementById('dateS')?.value || '',
          isoS: document.getElementById('isoS')?.value || '',
          focalS: document.getElementById('focalS')?.value || '',
          fNumberS: document.getElementById('fNumberS')?.value || '',
          shutterS: document.getElementById('shutterS')?.value || '',
          textColorS: document.getElementById('typeSColor')?.value || 'dominant',
          ratioT: document.getElementById('ratioT')?.value || '1:1',
          topLineT: document.getElementById('topLineT')?.value || '',
          photoByT: document.getElementById('photoByT')?.value || '',
          dateT: document.getElementById('dateT')?.value || '',
          isoT: document.getElementById('isoT')?.value || '',
          focalT: document.getElementById('focalT')?.value || '',
          fNumberT: document.getElementById('fNumberT')?.value || '',
          shutterT: document.getElementById('shutterT')?.value || '',
          textColorT: document.getElementById('typeTColor')?.value || '#ffffff'
        }
      );
    // }
  }

  borderColor.addEventListener('input', updateBorder);
  borderHeight.addEventListener('input', updateBorder);
  userImage.addEventListener('load', () => {
    updateBorder();
    applyDynamicBackground(userImage);
  });

  ['customModel', 'fNumber', 'exposureTime', 'focalLength', 'iso', 'dateTime', 'signatureText', 'filmStyle', 'frameNumber', 'printExposureMode', 'printExposureTime', 'printFNumber', 'printExposureBias', 'printFocalLength', 'printDate', 'topLineS', 'photoByS', 'dateS', 'isoS', 'focalS', 'fNumberS', 'shutterS', 'topLineT', 'photoByT', 'dateT', 'isoT', 'focalT', 'fNumberT', 'shutterT'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateBorderContent);
  });
  // 曝光模式下拉：change 事件确保更新
  document.getElementById('printExposureMode')?.addEventListener('change', updateBorderContent);

  // ========== Type S 控件 ==========
  // 画布比例切换：清除尺寸缓存并重新布局
  document.getElementById('canvasRatioS')?.addEventListener('change', () => {
    previewDesignCache.delete('type-s');  // P4：S 画布比例切换 → 失效 S 设计尺寸缓存
    previewDesignCache.delete('type-t');  // 保留旧版“切 S 同时清 T 缓存”的语义
    updateBorder();
  });

  // 文字颜色预设（主色 / 黑 / 自定义）
  document.getElementById('typeSColorPresets')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-scolor]');
    if (!btn) return;
    const val = btn.dataset.scolor;
    document.querySelectorAll('#typeSColorPresets .color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const hidden = document.getElementById('typeSColor');
    const picker = document.getElementById('typeSColorPicker');
    if (val === 'custom') {
      if (hidden) hidden.value = picker?.value || '#000000';
    } else {
      if (hidden) hidden.value = val;
      if (val !== 'dominant' && picker) picker.value = val;
    }
    updateBorderContent();
  });

  // 原生选色器
  document.getElementById('typeSColorPicker')?.addEventListener('input', (e) => {
    const hidden = document.getElementById('typeSColor');
    if (hidden) hidden.value = e.target.value;
    document.querySelectorAll('#typeSColorPresets .color-preset').forEach(b => {
      b.classList.toggle('active', b.dataset.scolor === 'custom');
    });
    updateBorderContent();
  });

  // 点选图片取色
  let typeSPicking = false;
  const typeSPickBtn = document.getElementById('typeSPickBtn');
  const stopTypeSPick = () => {
    typeSPicking = false;
    typeSPickBtn?.classList.remove('active');
    if (userImage) userImage.style.cursor = '';
  };
  typeSPickBtn?.addEventListener('click', () => {
    typeSPicking = !typeSPicking;
    typeSPickBtn.classList.toggle('active', typeSPicking);
    if (userImage) userImage.style.cursor = typeSPicking ? 'crosshair' : '';
  });
  userImage.addEventListener('click', (e) => {
    if (!typeSPicking || currentStyle !== 'type-s') return;
    const hex = sampleTypeSColor(e);
    if (hex) {
      const hidden = document.getElementById('typeSColor');
      if (hidden) hidden.value = hex;
      const picker = document.getElementById('typeSColorPicker');
      if (picker) picker.value = hex;
      document.querySelectorAll('#typeSColorPresets .color-preset').forEach(b => {
        b.classList.toggle('active', b.dataset.scolor === 'custom');
      });
      updateBorderContent();
    }
    stopTypeSPick();
  });

  /**
   * 从点击位置采样图片像素颜色（考虑 cover 裁剪与拖动偏移）
   * @param {MouseEvent} e
   * @returns {string|null} #rrggbb
   */
  function sampleTypeSColor(e) {
    if (!userImage.complete || !userImage.naturalWidth) return null;
    const st = typeSPreview.getState();
    const rect = st.photoRect;
    if (!rect || !rect.w || !rect.h) return null;
    const nW = userImage.naturalWidth;
    const nH = userImage.naturalHeight;
    const imgRatio = nW / nH;
    const winRatio = rect.w / rect.h;
    let drawnW, drawnH;
    if (imgRatio > winRatio) {
      drawnH = rect.h;
      drawnW = rect.h * imgRatio;
    } else {
      drawnW = rect.w;
      drawnH = rect.w / imgRatio;
    }
    const pctX = (50 + (st.offset?.x || 0) * 50) / 100;
    const pctY = (50 + (st.offset?.y || 0) * 50) / 100;
    const srcLeft = (drawnW - rect.w) * pctX;
    const srcTop = (drawnH - rect.h) * pctY;
    const natX = Math.round((e.offsetX + srcLeft) * (nW / drawnW));
    const natY = Math.round((e.offsetY + srcTop) * (nH / drawnH));
    if (natX < 0 || natY < 0 || natX >= nW || natY >= nH) return null;
    try {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      const cx = c.getContext('2d', { willReadFrequently: true });
      cx.drawImage(userImage, -natX, -natY);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      return null;
    }
  }

  // ========== Type T 控件 ==========
  // 照片比例切换：清除尺寸缓存并重新布局
  document.getElementById('ratioT')?.addEventListener('change', () => {
    previewDesignCache.delete('type-t');  // P4：T 照片比例切换 → 失效 T 设计尺寸缓存
    updateBorder();
  });

  // 文字颜色预设（白 / 主色 / 自定义）
  document.getElementById('typeTColorPresets')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tcolor]');
    if (!btn) return;
    const val = btn.dataset.tcolor;
    document.querySelectorAll('#typeTColorPresets .color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const hidden = document.getElementById('typeTColor');
    const picker = document.getElementById('typeTColorPicker');
    if (val === 'custom') {
      if (hidden) hidden.value = picker?.value || '#ffffff';
    } else {
      if (hidden) hidden.value = val;
      if (val !== 'dominant' && picker) picker.value = val;
    }
    updateBorderContent();
  });

  // 原生选色器
  document.getElementById('typeTColorPicker')?.addEventListener('input', (e) => {
    const hidden = document.getElementById('typeTColor');
    if (hidden) hidden.value = e.target.value;
    document.querySelectorAll('#typeTColorPresets .color-preset').forEach(b => {
      b.classList.toggle('active', b.dataset.tcolor === 'custom');
    });
    updateBorderContent();
  });

  // 点选图片取色
  let typeTPicking = false;
  const typeTPickBtn = document.getElementById('typeTPickBtn');
  const stopTypeTPick = () => {
    typeTPicking = false;
    typeTPickBtn?.classList.remove('active');
    if (userImage) userImage.style.cursor = '';
  };
  typeTPickBtn?.addEventListener('click', () => {
    typeTPicking = !typeTPicking;
    typeTPickBtn.classList.toggle('active', typeTPicking);
    if (userImage) userImage.style.cursor = typeTPicking ? 'crosshair' : '';
  });
  userImage.addEventListener('click', (e) => {
    if (!typeTPicking || currentStyle !== 'type-t') return;
    const hex = sampleTypeTColor(e);
    if (hex) {
      const hidden = document.getElementById('typeTColor');
      if (hidden) hidden.value = hex;
      const picker = document.getElementById('typeTColorPicker');
      if (picker) picker.value = hex;
      document.querySelectorAll('#typeTColorPresets .color-preset').forEach(b => {
        b.classList.toggle('active', b.dataset.tcolor === 'custom');
      });
      updateBorderContent();
    }
    stopTypeTPick();
  });

  /**
   * 从点击位置采样图片像素颜色（考虑 cover 裁剪与拖动偏移）
   * @param {MouseEvent} e
   * @returns {string|null} #rrggbb
   */
  function sampleTypeTColor(e) {
    if (!userImage.complete || !userImage.naturalWidth) return null;
    const st = typeTPreview.getState();
    const rect = st.photoRect;
    if (!rect || !rect.w || !rect.h) return null;
    const nW = userImage.naturalWidth;
    const nH = userImage.naturalHeight;
    const imgRatio = nW / nH;
    const winRatio = rect.w / rect.h;
    let drawnW, drawnH;
    if (imgRatio > winRatio) {
      drawnH = rect.h;
      drawnW = rect.h * imgRatio;
    } else {
      drawnW = rect.w;
      drawnH = rect.w / imgRatio;
    }
    const pctX = (50 + (st.offset?.x || 0) * 50) / 100;
    const pctY = (50 + (st.offset?.y || 0) * 50) / 100;
    const srcLeft = (drawnW - rect.w) * pctX;
    const srcTop = (drawnH - rect.h) * pctY;
    const natX = Math.round((e.offsetX + srcLeft) * (nW / drawnW));
    const natY = Math.round((e.offsetY + srcTop) * (nH / drawnH));
    if (natX < 0 || natY < 0 || natX >= nW || natY >= nH) return null;
    try {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      const cx = c.getContext('2d', { willReadFrequently: true });
      cx.drawImage(userImage, -natX, -natY);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      return null;
    }
  }
  // 厂商 change：仅更新预览（第 2 行厂商+机型）
  document.getElementById('manufacturerSelect')?.addEventListener('change', () => {
    updateBorderContent();
  });
  // 胶片品牌 change：重建胶片型号 datalist + 更新预览（品牌 → 型号）
  document.getElementById('filmBrand')?.addEventListener('change', () => {
    rebuildFilmModelOptions();
    updateBorderContent();
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
      textColor: document.getElementById('textColor')?.value || '#000000',
      manufacturer: document.getElementById('manufacturerSelect')?.value || '',
      filmStyle: document.getElementById('filmStyle')?.value || '',
      showSignatureQ: document.getElementById('switchSignatureQ')?.classList.contains('active') ?? true,
      signatureColorQ: document.getElementById('qSignatureColor')?.value || '#000000',
      frameNumber: document.getElementById('frameNumber')?.value || '01',
      printExposureMode: document.getElementById('printExposureMode')?.value || '',
      printExposureTime: document.getElementById('printExposureTime')?.value || '',
      printFNumber: document.getElementById('printFNumber')?.value || '',
      printExposureBias: document.getElementById('printExposureBias')?.value || '',
      printFocalLength: document.getElementById('printFocalLength')?.value || '',
      printDate: document.getElementById('printDate')?.value || '',
      canvasRatioS: document.getElementById('canvasRatioS')?.value || '1:1',
      topLineS: document.getElementById('topLineS')?.value || '',
      photoByS: document.getElementById('photoByS')?.value || '',
      dateS: document.getElementById('dateS')?.value || '',
      isoS: document.getElementById('isoS')?.value || '',
      focalS: document.getElementById('focalS')?.value || '',
      fNumberS: document.getElementById('fNumberS')?.value || '',
      shutterS: document.getElementById('shutterS')?.value || '',
      textColorS: document.getElementById('typeSColor')?.value || 'dominant',
      ratioT: document.getElementById('ratioT')?.value || '1:1',
      topLineT: document.getElementById('topLineT')?.value || '',
      photoByT: document.getElementById('photoByT')?.value || '',
      dateT: document.getElementById('dateT')?.value || '',
      isoT: document.getElementById('isoT')?.value || '',
      focalT: document.getElementById('focalT')?.value || '',
      fNumberT: document.getElementById('fNumberT')?.value || '',
      shutterT: document.getElementById('shutterT')?.value || '',
      textColorT: document.getElementById('typeTColor')?.value || '#ffffff'
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
      } else if (currentStyle === 'type-r') {
        // Type R 需要传递归一化拖动偏移（画面窗口裁剪）
        exportOptions.imageOffset = typeRPreview.getNormalizedOffset();
      } else if (currentStyle === 'type-s') {
        // Type S 需要传递归一化拖动偏移（照片区裁剪）
        exportOptions.imageOffset = typeSPreview.getNormalizedOffset();
      } else if (currentStyle === 'type-t') {
        // Type T 需要传递归一化拖动偏移（满幅照片裁剪）
        exportOptions.imageOffset = typeTPreview.getNormalizedOffset();
      }
      
      const blob = await exportImage(userImage, exportOptions);
      const styleTypeName = styleIdToTypeName(currentStyle || 'type-a');

      if (window.electronAPI) {
        // Electron 环境
        let exportFilename = 'outputOneFrame.jpg';
        if (currentImagePath) {
          const nameWithoutExt = currentImagePath.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
          exportFilename = EXPORT_NAMING_MODE === 1
            ? `${nameWithoutExt}-${styleTypeName}-sample.jpg`
            : `${nameWithoutExt}OneFrame.jpg`;
        } else if (currentFile?.name) {
          const baseName = currentFile.name.replace(/\.[^.]+$/, '');
          exportFilename = EXPORT_NAMING_MODE === 1
            ? `${baseName}-${styleTypeName}-sample.jpg`
            : `${baseName}OneFrame.jpg`;
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
        const baseName = currentFile?.name?.replace(/\.[^.]+$/, '') || 'output';
        const exportFilename = EXPORT_NAMING_MODE === 1
          ? `${baseName}-${styleTypeName}-sample.jpg`
          : `${baseName}OneFrame.jpg`;
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
  initFilms();

  // 首页缩略图随机选择（异步执行，不阻塞页面加载）
  initHomepageThumbnails(styleCards).catch(console.warn);


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

  // ========== ColorPhoto 全屏覆盖层逻辑 ==========
  const colorphotoBtn = document.getElementById('colorphotoBtn');
  const colorphotoOverlay = document.getElementById('colorphotoOverlay');
  const colorphotoFrame = document.getElementById('colorphotoFrame');
  const colorphotoBack = document.getElementById('colorphotoBack');

  const closeColorphoto = () => {
    if (colorphotoOverlay) colorphotoOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (colorphotoBtn && colorphotoOverlay && colorphotoFrame) {
    colorphotoBtn.addEventListener('click', () => {
      // 首次打开懒加载，避免首页预载 ColorPhoto 资源
      if (!colorphotoFrame.dataset.loaded) {
        colorphotoFrame.src = 'colorphoto/index.html';
        colorphotoFrame.dataset.loaded = '1';
      }
      colorphotoOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    if (colorphotoBack) {
      colorphotoBack.addEventListener('click', closeColorphoto);
    }

    // Esc 退出（仅覆盖层可见时）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !colorphotoOverlay.classList.contains('hidden')) {
        closeColorphoto();
      }
    });
  }
});

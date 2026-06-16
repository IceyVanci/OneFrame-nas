/**
 * 编辑器视图组件
 * 封装编辑器视图的逻辑
 */

import { typeBPreview } from '../styles/index.js';
import { typeAPreview } from '../styles/index.js';
import { getPreview } from '../styles/index.js';
import { configureEditPanel as configureTypeA } from './type-a-editor-panel.js';
import { configureEditPanel as configureTypeB } from './type-b-editor-panel.js';

/**
 * 编辑器视图类
 */
export class EditorView {
  constructor() {
    // DOM 元素引用
    this.elements = {
      editorView: null,
      appContainer: null,
      userImage: null,
      photoFooter: null,
      frameWrapper: null,
      borderContent: null,
      editPanel: null,
      borderColor: null,
      borderHeight: null,
      borderHeightLabel: null
    };
    
    // Logo 亮度缓存
    this.logoBrightnessCache = {};
    
    // 当前样式
    this.currentStyle = null;
  }
  
  /**
   * 初始化编辑器
   * @param {Object} options - 配置选项
   */
  init(options = {}) {
    // 获取 DOM 元素
    this.elements.editorView = document.getElementById('editor-view');
    this.elements.appContainer = document.querySelector('.app-container');
    this.elements.userImage = document.getElementById('userImage');
    this.elements.photoFooter = document.getElementById('photoFooter');
    this.elements.frameWrapper = document.getElementById('frameWrapper');
    this.elements.borderContent = document.getElementById('borderContent');
    this.elements.editPanel = document.getElementById('editPanel');
    this.elements.borderColor = document.getElementById('borderColor');
    this.elements.borderHeight = document.getElementById('borderHeight');
    this.elements.borderHeightLabel = document.getElementById('borderHeightLabel');
    
    // 初始化样式模块
    const elements = {
      img: this.elements.userImage,
      frameWrapper: this.elements.frameWrapper,
      photoFooter: this.elements.photoFooter,
      borderContent: this.elements.borderContent
    };
    typeAPreview.init(elements);
    typeBPreview.init(elements);
  }
  
  /**
   * 显示编辑器
   * @param {string} currentStyle - 当前样式 ID
   */
  show(currentStyle) {
    const { appContainer, editorView } = this.elements;
    
    // 保存当前样式
    this.currentStyle = currentStyle;
    
    appContainer.style.display = 'none';
    editorView.classList.remove('hidden');
    
    // 配置对应模式的编辑面板
    if (currentStyle === 'type-b') {
      configureTypeB();
    } else {
      configureTypeA();
    }
    
    if (this.elements.userImage.complete) {
      this.updateBorder({ currentStyle });
    }
  }
  
  
  /**
   * 隐藏编辑器
   */
  hide() {
    const { appContainer, editorView, userImage } = this.elements;
    
    appContainer.style.display = 'flex';
    editorView.classList.add('hidden');
    userImage.src = '';
    
    // 根据之前的样式重置对应模块
    if (this.currentStyle === 'type-b') {
      typeBPreview.reset();
    } else {
      typeAPreview.reset();
    }
    
    // 重置当前样式
    this.currentStyle = null;
  }
  
  /**
   * 更新边框预览
   * @param {Object} params - 参数
   */
  updateBorder(params = {}) {
    const { userImage, photoFooter, borderColor, borderHeight, borderHeightLabel } = this.elements;
    
    if (!userImage.complete) return;
    
    const currentStyle = params.currentStyle || 'type-a';
    const preview = getPreview(currentStyle);
    const shortSide = Math.min(userImage.clientWidth, userImage.clientHeight);
    const borderPercent = parseInt(borderHeight?.value) || 12;
    
    if (currentStyle === 'type-b') {
      typeBPreview.update({ naturalHeight: userImage.naturalHeight }, params);
    } else {
      const footerHeight = Math.round(shortSide * (borderPercent / 100));
      preview.updatePreview(userImage, photoFooter, {
        borderColor: borderColor?.value,
        borderHeight: footerHeight,
        borderHeightLabel,
        aspectRatio: document.getElementById('aspectRatio')?.value || 'default'
      });
      this.updateContent(params);
    }
  }
  
  /**
   * 更新边框内容预览
   * @param {Object} settings - 显示设置
   */
  updateContent(settings = {}) {
    const { currentStyle } = settings;
    
    if (currentStyle === 'type-b') {
      typeBPreview.update({ naturalHeight: this.elements.userImage.naturalHeight }, settings);
      return;
    }
    
    const preview = getPreview(currentStyle || 'type-a');
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
        selectedLogo: this.elements.selectedLogo,
        isLightLogo: this.logoBrightnessCache[this.elements.selectedLogo]?.isLight,
        showLogo: settings.showLogo ?? true,
        showModel: settings.showModel ?? false,
        customModel: settings.customModel || '',
        showParams: settings.showParams ?? true,
        fNumber: settings.fNumber || '',
        exposureTime: settings.exposureTime || '',
        iso: settings.iso || '',
        focalLength: settings.focalLength || '',
        showTime: settings.showTime ?? true,
        dateTime: settings.dateTime || '',
        signatureText: settings.signatureText || '',
        borderColor: settings.borderColor || '#ffffff'
      }
    );
  }
  
  /**
   * 获取显示设置
   * @returns {Object} 显示设置
   */
  getDisplaySettings() {
    const isTypeB = this.currentStyle === 'type-b';
    return {
      selectedLogo: this.elements.selectedLogo,
      // Type B 默认显示 Logo
      showLogo: isTypeB ? true : (document.getElementById('switchLogo')?.classList.contains('active') ?? true),
      showModel: document.getElementById('switchModel')?.classList.contains('active'),
      customModel: document.getElementById('customModel')?.value || '',
      // Type B 默认显示拍摄参数
      showParams: isTypeB ? true : (document.getElementById('switchParams')?.classList.contains('active') ?? true),
      fNumber: document.getElementById('fNumber')?.value || '',
      exposureTime: document.getElementById('exposureTime')?.value || '',
      focalLength: document.getElementById('focalLength')?.value || '',
      iso: document.getElementById('iso')?.value || '',
      // Type B 默认显示时间
      showTime: isTypeB ? true : (document.getElementById('switchTime')?.classList.contains('active') ?? true),
      dateTime: document.getElementById('dateTime')?.value || '',
      signatureText: document.getElementById('signatureText')?.value || ''
    };
  }
  
  /**
   * 获取编辑设置
   * @param {string} currentStyle - 当前样式
   * @returns {Object} 编辑设置
   */
  getEditSettings(currentStyle) {
    const isTypeB = currentStyle === 'type-b';
    return {
      styleId: currentStyle,
      // Type B 默认显示 Logo
      showLogo: isTypeB ? true : (document.getElementById('switchLogo')?.classList.contains('active') ?? false),
      selectedLogo: this.elements.selectedLogo || '',
      showModel: document.getElementById('switchModel')?.classList.contains('active'),
      customModel: document.getElementById('customModel')?.value || '',
      // Type B 默认显示拍摄参数
      showParams: isTypeB ? true : (document.getElementById('switchParams')?.classList.contains('active') ?? false),
      fNumber: document.getElementById('fNumber')?.value || '',
      exposureTime: document.getElementById('exposureTime')?.value || '',
      focalLength: document.getElementById('focalLength')?.value || '',
      iso: document.getElementById('iso')?.value || '',
      // Type B 默认显示时间
      showTime: isTypeB ? true : (document.getElementById('switchTime')?.classList.contains('active') ?? false),
      dateTime: document.getElementById('dateTime')?.value || '',
      showSignature: document.getElementById('switchSignature')?.classList.contains('active') ?? false,
      signatureText: document.getElementById('signatureText')?.value || '',
      borderColor: this.elements.borderColor?.value || '#ffffff',
      borderHeight: this.elements.borderHeight?.value || 12,
      aspectRatio: document.getElementById('aspectRatio')?.value || 'default'
    };
  }
  
  /**
   * 检测 Logo 亮度
   * @param {string} logoPath - Logo 路径
   * @returns {Promise<boolean>}
   */
  detectLogoBrightness(logoPath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
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
  
  /**
   * 检查 Logo 是否为浅色
   * @param {string} logoName - Logo 名称
   * @returns {Promise<boolean>}
   */
  async isLogoLight(logoName) {
    if (this.logoBrightnessCache[logoName] !== undefined) {
      return this.logoBrightnessCache[logoName].isLight;
    }
    const brightness = await this.detectLogoBrightness(`logos/${logoName}.svg`);
    this.logoBrightnessCache[logoName] = { isLight: brightness };
    return brightness;
  }
  
  /**
   * 重置表单
   */
  resetForm() {
    this.elements.selectedLogo = null;
    const logoPreview = document.getElementById('logoPreview');
    if (logoPreview) logoPreview.innerHTML = '';
    document.getElementById('customModel').value = '';
    document.getElementById('fNumber').value = '';
    document.getElementById('exposureTime').value = '';
    document.getElementById('focalLength').value = '';
    document.getElementById('iso').value = '';
    document.getElementById('dateTime').value = '';
    document.querySelectorAll('.logo-grid-item').forEach(item => item.classList.remove('selected'));
  }
}

// 导出单例
export const editorView = new EditorView();

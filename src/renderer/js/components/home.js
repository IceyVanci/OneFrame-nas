/**
 * 首页视图组件
 * 封装首页样式选择逻辑
 */

import { getAllLogos, getLogoFilename } from '../logo-utils.js';

/**
 * 首页视图类
 */
export class HomeView {
  constructor() {
    // DOM 元素
    this.elements = {
      appContainer: null,
      logoGrid: null,
      logoPreview: null
    };
  }
  
  /**
   * 初始化首页
   */
  init() {
    this.elements.appContainer = document.querySelector('.app-container');
    this.elements.logoGrid = document.getElementById('logoGrid');
    this.elements.logoPreview = document.getElementById('logoPreview');
  }
  
  /**
   * 初始化 Logo 网格
   * @returns {Promise<string[]>} Logo 列表
   */
  async initLogoGrid() {
    const logos = getAllLogos();
    
    this.elements.logoGrid.innerHTML = '';
    
    logos.forEach(name => {
      const item = document.createElement('div');
      item.className = 'logo-grid-item';
      item.dataset.logo = name;
      
      const img = document.createElement('img');
      img.alt = name;
      img.loading = 'lazy';
      img.src = `logos/${getLogoFilename(name)}`;
      
      item.appendChild(img);
      item.addEventListener('click', () => {
        if (this.onLogoSelect) {
          this.onLogoSelect(name);
        }
      });
      
      this.elements.logoGrid.appendChild(item);
    });
    
    return logos;
  }
  
  /**
   * 更新 Logo 选择状态
   * @param {string|null} name - 选中的 Logo 名称
   */
  updateLogoSelection(name) {
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
      
      this.elements.logoPreview.innerHTML = '';
      this.elements.logoPreview.appendChild(previewImg);
    } else {
      this.elements.logoPreview.innerHTML = '';
    }
  }
  
  /**
   * 初始化样式卡片事件
   * @param {Function} onStyleSelect - 样式选择回调
   */
  initStyleCards(onStyleSelect) {
    const styleCards = document.querySelectorAll('.style-card:not(.disabled)');
    
    styleCards.forEach(card => {
      card.addEventListener('click', async () => {
        const style = card.dataset.style;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          if (e.target.files[0]) {
            if (onStyleSelect) {
              const success = await onStyleSelect(style, { file: e.target.files[0] });
              if (success !== false) {
                this.show();
              }
            }
          }
        };
        input.click();
      });
    });
  }
  
  /**
   * 显示首页
   */
  show() {
    if (this.elements.appContainer) {
      this.elements.appContainer.style.display = 'flex';
    }
  }
  
  /**
   * 隐藏首页
   */
  hide() {
    if (this.elements.appContainer) {
      this.elements.appContainer.style.display = 'none';
    }
  }
  
  /**
   * 设置 Logo 选择回调
   * @param {Function} callback
   */
  setOnLogoSelect(callback) {
    this.onLogoSelect = callback;
  }
}

// 导出单例
export const homeView = new HomeView();

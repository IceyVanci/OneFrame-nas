/**
 * ControlPanel Component - 参数调节面板组件
 */

class ControlPanel {
  constructor() {
    this.displayModeRadios = document.querySelectorAll('input[name="displayMode"]');
    this.edgePositionSection = document.getElementById('edgePositionSection');
    this.edgeButtons = document.querySelectorAll('.edge-btn');
    this.blockSizeSlider = document.getElementById('blockSizeSlider');
    this.blockSizeValue = document.getElementById('blockSizeValue');
    this.colorSortSelect = document.getElementById('colorSortSelect');
    this.showLabelToggle = document.getElementById('showLabelToggle');
    this.showColorNameToggle = document.getElementById('showColorNameToggle');
    this.colorNameLangSelect = document.getElementById('colorNameLangSelect');
    this.colorNameLangValue = document.getElementById('colorNameLangValue');
    this.colorNameSection = document.getElementById('colorNameSection');
    this.colorNameLangSection = document.getElementById('colorNameLangSection');
    this.colorCountSection = document.getElementById('colorCountSection');
    this.colorList = document.getElementById('colorList');
    this.importBtn = document.getElementById('importBtn');
    this.exportBtn = document.getElementById('exportBtn');
    
    this.state = {
      displayMode: 'vertical',
      edgePosition: 'right',
      blockSize: 50,
      colorSort: 'original',
      showLabel: true,
      colors: []
    };
    
    this.colorCountRadios = document.querySelectorAll('input[name="colorCount"]');
    
    this.callbacks = {
      onDisplayModeChange: () => {},
      onEdgePositionChange: () => {},
      onBlockSizeChange: () => {},
      onColorCountChange: () => {},
      onColorSortChange: () => {},
      onShowLabelChange: () => {},
      onShowColorNameChange: () => {},
      onColorNameLangChange: () => {},
      onImport: () => {},
      onExport: () => {}
    };
    
    this.init();
  }
  
  init() {
    // 显示模式切换
    this.displayModeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.displayMode = e.target.value;
        this.updateEdgePositionVisibility();
        this.callbacks.onDisplayModeChange(this.state.displayMode);
      });
    });
    
    // 边缘位置选择
    this.edgeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.edgeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.edgePosition = btn.dataset.position;
        this.callbacks.onEdgePositionChange(this.state.edgePosition);
      });
    });
    
    // 色块大小
    if (this.blockSizeSlider) {
      this.blockSizeSlider.addEventListener('input', (e) => {
        this.state.blockSize = parseInt(e.target.value);
        this.blockSizeValue.textContent = this.state.blockSize + 'px';
        this.callbacks.onBlockSizeChange(this.state.blockSize);
      });
    }
    
    // 颜色排序
    if (this.colorSortSelect) {
      this.colorSortSelect.addEventListener('change', (e) => {
        this.state.colorSort = e.target.value;
        this.callbacks.onColorSortChange(this.state.colorSort);
      });
    }
    
    // 色号显示
    if (this.showLabelToggle) {
      this.showLabelToggle.addEventListener('change', (e) => {
        this.state.showLabel = e.target.checked;
        this.callbacks.onShowLabelChange(this.state.showLabel);
      });
    }
    
    // 色块数量
    this.colorCountRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const count = parseInt(e.target.value);
        this.callbacks.onColorCountChange(count);
      });
    });
    
    // 颜色名称显示
    if (this.showColorNameToggle) {
      this.showColorNameToggle.addEventListener('change', (e) => {
        this.callbacks.onShowColorNameChange(e.target.checked);
      });
    }
    
    // 颜色名称语言选择
    if (this.colorNameLangSelect) {
      this.colorNameLangSelect.addEventListener('change', (e) => {
        const lang = e.target.checked ? 'en' : 'cn';
        this.callbacks.onColorNameLangChange(lang);
      });
    }
    
    // 导入按钮
    if (this.importBtn) {
      this.importBtn.addEventListener('click', () => {
        this.callbacks.onImport();
      });
    }
    
    // 导出按钮
    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', () => {
        this.callbacks.onExport();
      });
    }
  }
  
  updateEdgePositionVisibility() {
    if (this.edgePositionSection) {
      this.edgePositionSection.style.display = 
        this.state.displayMode === 'edge' ? 'block' : 'none';
    }
    // 颜色名称控件在纵向、方格和边缘模式显示
    if (this.colorNameSection) {
      this.colorNameSection.style.display = 'block';
    }
    if (this.colorNameLangSection) {
      this.colorNameLangSection.style.display = 'block';
    }
    // 色块数量在纵向模式显示
    if (this.colorCountSection) {
      this.colorCountSection.style.display = 
        this.state.displayMode === 'vertical' ? 'block' : 'none';
    }
  }
  
  setColors(colors) {
    this.state.colors = colors;
    this.renderColorList();
  }
  
  renderColorList() {
    if (!this.colorList) return;
    
    this.colorList.innerHTML = '';
    
    this.state.colors.forEach((color, index) => {
      const item = document.createElement('div');
      item.className = 'color-item';
      
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color.hex;
      
      const hex = document.createElement('span');
      hex.className = 'color-hex';
      hex.textContent = color.hex;
      
      item.appendChild(swatch);
      item.appendChild(hex);
      
      this.colorList.appendChild(item);
    });
  }
  
  setExportEnabled(enabled) {
    if (this.exportBtn) {
      this.exportBtn.disabled = !enabled;
    }
  }
  
  setCallback(name, callback) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = callback;
    }
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(newState) {
    Object.assign(this.state, newState);
    
    if (newState.displayMode) {
      this.displayModeRadios.forEach(radio => {
        radio.checked = radio.value === newState.displayMode;
      });
      this.updateEdgePositionVisibility();
    }
    
    if (newState.edgePosition) {
      this.edgeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.position === newState.edgePosition);
      });
    }
    
    if (newState.blockSize !== undefined && this.blockSizeSlider) {
      this.blockSizeSlider.value = newState.blockSize;
      this.blockSizeValue.textContent = newState.blockSize + 'px';
    }
    
    if (newState.colorSort !== undefined && this.colorSortSelect) {
      this.colorSortSelect.value = newState.colorSort;
    }
    
    if (newState.showLabel !== undefined && this.showLabelToggle) {
      this.showLabelToggle.checked = newState.showLabel;
    }
  }
}

/**
 * ImagePreview Component - 图片预览组件
 */

class ImagePreview {
  constructor(canvasId, colorBlocksId) {
    this.canvas = document.getElementById(canvasId);
    this.colorBlocksContainer = document.getElementById(colorBlocksId);
    this.container = this.canvas?.parentElement;
    
    if (!this.canvas || !this.colorBlocksContainer) {
      console.error('ImagePreview: canvas or colorBlocks not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.image = null;
    this.colors = [];
    this.draggedIndex = null;
    this.blockSize = 80;
  }
  
  /**
   * 加载图片
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.onload = () => {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.ctx.drawImage(this.image, 0, 0);
        resolve();
      };
      this.image.onerror = reject;
      this.image.src = src;
    });
  }
  
  /**
   * 设置颜色
   */
  setColors(colors) {
    this.colors = colors;
    this.renderColorBlocks();
  }
  
  /**
   * 渲染色块（预览小尺寸固定40px）
   */
  renderColorBlocks() {
    if (!this.colorBlocksContainer) return;
    
    this.colorBlocksContainer.innerHTML = '';
    this.colorBlocksContainer.className = 'color-blocks vertical';
    
    this.colors.forEach((color, index) => {
      const block = document.createElement('div');
      block.className = 'color-block';
      block.draggable = true;
      block.dataset.index = index;
      
      const inner = document.createElement('div');
      inner.className = 'color-block-inner';
      inner.style.backgroundColor = color.hex;
      
      const label = document.createElement('div');
      label.className = 'color-label';
      label.textContent = color.hex;
      
      block.appendChild(inner);
      block.appendChild(label);
      
      block.addEventListener('dragstart', (e) => {
        this.draggedIndex = parseInt(block.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
      });
      
      block.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      block.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(block.dataset.index);
        if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
          this.swapColors(this.draggedIndex, targetIndex);
        }
        this.draggedIndex = null;
      });

      // ===== 触摸拖拽支持（移动端） =====
      block.addEventListener('touchstart', (e) => {
        this.draggedIndex = parseInt(block.dataset.index);
        this._touchStartX = e.touches[0].clientX;
        this._touchStartY = e.touches[0].clientY;
      });

      block.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.draggedIndex === null) return;
        
        const touch = e.changedTouches[0];
        const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
        if (targetEl) {
          const targetBlock = targetEl.closest('.color-block');
          if (targetBlock) {
            const targetIndex = parseInt(targetBlock.dataset.index);
            if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
              this.swapColors(this.draggedIndex, targetIndex);
            }
          }
        }
        this.draggedIndex = null;
      });

      block.addEventListener('touchcancel', () => {
        this.draggedIndex = null;
      });
      
      this.colorBlocksContainer.appendChild(block);
    });
  }
  
  /**
   * 交换颜色
   */
  swapColors(fromIndex, toIndex) {
    const temp = this.colors[fromIndex];
    this.colors[fromIndex] = this.colors[toIndex];
    this.colors[toIndex] = temp;
    
    this.colors.forEach((c, i) => c.position = i);
    
    if (this.onColorsChange) {
      this.onColorsChange(this.colors);
    }
    this.renderColorBlocks();
  }
  
  /**
   * 设置颜色变更回调
   */
  setOnColorsChange(callback) {
    this.onColorsChange = callback;
  }
  
  /**
   * 显示预览容器
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }
  
  /**
   * 隐藏预览容器
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  /**
   * 获取Canvas
   */
  getCanvas() {
    return this.canvas;
  }
  
  /**
   * 获取图片
   */
  getImage() {
    return this.image;
  }
}

/**
 * DropZone Component - 拖拽区域组件
 */

class DropZone {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.onFileSelect = options.onFileSelect || (() => {});
    this.fileInput = document.getElementById('fileInput');
    
    if (!this.element) {
      console.error('DropZone: element not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    // 点击事件
    this.element.addEventListener('click', () => {
      if (this.fileInput) {
        this.fileInput.click();
      }
    });
    
    // 文件选择事件（支持多文件）
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const validFiles = Array.from(e.target.files).filter(file => this.isValidImage(file));
        if (validFiles.length > 0) {
          this.onFileSelect(validFiles.length === 1 ? validFiles[0] : validFiles);
        }
        // 重置file input的值，以便再次选择相同文件
        this.fileInput.value = '';
      });
    }
    
    // 拖拽事件
    this.element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.add('drag-over');
    });
    
    this.element.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.remove('drag-over');
    });
    
    this.element.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.element.classList.remove('drag-over');
      
      const validFiles = Array.from(e.dataTransfer.files).filter(file => this.isValidImage(file));
      if (validFiles.length > 0) {
        this.onFileSelect(validFiles.length === 1 ? validFiles[0] : validFiles);
      }
    });
    
    // 阻止默认拖拽行为
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());

    // ===== 触摸事件支持（移动端） =====
    // 移动端点击也应触发文件选择
    this.element.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.fileInput) {
        this.fileInput.click();
      }
    });
  }
  
  isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
  }
  
  show() {
    this.element.style.display = 'flex';
  }
  
  hide() {
    this.element.style.display = 'none';
  }
}

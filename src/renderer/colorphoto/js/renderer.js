/**
 * ColorPhoto - Main Renderer
 * 主渲染进程入口文件（Web/Docker 版本）
 */

// 全局状态
const appState = {
  originalImage: null,
  processedImage: null,
  extractedColors: [],
  allExtractedColors: [],
  displayMode: 'vertical',
  edgePosition: 'right',
  colorCount: 5,
  colorSort: 'brightness',
  showLabel: true,
  showColorName: false,
  colorNameLanguage: 'en',
  firstTimeShowColorName: true,  // 首次显示颜色名称标志
  blockSize: 150,
  exifData: null,
  originalFileName: null,
  // 每个模式独立的颜色排序状态
  modeColors: {
    vertical: [],
    grid: [],
    edge: []
  },
  // 队列相关状态
  imageQueue: [],
  currentQueueIndex: -1
};

// 组件实例
let colorExtractor;
let imageProcessor;
let exifHandler;
let imagePreview;
let controlPanel;

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  console.log('ColorPhoto initializing...');
  initComponents();
  setupCallbacks();
  console.log('ColorPhoto initialized');
});

// 初始化组件
function initComponents() {
  colorExtractor = new ColorExtractor(appState.colorCount);
  imageProcessor = new ImageProcessor();
  imageProcessor.initCanvas(document.getElementById('previewCanvas'));
  exifHandler = new ExifHandler();
  imagePreview = new ImagePreview('previewCanvas', 'colorBlocks');
  controlPanel = new ControlPanel();
  
  // 拖拽区域组件
  const dropZone = new DropZone('dropZone', {
    onFileSelect: handleDropZoneFileSelect
  });
}

// 处理拖拽区域的文件选择（支持单文件或多文件）
async function handleDropZoneFileSelect(fileOrFiles) {
  try {
    // 如果是单个文件，直接使用loadImage
    if (fileOrFiles instanceof File) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target.result;
        await loadImage({
          name: fileOrFiles.name,
          data: data
        });
      };
      reader.readAsDataURL(fileOrFiles);
      return;
    }
    
    // 如果是数组（多个文件），使用队列处理
    if (Array.isArray(fileOrFiles) && fileOrFiles.length > 0) {
      // 使用FileReader读取所有文件
      const loadedFiles = [];
      let loadedCount = 0;
      
      fileOrFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadedFiles[index] = {
            name: file.name,
            dataUrl: event.target.result
          };
          loadedCount++;
          
          if (loadedCount === fileOrFiles.length) {
            addFilesToQueue(loadedFiles);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    alert('读取文件失败: ' + error.message);
  }
}

// 设置回调函数
function setupCallbacks() {
  controlPanel.setCallback('onImport', handleImport);
  controlPanel.setCallback('onExport', handleExport);
  
  controlPanel.setCallback('onDisplayModeChange', (mode) => {
    // 保存当前模式的颜色排序
    appState.modeColors[appState.displayMode] = [...appState.extractedColors];
    
    appState.displayMode = mode;
    imageProcessor.setDisplayMode(mode);
    
    // 如果该模式已有保存的颜色排序，使用它；否则使用默认排序
    const savedColors = appState.modeColors[mode];
    const defaultSortedColors = colorExtractor.sortColors(appState.allExtractedColors, appState.colorSort);
    const displayColors = savedColors.length > 0 ? savedColors : defaultSortedColors;
    
    // 方格模式始终使用前4个颜色
    if (mode === 'grid') {
      const gridColors = displayColors.slice(0, 4);
      imageProcessor.setColors(gridColors);
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(displayColors.slice(0, 5));
      controlPanel.setColors(displayColors.slice(0, 5));
    } else {
      const limitedColors = mode === 'vertical' && appState.colorCount < 5 
        ? displayColors.slice(0, appState.colorCount) 
        : displayColors;
      appState.extractedColors = limitedColors;
      imageProcessor.setColors(limitedColors);
      // 侧边栏显示全部5个颜色
      imagePreview.setColors(displayColors.slice(0, 5));
      controlPanel.setColors(displayColors.slice(0, 5));
    }
    renderImage();
  });
  
  controlPanel.setCallback('onEdgePositionChange', (position) => {
    appState.edgePosition = position;
    imageProcessor.setEdgePosition(position);
    renderImage();
  });
  
  controlPanel.setCallback('onColorCountChange', (count) => {
    appState.colorCount = count;
    colorExtractor.colorCount = count;
    if (appState.extractedColors.length >= 5) {
      let limitedColors;
      if (count === 3) {
        // 取当前侧边栏5个颜色的中间3个
        limitedColors = [appState.extractedColors[1], appState.extractedColors[2], appState.extractedColors[3]];
      } else {
        limitedColors = appState.extractedColors.slice(0, count);
      }
      appState.extractedColors = limitedColors;
      imageProcessor.setColors(limitedColors);
      controlPanel.setColors(limitedColors);
      renderImage();
    }
  });
  
  controlPanel.setCallback('onBlockSizeChange', (size) => {
    appState.blockSize = size;
    imageProcessor.setBlockSize(size);
    renderImage();
  });
  
  controlPanel.setCallback('onColorSortChange', (sortType) => {
    appState.colorSort = sortType;
    if (appState.extractedColors.length > 0) {
      const sortedColors = colorExtractor.sortColors(appState.extractedColors, sortType);
      appState.extractedColors = sortedColors;
      imageProcessor.setColors(sortedColors);
      imagePreview.setColors(sortedColors);
      controlPanel.setColors(sortedColors);
      renderImage();
    }
  });
  
  controlPanel.setCallback('onShowLabelChange', (show) => {
    appState.showLabel = show;
    imageProcessor.setShowLabel(show);
    renderImage();
  });
  
  controlPanel.setCallback('onShowColorNameChange', (show) => {
    appState.showColorName = show;
    imageProcessor.setShowColorName(show);
    // 首次开启颜色名称时，自动设置为英文
    if (show && appState.firstTimeShowColorName) {
      appState.firstTimeShowColorName = false;
      appState.colorNameLanguage = 'en';
      imageProcessor.setColorNameLanguage('en');
      // 更新 UI：勾选英文开关
      const langToggle = document.getElementById('colorNameLangSelect');
      if (langToggle) langToggle.checked = true;
    }
    renderImage();
  });
  
  controlPanel.setCallback('onColorNameLangChange', (lang) => {
    appState.colorNameLanguage = lang;
    imageProcessor.setColorNameLanguage(lang);
    renderImage();
  });
  
  imagePreview.setOnColorsChange((colors) => {
    appState.extractedColors = colors;
    // 直接更新 colors，不调用 setColors 以避免重置位置
    imageProcessor.colors = colors.slice(0, appState.colorCount);
    // 侧边栏显示全部5个颜色（保持用户拖动后的顺序）
    imagePreview.setColors(colors.slice(0, 5));
    controlPanel.setColors(colors);
    renderImage();
  });
}

// 重新提取颜色
async function reExtractColors() {
  const canvas = imagePreview.getCanvas();
  if (!canvas) return;
  
  const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  const colors = colorExtractor.extract(imageData);
  appState.allExtractedColors = colors;
  
  const displayColors = colorExtractor.sortColors(colors, appState.colorSort);
  const limitedColors = displayColors.slice(0, appState.colorCount);
  
  appState.extractedColors = limitedColors;
  imageProcessor.setColors(limitedColors);
  imagePreview.setColors(limitedColors);
  controlPanel.setColors(limitedColors);
  renderImage();
}

// 处理图片导入（浏览器模式：使用 <input type="file">）
async function handleImport() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files).filter(f => 
        f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
      );
      
      if (files.length === 0) return;
      
      // 读取所有文件为 dataUrl
      const loadedFiles = [];
      let loadedCount = 0;
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadedFiles[index] = {
            name: file.name,
            dataUrl: event.target.result
          };
          loadedCount++;
          
          if (loadedCount === files.length) {
            if (loadedFiles.length === 1) {
              loadImage({
                name: loadedFiles[0].name,
                data: loadedFiles[0].dataUrl
              });
            } else {
              addFilesToQueue(loadedFiles);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    };
    
    input.click();
  } catch (error) {
    console.error('Error importing image:', error);
    alert('导入图片失败: ' + error.message);
  }
}

// 加载图片（浏览器模式：使用 exifHandler.extractFromDataUrl 提取 EXIF）
async function loadImage(result) {
  const { name, data } = result;
  
  try {
    appState.originalFileName = name;
    
    // 浏览器端 EXIF 提取：PNG 不支持标准 EXIF
    let exifData = null;
    const isPng = name && name.toLowerCase().endsWith('.png');
    if (!isPng) {
      exifData = await exifHandler.extractFromDataUrl(data);
    }
    appState.exifData = exifData;
    if (exifData) {
      exifHandler.setExifData(exifData);
    }
    
    await imagePreview.loadImage(data);
    
    const canvas = imagePreview.getCanvas();
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const colors = colorExtractor.extract(imageData);
    appState.allExtractedColors = colors;
    
    const sortedColors = colorExtractor.sortColors(colors, appState.colorSort);
    const displayColors = sortedColors.slice(0, appState.colorCount);
    
    appState.extractedColors = displayColors;
    // 导入新图片时重置所有模式的颜色排序状态
    appState.modeColors = {
      vertical: [],
      grid: [],
      edge: []
    };
    
    // 设置队列状态
    appState.imageQueue = [{
      name: name,
      dataUrl: data,
      exifData: exifData,
      colors: colors
    }];
    appState.currentQueueIndex = 0;
    
    imageProcessor.setImage(imagePreview.getImage());
    imageProcessor.setColors(displayColors);
    imagePreview.setColors(displayColors);
    controlPanel.setColors(displayColors);
    controlPanel.setExportEnabled(true);
    renderImage();
    
    document.getElementById('dropZone').style.display = 'none';
    imagePreview.show();
    document.getElementById('queuePanel').style.display = 'none';
    
  } catch (error) {
    console.error('Error loading image:', error);
    alert('加载图片失败: ' + error.message);
  }
}

// 渲染图片
function renderImage() {
  imageProcessor.setEdgePosition(appState.edgePosition);
  imageProcessor.setBlockSize(appState.blockSize);
  imageProcessor.setShowLabel(appState.showLabel);
  imageProcessor.setShowColorName(appState.showColorName);
  imageProcessor.setColorNameLanguage(appState.colorNameLanguage);
  imageProcessor.render();
}

// 浏览器端保存文件（使用 <a download>）
function saveFileBrowser(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 处理导出（浏览器模式：使用 <a download> 触发下载）
async function handleExport() {
  try {
    // 根据原始文件类型决定导出格式
    const isPng = appState.originalFileName && 
      appState.originalFileName.toLowerCase().endsWith('.png');
    
    // PNG 使用无损导出，JPEG 使用 95% 质量
    let exportData = imageProcessor.exportToDataUrl(isPng ? 'image/png' : 'image/jpeg');
    
    // 仅 JPEG 嵌入 EXIF
    if (!isPng && appState.exifData && typeof piexif !== 'undefined') {
      console.log('Attempting to embed EXIF...');
      exportData = exifHandler.embedExif(exportData, appState.exifData);
      console.log('EXIF embedded successfully');
    }
    
    const originalName = appState.originalFileName || 'image.jpg';
    const baseName = originalName.replace(/\.[^.]+$/, '');
    const ext = isPng ? '.png' : '.jpg';
    const defaultName = baseName + '_colored' + ext;
    
    // 浏览器下载
    saveFileBrowser(exportData, defaultName);
  } catch (error) {
    console.error('Error exporting image:', error);
    alert('导出图片失败: ' + error.message);
  }
}

// 处理关于按钮
const aboutBtn = document.getElementById('aboutBtn');
const modal = document.getElementById('aboutModal');
const closeBtn = document.getElementById('closeModal');

if (aboutBtn && modal && closeBtn) {
  aboutBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // 处理弹窗中的链接点击，在新标签页打开
  modal.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      const href = e.target.getAttribute('href');
      if (href) {
        window.open(href, '_blank');
      }
    }
  });
}

// 处理文件拖入窗口
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const files = Array.from(e.dataTransfer.files).filter(f => 
    f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
  );
  
  if (files.length > 0) {
    addFilesToQueue(files);
  }
});

// ========== 队列功能 ==========

// 性能优化：EXIF数据缓存（避免重复读取）
const exifCache = new Map();

// 性能优化：图片数据URL缓存
const dataUrlCache = new Map();

// 添加文件到队列（支持 File 对象或已有 dataUrl 的对象）
function addFilesToQueue(files) {
  let loadedCount = 0;
  const totalFiles = files.length;
  
  files.forEach(file => {
    // 如果已有 dataUrl（从文件对话框导入），直接使用
    if (file.dataUrl) {
      const queueItem = {
        name: file.name,
        dataUrl: file.dataUrl,
        exifData: null,
        colors: []
      };
      appState.imageQueue.push(queueItem);
      loadedCount++;
      
      if (appState.currentQueueIndex === -1) {
        appState.currentQueueIndex = appState.imageQueue.length - 1;
        loadQueueImageFromQueue(appState.currentQueueIndex);
      }
      
      if (loadedCount === totalFiles) {
        document.getElementById('queuePanel').style.display = 
          appState.imageQueue.length > 1 ? 'flex' : 'none';
        updateQueuePanel();
      }
      return;
    }
    
    // 如果是 File 对象（拖入），使用 FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const queueItem = {
        name: file.name,
        dataUrl: e.target.result,
        exifData: null,
        colors: []
      };
      appState.imageQueue.push(queueItem);
      loadedCount++;
      
      if (appState.currentQueueIndex === -1) {
        appState.currentQueueIndex = appState.imageQueue.length - 1;
        loadQueueImageFromQueue(appState.currentQueueIndex);
      }
      
      if (loadedCount === totalFiles) {
        document.getElementById('queuePanel').style.display = 
          appState.imageQueue.length > 1 ? 'flex' : 'none';
        updateQueuePanel();
      }
    };
    reader.readAsDataURL(file);
  });
}

// 从队列加载图片（浏览器模式：使用 exifHandler.extractFromDataUrl）
async function loadQueueImageFromQueue(index) {
  if (index < 0 || index >= appState.imageQueue.length) return;
  
  const item = appState.imageQueue[index];
  appState.currentQueueIndex = index;
  
  try {
    // 性能优化：使用EXIF缓存，避免重复读取
    let exifData;
    const cacheKey = item.name;
    if (exifCache.has(cacheKey)) {
      exifData = exifCache.get(cacheKey);
    } else {
      // 浏览器端 EXIF 提取：PNG 不支持标准 EXIF
      const isPng = item.name && item.name.toLowerCase().endsWith('.png');
      exifData = isPng ? null : await exifHandler.extractFromDataUrl(item.dataUrl);
      exifCache.set(cacheKey, exifData);
    }
    item.exifData = exifData;
    appState.exifData = exifData;
    appState.originalFileName = item.name;
    
    await imagePreview.loadImage(item.dataUrl);
    const canvas = imagePreview.getCanvas();
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const colors = colorExtractor.extract(imageData);
    
    item.colors = colors;
    appState.allExtractedColors = colors;
    
    const sortedColors = colorExtractor.sortColors(colors, appState.colorSort);
    const displayColors = sortedColors.slice(0, appState.colorCount);
    
    appState.extractedColors = displayColors;
    appState.modeColors = { vertical: [], grid: [], edge: [] };
    imageProcessor.setImage(imagePreview.getImage());
    imageProcessor.setColors(displayColors);
    imagePreview.setColors(displayColors);
    controlPanel.setColors(displayColors);
    controlPanel.setExportEnabled(true);
    
    document.getElementById('dropZone').style.display = 'none';
    imagePreview.show();
    
    document.getElementById('queuePanel').style.display = 
      appState.imageQueue.length > 1 ? 'flex' : 'none';
    
    updateQueuePanel();
    renderImage();
    
    // 性能优化：预加载相邻图片
    preloadAdjacentImages(index);
  } catch (error) {
    console.error('Error loading queue image:', error);
  }
}

// 更新队列面板
function updateQueuePanel() {
  const queueList = document.getElementById('queueList');
  if (!queueList) return;
  
  queueList.innerHTML = '';
  appState.imageQueue.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'queue-item' + (index === appState.currentQueueIndex ? ' active' : '');
    div.onclick = () => loadQueueImageFromQueue(index);
    
    const img = document.createElement('img');
    img.src = item.dataUrl;
    div.appendChild(img);
    queueList.appendChild(div);
  });
}

// 重置到初始状态
function resetToInitialState() {
  console.log('Resetting to initial state...');
  appState.originalImage = null;
  appState.processedImage = null;
  appState.extractedColors = [];
  appState.allExtractedColors = [];
  appState.exifData = null;
  appState.originalFileName = null;
  appState.currentQueueIndex = -1;
  appState.imageQueue = [];
  appState.modeColors = { vertical: [], grid: [], edge: [] };
  
  // 重置图像处理器
  if (imageProcessor) {
    imageProcessor.setImage(null);
  }
  
  // 隐藏图像预览
  if (imagePreview) {
    imagePreview.hide();
  }
  
  // 重置控制面板
  if (controlPanel) {
    controlPanel.setExportEnabled(false);
    controlPanel.setColors([]);
  }
  
  // 显示拖拽区域
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.style.display = 'flex';
  }
  
  // 隐藏队列面板
  const queuePanel = document.getElementById('queuePanel');
  if (queuePanel) {
    queuePanel.style.display = 'none';
  }
  
  // 隐藏预览容器
  const previewContainer = document.getElementById('previewContainer');
  if (previewContainer) {
    previewContainer.style.display = 'none';
  }
  
  // 清除颜色块
  const colorBlocks = document.getElementById('colorBlocks');
  if (colorBlocks) {
    colorBlocks.innerHTML = '';
  }
  
  // 重置画布
  const canvas = document.getElementById('previewCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // 性能优化：清理缓存（释放内存）
  exifCache.clear();
  dataUrlCache.clear();
  
  console.log('Reset complete');
}

// 关闭按钮处理
function handleClose() {
  console.log('Close button clicked, currentQueueIndex:', appState.currentQueueIndex);
  if (appState.currentQueueIndex === -1) return;
  
  const removedIndex = appState.currentQueueIndex;
  console.log('Removing image at index:', removedIndex, 'from queue of', appState.imageQueue.length);
  
  // 从队列中移除当前图片
  appState.imageQueue.splice(removedIndex, 1);
  
  if (appState.imageQueue.length === 0) {
    // 队列为空，重置到初始状态
    console.log('Queue empty, resetting to initial state');
    resetToInitialState();
  } else {
    // 队列中还有图片，加载下一张
    console.log('Queue has', appState.imageQueue.length, 'images remaining');
    
    // 如果移除的是最后一个，调整索引
    if (removedIndex >= appState.imageQueue.length) {
      appState.currentQueueIndex = appState.imageQueue.length - 1;
    } else {
      // 否则保持当前索引（指向下一个图片）
      appState.currentQueueIndex = removedIndex;
    }
    
    loadQueueImageFromQueue(appState.currentQueueIndex);
  }
  
  // 更新队列面板显示
  const queuePanel = document.getElementById('queuePanel');
  if (queuePanel) {
    queuePanel.style.display = appState.imageQueue.length > 1 ? 'flex' : 'none';
  }
  updateQueuePanel();
}

// 性能优化：预加载相邻图片
function preloadAdjacentImages(currentIndex) {
    const preloadRange = 1; // 预加载前后各1张
    for (let i = currentIndex - preloadRange; i <= currentIndex + preloadRange; i++) {
        if (i >= 0 && i < appState.imageQueue.length && i !== currentIndex) {
            const item = appState.imageQueue[i];
            if (!item.preloaded) {
                const img = new Image();
                img.src = item.dataUrl;
                item.preloaded = true;
            }
        }
    }
}

// 绑定关闭按钮
document.getElementById('closeBtn').addEventListener('click', handleClose);
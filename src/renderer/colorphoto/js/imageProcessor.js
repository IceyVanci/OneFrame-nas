/**
 * ImageProcessor - 图片处理模块
 * 负责渲染色块和处理图片导出
 */

class ImageProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
    this.colors = [];
    this.displayMode = 'vertical'; // vertical | edge
    this.edgePosition = 'right';
    this.blockSize = 150;
    this.showLabel = true;
    this.showColorName = false;
    this.colorNameLanguage = 'en';
    
    // 拖拽状态（五个色块整体拖动）
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.initialPositions = [];
    
    // 色块位置数组（按模式独立存储）
    this.modePositions = {
      vertical: { positions: [], userHasCustom: false },
      grid: { positions: [], userHasCustom: false },
      edge: { positions: [], userHasCustom: false }
    };
    
    // 当前使用的位置引用
    this.blockPositions = [];
  }

  initCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupDragEvents();
  }

  setImage(img) {
    this.originalImage = img;
    if (!img) {
      // img为null时清空画布
      if (this.canvas) {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.blockPositions = [];
      this.colors = [];
      return;
    }
    if (this.canvas) {
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      // 导入新图片时重置所有模式的用户自定义位置
      Object.keys(this.modePositions).forEach(mode => {
        this.modePositions[mode].userHasCustom = false;
        this.modePositions[mode].positions = [];
      });
      this.initBlockPositions();
    }
  }

  setColors(colors) {
    this.colors = colors;
    const modeData = this.modePositions[this.displayMode];
    
    // 如果用户已自定义位置且颜色数量不变，不重置位置
    if (!modeData.userHasCustom || colors.length !== modeData.positions.length) {
      if (this.displayMode === 'vertical' && modeData.positions.length > 0) {
        // 纵向模式：保持中心X和Y位置不变，重新计算位置
        const centerX = modeData.positions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / modeData.positions.length;
        const centerY = modeData.positions.reduce((sum, p) => sum + p.y + p.height / 2, 0) / modeData.positions.length;
        const totalHeight = colors.length * this.blockSize;
        const newStartY = centerY - totalHeight / 2;
        
        this.blockPositions = [];
        colors.forEach((color, index) => {
          this.blockPositions.push({
            x: centerX - this.blockSize / 2,
            y: newStartY + index * this.blockSize,
            width: this.blockSize,
            height: this.blockSize
          });
        });
        modeData.positions = [...this.blockPositions];
      } else {
        this.initBlockPositions();
      }
    } else {
      // 使用保存的位置
      this.blockPositions = [...modeData.positions];
    }
  }

  setDisplayMode(mode) {
    // 切换模式前保存当前位置到对应模式
    this.modePositions[this.displayMode].positions = [...this.blockPositions];
    
    this.displayMode = mode;
    
    // 如果新模式已有保存的位置，加载它
    const modeData = this.modePositions[mode];
    if (modeData.positions.length > 0 && modeData.userHasCustom) {
      this.blockPositions = [...modeData.positions];
      this.render();
    } else {
      this.initBlockPositions();
    }
  }

  setEdgePosition(position) {
    this.edgePosition = position;
  }

  setBlockSize(newSize) {
    // 计算当前整体中心位置
    const oldSize = this.blockSize;
    const oldPositions = [...this.blockPositions];
    
    // 计算中心位置
    let centerX = 0, centerY = 0;
    if (this.blockPositions.length > 0) {
      centerX = this.blockPositions.reduce((sum, p) => sum + p.x + p.width / 2, 0) / this.blockPositions.length;
      centerY = this.blockPositions.reduce((sum, p) => sum + p.y + p.height / 2, 0) / this.blockPositions.length;
    }
    
    this.blockSize = newSize;
    
    // 重新计算位置，保持中心不变
    if (this.displayMode === 'vertical') {
      // 纵向模式：保持中心Y不变
      const blockCount = this.blockPositions.length;
      const totalHeight = blockCount * this.blockSize;
      const newStartY = centerY - totalHeight / 2;
      
      this.blockPositions.forEach((pos, index) => {
        pos.width = this.blockSize;
        pos.height = this.blockSize;
        pos.x = oldPositions[index].x; // X位置不变
        pos.y = newStartY + index * this.blockSize;
      });
    } else if (this.displayMode === 'grid') {
      // 方格模式：保持中心位置不变
      const totalWidth = 2 * this.blockSize;
      const totalHeight = 2 * this.blockSize;
      const newStartX = centerX - totalWidth / 2;
      const newStartY = centerY - totalHeight / 2;
      
      this.blockPositions.forEach((pos, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        pos.width = this.blockSize;
        pos.height = this.blockSize;
        pos.x = newStartX + col * this.blockSize;
        pos.y = newStartY + row * this.blockSize;
      });
    }
    
    this.render();
  }

  setShowLabel(show) {
    this.showLabel = show;
  }

  setShowColorName(show) {
    this.showColorName = show;
  }

  setColorNameLanguage(lang) {
    this.colorNameLanguage = lang;
  }

  // 绘制圆角矩形（可指定哪些角是圆角）
  fillRoundedRect(ctx, x, y, width, height, radius, options = {}) {
    const { topLeft = true, topRight = true, bottomRight = true, bottomLeft = true } = options;
    
    ctx.beginPath();
    
    // 从左上角开始
    if (topLeft) {
      ctx.moveTo(x + radius, y);
    } else {
      ctx.moveTo(x, y);
    }
    
    // 上边到右上角
    if (topRight) {
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
    } else {
      ctx.lineTo(x + width, y);
    }
    
    // 右边到右下角
    if (bottomRight) {
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    } else {
      ctx.lineTo(x + width, y + height);
    }
    
    // 下边到左下角
    if (bottomLeft) {
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
    } else {
      ctx.lineTo(x, y + height);
    }
    
    // 左边回到左上角
    if (topLeft) {
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
    } else {
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
  }

  // 初始化色块位置
  initBlockPositions() {
    if (!this.canvas || !this.colors.length) return;
    
    const imgWidth = this.canvas.width;
    const imgHeight = this.canvas.height;
    
    this.blockPositions = [];
    
    if (this.displayMode === 'vertical') {
      // 纵向模式：色块在图片左侧
      const startX = 10;
      const blockCount = this.colors.length;
      const totalHeight = blockCount * this.blockSize;
      const startY = Math.max(0, (imgHeight - totalHeight) / 2);
      
      this.colors.forEach((color, index) => {
        this.blockPositions.push({
          x: startX,
          y: startY + index * this.blockSize,
          width: this.blockSize,
          height: this.blockSize
        });
      });
    } else if (this.displayMode === 'grid') {
      // 方格模式：2x2布局，仅使用前4个颜色
      const gridColors = this.colors.slice(0, 4);
      const startX = 10;
      const startY = 10;
      
      gridColors.forEach((color, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        this.blockPositions.push({
          x: startX + col * this.blockSize,
          y: startY + row * this.blockSize,
          width: this.blockSize,
          height: this.blockSize
        });
      });
    } else {
      // 边缘模式
      this.updateEdgePositions();
    }
  }

  // 更新边缘位置
  updateEdgePositions() {
    if (!this.canvas) return;
    
    const imgWidth = this.canvas.width;
    const imgHeight = this.canvas.height;
    const isHorizontal = this.edgePosition === 'top' || this.edgePosition === 'bottom';
    
    let blockLen, blockThick, startX, startY;
    
    if (isHorizontal) {
      blockLen = imgWidth / this.colors.length;
      blockThick = this.blockSize;
      startX = 0;
      startY = this.edgePosition === 'top' ? 0 : imgHeight - blockThick;
    } else {
      blockLen = imgHeight / this.colors.length;
      blockThick = this.blockSize;
      startX = this.edgePosition === 'left' ? 0 : imgWidth - blockThick;
      startY = 0;
    }
    
    this.blockPositions = [];
    this.colors.forEach((color, index) => {
      if (isHorizontal) {
        this.blockPositions.push({
          x: index * blockLen,
          y: startY,
          width: blockLen,
          height: blockThick
        });
      } else {
        this.blockPositions.push({
          x: startX,
          y: index * blockLen,
          width: blockThick,
          height: blockLen
        });
      }
    });
  }

  // 设置拖拽事件（五个色块整体拖动）
  setupDragEvents() {
    if (!this.canvas) return;
    
    const getCanvasCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };
    
    // 查找色块（检测任何色块）
    const findBlockAt = (x, y) => {
      for (let i = 0; i < this.blockPositions.length; i++) {
        const pos = this.blockPositions[i];
        if (x >= pos.x && x <= pos.x + pos.width &&
            y >= pos.y && y <= pos.y + pos.height) {
          return i;
        }
      }
      return -1;
    };
    
    this.canvas.addEventListener('mousedown', (e) => {
      // 边缘模式不允许拖动
      if (this.displayMode === 'edge') return;
      
      const coords = getCanvasCoords(e);
      const index = findBlockAt(coords.x, coords.y);
      if (index >= 0) {
        this.isDragging = true;
        this.dragOffsetX = coords.x - this.blockPositions[0].x;
        this.dragOffsetY = coords.y - this.blockPositions[0].y;
        // 保存初始位置用于计算相对偏移
        this.initialPositions = this.blockPositions.map(p => ({ x: p.x, y: p.y }));
        this.canvas.style.cursor = 'grabbing';
      }
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const coords = getCanvasCoords(e);
        const deltaX = coords.x - this.dragOffsetX - this.initialPositions[0].x;
        const deltaY = coords.y - this.dragOffsetY - this.initialPositions[0].y;
        
        // 整体移动所有色块到任意位置
        this.blockPositions.forEach((pos, i) => {
          pos.x = this.initialPositions[i].x + deltaX;
          pos.y = this.initialPositions[i].y + deltaY;
        });
        
        this.render();
      } else {
        if (this.displayMode !== 'vertical') {
          this.canvas.style.cursor = 'default';
          return;
        }
        const coords = getCanvasCoords(e);
        const index = findBlockAt(coords.x, coords.y);
        this.canvas.style.cursor = index >= 0 ? 'grab' : 'default';
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        // 保存拖拽后的位置到当前模式
        this.modePositions[this.displayMode].positions = [...this.blockPositions];
        this.modePositions[this.displayMode].userHasCustom = true;
        this.canvas.style.cursor = 'default';
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      if (this.isDragging) {
        this.isDragging = false;
        // 保存拖拽后的位置到当前模式
        this.modePositions[this.displayMode].positions = [...this.blockPositions];
        this.modePositions[this.displayMode].userHasCustom = true;
        this.canvas.style.cursor = 'default';
      }
    });

    // ===== 触摸事件支持（移动端） =====
    const getTouchCanvasCoords = (e) => {
      const touch = e.touches[0] || e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('touchstart', (e) => {
      // 边缘模式不允许拖动
      if (this.displayMode === 'edge') return;
      
      const coords = getTouchCanvasCoords(e);
      const index = findBlockAt(coords.x, coords.y);
      if (index >= 0) {
        e.preventDefault(); // 防止页面滚动
        this.isDragging = true;
        this.dragOffsetX = coords.x - this.blockPositions[0].x;
        this.dragOffsetY = coords.y - this.blockPositions[0].y;
        this.initialPositions = this.blockPositions.map(p => ({ x: p.x, y: p.y }));
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault(); // 防止页面滚动
        const coords = getTouchCanvasCoords(e);
        const deltaX = coords.x - this.dragOffsetX - this.initialPositions[0].x;
        const deltaY = coords.y - this.dragOffsetY - this.initialPositions[0].y;
        
        this.blockPositions.forEach((pos, i) => {
          pos.x = this.initialPositions[i].x + deltaX;
          pos.y = this.initialPositions[i].y + deltaY;
        });
        
        this.render();
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.modePositions[this.displayMode].positions = [...this.blockPositions];
        this.modePositions[this.displayMode].userHasCustom = true;
      }
    });

    this.canvas.addEventListener('touchcancel', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.modePositions[this.displayMode].positions = [...this.blockPositions];
        this.modePositions[this.displayMode].userHasCustom = true;
      }
    });
  }

  render() {
    if (!this.canvas || !this.ctx || !this.originalImage) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.originalImage, 0, 0);

    this.renderBlocks();
  }

  renderBlocks() {
    const { ctx, colors, blockSize, showLabel, showColorName, colorNameLanguage, displayMode, edgePosition } = this;
    
    // 方格模式只使用前4个颜色
    const renderColors = displayMode === 'grid' ? colors.slice(0, 4) : colors;
    
    // 圆角半径（色块尺寸的12%）
    const cornerRadius = blockSize * 0.12;
    
    renderColors.forEach((color, index) => {
      const pos = this.blockPositions[index] || { x: 0, y: 0, width: blockSize, height: blockSize };
      const isFirst = index === 0;
      const isLast = index === renderColors.length - 1;
      
      // 确定哪些角需要圆角
      let roundedCorners = { topLeft: false, topRight: false, bottomRight: false, bottomLeft: false };
      
      if (displayMode === 'vertical') {
        // 纵向模式：顶部色块只有左上右上圆角，底部色块只有左下右下圆角
        if (isFirst) {
          roundedCorners = { topLeft: true, topRight: true, bottomRight: false, bottomLeft: false };
        } else if (isLast) {
          roundedCorners = { topLeft: false, topRight: false, bottomRight: true, bottomLeft: true };
        }
      } else if (displayMode === 'grid') {
        // 方格模式：2x2布局，外侧四角各只有一个圆角
        // index 0: 左上角(0,0) -> topLeft
        // index 1: 右上角(1,0) -> topRight
        // index 2: 左下角(0,1) -> bottomLeft
        // index 3: 右下角(1,1) -> bottomRight
        if (index === 0) {
          roundedCorners = { topLeft: true, topRight: false, bottomRight: false, bottomLeft: false };
        } else if (index === 1) {
          roundedCorners = { topLeft: false, topRight: true, bottomRight: false, bottomLeft: false };
        } else if (index === 2) {
          roundedCorners = { topLeft: false, topRight: false, bottomRight: false, bottomLeft: true };
        } else if (index === 3) {
          roundedCorners = { topLeft: false, topRight: false, bottomRight: true, bottomLeft: false };
        }
      }
      
      // 绘制色块（使用圆角矩形）
      ctx.fillStyle = color.hex;
      this.fillRoundedRect(ctx, pos.x, pos.y, pos.width, pos.height, cornerRadius, roundedCorners);
      
      // 绘制描边
      if (displayMode !== 'grid') {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 绘制色号
      if (showLabel) {
        const text = color.hex;
        
        if (displayMode === 'vertical') {
          // 纵向模式：色号在色块右侧，无背景，字体至少是色块高度的三分之一
          const labelX = pos.x + pos.width + 5;
          const labelY = pos.y;
          const labelHeight = pos.height;
          
          // 字体至少是色块高度的三分之一
          const fontSize = Math.max(24, labelHeight / 3);
          ctx.font = `bold ${fontSize}px 'MiSans', monospace`;
          
          // 动态计算描边线宽（字体大小的6%）
          const strokeWidth = Math.max(1, fontSize * 0.06);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = strokeWidth;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.strokeText(text, labelX, labelY + labelHeight / 2);
          ctx.fillStyle = color.hex;
          ctx.fillText(text, labelX, labelY + labelHeight / 2);
          
          // 绘制颜色名称（在色号下方），中文去掉结尾的"色"字
          if (showColorName) {
            let colorName = getColorName(color.hex, colorNameLanguage);
            if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
              colorName = colorName.slice(0, -1);
            }
            const nameY = labelY + labelHeight / 2 + fontSize + 5;
            ctx.strokeText(colorName, labelX, nameY);
            ctx.fillStyle = color.hex;
            ctx.fillText(colorName, labelX, nameY);
          }
          
        } else if (displayMode === 'grid') {
          // 方格模式：色号沿底边居中，颜色名称在左上角
          const text = color.hex;
          const nameOffset = pos.width * 0.05; // 距离边缘5%
          const nameFontSize = pos.width / 5; // 颜色名称字体为色块的1/5
          
          // 绘制颜色名称（位于色块左上角）
          if (showColorName) {
            let colorName = getColorName(color.hex, colorNameLanguage);
            if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
              colorName = colorName.slice(0, -1);
            }
            
            ctx.font = `bold ${nameFontSize}px 'MiSans', monospace`;
            const nameStrokeWidth = Math.max(1, nameFontSize * 0.08);
            const nameX = pos.x + nameOffset;
            const maxWidth = pos.width - nameOffset * 2;
            
            // 英文智能换行：允许两次换行
            if (colorNameLanguage === 'en' && ctx.measureText(colorName).width > maxWidth) {
              const lines = [];
              let uppercaseBreaks = [];
              
              // 找到所有大写字母位置（跳过第一个字符后的位置）
              for (let i = 1; i < colorName.length; i++) {
                if (colorName[i] >= 'A' && colorName[i] <= 'Z') {
                  uppercaseBreaks.push(i);
                }
              }
              
              if (uppercaseBreaks.length >= 2) {
                // 两次换行
                const break1 = uppercaseBreaks[Math.floor(uppercaseBreaks.length / 3)];
                const break2 = uppercaseBreaks[Math.floor(uppercaseBreaks.length * 2 / 3)];
                const line1 = colorName.substring(0, break1);
                const line2 = colorName.substring(break1, break2);
                const line3 = colorName.substring(break2);
                if (line1) lines.push(line1);
                if (line2) lines.push(line2);
                if (line3) lines.push(line3);
              } else if (uppercaseBreaks.length === 1) {
                // 一次换行
                const break1 = uppercaseBreaks[0];
                const line1 = colorName.substring(0, break1);
                const line2 = colorName.substring(break1);
                if (ctx.measureText(line1).width < maxWidth) {
                  if (line1) lines.push(line1);
                  if (line2) lines.push(line2);
                } else {
                  lines.push(colorName);
                }
              } else {
                lines.push(colorName);
              }
              
              // 绘制多行
              ctx.strokeStyle = '#000';
              ctx.lineWidth = nameStrokeWidth;
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              lines.forEach((line, idx) => {
                if (line) {
                  const y = pos.y + nameOffset + idx * nameFontSize;
                  ctx.strokeText(line, nameX, y);
                  ctx.fillStyle = color.hex;
                  ctx.fillText(line, nameX, y);
                }
              });
            } else {
              ctx.strokeStyle = '#000';
              ctx.lineWidth = nameStrokeWidth;
              ctx.textAlign = 'left';
              ctx.textBaseline = 'top';
              ctx.strokeText(colorName, nameX, pos.y + nameOffset);
              ctx.fillStyle = color.hex;
              ctx.fillText(colorName, nameX, pos.y + nameOffset);
            }
          }
          
          // 绘制色号（沿底边居中，7个字符宽度为色块的4/5）
          const hexTargetWidth = pos.width * 0.8;
          ctx.font = `bold 24px 'MiSans', monospace`;
          const baseWidth = ctx.measureText(text).width;
          const hexFontSize = Math.floor(24 * hexTargetWidth / baseWidth);
          const hexActualFontSize = Math.max(12, hexFontSize);
          
          ctx.font = `bold ${hexActualFontSize}px 'MiSans', monospace`;
          const outerStrokeWidth = Math.max(1, hexActualFontSize * 0.08);
          const innerStrokeWidth = outerStrokeWidth / 2;
          
          const hexX = pos.x + pos.width / 2;
          const hexY = pos.y + pos.height - nameOffset;
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          // 外层描边（LightGray或白色）
          const outerStrokeColor = color.hex.toUpperCase() === '#D3D3D3' ? '#fff' : '#D3D3D3';
          ctx.strokeStyle = outerStrokeColor;
          ctx.lineWidth = outerStrokeWidth;
          ctx.strokeText(text, hexX, hexY);
          
          // 内层描边（黑色）
          ctx.strokeStyle = '#000';
          ctx.lineWidth = innerStrokeWidth;
          ctx.strokeText(text, hexX, hexY);
          
          // 字体颜色与色块颜色相同
          ctx.fillStyle = color.hex;
          ctx.fillText(text, hexX, hexY);
          
        } else {
          // 边缘模式：色号在边缘1/3处，颜色名称在内侧1/3处
          const isVerticalLabel = edgePosition === 'left' || edgePosition === 'right';
          
          // 字体大小是色块短边的三分之一
          const shortSide = Math.min(pos.width, pos.height);
          const fontSize = shortSide / 3;
          const strokeWidth = Math.max(1, fontSize * 0.06);
          
          ctx.font = `bold ${fontSize}px 'MiSans', monospace`;
          
          if (isVerticalLabel) {
            // 竖向边缘（left/right）
            // 旋转后的坐标系：x 对应原来的垂直方向（居中），y 对应原来的水平方向
            ctx.save();
            ctx.translate(pos.x + pos.width / 2, pos.y + pos.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // right 模式：色号在右1/3处，颜色名称在左1/3处（从边缘向内1/3）
            // left 模式：色号在左1/3处，颜色名称在右1/3处
            // 旋转后 y 轴范围 [-pos.width/2, pos.width/2]，从边缘到1/3处 = pos.width/2 - pos.width/3 = pos.width/6
            const isRight = edgePosition === 'right';
            const hexY = isRight ? pos.width / 6 : -pos.width / 6;
            const nameY = isRight ? -pos.width / 6 : pos.width / 6;
            
            // 绘制颜色名称（在内侧）
            if (showColorName) {
              let colorName = getColorName(color.hex, colorNameLanguage);
              if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
                colorName = colorName.slice(0, -1);
              }
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = strokeWidth;
              ctx.strokeText(colorName, 0, nameY);
              ctx.strokeStyle = '#000';
              ctx.lineWidth = strokeWidth;
              ctx.strokeText(colorName, 0, nameY);
              ctx.fillStyle = color.hex;
              ctx.fillText(colorName, 0, nameY);
            }
            
            // 绘制色号（在边缘）
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, 0, hexY);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, 0, hexY);
            ctx.fillStyle = color.hex;
            ctx.fillText(text, 0, hexY);
            
            ctx.restore();
          } else {
            // 横向边缘（top/bottom）
            // 文字水平居中，竖直方向上：top模式色号在上1/3、颜色名称在下1/3，bottom模式相反
            const centerX = pos.x + pos.width / 2;
            
            const isBottom = edgePosition === 'bottom';
            const hexY = isBottom ? pos.y + pos.height * 2/3 : pos.y + pos.height / 3;
            const nameY = isBottom ? pos.y + pos.height / 3 : pos.y + pos.height * 2/3;
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 绘制颜色名称（在内侧）
            if (showColorName) {
              let colorName = getColorName(color.hex, colorNameLanguage);
              if (colorNameLanguage === 'cn' && colorName.endsWith('色')) {
                colorName = colorName.slice(0, -1);
              }
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = strokeWidth;
              ctx.strokeText(colorName, centerX, nameY);
              ctx.strokeStyle = '#000';
              ctx.lineWidth = strokeWidth;
              ctx.strokeText(colorName, centerX, nameY);
              ctx.fillStyle = color.hex;
              ctx.fillText(colorName, centerX, nameY);
            }
            
            // 绘制色号（在边缘）
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, centerX, hexY);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, centerX, hexY);
            ctx.fillStyle = color.hex;
            ctx.fillText(text, centerX, hexY);
          }
        }
      }
    });
  }

  exportToDataUrl(format = 'image/jpeg') {
    if (!this.canvas) return null;
    if (format === 'image/png') {
      return this.canvas.toDataURL('image/png');
    }
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  getImageSize() {
    if (!this.originalImage) return { width: 0, height: 0 };
    return {
      width: this.originalImage.width,
      height: this.originalImage.height
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageProcessor;
}

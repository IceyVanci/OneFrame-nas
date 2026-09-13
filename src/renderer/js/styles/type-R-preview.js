/**
 * Type R 预览样式模块（Pentax 645N 胶片边缘打印）
 * 布局：黑色胶片底 + 画面窗口（左/上/下窄边，右侧宽胶片带）+ 右带竖排橙色打印
 * - 画布比例锁定 645 单帧：横图 4:3，纵图 3:4（方向随原图）
 * - 画面窗口内照片 cover 填满，可二维拖动选择可见区域（不拉伸、不直接裁切）
 * - 右侧打印 8 项（自顶向下）：署名 / 日期 / 焦距 / 曝光偏差 / 光圈 / 快门 / 曝光模式 / 序号
 * - 动态边缘等距排版：底端锚定图片下边缘（序号底边），各文字块之间空白等宽
 * - 署名用固定 5 字符预留盒：盒顶贴图片上边缘，文字自盒底向上排；≤5 字符在盒内，
 *   >5 字符向上溢出到胶片上边；署名为空时仍保留该盒（其余项位置不变）
 * 文字基准字号 = 0.022 × 显示宽度（预览/导出同比例）
 */

export const TYPE_R_LAYOUT = {
  windowLeft: 0.03,          // 画面窗口左边距（占画布宽）
  windowTop: 0.08,           // 画面窗口上边距（占画布高），也是署名预留盒顶边
  windowWidth: 0.89,         // 画面窗口宽（占画布宽）
  windowHeight: 0.84,        // 画面窗口高（占画布高），也是打印排版高度区间
  stripWidth: 0.08,          // 右侧胶片带宽度（占画布宽）
  baseFont: 0.022,           // 打印文字基准字号（× 画布宽）
  signatureReserveChars: 5,  // 署名预留字符数（固定占位）
  charAdvanceEm: 0.6,        // Doto 单字符步进（em），用于预留盒/回退估算
  letterSpacingEm: 0.04,     // 字距（em），与 CSS .type-r-item 一致
  minGapEm: 0.6              // 相邻项最小空白（em），内容过长时据此缩小字号
};

// 存储当前状态
let state = {
  img: null,
  frameWrapper: null,
  photoFooter: null,
  borderContent: null,
  displayWidth: 0,
  displayHeight: 0,
  winWidth: 0,
  winHeight: 0,
  imageDims: { naturalWidth: 0, naturalHeight: 0 },
  isPortrait: false,
  offset: { x: 0, y: 0 },      // 归一化偏移 [-1, 1]
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  offsetStart: { x: 0, y: 0 }
};

/**
 * 初始化 Type R 预览
 * @param {Object} elements - DOM 元素
 */
export function init(elements) {
  state.img = elements.img;
  state.frameWrapper = elements.frameWrapper;
  state.photoFooter = elements.photoFooter;
  state.borderContent = elements.borderContent;

  if (state.img) {
    state.img.removeEventListener('mousedown', startDrag);
    state.img.addEventListener('mousedown', startDrag);
  }
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', endDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
}

/**
 * 计算画布尺寸（锁定 645 单帧比例；长边按原始像素取，保证不放大）
 * @param {Object} settings - { naturalWidth, naturalHeight }
 * @returns {Object} { squareSize, canvasHeight, isPortrait }
 */
export function calcSize(settings) {
  const { naturalWidth, naturalHeight } = settings;
  const isPortrait = naturalHeight > naturalWidth;
  const ratio = isPortrait ? 3 / 4 : 4 / 3; // 画布 宽/高
  const L = TYPE_R_LAYOUT;
  const winRatio = (L.windowWidth / L.windowHeight) * ratio; // 画面窗口 宽/高
  const imgRatio = naturalWidth / naturalHeight;

  let canvasWidth, canvasHeight;
  if (imgRatio > winRatio) {
    // 高度受限：窗口高 = 原图高
    canvasHeight = naturalHeight / L.windowHeight;
    canvasWidth = canvasHeight * ratio;
  } else {
    canvasWidth = naturalWidth / L.windowWidth;
    canvasHeight = canvasWidth / ratio;
  }

  return {
    squareSize: Math.round(canvasWidth),
    canvasHeight: Math.round(canvasHeight),
    isPortrait
  };
}

/**
 * 设置 frameWrapper 样式（接收显示尺寸）
 * @param {number} squareSize - 显示画布宽
 * @param {number} canvasHeight - 显示画布高
 */
export function updateFrameWrapper(squareSize, canvasHeight) {
  if (!state.frameWrapper) return;

  state.frameWrapper.classList.add('type-r');
  state.frameWrapper.classList.remove(
    'type-a', 'type-b', 'type-c', 'type-d', 'type-e', 'type-f', 'type-g', 'type-h',
    'type-i', 'type-j', 'type-k', 'type-l', 'type-m', 'type-n', 'type-o', 'type-p', 'type-q'
  );

  state.displayWidth = squareSize;
  state.displayHeight = canvasHeight;

  state.frameWrapper.style.width = `${squareSize}px`;
  state.frameWrapper.style.height = `${canvasHeight}px`;

  if (state.borderContent) {
    const baseFontSize = Math.max(8, Math.round(TYPE_R_LAYOUT.baseFont * squareSize));
    state.borderContent.style.fontSize = `${baseFontSize}px`;
  }
}

/**
 * 更新 DOM 预览
 * @param {number} displayW - 显示画布宽
 * @param {number} displayH - 显示画布高
 * @param {Object} imgDimensions - { naturalWidth, naturalHeight }
 */
export function updatePreview(displayW, displayH, imgDimensions = {}) {
  if (!state.img) return;

  if (imgDimensions.naturalWidth && imgDimensions.naturalHeight) {
    state.imageDims = {
      naturalWidth: imgDimensions.naturalWidth,
      naturalHeight: imgDimensions.naturalHeight
    };
  }
  state.displayWidth = displayW;
  state.displayHeight = displayH;
  state.isPortrait = state.imageDims.naturalHeight > state.imageDims.naturalWidth;

  const L = TYPE_R_LAYOUT;
  const winLeft = displayW * L.windowLeft;
  const winTop = displayH * L.windowTop;
  const winW = displayW * L.windowWidth;
  const winH = displayH * L.windowHeight;
  state.winWidth = winW;
  state.winHeight = winH;

  const img = state.img;
  img.style.position = 'absolute';
  img.style.left = `${winLeft}px`;
  img.style.top = `${winTop}px`;
  img.style.width = `${winW}px`;
  img.style.height = `${winH}px`;
  img.style.maxWidth = 'none';
  img.style.maxHeight = 'none';
  img.style.objectFit = 'cover';
  img.style.display = '';
  img.style.clipPath = 'none';
  img.style.transform = 'none';

  if (state.photoFooter) {
    state.photoFooter.style.display = 'none';
  }

  applyOffset();
  updateDragHint();
}

/**
 * 更新边框内容预览（右侧胶片带动态边缘等距竖排打印）
 * 签名用固定 5 字符预留盒；任一项为空都不影响其余排版（签名盒恒定保留）。
 * @param {Object} elements - 边框元素
 * @param {Object} settings - 设置
 */
export function updateContentPreview(elements, settings) {
  if (!state.borderContent) return;
  const slots = buildPrintSlots(settings);

  const render = () => {
    if (!state.borderContent) return;
    const { fontSize, centers } = computePrintLayout(slots, state.displayWidth, state.displayHeight);
    let html = '<div class="type-r-print">';
    if (fontSize > 0) {
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i] || centers[i] == null) continue;
        const topPct = (centers[i] * 100).toFixed(3);
        html += `<div class="type-r-slot" style="top:${topPct}%"><span class="type-r-item" style="font-size:${fontSize}px">${escapeHtml(slots[i])}</span></div>`;
      }
    }
    html += '</div>';
    state.borderContent.innerHTML = html;
  };

  render();

  // Doto 可能尚未加载：就绪后按真实字体度量重排（避免与导出不一致）
  try {
    if (document.fonts && !document.fonts.check("700 16px 'Doto'")) {
      document.fonts.load("700 16px 'Doto'")
        .then(() => {
          if (state.frameWrapper?.classList.contains('type-r')) render();
        })
        .catch(() => {});
    }
  } catch (e) { /* ignore */ }
}

/**
 * 组装打印槽（定长 8，自顶向下）：署名 / 日期 / 焦距 / 曝光偏差 / 光圈 / 快门 / 曝光模式 / 序号
 * 缺项为空串；固定下标即固定位置，某项清空不移动其他项。
 * @param {Object} settings
 * @returns {string[]}
 */
export function buildPrintSlots(settings = {}) {
  const sig = String(settings.signatureText || '').trim();
  const date = formatPrintDate(settings.printDate);
  const focal = String(settings.printFocalLength || '').trim();
  const bias = String(settings.printExposureBias || '').trim();
  const aperture = String(settings.printFNumber || '').trim();
  const shutter = String(settings.printExposureTime || '').trim();
  const mode = String(settings.printExposureMode || '').trim();
  const seq = String(settings.frameNumber || '').trim();
  return [sig, date, focal, bias, aperture, shutter, mode, seq];
}

/**
 * 打印日期格式化为 YY/MM/DD（输入 YYYY-MM-DD，即原生 date 控件值）
 * @param {string} raw
 * @returns {string}
 */
function formatPrintDate(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1].slice(2)}/${m[2]}/${m[3]}`;
  return s;
}

let _measureCtx = null;
function getMeasureCtx() {
  if (_measureCtx) return _measureCtx;
  try {
    _measureCtx = document.createElement('canvas').getContext('2d');
  } catch (e) {
    _measureCtx = null;
  }
  return _measureCtx;
}

/**
 * 计算打印排版：动态边缘等距 + 署名固定 5 字符预留盒（预览/导出共用）
 * - 排版区间：windowTop → windowTop + windowHeight（底端为图片下边缘，序号底边对齐）
 * - 各非空项之间空白等宽；签名以 5 字符盒参与排版，文字自盒底向上排
 * @param {string[]} slots - buildPrintSlots 的结果
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{fontSize:number, centers:(number|null)[]}} centers 为文字中心（画布高比例），空槽为 null
 */
export function computePrintLayout(slots, canvasWidth, canvasHeight) {
  const L = TYPE_R_LAYOUT;
  const w = canvasWidth || 0;
  const h = canvasHeight || 0;
  if (!w || !h) return { fontSize: 0, centers: slots.map(() => null) };

  const ctx = getMeasureCtx();

  // 在给定"字号占画布高比例 em"下测量各槽长度（画布高比例）
  const measure = (em) => {
    const fontPx = em * h;
    if (ctx) {
      ctx.font = `700 ${fontPx}px 'Doto', 'MiSans', sans-serif`;
      try { ctx.letterSpacing = `${L.letterSpacingEm * fontPx}px`; } catch (e) { /* 不支持则忽略 */ }
    }
    const lengths = slots.map((t) => {
      if (!t) return 0;
      if (ctx) return ctx.measureText(t).width / h;
      return t.length * L.charAdvanceEm * em; // 回退估算
    });
    const sigReserve = L.signatureReserveChars * L.charAdvanceEm * em;
    return { lengths, sigReserve };
  };

  const buildEntries = (d) => {
    const list = [{ slot: 0, isSig: true, reserved: d.sigReserve, actual: d.lengths[0] }];
    for (let i = 1; i < slots.length; i++) {
      if (slots[i]) list.push({ slot: i, isSig: false, reserved: d.lengths[i], actual: d.lengths[i] });
    }
    return list;
  };

  let em = L.baseFont * (w / h);
  let data = measure(em);
  let entries = buildEntries(data);
  const n = entries.length;
  const span = L.windowHeight;

  // 内容过长：线性缩小字号，保证总长度 + 最小空白 ≤ 排版区间
  if (n > 1) {
    const total = entries.reduce((s, e) => s + e.reserved, 0);
    const needed = (n - 1) * L.minGapEm * em;
    if (total > 0 && total + needed > span) {
      em = em * span / (total + needed);
      data = measure(em);
      entries = buildEntries(data);
    }
  }

  const total = entries.reduce((s, e) => s + e.reserved, 0);
  const gap = n > 1 ? Math.max(0, (span - total) / (n - 1)) : 0;

  const centers = slots.map(() => null);
  let top = L.windowTop;
  for (const e of entries) {
    // 签名：文字自盒底向上排；其余：文字中心即槽中心
    centers[e.slot] = e.isSig ? top + e.reserved - e.actual / 2 : top + e.actual / 2;
    top += e.reserved + gap;
  }

  return { fontSize: Math.round(em * h), centers };
}

/**
 * 计算 cover 后图片的绘制尺寸与最大偏移（显示像素）
 */
function getMaxOffset() {
  const { naturalWidth, naturalHeight } = state.imageDims;
  const winW = state.winWidth;
  const winH = state.winHeight;
  if (!naturalWidth || !naturalHeight || !winW || !winH) {
    return { x: 0, y: 0, drawnW: 0, drawnH: 0 };
  }
  const imgRatio = naturalWidth / naturalHeight;
  const winRatio = winW / winH;
  let drawnW, drawnH;
  if (imgRatio > winRatio) {
    drawnH = winH;
    drawnW = winH * imgRatio;
  } else {
    drawnW = winW;
    drawnH = winW / imgRatio;
  }
  return {
    x: Math.max(0, (drawnW - winW) / 2),
    y: Math.max(0, (drawnH - winH) / 2),
    drawnW,
    drawnH
  };
}

/**
 * 应用归一化偏移到 object-position
 */
function applyOffset() {
  const m = getMaxOffset();
  const px = m.x > 0 ? 50 + state.offset.x * 50 : 50;
  const py = m.y > 0 ? 50 + state.offset.y * 50 : 50;
  if (state.img) {
    state.img.style.objectPosition = `${px}% ${py}%`;
  }
}

/**
 * 开始拖动
 */
function startDrag(e) {
  if (!state.img) return;
  e.preventDefault();
  state.isDragging = true;
  state.dragStart = { x: e.clientX, y: e.clientY };
  state.offsetStart = { ...state.offset };
}

/**
 * 拖动中（二维）
 */
function onDrag(e) {
  if (!state.isDragging || !state.img) return;
  e.preventDefault();
  const m = getMaxOffset();
  const deltaX = e.clientX - state.dragStart.x;
  const deltaY = e.clientY - state.dragStart.y;
  if (m.x > 0) {
    state.offset.x = clamp(state.offsetStart.x - deltaX / m.x, -1, 1);
  }
  if (m.y > 0) {
    state.offset.y = clamp(state.offsetStart.y - deltaY / m.y, -1, 1);
  }
  applyOffset();
}

/**
 * 结束拖动
 */
function endDrag() {
  state.isDragging = false;
}

/**
 * 数值钳制
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 更新拖动提示
 */
function updateDragHint() {
  if (!state.frameWrapper) return;
  const parent = state.frameWrapper.parentElement;
  if (!parent) return;

  parent.querySelectorAll('.type-r-drag-hint').forEach(hint => hint.remove());

  const m = getMaxOffset();
  if (m.x > 5 || m.y > 5) {
    const hint = document.createElement('div');
    hint.className = 'type-r-drag-hint';
    hint.textContent = '拖动选择显示区域';
    parent.insertBefore(hint, state.frameWrapper.nextSibling);
  }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 获取归一化偏移量（[-1,1]，用于导出）
 */
export function getNormalizedOffset() {
  return { ...state.offset };
}

/**
 * 重置图片偏移量
 */
export function resetImageOffset() {
  state.offset = { x: 0, y: 0 };
  applyOffset();
}

/**
 * 获取当前状态（只读副本）
 */
export function getState() {
  return {
    displayWidth: state.displayWidth,
    displayHeight: state.displayHeight,
    winWidth: state.winWidth,
    winHeight: state.winHeight,
    offset: { ...state.offset }
  };
}

/**
 * 重置样式
 */
export function reset() {
  if (state.img) {
    state.img.style.position = '';
    state.img.style.left = '';
    state.img.style.top = '';
    state.img.style.width = '';
    state.img.style.height = '';
    state.img.style.maxWidth = '';
    state.img.style.maxHeight = '';
    state.img.style.objectFit = '';
    state.img.style.objectPosition = '';
    state.img.style.clipPath = '';
    state.img.style.transform = '';
  }

  if (state.photoFooter) {
    state.photoFooter.style.display = '';
  }

  if (state.frameWrapper) {
    state.frameWrapper.classList.remove('type-r');
    state.frameWrapper.classList.add('type-a');
    state.frameWrapper.style.width = '';
    state.frameWrapper.style.height = '';
  }

  if (state.borderContent) {
    state.borderContent.style.fontSize = '';
    state.borderContent.innerHTML = `
      <div class="border-content-inner">
        <div class="border-logo" id="borderLogo"></div>
        <div class="border-info">
          <div class="border-info-inner">
            <div class="border-text border-model" id="borderModel"></div>
            <div class="border-text border-params" id="borderParams"></div>
          </div>
        </div>
        <div class="border-focal">
          <div class="border-text border-focal-text" id="borderFocal"></div>
        </div>
        <div class="border-right">
          <div class="border-right-inner">
            <div class="border-text border-signature" id="borderSignature"></div>
            <div class="border-text" id="borderTime"></div>
          </div>
        </div>
      </div>
    `;
  }

  state.displayWidth = 0;
  state.displayHeight = 0;
  state.winWidth = 0;
  state.winHeight = 0;
  state.offset = { x: 0, y: 0 };
}

/**
 * Type R 预览样式配置
 */
export const typeRPreview = {
  id: 'type-r',
  name: 'Type R Preview',
  init,
  calcSize,
  updateFrameWrapper,
  updatePreview,
  updateContentPreview,
  reset,
  getNormalizedOffset,
  resetImageOffset,
  getState
};

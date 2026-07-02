// OneFrame NAS 首页缩略图选择器
// 使用 sample-manifest.json 清单文件替代暴力探测，1 次 fetch 替代 2,574 次 HEAD 请求

/**
 * styleId（如 'type-l'）转换为 Type 名称（如 'TypeL'）。
 * @param {string} styleId
 * @returns {string}
 */
function styleIdToTypeName(styleId) {
  const match = styleId.match(/^type-(.)(.*)$/);
  if (!match) {
    return styleId.charAt(0).toUpperCase() + styleId.slice(1);
  }
  return 'Type' + match[1].toUpperCase() + match[2];
}

/**
 * Fisher-Yates 洗牌算法（返回新数组，不修改原数组）。
 * @param {Array} array
 * @returns {Array}
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 从单个 .style-card 解析样式缩略图元信息。
 * @param {HTMLElement} card
 * @returns {{ styleId: string, typeName: string, basePath: string } | null}
 */
function buildStyleThumbnailMeta(card) {
  const styleId = card.dataset.style;
  if (!styleId) return null;

  const img = card.querySelector('.preview-image');
  let basePath = '';
  let typeName = '';

  if (img) {
    const fallbackSrc = img.getAttribute('data-fallback-src') || '';
    const src = fallbackSrc || img.getAttribute('src') || '';
    if (src && !src.startsWith('data:')) {
      basePath = src;
      const typeMatch = src.match(/(Type[A-Z])-/);
      if (typeMatch) {
        typeName = typeMatch[1];
      }
    }
  }

  if (!typeName) {
    typeName = styleIdToTypeName(styleId);
  }

  if (!basePath) {
    basePath = `Sample/${typeName}-sample_compressed.jpeg`;
  }

  return { styleId, typeName, basePath };
}

/**
 * 获取 sample-manifest.json 清单文件。
 * @param {string} manifestUrl - 清单文件 URL
 * @returns {Promise<Object|null>}
 */
async function fetchManifest(manifestUrl) {
  try {
    const resp = await fetch(manifestUrl);
    if (!resp.ok) return null;
    const manifest = await resp.json();
    if (manifest && manifest.samples && typeof manifest.samples === 'object') {
      return manifest;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 从 manifest 清单中为每个样式随机选取缩略图，保证不同样式尽量不重复 imageId。
 * @param {Object} manifest - { samples: { TypeA: ["01","022"], ... } }
 * @param {Array<{ styleId: string, typeName: string, basePath: string }>} metaList
 * @returns {Map<string, string>} styleId → 最终缩略图路径
 */
function selectRandomFromManifest(manifest, metaList) {
  const usedImageIds = new Set();
  const assignments = new Map();
  const shuffledMetas = shuffle(metaList);

  for (const meta of shuffledMetas) {
    const candidates = manifest.samples[meta.typeName];
    if (!candidates || candidates.length === 0) {
      assignments.set(meta.styleId, meta.basePath);
      continue;
    }

    const shuffledCandidates = shuffle(candidates);
    let assigned = false;

    for (const imageId of shuffledCandidates) {
      if (!usedImageIds.has(imageId)) {
        usedImageIds.add(imageId);
        const path = `Sample/${imageId}-${meta.typeName}-sample_compressed.jpeg`;
        assignments.set(meta.styleId, path);
        assigned = true;
        break;
      }
    }

    // 所有候选 ID 都已被其他样式使用，回退到 basePath
    if (!assigned) {
      // 允许重复使用 ID（所有候选都被占用了）
      const fallbackId = shuffledCandidates[0];
      const path = `Sample/${fallbackId}-${meta.typeName}-sample_compressed.jpeg`;
      assignments.set(meta.styleId, path);
    }
  }

  return assignments;
}

/**
 * 首页缩略图初始化入口。
 * 从 sample-manifest.json 获取样本清单，随机选取后写入 <img> src。
 * @param {NodeList|HTMLElement[]} styleCards - .style-card 元素集合
 * @param {object} [options]
 * @param {string} [options.manifestUrl='Sample/sample-manifest.json'] - 清单文件 URL
 * @returns {Promise<Map<string, string>>} styleId → 最终缩略图路径
 */
export async function initHomepageThumbnails(styleCards, options = {}) {
  const {
    manifestUrl = 'Sample/sample-manifest.json'
  } = options;

  // 解析所有样式卡片的元信息
  const metas = [];
  for (const card of styleCards) {
    const meta = buildStyleThumbnailMeta(card);
    if (meta) {
      metas.push(meta);
    }
  }

  if (metas.length === 0) return new Map();

  // 获取 manifest 清单
  const manifest = await fetchManifest(manifestUrl);

  let assignments;

  if (manifest) {
    // manifest 获取成功，从中随机选取
    assignments = selectRandomFromManifest(manifest, metas);
  } else {
    // manifest 获取失败，使用 data-fallback-src 回退
    console.warn('sample-manifest.json 加载失败，使用默认缩略图');
    assignments = new Map();
    for (const meta of metas) {
      assignments.set(meta.styleId, meta.basePath);
    }
  }

  // 写入 img.src
  for (const card of styleCards) {
    const styleId = card.dataset.style;
    if (!styleId) continue;
    const path = assignments.get(styleId);
    if (!path) continue;
    const img = card.querySelector('.preview-image');
    if (img) {
      img.src = path;
    }
  }

  return assignments;
}
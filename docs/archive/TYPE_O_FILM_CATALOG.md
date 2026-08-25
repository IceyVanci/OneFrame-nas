# Type O 胶片清单（待检查）

> 用途：Type O 模板编辑面板「胶片」输入框的下拉建议（`<input list="filmPresets">` + `<datalist>`）。
> 交互：选「厂商」后，datalist 按 `films[厂商]` 筛选；`films[厂商]` 为空时回退为全部胶片并集；**始终可手动输入任意文字**。
> 标注：**彩色** / **黑白** / **正片** / **电影卷** / **特效卷**；◆=当前计划已含，✚=建议新增。
> 本版已按你的修改更新（厂商精简、新增 Lucky/Fomapan）；末尾「待确认项」列出需你拍板的点，确认后写入 `src/renderer/films.json`。

---

## Kodak 柯达

- ◆ Kodak Portra 400（彩色）
- ◆ Kodak Portra 160（彩色）
- ✚ Kodak Portra 800（彩色）
- ◆ Kodak Ektar 100（彩色）
- ◆ Kodak Gold 200（彩色）
- ◆ Kodak ColorPlus 200（彩色）
- ✚ Kodak Ultramax 400（彩色）
- ✚ Kodak Pro Image 100（彩色）
- ◆ Kodak Vision3 5219 / 500T（电影卷）
- ✚ Kodak Vision3 250D / 5207、50D / 5203、200T / 5213（电影卷）
- ◆ Kodak Tri-X 400（黑白）
- ✚ Kodak T-Max 100 / 400 / 3200（黑白）
- ✚ Kodak Ektachrome E100（正片）
- ✚ Kodak Kodachrome 64（正片，已停产，经典）

## Fujifilm 富士

- ◆ Fujifilm C200（彩色）
- ◆ Fujifilm Superia X-TRA 400（彩色）
- ✚ Fujifilm Superia 200 / 800 / Premium 400（彩色）
- ✚ Fujifilm Color 100 / 200（彩色）
- ◆ Fujifilm Pro 400H（彩色，已停产）
- ✚ Fujifilm Industrial 100（业务用）
- ◆ Fujifilm Velvia 50（正片）
- ◆ Fujifilm Provia 100F（正片）
- ✚ Fujifilm Velvia 100、Astia 100F（正片）
- ✚ Fujifilm Neopan 100 / 400、ACROS 100 / ACROS II（黑白）

## Ilford 伊尔福

- ◆ Ilford HP5 Plus 400（黑白）
- ◆ Ilford Delta 400（黑白）
- ✚ Ilford FP4 Plus 125、Delta 100 / 3200、Pan F Plus 50、XP2 Super 400、Ortho Plus 80（黑白）
- ✚ Ilford Kentmere 100 / 400（黑白，入门级）

## Cinestill 影星

- ◆ Cinestill 800T（电影卷去碳层）
- ◆ Cinestill 400D（彩色）
- ✚ Cinestill 50D（彩色）

## Lomography 乐魔

- ◆ Lomography 400（彩色）
- ◆ Lomography Color Negative 800（彩色）
- ✚ Lomography CN 100 / 200（彩色）
- ✚ LomoChrome Purple / Metropolis / Turquoise / Color '92（特效卷）
- ✚ Lomography Earl Grey 100（黑白）

## Agfa 爱克发

- ◆ AgfaPhoto APX 400（黑白）
- ✚ AgfaPhoto APX 100（黑白）
- ✚ AgfaPhoto Vista 200（彩色，已停产）
- ✚ AgfaPhoto Color 200（彩色）

## Rollei 禄来

- ✚ Rollei RPX 25 / 100 / 400（黑白）
- ✚ Rollei Retro 80S / 400S（黑白）
- ✚ Rollei CN 200（黑白，C41 工艺）

## Adox（德国，近年流行）

- ✚ Adox CHS 100 II / 50 II（黑白）
- ✚ Adox Color Mission 200（彩色）
- ✚ Adox HR-50（黑白）

## Orwo（德国，近年流行）

- ✚ Orwo Wolfen NC500（彩色）
- ✚ Orwo UN 54 / UN 100（黑白）

## Lucky 乐凯

- ✚ Lucky 200（彩色）
- ✚ Lucky 400（彩色）
- ✚ Lucky SHD 100（黑白）
- ✚ Lucky SHD 400（黑白）

## Fomapan 福马

- ✚ FOMAPAN 100（黑白）
- ✚ FOMAPAN 200（黑白）
- ✚ FOMAPAN 400（黑白）
- ✚ FOMAPAN ORTHO 400（黑白，正色）

---

## 建议初始 `films.json`（v3，已按你的厂商修改 + 新增 Lucky/Fomapan）

```json
{
  "version": 3,
  "manufacturers": [
    "Canon", "Kodak", "Fujifilm", "Nikon", "Leica", "Hasselblad",
    "Pentax", "Olympus", "Rollei", "Ilford", "Cinestill", "Lucky", "Fomapan"
  ],
  "films": {
    "Kodak": [
      "Kodak Portra 400", "Kodak Portra 160", "Kodak Portra 800",
      "Kodak Ektar 100", "Kodak Gold 200", "Kodak ColorPlus 200",
      "Kodak Ultramax 400", "Kodak Pro Image 100",
      "Kodak Vision3 500T", "Kodak Vision3 250D", "Kodak Tri-X 400",
      "Kodak T-Max 400", "Kodak Ektachrome E100"
    ],
    "Fujifilm": [
      "Fujifilm C200", "Fujifilm Superia X-TRA 400", "Fujifilm Superia 200",
      "Fujifilm Color 100", "Fujifilm Pro 400H", "Fujifilm Industrial 100",
      "Fujifilm Velvia 50", "Fujifilm Provia 100F",
      "Fujifilm Neopan 400", "Fujifilm ACROS 100"
    ],
    "Ilford": [
      "Ilford HP5 Plus 400", "Ilford Delta 400", "Ilford FP4 Plus 125",
      "Ilford Delta 3200", "Ilford Pan F Plus 50", "Ilford XP2 Super 400",
      "Ilford Kentmere 400"
    ],
    "Cinestill": ["Cinestill 800T", "Cinestill 400D", "Cinestill 50D"],
    "Lomography": [
      "Lomography 400", "Lomography Color Negative 800", "Lomography CN 100",
      "LomoChrome Purple", "LomoChrome Metropolis", "Lomography Earl Grey 100"
    ],
    "Agfa": [
      "AgfaPhoto APX 400", "AgfaPhoto APX 100",
      "AgfaPhoto Vista 200", "AgfaPhoto Color 200"
    ],
    "Rollei": [
      "Rollei RPX 100", "Rollei RPX 400", "Rollei Retro 80S", "Rollei CN 200"
    ],
    "Adox": ["Adox CHS 100 II", "Adox Color Mission 200", "Adox HR-50"],
    "Orwo": ["Orwo Wolfen NC500", "Orwo UN 54"],
    "Lucky": ["Lucky 200", "Lucky 400", "Lucky SHD 100", "Lucky SHD 400"],
    "Fomapan": ["FOMAPAN 100", "FOMAPAN 200", "FOMAPAN 400", "FOMAPAN ORTHO 400"]
  }
}
```

---

## 厂商列表说明（按你的修改更新）

- **相机品牌**（用于成品图第 2 行"厂商 + 机型"）：Canon、Nikon、Leica、Hasselblad、Pentax、Olympus
- **胶片品牌（厂商下拉可筛选）**：Kodak、Fujifilm、Rollei、Ilford、Cinestill、Lucky、Fomapan
- **胶片品牌（未列入厂商下拉，仅通过"全部胶片并集"回退出现）**：Lomography、Agfa、Adox、Orwo
- 相机品牌（如 Canon）无对应胶片条目 → datalist 自动回退为**全部胶片并集**
- 该列表可随时在 `films.json` 增删

---

## 待确认项（更新时我替你做了以下判断，请核对）

1. **已将 Lucky、Fomapan 加入厂商下拉**（新增胶片品牌可被筛选）；若你希望它们仅在"全部胶片回退"中出现，可移出 `manufacturers`。
2. **已删除 Polaroid、Shanghai 的胶片条目**（其小节被你移除）；如需保留请加回。
3. **Lomography、Agfa、Adox、Orwo 保留在胶片表、但不在厂商下拉**（仅通过回退并集出现）；如需直接从厂商下拉筛选，请加入 `manufacturers`。
4. 已移除厂商列表中的 **Sony**（原相机品牌）。
5. 原 `films.json` 中 `manufacturers` 存在**尾逗号**（无效 JSON），已修正。

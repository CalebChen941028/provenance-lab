# 09 · 图表规范化审计（目标期刊：Psychology Research and Behavior Management）

日期：2026-10-24。审计对象为 `04-analysis/figures/` 下三张图（`figure-R1-scatter-ols-ci.png`、`figure-R2-regression-diagnostics.png`、`figure-S1-marginal-distributions.png`），由 `04-analysis/03_freeze_analyze.py:557-661` 生成。规范化版本输出至 `04-analysis/figures-polished/`，原图未改动。重绘脚本：`figures-polished/figures_polish.py`。

两点口径说明：

1. 任务给定路径 `…/04-analysis/run-03-summary.txt/figures` 中 `run-03-summary.txt` 是文件（1.7 KB，`ls -la` 核验），实际图表目录为其同级目录 `04-analysis/figures/`，本次按该目录审计；规范化输出同样落到同级目录 `04-analysis/figures-polished/`。
2. `tables/` 目录仅有 9 个 CSV 表格文件，无配图（`find 04-analysis/tables -type f` 核验，输出全为 `.csv`），故审计只覆盖上述三张图。

## 1 期刊规范要点（Dove Medical Press，适用于 PRBM）

依据：Dove Press 作者指南 "Manuscript Figures & Tables" 页（https://www.dovepress.com/author-guidelines/figures-tables ，WebFetch 于 2026-10-24 抓取）。页面原文摘录与本次执行对照：

| 条目 | 期刊要求（原文） | 本次执行 |
|---|---|---|
| 文件格式 | ".jpeg, .jpg, .bmp, .png, .gif, .tiff"（PDF/EPS 不在列） | 每图输出 PNG + TIFF 两版投稿格式；PDF 仅作矢量存档，不随稿提交 |
| 分辨率 | "Combination images: minimum 600 dpi" | 图表属组合图，全部按 600 dpi 输出 |
| 字体 | "Arial, and Symbol (Roman)"，字号全图一致 | 统一 Arial，基准 8 pt |
| 面板标号 | 多面板须标 "eg, A, B, C, D" | 粗体大写 A/B/C/D（R2 四面板、S1 六面板），置于各面板左上角 |
| 图内语言 | "All text in English" | 全部标注改英文 |
| 色彩模式 | "Image colour should be RGB" | PNG/TIFF 均为 RGB（无 alpha 通道） |
| 透明/图层 | "No layers or transparent objects" | 原 RGBA 已拍平到白底 RGB |
| 图注 | 图注随文稿另给，不进图面 | 原图题注内嵌统计量移入图注文案（见 §5） |
| 命名 | "[manuscript ID] Figure [number]" | 保留内部可追溯文件名；投稿时按该规则改名（R1→Figure 1、R2→Figure 2，S1 为补充材料图） |
| 栏宽 | 页面未给具体栏宽数值 | 按 89 mm（单栏）/180 mm（双栏）通行版面排字，字号按最终物理尺寸设定 |

通用科研图规范（本组默认）：Okabe-Ito 色盲友好配色；语义固定——蓝=数据点/条形、天蓝=置信带、朱红=数据驱动平滑（LOWESS）或超阈标记、灰=固定参考线；去顶右刺脊；无网格、无 3D、无装饰渐变；坐标轴带单位。

## 2 逐图审计（问题 → 改动 → 依据）

### 2.1 figure-R1-scatter-ols-ci（散点 + OLS + 95%CI + LOWESS）

| # | 问题（原图证据） | 改动 | 依据 |
|---|---|---|---|
| 1 | 图内嵌两行题注 "Figure R1 摄入量与考试焦虑…/Pearson r(298)=0.200, 95%CI […]”（`03_freeze_analyze.py:586-587`） | 删除图内题注；r、CI、t、p 移入投稿图注文案（§5） | Dove 要求图注随文稿另给；统计量放图注是期刊通行做法 |
| 2 | 全图中文标注（`03_freeze_analyze.py:36-37` 设 PingFang SC，标签 `584-585` 行） | 全部改英文（"Daily caffeine intake (mg/day)"、"TAS total score (0–37)"），单位保留 | Dove："All text in English"；Arial/Symbol Roman |
| 3 | 字体 PingFang SC/Heiti SC 回退链，非期刊字体 | Arial 统一，`pdf.fonttype=42` 嵌入 | Dove 字体条款 |
| 4 | 图宽 7.1 in（180 mm），8.5 pt 图例缩到 89 mm 栏宽后仅约 4.2 pt | 按单栏 89 mm（3.5 in）直接排字：基准 8 pt、图例 6.2 pt、脚注 6 pt，印刷比例下全部 ≥5 pt | 印刷文字下限 5–7 pt；按最终物理尺寸排字避免二次缩放 |
| 5 | 默认蓝 #1f77b4、深蓝 #08306b、橙 #d94801 混用，无固定语义 | Okabe-Ito：点 #0072B2、CI 带 #56B4E9、OLS 线近黑 #1A1A1A、LOWESS 朱红 #D55E00 虚线；三张图同一语义映射 | 色盲友好配色；面板间配色统一 |
| 6 | 图例缺散点项，仅 3 项（`588` 行） | 增补 "Observations (n=300)"，共 4 项 | 图例自足原则 |
| 7 | 四边完整框线（matplotlib 默认刺脊） | 去顶、右刺脊 | 去图表垃圾 |
| 8 | PNG 单格式、300 dpi、RGBA（`file` 输出 "8-bit/color RGBA"） | PNG 600 dpi RGB + TIFF 600 dpi LZW + PDF 矢量存档，共三版 | Dove 600 dpi/RGB/无透明条款 |
| 9 | 水印 7 pt 灰字中文（`589-590` 行） | 保留同等信息，改英文 6 pt："Simulated data (fixed-seed demonstration run; not for real-world inference)" | 图须自明数据性质；6 pt ≥5 pt 下限 |

数值未动：散点、OLS（`np.polyfit` 同口径）、CI 带（同公式 `570-581` 行）、LOWESS（frac=2/3, it=0，同 `582` 行）逐一复刻；斜率复算 1.517 分/100mg·d⁻¹、截距 15.738，与 M0（table-R2）一致。

### 2.2 figure-R2-regression-diagnostics（2×2 诊断四联）

| # | 问题（原图证据） | 改动 | 依据 |
|---|---|---|---|
| 1 | 图内嵌总标题 "Figure R2 主模型 M1 回归诊断四联图（模拟数据，n=300）"（`629` 行 suptitle） | 删除；图注文案承接 | 同 2.1#1 |
| 2 | 面板标号 "(a) (b) (c) (d)" 小写带括号、混入面板标题（`603/610/617/625` 行） | 粗体大写 A/B/C/D 独立置各面板左上角，标题改英文短句居中（"Normal Q–Q of M1 residuals" 等） | Dove "A, B, C, D" 标号；字母与描述分离便于图注引用 |
| 3 | 中文轴标/标题 | 英文（"Theoretical quantiles"、"Fitted values (TAS)"、"Cook's D"、"Record ID (sid)" 等） | Dove 英文条款 |
| 4 | 图宽 9.5 in（241 mm）超出常规版面 | 7.1 in（180 mm）双栏宽，基准 8 pt | 版面通行尺寸；字号按物理尺寸设定 |
| 5 | 配色：#1f77b4 点、#d94801 平滑线与参考线混用（Q–Q 参考线、残差 0 线、4/n 阈值线全用橙） | 数据点蓝；LOWESS 朱红虚线；固定参考线（Q–Q 理论线、0 线、4/n 阈值线）统一灰 #555555；超阈 Cook's D 点朱红高亮 | 语义固定配色：数据/平滑/参考三分，灰不作数据色 |
| 6 | 阈值图例 "阈值 4/n = 0.0133" 中文 | "Threshold 4/n = 0.0133"，置右上图例 | 语言条款；数值与原图一致（thr=4/300） |
| 7 | PNG 300 dpi RGBA | PNG 600 dpi RGB + TIFF + PDF | 同 2.1#8 |
| 8 | 四边框线 | 去顶右刺脊 | 去图表垃圾 |
| 9 | 水印中文 7 pt | 英文 6 pt，同 2.1#9 | 同上 |

数值未动：M1 同公式重拟合（`FORMULA_M1` 与 `03_freeze_analyze.py:204` 逐字一致），残差、标准化残差、Cook's D 及阈值全用同一口径；复算 b₁=1.248、CI [0.405, 2.091]、超阈 16 条，与 table-R2、table-S1b 一致。

### 2.3 figure-S1-marginal-distributions（2×3 边际形态核查）

| # | 问题（原图证据） | 改动 | 依据 |
|---|---|---|---|
| 1 | 总标题内嵌图内并含 "Figure S1" 字样与括注说明（`654-655` 行） | 删除；说明移图注（截断致尾部偏离为预期） | 同 2.1#1 |
| 2 | 面板标号 "a) b) c) / d) e) f)" 小写带括号（`645/651` 行） | 粗体大写 A–F 独立标于各面板左上角 | Dove 标号条款 |
| 3 | 中文标题/轴标/图例（"摄入量 (mg/d) 直方图"、"Table 2 理论密度"） | 英文：上排直方图标题含变量名与取值范围，下排 "Q–Q vs lognormal/normal"；图例 "Observed (density)"、"SAP Table 2 theoretical" | Dove 英文条款 |
| 4 | 图宽 10.5 in（267 mm） | 7.1 in（180 mm） | 版面尺寸 |
| 5 | 上排无 y 轴标签（直方图密度轴无标注） | 上排补 "Density"，下排 "Sample quantiles"/"Theoretical quantiles" | 坐标轴须带量纲/单位；图例自足 |
| 6 | 理论密度曲线用深蓝 #08306b（`644` 行），与数据色同族 | 理论参考曲线统一灰 #555555；条形蓝 #0072B2 | 语义三分配色（参考=灰） |
| 7 | PNG 300 dpi RGBA | PNG 600 dpi RGB + TIFF + PDF | 同 2.1#8 |
| 8 | 中文水印 | 英文 6 pt 脚注 | 同 2.1#9 |

数值未动：bins=24、density=True、理论分布参数（lognorm s=0.62, scale=130；norm(18.4, 8.0)；norm(6.5, 3.2)）与 `637-639` 行逐字一致。

## 3 数值一致性核验（只改呈现，不改结果）

重绘运行命令与完整输出（工作目录 `04-analysis`，解释器 `.venv/bin/python`，与原脚本同一环境）：

```
$ ./.venv/bin/python figures-polished/figures_polish.py
[R1] r=0.200 fisherCI=[0.089,0.307] ols_intercept=15.738 slope_per100=1.517
[R2] M1 b1=1.248 CI=[0.405,2.091] cooks>thr n=16 thr=0.0133
[S1] cols=['caffeine_mg', 'tas_total', 'psqi_total'] bins=24 density=True
[pdf] figure-R1-scatter-ols-ci: FontFile2=True ArialName=True
[pdf] figure-R2-regression-diagnostics: FontFile2=True ArialName=True
[pdf] figure-S1-marginal-distributions: FontFile2=True ArialName=True
[done] outputs in /Users/.../04-analysis/figures-polished
```

对照冻结口径：r=0.200、95%CI [0.089, 0.307] 与 `table-R2-primary-results.csv` H1a 行一致；M1 b₁=1.248、CI [0.405, 2.091] 与 H1b 行一致；Cook's D 阈值 4/300≈0.0133、超阈 16 条与 `table-S1-diagnostics.csv` 及 `table-S1b-cooks-distance.csv`（16 行）一致；M0 斜率 1.517 与 table-R2 参照行一致。

## 4 输出清单与属性核验

核验命令（`file` 与 PIL 逐文件回读）及关键输出：

```
$ file *.png *.tif
figure-R1-scatter-ols-ci.png:         PNG image data, 2100 x 1680, 8-bit/color RGB
figure-R2-regression-diagnostics.png: PNG image data, 4260 x 3360, 8-bit/color RGB
figure-S1-marginal-distributions.png: PNG image data, 4260 x 2820, 8-bit/color RGB
…tif: TIFF … compression=LZW, PhotometricIntepretation=RGB
$ python -c "PIL 逐文件回读"
mode=RGB, dpi=(599.9988, 599.9988)  # 全部 9 个位图/PDF 文件
```

| 文件 | 格式 | 像素 | 物理尺寸 | dpi | 色彩 |
|---|---|---|---|---|---|
| figure-R1-scatter-ols-ci.png/.tif/.pdf | PNG/TIFF/PDF | 2100×1680 | 89×71 mm | 600 | RGB |
| figure-R2-regression-diagnostics.png/.tif/.pdf | PNG/TIFF/PDF | 4260×3360 | 180×142 mm | 600 | RGB |
| figure-S1-marginal-distributions.png/.tif/.pdf | PNG/TIFF/PDF | 4260×2820 | 180×119 mm | 600 | RGB |

三张成图另经视觉 QA（图像模型逐图检查）：全部文字英文 Arial 可辨、面板字母 A–F 粗体到位、图例与数据无遮挡、无裁切、无残留中文字符。

## 5 投稿用英文图注（复制即用，统计量与表一致）

**Figure R1.** Association between daily caffeine intake and examination anxiety (simulated demonstration data, n = 300). Each point is one participant. The black line is the ordinary least-squares fit, ŷ = 15.74 + 1.52 × intake/100; the shaded band is its 95% CI; the dashed orange line is a LOWESS smoother (frac = 2/3). Unadjusted Pearson r(298) = 0.200, 95% CI [0.089, 0.307], p < .001. Abbreviation: TAS, Test Anxiety Scale (0–37). Note: fixed-seed simulated data for pipeline demonstration; not for real-world inference.

**Figure R2.** Regression diagnostics for the primary model M1 (simulated demonstration data, n = 300). (A) Normal Q–Q plot of M1 residuals (Shapiro–Wilk W = 0.994, p = .286). (B) Residuals versus fitted values with LOWESS smoother (dashed); the grey line marks zero. (C) Scale–location plot of √|standardized residuals| with LOWESS smoother (Breusch–Pagan p = .970; Ramsey RESET p = .845). (D) Cook's distance per record; the dashed grey line marks the 4/n = 0.0133 threshold; the 16 records above it are highlighted in orange (sensitivity-only exclusion; the primary analysis retains the full sample). Abbreviation: TAS, Test Anxiety Scale.

**Figure S1.** Marginal distribution checks of the simulated columns against the SAP Table 2 data-generating settings (n = 300). (A–C) Histograms (24 bins, density scale) with the theoretical lognormal (caffeine) or normal (TAS, PSQI) densities from SAP Table 2 overlaid in grey. (D–F) Quantile–quantile plots against the same theoretical distributions; minor tail deviations reflect the design truncation and are expected. Abbreviations: PSQI, Pittsburgh Sleep Quality Index (0–21); TAS, Test Anxiety Scale (0–37).

## 6 保留与未执行事项

- 原图三张保留于 `figures/`，未覆盖、未删除；重绘独立成目录。
- `tables/` 无配图（仅 CSV），未做图表类处理。
- 期刊页面未给出栏宽数值，89/180 mm 为研究期刊通行版面，字号按该物理尺寸设定；若编辑部另有要求，改 `figures_polish.py` 中 `figsize` 即可，字号无需再调。
- 本机无 `pdffonts`（`which pdffonts` 无输出），PDF 字体嵌入改用字节级检查（`FontFile2` 与 `Arial` 名称均在 PDF 内，见 §3 输出）；pdffonts 级核验未执行。
- Dove 收稿格式列表不含 PDF/EPS，三份 PDF 仅作矢量存档供后续改版，投稿用 PNG 或 TIFF。
- 投稿前文件需按 Dove 命名规则改为 "[manuscript ID] Figure 1 / Figure 2"；figure-S1 为补充材料图，命名随编辑部补充材料要求。

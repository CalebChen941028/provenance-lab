# 00 README：产物目录、改动清单与人工校对入口

运行口径：provenance-lab pipeline · development 严格度 · hybrid 编队 · 无真实数据（固定种子模拟数据演示，n=300）。本文件为 S8 审计包产物之一，与 `05-audit-trail.md` 配套使用：本文件回答「东西在哪、动了什么、去哪核对」，05 回答「流程怎么走、每一步依据什么」。

目录树与逐文件说明取自本步骤对 `provenance-lab-output/` 的实际 `find`/`ls` 核实（2026-10-24）；三份清单的口径见 §2–§4。

## 1 目录树与逐文件说明

```text
provenance-lab-output/
├── 00-README.md                  本文件：目录树 + 动了什么/没动什么/去哪找什么 + 免责声明
├── 01-research-question.md       立题书（R1 修订版）：研究问题、PECO、目标参数与设计口径
├── 02-evidence-table.md          证据表（S2b，R1 修订版）：五源 87 条候选经 PRISMA 筛选纳入 55 条，逐研究偏倚风险评估
├── 03-sap.md                     统计分析计划 v1.0（冻结）：变量字典（§2.2 Table 3）、方法依据、校正家族、门与中止条款
├── 04-analysis/                  分析产物目录（脚本、数据、表、图、日志）
│   ├── 01_calibrate.py           第 1 步脚本：高斯骨架+边际变换的生成参数校准（Fisher 迭代）
│   ├── 02_montecarlo.py          第 2 步脚本：Null-A/Null-B 各 2000 次零假设蒙特卡洛 type-I 校准
│   ├── 03_freeze_analyze.py      第 3 步脚本：冻结演示数据 + 完整性/复现性门 + 全套分析与表图输出
│   ├── common_sim.py             三步共用的生成与校准函数库（含三行式通俗注释）
│   ├── calibration-params.json   校准终值参数（骨架相关终值与迭代记录）
│   ├── decisions-log.md          执行决定与偏离记录 D1–D17，供人工逐条校对
│   ├── run_all.sh                一键重跑入口：清空 mc-cache 后顺序执行 01→02→03
│   ├── run-03-summary.txt        第 3 步终端摘要：门、主结果、诊断、敏感性、CV 的一屏速览
│   ├── run-all-console.log       全量运行控制台日志（含 Null-B 校准 3 次迭代收敛记录）
│   ├── run-heartbeat.log         心跳日志：各步起止时间戳与蒙特卡洛四块进度
│   ├── pyproject.toml            分析环境依赖声明（numpy/scipy/pandas/statsmodels/matplotlib）
│   ├── uv.lock                   依赖锁定文件（与 pyproject 配套，保证环境可复现）
│   ├── input/                    冻结数据层
│   │   ├── sim_data_frozen.csv   冻结的演示数据集（301 行=表头+300 条记录；SHA256 见 manifest）
│   │   └── freeze_manifest.json  冻结清单：n、种子、骨架相关终值、SHA256 指纹
│   ├── tables/                   9 张结果表（CSV，编号 S0/S1/S1b/S2/S3/S5/R1/R2/R3，逐表说明见 Table 1）
│   ├── figures/                  3 张原始输出图（PNG：R1 散点、R2 诊断四联、S1 边际形态）
│   ├── figures-polished/         3 张图的期刊规范版（各含 PNG/PDF/TIF 三格式）+ 重绘脚本 figures_polish.py
│   ├── mc-cache/                 蒙特卡洛中间缓存（Null-A/Null-B 各 4 块 CSV，重跑时由 run_all.sh 清空重建）
│   ├── .venv/                    uv 管理的局部 Python 运行环境（非交付物，仅供复现）
│   └── __pycache__/              Python 字节码缓存（自动生成，非交付物）
├── 05-audit-trail.md             审计追踪（S8）：流程图、变量字典、方法决策表、引文深审明细、关卡结论、校对指引
├── 05a-citation-audit.md         引文深审原始明细（R1 初审 + R2 复核，41 个有效引用点逐条判定）
├── 06-draft.md                   论文初稿（R2 修订版）：STROBE 口径成稿，40 条参考文献全部来自白名单
├── 07-rebuttal.md                预审回应信：六位评委拷问逐条作答，附 3 条 unanswered 与核验命令汇总
├── 08-papers-manifest.md         文献归档清单：已下载 16 条（含来源）与未下载 24 条（含获取途径建议）
├── 09-figure-audit.md            图表规范化审计：按目标期刊规范逐图对照并重绘（原图未改动）
└── papers/                       16 篇合法下载的文献 PDF（文件名规范：标题_期刊_年份.pdf）
```

**Table 1** 04-analysis/tables/ 下 9 张结果表逐张说明

| 表文件 | 内容一句话说明 |
|---|---|
| table-S0-data-integrity-gate.csv | 完整性/复现性门 10 项检查结果（全部 PASS，含三对实测 r 与目标偏差） |
| table-S1-diagnostics.csv | 前提假设诊断汇总（BP、RESET、Shapiro-Wilk、VIF、条件数双口径） |
| table-S1b-cooks-distance.csv | Cook's D>4/n 标记的 16 条影响记录明细（含 sid 与摄入/TAS 值） |
| table-S2-multiplicity.csv | 多重校正结果：F1 Holm 与 F2 BH-FDR 的逐检验 p/q 值与判定 |
| table-S3-montecarlo.csv | 蒙特卡洛 type-I 校准：Null-A/Null-B 拒绝率、95%CI 与合格带判定 |
| table-S5-models-full.csv | 全部备选模型（M0/M1/M1ord/M2/M3/M1bin 等）的完整系数表 |
| table-R1-descriptives.csv | 描述统计：各变量均值/SD/分布特征与二分组构成 |
| table-R2-primary-results.csv | 主结果表：H1a Pearson r 与 H1b 调整斜率 b₁ 及 Holm 校正后 p |
| table-R3-sensitivity-exploration.csv | 敏感性与探索结果：Spearman、二分口径、年级编码、H2、交互、CV |

## 2 动了什么（本流水线只写 provenance-lab-output/）

本流水线在 `provenance-lab-output/` 内新建并写入了 §1 目录树所列的全部交付产物：

1. 立题书（01）、证据表（02）、SAP（03）：检索、综合与预注册阶段产物。
2. 分析目录（04-analysis/）：脚本 4 份、环境声明 2 份、冻结数据与清单 2 份、结果表 9 张、图 3 张及其规范版 9 个图像文件与重绘脚本、蒙特卡洛缓存 8 块、日志 3 份、决定日志 1 份。`.venv/` 与 `__pycache__/` 为运行环境与字节码缓存，随分析步骤自动生成。
3. 引文深审明细（05a）、初稿（06）、回应信（07）、归档清单（08）、图表审计（09）。
4. 文献 PDF 16 篇（papers/），全部为开放获取或官方渠道合法下载，逐篇来源见 08 §一。
5. 本审计包（00-README.md 与 05-audit-trail.md）。

写入范围仅限 `provenance-lab-output/` 及其子目录。检索与引文关卡阶段另在工作区根目录创建了 4 个 `tmp_` 前缀工作缓存目录（`tmp_pubmed_LAd32`、`tmp_epmc_LAd32`、`tmp_citegate`、`tmp_lib`，本步骤 `ls` 核实存在），属过程缓存而非交付产物，人工校对完成后可自行删除。

## 3 没动什么（只读与未涉及）

1. **无真实数据集被读取或改动**。本运行 `dataPath` 为空，分析用数据由固定种子（20261023）在 04-analysis 内生成并冻结；不存在任何原始数据目录被写入的路径。
2. **付费墙文献一律未绕过**。08 §二所列 24 条未下载文献未做任何抓取尝试，仅给出合法获取途径建议；其中 4 条为脚本通道被拦截的完全开放获取期刊，浏览器可免费下载。
3. **原始输出图未改动**。`04-analysis/figures/` 下 3 张原始 PNG 保留原样，规范化版本另存 `figures-polished/`（09 §口径说明第 2 条）。
4. **99-metrics.json 非本步骤所写**。该运行指标文件由流水线代码落盘；本审计整理步骤检查时（2026-10-24）该文件尚未出现在产物目录（`find` 核实为无），本步骤未创建、未改动它。
5. 工作区根目录的 `.zcode/`、`.licenses/`、`.video_agent/` 及各 `tmp_*` 缓存目录，本步骤未做任何改动。

## 4 去哪找什么（按核对意图索引）

**Table 2** 核对意图与对应文件对照

| 想核对什么 | 打开哪里 | 看什么 |
|---|---|---|
| 研究问题、假设与设计口径 | 01-research-question.md | §1 背景、PECO 与目标参数 |
| 某条纳入研究的证据与偏倚评估 | 02-evidence-table.md | 分层证据表逐研究条目与 §9 标识符核验 |
| 每个变量的定义、来源、变换 | 03-sap.md §2.2 Table 3 | 与 05-audit-trail.md §2 逐格对照 |
| 每个统计方法为何选它 | 03-sap.md 方法依据节 | 与 05-audit-trail.md §3 执行情况列对齐 |
| 数据是否被动过手脚 | 04-analysis/input/freeze_manifest.json + table-S0 | SHA256 指纹与 10 项门检查 |
| 主结果数字（r、b₁、p） | 04-analysis/tables/table-R2-primary-results.csv | 与 06-draft.md 摘要逐数对照 |
| 蒙特卡洛水平校准 | table-S3-montecarlo.csv + run-all-console.log | 拒绝率与合格带、校准迭代记录 |
| 执行中的偏离与修复 | 04-analysis/decisions-log.md | D1–D17 逐条，重点 D3 |
| 某条引文是否忠实 | 05a-citation-audit.md（照抄进 05-audit-trail.md §4） | 逐条溯源与原文位置 |
| 稿件正文与参考文献 | 06-draft.md | 40 条 Vancouver 文献表 |
| 评审问了什么、哪些答不出 | 07-rebuttal.md | 六位评委问答与文末 Unanswered |
| 文献 PDF 与缺口 | papers/（16 篇）+ 08-papers-manifest.md §二 | 24 条待获取清单 |
| 图是否合规、数值有无被改 | 09-figure-audit.md + figures-polished/ | 逐图对照记录 |
| 一键重跑验证 | 04-analysis/run_all.sh | 终次 FINAL_EXIT=0，约 6 秒 |

## 5 免责声明

**工具定位声明**：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。

补充边界：

1. 本运行全部数据为固定种子模拟生成（演示口径），结果仅描述模拟总体，不外推任何真实人群，不用于真实推断、发表结论或决策。
2. 08 §二所列文献须由用户自行通过合法途径获取并补齐后，方可支持投稿版本的引用核对。
3. 初稿若使用了 AI 辅助写作，投稿时应按 ICMJE 及目标期刊政策如实披露。
4. 人工校对建议按 05-audit-trail.md §6 的顺序执行；任何一处核对不过，以原始产物文件为准并回溯对应阶段，不以本审计包的文字为准。

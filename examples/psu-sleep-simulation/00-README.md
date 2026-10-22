# 00 人工校对包总览（README）

生成本轮：2026-10-22（审计整理员）。本目录是 provenance-lab 流水线的全部交付产物；本文件给出目录树、逐文件说明与三份清单（动了什么／没动什么／去哪找什么），配套审计追踪见 `05-audit-trail.md`，逐条人工校对指引见其 §6。目录树由 `ls` 逐项核实（核实于 2026-10-22 09:54 前）。

---

## 1 目录树

```text
provenance-lab-output/
├── 00-README.md                     ← 本文件
├── 01-research-question.md          立题书 v2.1
├── 02-evidence-table.md             证据表 v2.1
├── 03-sap.md                        统计分析计划 v2.1（冻结＋§16 勘误）
├── 04-analysis/                     模拟分析执行包
│   ├── README.md                    执行包说明与两轮审稿修订记录
│   ├── decisions-log.md             执行决策 D1–D26
│   ├── run_all.sh / run_mde_fix.sh / run_d25_fix.sh / run_rest.sh
│   ├── R/                           13 个 R 脚本（lib×3＋01–09＋08b_jars）
│   ├── tables/                      26 个表文件（R1–R9a＋demo_table1–5，CSV/MD）
│   ├── figures/                     原始图件 8 图＋1 个作废标注
│   ├── figures-polished/            规范化重绘图件（24 个＋脚本与 _data/）
│   ├── data/                        targets.json＋单元格级 .rds＋演示队列
│   ├── logs/                        运行日志与 MD5 基准（12 个文件）
│   ├── _v1_archive/                 v1.x 旧产物隔离区
│   └── cache/                       冒烟测试脚本
├── 05-audit-trail.md                审计追踪（本轮新增）
├── 05a-citation-audit.md            引文深审明细（72 条逐条）
├── 06-draft.md                      初稿 v2.3
├── 07-rebuttal.md                   预审回应信（答辩拷问十问）
├── 08-papers-manifest.md            文献 PDF 归档清单
├── 09-figure-audit.md               图件规范化审计
├── papers/                          51 个文献 PDF（对应 References 72 条中的 51 条）
└── .figpolish-venv/                 图件规范化阶段专用 Python 虚拟环境
```

## 2 逐文件说明

### 2.1 顶层文档

**Table 1** 顶层文件一览

| 文件 | 说明 |
|---|---|
| `00-README.md` | 本文件：目录树、逐文件说明、三份清单与免责声明 |
| `01-research-question.md` | 立题书 v2.1（2026-10-18）：研究问题重构为四场景 DGM 下的模板性能命题，冻结四场景参数（Table 4）、校准系数（Table 5）与假设 H1–H4 |
| `02-evidence-table.md` | 证据表 v2.1：五源 100 条候选的 PRISMA 式去重与资格筛选记录，证据按校准／判别力／调节范例／模板配套四层组织，SANRA 定调 |
| `03-sap.md` | 统计分析计划 v2.1：2026-10-18 于任何模拟数据生成前冻结；含变量字典（Table 3，人工校对件①）、方法依据表（Table 10，人工校对件②）、种子方案（Table 6）；执行期勘误集中于 §16 |
| `04-analysis/` | 模拟分析执行包，见 §2.2 |
| `05-audit-trail.md` | 审计追踪（本轮新增）：流程图、变量字典、方法决策表、引文深审明细、关卡结论与人工校对指引 |
| `05a-citation-audit.md` | 引文深审明细（2026-10-22，含 v2.3 复核轮）：06-draft 全部 72 条参考文献逐条审计，判定溯源／原文位置／准确性／必要性与撤稿状态 |
| `06-draft.md` | 初稿 v2.3（2026-10-22）：Morris 规范为主体的模拟研究报告，STROBE 作演示队列模板骨架；结构式摘要、表 1–11、图 1–4、References 1–72 |
| `07-rebuttal.md` | 预审回应信：答辩拷问十问逐条作答（结论→证据与核验→稿件同步修订），文末列 7 条未答事项及所缺条件 |
| `08-papers-manifest.md` | 文献 PDF 归档清单（2026-10-22）：72 条中 51 条已下载（70.8%）的逐文件↔条目对照、获取渠道与 21 条未获清单及补齐指引 |
| `09-figure-audit.md` | 图件规范化审计：8 图按 Nature 图件规范重绘的逐项核验（统计数值零改动、121 项结构化校验、交叉核验记录） |
| `papers/` | 51 个文献 PDF，文件名遵循「标题_期刊_年份.pdf」；逐文件与条目号/PMID/DOI/渠道的对照见 `08-papers-manifest.md` Table |
| `.figpolish-venv/` | 图件规范化阶段（figures-polished）创建的 Python 虚拟环境，仅为重绘脚本运行环境，非研究内容 |

### 2.2 04-analysis 执行包

**Table 2** 04-analysis 逐文件说明（依据其 README、decisions-log 与目录核实）

| 文件/目录 | 说明 |
|---|---|
| `README.md` | 执行包说明：一键重跑口径、目录结构、表/图↔SAP 对应、种子方案、两轮统计审稿修订记录 |
| `decisions-log.md` | 执行决策 D1–D26：工具栈、DGP 实现层（D4/D5）、缺失与 MI（D8/D9）、汇总口径（D16–D18）、并行策略（D19）、两轮审稿修复（D22/D25/D26）、图件修复（D24）；注：文件头部标注「编号 D1–D25」（第 5 行），而正文含 D26 条目，头部计数未随后续条目同步——校对时以正文为准 |
| `run_all.sh` | 一键全量重跑：校准→Cell A→Cell B/C→Cell D→S\*6→MDE(条件)→演示集→汇总→判定，任一步非零退出即中止 |
| `run_mde_fix.sh` | 第 1 轮审稿意见 1（MDE 网格同构修复，D22）后的定向重跑链 |
| `run_d25_fix.sh` | 第 2 轮审稿 M1（调节 DGP 第 145 行勘误，D25）后的 03→09 重跑链 |
| `run_rest.sh` | 首跑中断后的续跑脚本（历史工件；其日志残留见 `logs/run_all.log` 尾部，L7 登记） |
| `R/lib_dgp.R` | 四场景 DGP、缺失机制（MCAR/M1）与调节叠加（Table 1/§1.3–1.6 冻结参数）；第 145 行经 D25 修复并注释留痕 |
| `R/lib_estimators.R` | CLPM/RI-CLPM（MLR+FIML、平稳约束）、S\*4/S\*5 版、ANCOVA、界值暴露、MI 调节模块、IPW、S\*7 多组与场景分类器 |
| `R/lib_metrics.R` | Morris 指标、Wilson CI、精确二项容差 [37,64]/1000、Holm/BH 程序与 H1–H4 判定 |
| `R/01_calibrate.R`–`R/09_verify.R` | 分阶段脚本：01 校准（n=10⁶ 超总体＋targets.json 冻结）→02 Cell A→03 Cell B/C→04 Cell D→05 S\*6→06 MDE→07 演示集→08 汇总→09 判定；`R/08b_jars.R` 为 D26 新增的 JARS 报告项（f²、简单斜率、Holm 调整 p，输出表 R5b） |
| `tables/`（26 个） | R1 校准复核；R2 H1 16 格；R3 H2/H3；R3b MDE 网格；R4 混淆矩阵；R5 H4 调节（含 CC 参考行）；R5b JARS 交互报告项；R6 S\*1/S\*2；R7 Cell D 四处理器；R8 收敛＋S\*4/S\*5/S\*7；R8b S\*6 堆叠；R9a H1 违例格明细（仅 CSV）；demo_table1–5 演示附件（基线/缺失/FMI/Mardia/SEM）；主表均 CSV+MD 双格式 |
| `figures/` | 原始图件（未改动）：F1 设计、F2 MDE、F3/F3b 偏差与覆盖森林、F4 判别、demo_fig1–3；`demo_fig2_mi_trace.DEPRECATED.txt` 为 D24 认定的作废标注 |
| `figures-polished/` | 8 图 ×（PDF+SVG+600 dpi PNG）共 24 个规范图件＋`make_polished_figures.py`（重绘）、`_extract_data.R`（同种子重放提取）、`_verify_output.py`（121 项校验）与 `_data/`（直读提取的 3 个 CSV）；统计数值与原图零改动（09 审计） |
| `data/` | `targets.json`（冻结目标值，含 v2.0 作废口径留痕字段）；Cell A–D、Cell B k1–k3、MDE 网格 j1–j8（β 与 ΔR² 各八点）、S\*6 的重复级记录 .rds（含 seed 列可重放）；`demo_cohort.csv` 演示队列 |
| `logs/` | `run_all.log`（全链日志）、`mde_fix.log`/`d25_fix.log`（两轮修复重跑）、`md5_d25.txt`（现行 MD5 基准）、`pre_rerun_md5.txt`（首跑对照，targets.json 基准自 v2.1 勘误起失效）、`first_run_summary.md`（首跑 03–08 段日志覆盖后的观察记录重建）、`session-info.txt`（D26 重制）等 |
| `_v1_archive/` | 2026-10-17 v1.x 单场景设计旧产物整体归档（SAP §10.6 与 D2），不作为任何输入 |
| `cache/smoke_test.R` | 全量运行前的冒烟测试脚本 |

---

## 3 三份清单

### 3.1 动了什么（本流水线全部写入，均在 provenance-lab-output/ 内）

**Table 3** 写入清单

| 对象 | 内容 |
|---|---|
| 顶层文档 | `01`（v2.1）→`02`（v2.1）→`03`（v2.1）→`06`（v2.0→v2.3）→`07`→`05a`→`08`→`09` 全部为本流水线生成与逐轮修订 |
| `04-analysis/` | 全目录：R 脚本、run 脚本、tables/figures/figures-polished/data/logs 全部产物；源码修改均留痕（D5 构造、D22 网格、D24 图件、D25 第 145 行修复及连带修复、D26 新增 08b_jars.R） |
| `papers/` | 51 个文献 PDF 下载落盘（渠道与合法性见 `08-papers-manifest.md`；未绕过任何付费墙） |
| `.figpolish-venv/` | 图件规范化阶段创建的 Python 虚拟环境 |
| 本轮新增 | `00-README.md`、`05-audit-trail.md`（审计整理轮） |

### 3.2 没动什么（只读输入与未触碰内容）

**Table 4** 只读与未触碰清单

| 对象 | 状态 |
|---|---|
| 工作区根目录检索原始数据（`s1.json`–`s18.json`、`shortlist.json`、`key_abstracts.txt`、`psu_sleep_search/`） | 只读输入：五源检索与短名单的原始产物，供 01/02 读取，内容未修改 |
| `tmp_litsearch/`、`tmp_pubmed_psu/`、`tmp_pubmed_psu_sleep/`、`tmp_eupmc_psu/`、`tmp_sel_chair/` | 检索阶段中间缓存（原始响应与候选清单），非交付物 |
| `tmp_citecheck/`、`tmp_citeaudit/`、`tmp_papers/` | 引文核查、引文深审与 PDF 下载阶段的中间缓存（接口响应、下载暂存清单），由对应阶段写入工作缓存，不属于交付产物；最终产物分别落在 `05a` 与 `papers/`+`08` |
| `demo-task/`、`zxmoto-820rr/`、`.licenses/`、`.zcode/` | 与本研究无关的工作区既有内容，未触碰 |
| 原始文献 PDF 与出版社站点 | 只读获取（开放获取渠道），未修改任何来源文件 |

### 3.3 去哪找什么

**Table 5** 检索指引

| 要找什么 | 去哪里 |
|---|---|
| 研究问题、四场景定义、假设 H1–H4 原文 | `01-research-question.md`（Table 3/4/5） |
| 每个校准系数的文献出处与证据分层 | `02-evidence-table.md`（Table 2 及各层） |
| 变量字典（逐变量定义/来源/变换/理由） | `03-sap.md` §2.1 Table 3；同构转录见 `05-audit-trail.md` §2 |
| 每个方法选择的依据与执行情况 | `03-sap.md` Table 10（方法依据）＋`04-analysis/decisions-log.md`（D1–D26）；对齐表见 `05-audit-trail.md` §3 |
| H1–H4 判定结果与数值 | `04-analysis/tables/`（R2–R5、R9a）＋`06-draft.md` 表 3–7 |
| 场景判别混淆矩阵 | `04-analysis/tables/R4_confusion.csv`；初稿表 4 |
| MDE 网格与功效曲线 | `04-analysis/tables/R3b_mde_grid.csv`、`figures-polished/F2_mde.*` |
| 敏感性分析（S\*1–S\*7、Cell D） | `04-analysis/tables/` R6/R7/R8/R8b；初稿表 8–10 |
| 执行偏离与勘误全记录 | `04-analysis/decisions-log.md`＋`03-sap.md` §16 |
| 重跑与字节级复现证据 | `04-analysis/logs/`（run_all.log、md5_d25.txt、pre_rerun_md5.txt） |
| 每条引文的审计判定 | `05a-citation-audit.md`；转录表见 `05-audit-trail.md` §4 |
| 评审/拷问/深审的结论与遗留 | `05-audit-trail.md` §5；`07-rebuttal.md` 未答事项；`06-draft.md` §4.5 |
| 某篇文献的 PDF | `papers/`＋`08-papers-manifest.md` 逐条对照（21 条未获的补齐指引同在此文件） |
| 图件规范与数值一致性核验 | `09-figure-audit.md` |

---

## 4 免责声明

本研究为 provenance-lab 工作流内部生成的模拟方法学演示：全部数据为固定种子蒙特卡洛模拟数据，无人体对象、不涉及伦理审查；一切数值结论限于校准参数邻域与预登记的 DGM 族，不外推至任何人群、不用于发表性人群推断或实际决策。全部文档由 AI 工作流在人工监督规则下生成，引用判定、统计结果与勘误记录虽经多关卡核查（见 `05-audit-trail.md` §5），仍可能存在错误或遗漏，发表或决策使用前须由研究者按 `05-audit-trail.md` §6 的指引逐项人工核对；各关卡遗留的未决事项（同行评审 2 轮遗留 11 项、答辩拷问 7 问待补、引文深审遗留 2 条）如实列示于该文件，未做任何美化或选择性呈现。

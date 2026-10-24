# 05 审计追踪：流程、变量、方法、引文与关卡结论

运行口径：provenance-lab pipeline · development 严格度 · hybrid 编队 · 无真实数据（固定种子模拟数据演示，n=300）。本文件为 S8 审计包产物，把整条流水线整理成人工校对材料：流程怎么走（§1）、每个变量从哪来（§2）、每个方法为何选与做得如何（§3）、每条引文是否忠实（§4）、各关卡放行了什么（§5）、按什么顺序核对（§6）。§7 为免责声明。

整理依据：本步骤实读 `01-research-question.md`、`02-evidence-table.md`（头部）、`03-sap.md`（§2.2 及关键条款）、`04-analysis/decisions-log.md`（全文）、`run-03-summary.txt`、`tables/table-S0/S2/S3`（原文）、`05a-citation-audit.md`（全文）、`06-draft.md`（头部）、`07-rebuttal.md`（全文）、`08-papers-manifest.md`、`09-figure-audit.md`（头部），并对产物树做了 `find`/`ls` 核实；本步骤亲测记录见 §5 Table 8。凡未亲测的运行声明（如 `bash run_all.sh` 的退出码）均注明出处、不以本文件名义背书。

每个编号部分开头有「通俗导读」框：用生活类比说明本部分做什么、为什么、结果意味着什么；关键结论后跟「亲手验证动作」，指明打开哪个文件、看哪个数字、与哪里对照。白话层只用于导读框，不进入正式表格内容。

## 1 流程图：整条流水线怎么走

> **通俗导读**　这一节像看餐厅后厨的动线图。每道工序做了什么、为什么这么做，写在节点里。六边形是质检台。菜过了质检台才能上下一道工序。看懂动线，就知道去哪个工位查问题。

```mermaid
flowchart TD
    S1["S1 立题书<br/>做了什么：凝练研究问题、PECO 与目标参数（r=0.20）<br/>为何：先固定问题，防后续漂移"]
    S2a["S2a 五源文献检索<br/>做了什么：PubMed/EuropePMC/OpenAlex/Semantic Scholar/arXiv 检索，得 87 条候选<br/>为何：多库互补，防单一库盲区"]
    G1{{"关卡：引文核查<br/>做了什么：13 条标识符与撤稿状态核查，0 失败<br/>为何：证据底座必须逐条落地"}}
    S2b["S2b 证据综合<br/>做了什么：PRISMA 去重筛选纳入 55 条，逐研究偏倚风险要点<br/>为何：给立题与 SAP 可溯源的证据"}
    S3["S3 SAP 冻结<br/>做了什么：见任何结果前冻结 v1.0（变量字典/方法依据/校正家族/门）<br/>为何：预注册杜绝事后换模型"]
    A1["04-01 参数校准<br/>做了什么：高斯骨架+边际变换，Fisher 迭代 2 次收敛，三对偏差≤0.0006<br/>为何：同时控制边际形态与目标相关"]
    A2["04-02 零假设蒙特卡洛<br/>做了什么：Null-A/Null-B 各 2000 次 type-I 校准，先于演示结果查看<br/>为何：变换对检验水平的影响只能经验评估"]
    A3["04-03 冻结+分析<br/>做了什么：SHA256 冻结数据，过门后跑主分析/诊断/敏感性/CV<br/>为何：冻结后数据不可再改，保证可复现"]
    G2{{"关卡：完整性/复现性门<br/>做了什么：10 项检查（范围/缺失/三对 r 偏差）<br/>结果：全部 PASS"}}
    G3{{"关卡：统计审稿<br/>结果：accept，0 轮退回"}}
    S7["图表规范化<br/>做了什么：3 张图按期刊规范重绘入 figures-polished/，原图未动<br/>为何：图表合规且数值不被改动"}}
    S5["S5 初稿写作<br/>做了什么：按 STROBE+APA/JARS 成稿，40 条引用全部来自白名单<br/>为何：引文白名单杜绝编造"}}
    G4{{"关卡：同行评审<br/>结果：1 轮，遗留 major 0 项"}}
    G5{{"关卡：答辩拷问<br/>做了什么：6 问逐条作答，3 问待补<br/>为何：暴露答不出的问题"}}
    S5a["S5a 引文深审 R1<br/>做了什么：43 个引用点逐条溯源/原文位置/准确性/必要性<br/>结果：3 处问题引用"}}
    G6{{"关卡：引文深审 R2 复核<br/>结果：3 处全部关闭，问题引用 0"}}
    S6["S6 文献归档<br/>做了什么：16 篇合法下载入 papers/，24 条列待获取清单<br/>为何：付费墙不绕过，留人工补齐路径"}}
    S8["S8 审计包<br/>做了什么：产出 00-README 与本文件<br/>为何：把全流程变成可逐项人工核对的材料"]]
    S1 --> S2a --> G1 --> S2b --> S3 --> A1 --> A2 --> A3 --> G2 --> G3 --> S7 --> S5 --> G4 --> G5 --> S5a --> G6 --> S6 --> S8
```

**Table 1** 节点逐个说明：做了什么与为何这么做

| 节点 | 做了什么 | 为何这么做 |
|---|---|---|
| S1 立题书 | 凝练横断线性关联问题与 PECO，固定目标 r=0.20、界值 100 mg/d、n=300；R1 修订吸收方法学评审 5 条意见（01 文首） | 问题与参数先冻结，后续阶段没有重新解释的空间 |
| S2a 五源检索 | 五库共得 87 条候选题录（02 文首，2026-10-23/24 执行） | 单一数据库必有盲区，多库互补并保留检索式原文 |
| 关卡：引文核查 | 13 条标识符经 API 落地核查、撤稿状态核验，0 失败；发现条目[41]研究数误写（27→13 篇）并更正（02 §9） | 证据表是全部下游主张的地基，地基条目必须逐条可溯源 |
| S2b 证据综合 | PRISMA 思路去重筛选，55 条纳入；横断用 NOS 要点、纵向用队列版、实验用 RoB 2 思路（02） | 分层证据给立题参数与 SAP 锚定值提供可查依据 |
| S3 SAP 冻结 | 见任何结果前冻结 v1.0：变量字典、方法依据、F1/F2 校正家族、诊断触发条款、门与中止条款（03） | 预注册式内控，从流程上杜绝 p-hacking 与选择性报告 |
| 04-01 校准 | 高斯骨架+边际变换生成参数校准，Fisher 迭代 2 次收敛，三对相关偏差 ≤0.0006（D1、calibration-params.json） | 直接联合建模难以同时指定边际形态与变换后相关，骨架反解+迭代双重保证 |
| 04-02 蒙特卡洛 | Null-A 与 Null-B 各 2000 个零假设数据集，经验拒绝率须落入 [0.0404, 0.0596]；先于演示数据结果查看（D1、D3） | 边际变换与截断对检验水平的影响无法纯理论推导，只能经验评估 |
| 04-03 冻结+分析 | 冻结 300 行数据（SHA256 记入 manifest），过门后执行 H1a/H1b、诊断、敏感性、探索、CV，产出 9 表 3 图（run-03-summary.txt） | 冻结让「数据—结果」一一对应，任何人重跑只能得到同一组数 |
| 关卡：完整性/复现性门 | 10 项检查：记录数、零缺失、三变量取值范围、三对实测 r 对目标偏差（table-S0，全 PASS） | 复现门不满足即判生成或校准缺陷，回退修复而不是带病分析 |
| 关卡：统计审稿 | 统计审稿人对分析产物审校，verdict=accept、0 轮退回（运行指标） | 统计正确性是流水线生命线，任何档位不降级 |
| 图表规范化 | 按 Dove/PRBM 规范逐图审计并重绘，输出 figures-polished/（PNG/PDF/TIF），原图保留（09） | 图表合规件要求；重绘只改呈现、不改数值 |
| S5 初稿写作 | STROBE 口径成稿，统计量按 APA/JARS，40 条参考文献全部来自白名单（06） | 引文白名单+报告规范双约束，杜绝编造引文与碎片段落 |
| 关卡：同行评审 | 1 轮评审，遗留 major 0 项（运行指标）；意见修订进 06 | 模拟真实评审压力，暴露稿件缺口 |
| 关卡：答辩拷问 | 六位预审评委 6 问逐条作答，答不出的 3 问列入 unanswered（07） | 拷问的价值在于暴露答不出的问题，而非全部答上 |
| S5a 引文深审 R1 | 43 个引用点四维校验：溯源、原文位置、准确性、必要性；3 处问题引用（05a §2） | 防二手充一手、防夸大与断章取义、防凑数引用 |
| 关卡：R2 复核 | 修订稿复核：[8]@§2.4 删引改内部依据、[21]@§4.3 改 [17][19]、[30] 题录更正；问题引用归零（05a §7） | 问题引用必须关闭后才允许定稿口径 |
| S6 文献归档 | 16 篇合法下载入 papers/（文件名规范、大小与格式验证），24 条列待获取清单（08） | 付费墙绝不绕过；缺口显式留清单供人工补齐 |
| S8 审计包 | 产出 00-README 与本文件 | 研究者能按图逐节点、按表逐变量、按明细逐引文快速核对 |

## 2 变量字典（照抄 SAP，供逐列人工校对）

> **通俗导读**　这一节像菜谱的配料表。每种配料写清：叫什么、算什么、从哪来、怎么处理、为什么用它。核对时拿表对数据文件的列名。一列一行对着看。

以下 8 行照抄自 SAP 定稿的变量字典（`03-sap.md` §2.2 Table 3 为其成文版），字段原文逐条照录、未作改写；SAP 另附逐变量白话解释（03 附录 B）。

**Table 2** 变量字典（照抄）

| 变量 | 操作定义 | 来源列 | 变换规则 | 选取理由 |
|---|---|---|---|---|
| caffeine_mg | 日均咖啡因摄入量（mg/d），FFQ 式口径估算咖啡、茶、能量饮料与可乐贡献的总咖啡因，连续、右偏、下界 0 | 模拟生成列（Table 2：对数正态中位数 130、σ=0.62、截断 [0, 800]，边际 SD≈108 mg/d） | 原尺度进入相关分析与描述统计；右偏形态不作事前剔除，形态稳健性由 Spearman 与诊断承担 | 研究问题的焦点暴露；mg/d 口径与证据表核心研究（土耳其 166.5±101.9 mg/d、约旦 USDA 数据库口径）直接对应；品类分项口径被排除（模拟按总量生成，品类依赖证据留真实数据版） |
| caffeine_100 | 咖啡因摄入量除以 100（回归主计量，mg/d / 100） | 派生列：caffeine_mg / 100 | 线性缩放，仅入回归族模型（M0/M1/M1ord/M2/M3） | 斜率按每 100 mg/d 解读，系数量级可读，与设计真值 1.25 分/100 mg·d⁻¹ 同口径 |
| tas_total | Sarason 考试焦虑量表总分，37 项 0/1 计分，理论值域 0–37，连续，主要结局 | 模拟生成列（N(18.4, 8.0) 截断 [0, 37]） | 原尺度，不标准化（标准化系数仅辅助报告） | 主结局（任务书与 01 立题书指定）；GAD-7/STAI 等一般焦虑口径被排除（偏离考试焦虑这一情境性构念） |
| psqi_total | 匹兹堡睡眠质量指数总分，0–21，高分=睡眠差，关键调整变量 | 模拟生成列（N(6.5, 3.2) 截断 [0, 21]，P(PSQI>5)=0.68 锚定约旦 70.6% 差睡眠占比） | 原尺度连续入 M1 | 证据表中咖啡因×睡眠×焦虑三联的横断证据支持其混杂地位；横断数据无法区分混杂与中介，β₁ 按调整 PSQI 后的直接关联口径解释，不作总效应解释；睡眠时长单独条目被排除（PSQI 总分已承载睡眠结构） |
| sex_female | 性别指示变量，女=1、男=0（男为参照） | 模拟生成列（Bernoulli(0.55)，女生概率，独立于三维骨架） | 指示编码，不变换 | 人口学调整变量（任务书指定）；另预注册 1 df 性别×摄入交互仅作探索 |
| grade | 年级，1=大一至 4=大四 | 模拟生成列（Uniform{1,2,3,4}，独立生成） | 主分析拆为 grade_y2/y3/y4 三个指示变量（参照=大一）；敏感性口径连续 1–4 | 人口学调整变量；主分析指示编码不假定线性年级效应；年龄被排除（与年级共线，模拟以年级承载年级效应） |
| caff_high | 二分暴露敏感性口径：日均摄入≥100 mg/d 记 1，<100 mg/d 记 0（参照组） | 派生列：caffeine_mg ≥ 100 判 1 | 固定界值二分；设计预期 <100 组占比约 34% | 01 立题书 PECO 指定界值；预注册固定界值优于数据依赖的中位数分界；巴西研究的品类/总量口径依赖教训支持以连续总量为主口径、二分为敏感性 |
| caffeine_100_sq | 摄入量计量的平方项，检验剂量-反应曲率，仅入 H2 探索模型 | 派生列：caffeine_100 的平方 | 平方变换，仅入 M2 | H2 需要曲率项检验线性充分性；+1 参数属预注册探索性支出，n/k=37.5 仍宽裕 |

**亲手验证动作**　打开 `04-analysis/input/sim_data_frozen.csv` 的表头，确认列名与本表变量一一对应；再开 `04-analysis/tables/table-R1-descriptives.csv`，把 caffeine_mg 的均值 151.3、SD 105.6 与 Table 2 设定（中位数 130、SD≈108）对照，量级应一致。

## 3 分析方法决策表：计划依据与执行情况对齐

> **通俗导读**　这一节像点菜记录的两栏对照。左栏是下单时写的理由。右栏是实际上菜情况。两栏对着看，就知道有没有临场换菜。

**Table 3** 方法决策表（选择依据照抄 SAP 的 methodRationale；执行情况取自 decisions-log D 编号、结果表与摘要）

| 方法 | 选择依据（照抄 SAP） | 执行情况 |
|---|---|---|
| Pearson 相关（H1a 主） | 研究问题是线性关联强度、两变量均为连续量化口径、n=300 推断稳健；不用 Spearman（敏感对象是单调而非线性，降为敏感性）、不用点二列（暴露二分化损失信息，降为敏感性）。 | 已执行：*r*(298)=0.200，95%CI [0.089, 0.307]，*t*=3.53，Holm 校正后 *p*=0.000962，确证阳性（table-R2；D5） |
| Fisher z 95%CI | 相关系数区间估计的标准变换，n=300 无需小样本偏修正；不预注册 bootstrap 区间以避免备选膨胀。 | 已执行：[0.089, 0.307]，与 01 立题书预期区间 [0.089, 0.306] 几乎重合（table-R2） |
| OLS 多元线性回归（H1b 主） | 连续结局、线性可加结构下斜率可直接按每 100 mg/d 解读；不用正则化回归（7 参数、n/k≈43，无需惩罚）、不用 GAM（非线性偏离已由 H2 二次项明确检验）、不用分位回归（研究问题为中心趋势关联）。 | 已执行：*b*₁=1.248 分/100 mg·d⁻¹，95%CI [0.405, 2.091]，*t*(293)=2.91，Holm 校正后 *p*=0.003852；偏相关 0.168 对设计解析 0.170（table-R2） |
| 年级以 3 个指示变量进入主模型 | 不假定年级对 TAS 的线性效应，n=300 足以支付 3 df；连续编码 1–4 仅作敏感性（b₁ 变化<10% 判编码不敏感）。 | 已执行：M1 用指示变量；敏感性 M1ord 连续编码 *b*₁=1.249，相对变化 0.1%，判编码不敏感（run-03-summary.txt [sens] 行；table-R3） |
| Holm 步降（F1） | 两确证假设的 FWER 强控制，比单步 Bonferroni 第二步更不保守；不用 BH-FDR（确证家族按 FWER 口径更稳）。 | 已执行：H1a 校正后 *p*=0.000962、H1b *p*=0.003852，均拒绝 H0（table-S2；D5） |
| BH-FDR（F2） | 探索家族内控制假发现比例、保留探索灵敏度；不用 FWER 类校正（对探索条目过严）。 | 已执行、只描述不判定：Spearman *q*=0.003、二分 *t* *q*=0.003、二分调整 *b* *q*=0.006、交互 *q*=0.041、H2 二次项 *q*=0.191（table-S2/R3；D5） |
| HC3 稳健标准误（BP 显著时条件触发） | 有限样本下异方差稳健性质优于 HC0/HC1；不依赖经典标准误的同方差假定。 | 未触发：BP *p*=0.970，HC3 分支零执行；分支代码未经运行验证，已列入 07 Response 6.1 的压测边界 |
| VIF 加条件数 | 线性共线性标准诊断、双指标互证；不单用条件数（对两变量共线不如 VIF 直观）。 | 已执行：max VIF=1.41；条件数原始口径 32.02（量纲假信号）补列标准化口径 1.88，双口径披露（table-S1；D11） |
| 嵌套 t/partial F 作模型比较 | 备选模型集（M0/M1/M1ord/M2/M3/M1hc3，封闭集合）内比较的确率推断；AIC/BIC 仅作 M2 与 M1ord 的辅助描述（Δ≥2），不作确证判定、不用于搜索集合外模型。 | 已执行：全模型系数入 table-S5；AIC/BIC 仅描述；无集合外模型（D5：模型集封闭，无事后换模型） |
| 5 折分层交叉验证（预测性验证敏感性） | 方差-计算的折中，TAS 五分位分层稳住折间分布；不用 LOOCV（计算重、方差结构不利）与重复 CV（演示冗余）；推断结论不依赖 CV。 | 已执行：CV-RMSE M0=7.866、M1=7.714、M2=7.739；M2 相对 M1 改善 −0.32%<5%，判复杂度不划算，与 H2 互证（run-03-summary；D14） |
| 零假设蒙特卡洛 type-I 校准（Null-A/Null-B 各 2000 次） | 高斯骨架边际变换与截断对检验水平的影响只能经验评估，纯理论推导无法覆盖；不合格时排查实现而非放宽带。 | 已执行且 PASS：Null-A 0.0545、Null-B 0.0565 均在 [0.0404, 0.0596]；首版单样本校准致双 FAIL，按「排查实现不放宽带」修正为 400 重抽集平均口径，全程留痕（table-S3；D3-4/D3-5）；附带演示 Null-B 下 H1a 拒绝率 0.117 量化混杂膨胀 |
| 高斯骨架+边际变换生成（数据侧） | 同时精确控制目标边际形态与变换后相关，骨架反解（ρ*≈0.216）+Fisher 尺度迭代校准双重保证；直接联合分布建模难以同时指定边际与相关。 | 已执行：01_calibrate.py 迭代 2 次收敛，骨架终值 (0.2496, 0.1599, 0.2685)（calibration-params.json、freeze_manifest.json）；门实测三对偏差 ≤0.0006（table-S0） |
| 独立样本 t 检验（二分口径） | 两组均值比较的直接工具，与证据表分组研究可比；结局近正态，无秩检验必要。 | 已执行：均值差 3.02 分、Cohen's *d*=0.38，95%CI [0.15, 0.62]（*q*=0.003）；调整后 *b*=2.68，95%CI [0.87, 4.50]（*q*=0.006）（table-R3） |
| 多重插补（条件触发） | 意外缺失下保留不确定性的标准处理（m=20，Rubin 合并）；不用单点插补（低估不确定性）、不裸用 CCA（无敏感性对照）。 | 未触发：冻结数据零缺失确认（table-S0「全表零缺失 PASS」；D13）；分支代码同样未运行验证（07 Response 6.1） |

**亲手验证动作**　任选一行做两头核对。以 Holm 行为例：打开 `04-analysis/tables/table-S2-multiplicity.csv`，看 H1a 行校正后 *p*=0.000962、H1b 行 0.003852；再开 `06-draft.md` 摘要，两个数字应与稿件一致。以蒙特卡洛行为例：开 `table-S3-montecarlo.csv`，Null-A 0.0545、Null-B 0.0565 均须落在合格带 [0.0404, 0.0596] 内，判定列均为 PASS。

## 4 引文深审明细（照抄 05a，供逐条人工核对）

> **通俗导读**　这一节像查账。稿子里每张「发票」（引用）都要对到原始凭证（原文段落）。查四件事：货源是不是原厂、凭证在哪一页、金额对不对、这张票该不该贴。R1 查出三张问题票。退回换开后，R2 复查全部通过。

以下内容照抄自 `05a-citation-audit.md`（R1 初审 + R2 复核），逐条判定未作改写；条目格式为 05a 原文的「定位｜层级｜原始性｜原文位置｜比对｜必要性｜状态｜结论」。R1 审 43 个引用点；两个错误引用点（[8]@§2.4、[21]@§4.3）随修订消失后，R2 有效引用点为 41 个，与运行指标 `citationAudit: entries=41, problems=0` 一致。05a 原文的 §3 明细共列出 43 条记录（含两条已关闭的问题引用记录），下文全部照录。

**Table 4** 总体结果（照抄 05a §2）

| 项目 | R1 初审（修订前） | R2 复核（修订后） |
|---|---|---|
| 审计引用点 | 43（40 条参考文献；[8]、[21] 各拆 2 个引用点，[30] 另拆 1 条书目勘误项） | 41（[8]@§2.4 与 [21]@§4.3 两个错误引用点已随修订消失，[30] 书目项转为已更正核验） |
| 定位成功 | 43/43（无 untraceable） | 41/41 |
| 最原始源 | 43/43 为 primary（[4][17][18] 为合并估计的原始出处，用法正确） | 41/41 为 primary |
| supported | 40/43 | 41/41 |
| 问题引用 | **3** | **0** |
| 撤稿/关注 | 0 条 retracted、0 条 expression of concern；1 条 corrected（[37] JARS 2018，有正式更正 10.1037/amp0000389） | 同左（复核未发现新状态变化） |

### 4.1 A 组：研究证据（照抄 05a §3 A 组）

**[1] §1 韩国摄入量与症状（274.6±276.5、19.9%≥400、27.1% 焦虑症状）；§1 末段与 §2.2 摄入分布锚定** ｜ PMID:39246108 = Choi SW 等, Korean J Med Educ 2024（PubMed 摘要与期刊记录一致）｜ abstract ｜ primary ｜ 摘要 RESULTS：274.6±276.5 mg/d、4.25±2.26 d/周、≥400 mg/d 者 19.9%、症状序次中 anxiety 27.1%（palpitations 47.4%、frequent urination 42.9% 之后）｜ supported ｜ necessary ｜ clean ｜ 保留。

**[2] §1 土耳其 166.5（SD 101.9）；§2.2 对数正态锚定；§2.2 同口径 r=0.137；§4.2 量级对照** ｜ PMID:41956451 = Keskin E 等, J Health Psychol 2026, DOI:10.1177/13591053261437579 ｜ abstract ｜ primary ｜ 摘要：261 名伊斯坦布尔学生，166.5±101.9 mg/d，r=0.137（p=.026），重度焦虑 OR=1.003（1.001–1.005），与抑郁无关联 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[3] §1 巴林 727 名、FFQ、268 mg/d、≥400 mg/d 五项症状约翻倍** ｜ PMID:32290044 = Jahrami H 等, Foods 2020, DOI:10.3390/foods9040473 ｜ abstract ｜ primary ｜ 摘要：n=727、半定量 FFQ、268 mg/d、"Participants consuming 400 mg/day or more showed a statistically and significantly twice as high risk for five symptoms" ｜ supported ｜ necessary ｜ clean ｜ 保留。注：原文五项为 headaches、spells of terror or panic、feeling trapped、worrying too much、worthlessness，其中"惊恐发作""过度担忧"确在其列；"五项焦虑症状"是对原文 anxiogenic 框架的合理压缩，若求精确可改"五项症状（含惊恐发作与过度担忧）"。

**[4] §1 SMD=0.94（0.28–1.60）、低剂量 0.61、>400 mg 2.86、剂量梯度；§2.2 量纲不可比；§4.2 d=0.38 对照 0.61（0.42–0.79）** ｜ PMID:38362247 = Liu C 等, Front Psychol 2024, DOI:10.3389/fpsyg.2024.1270246 ｜ abstract ｜ primary（合并估计的原始出处）｜ 摘要：8 篇文献 14 项研究 546 名健康人；SMD=0.94（0.28,1.60）；低剂量 0.61（0.42,0.79）；高剂量 2.86（2.50,3.22）；结论句"intake dose is greater than 400 mg" ｜ supported ｜ necessary ｜ clean（EuropePMC 出版类型 Systematic Review）｜ 保留。

**[5] §1 拉合尔 GAD-7 r=0.258；§2.2 目标值区间端点；§4.2 量级对照** ｜ DOI:10.61919/jhrr.v4i3.1256 = Aleem A 等, J Health Rehabil Res 2024（Crossref 落地 + 期刊落地页摘要）｜ abstract ｜ primary ｜ 落地页摘要原文："Significant positive correlations were found between caffeine consumption and PHQ-9 scores (r = .216, p < .001) as well as GAD-7 scores (r = .258, p < .001)"；茶为首要来源 75.9% ｜ supported ｜ necessary ｜ clean（OpenAlex false）｜ 保留。

**[6] §1 约旦 USDA 口径 DASS-21 正相关；§1 末段连续 mg/d 证据[2][5][6]** ｜ PMID:42491907 = Al-Dalaeen A 等, J Educ Health Promot 2026, DOI:10.4103/jehp.jehp_1579_25 ｜ abstract ｜ primary ｜ 摘要：n=204，按份量/频次/含咖啡因量并以 USDA 数据库折算 mg/d；"DASS scores showed positive correlations with dark chocolate, American/instant coffee, decaffeinated coffee, and red tea" ｜ supported ｜ necessary ｜ clean ｜ 保留。注：严格说是与具体品类（含美式/速溶咖啡）的相关；§1 末段"回归证据"措辞对 [5][6] 实为相关证据，建议改"关联证据"。

**[7] §1 沙特 Medina mg/d 定量与 DASS-21 无关联** ｜ PMID:37916247 = Makki NM 等, Cureus 2023, DOI:10.7759/cureus.48018 ｜ abstract ｜ primary ｜ 摘要 Results/Conclusion："no significant association was found between the severity of the DASS-21 score and the daily consumption of caffeine"（520 人，mg/d 问卷）｜ supported ｜ necessary ｜ clean ｜ 保留。

**[8] §1 黑咖啡品类显著而总咖啡因不显著；§4.2 口径教训；§4.3 品类依赖检出差异** ｜ PMID:42895008 = Gontijo ALA 等, J Oral Facial Pain Headache 2026, DOI:10.22514/jofph.2026.061，PMC13678550 ｜ fulltext ｜ primary ｜ 摘要 Results："daily black coffee consumption was significantly associated with severe anxiety (p < 0.001)"；讨论原文："The finding that only black coffee consumption, rather than total caffeine intake, was associated with anxiety symptoms may be explained by..."（全文第 4 段讨论）｜ supported ｜ necessary ｜ clean ｜ 保留。

**[8] §2.4 二分解读规则——R1 问题引用，R2 已关闭** ｜ R1 判定：wrong-context/unsupported（原文比较"品类 vs 总量"口径，不涉及二分化信息损失）。R2 复核：修订稿该句已删除 [8] 引用，改为"预注册解读规则（SAP §4.2，依据设计解析计算：二分后点二列 r ≈ 0.17、t 检验效能 ≈ 0.83，低于连续口径的 0.94）"的内部设计依据。手算自洽复核（Bash 工具当日故障未能跑脚本，为手工近似）：二分衰减因子 φ(z)/√(p(1−p)) 在理论分割 p=P(≥100)=0.664 下 ≈0.773，以边际 r=0.20 为基得 r_pb≈0.155、以骨架 ρ*=0.2496 为基得 ≈0.193，初稿 ≈0.17 落在区间内；r_pb=0.17、n=300 时 power≈0.85，与 ≈0.83 同量级；连续口径 0.94 与稿内 SAP 效能 0.937 一致。**问题关闭**。

**[9] §1 日本男生显著女生无；§4.2/§4.3 性别特异** ｜ PMID:2085289 = Mino Y 等, 1990（日文志，无 DOI）｜ abstract ｜ primary ｜ 摘要：291/423 名医学生；男生调整饮酒吸烟后咖啡因与焦虑显著正相关；女生与焦虑无关联、高摄入者抑郁反而更低 ｜ supported ｜ necessary ｜ clean（OpenAlex PMID 通道 false）｜ 保留。

**[10] §1 NutriNet 24,197 人女性显著男性无；§4.2/§4.3 性别特异** ｜ PMID:35334898 = Paz-Graniel I 等, Nutrients 2022, DOI:10.3390/nu14061242 ｜ abstract ｜ primary ｜ 摘要：n=24,197（74.1% 女性，平均 53.7 岁）；女性最高三分位 aOR=1.13（1.03–1.23），男性无关联 ｜ supported ｜ necessary ｜ clean ｜ 保留。注：该样本为一般成人（平均 53.7 岁），初稿未称其为大学生，用法无越界。

**[11] §1 Raine 仅男性调整后持续；§4.2 调整协变量清单与 β=0.32** ｜ PMID:24019267 = Trapp GS 等, Depress Anxiety 2014, DOI:10.1002/da.22175 ｜ abstract ｜ primary ｜ 摘要：20 岁随访横断，502 男 567 女；调整 sociodemographic、alcohol and drug use、physical activity、BMI、dietary intake 后每 100 mL/d 与焦虑相关（仅男性，β=0.32，95%CI 0.05–0.58）｜ supported ｜ necessary ｜ clean ｜ 保留。注：初稿 §4.2 协变量列举漏"drug use"，属简化，不构成偏差。

**[12] §1 纵向随访仅男性；§4.2 性别特异** ｜ PMID:32845046 = Kaur S 等, Depress Anxiety 2020, DOI:10.1002/da.23090 ｜ abstract ｜ primary ｜ 摘要：Raine Gen2，n=429（20→22 岁）；男性由非使用者转使用者焦虑分 +3.76（1.82–5.70），女性不显著 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[13] §1 反向路径（惩罚敏感性负向预测摄入）；§4.2 方向边界；§4.3 竞争结构** ｜ PMID:25188705 = Lyvers M 等, J Psychoactive Drugs 2014, DOI:10.1080/02791072.2014.942043 ｜ abstract ｜ primary ｜ 摘要：106 名大学生；"sensitivity to punishment negatively predicted daily caffeine intake, suggesting caffeine avoidance by trait-anxious individuals"；述情障碍正向预测 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[14] §1 韩国成人非线性（p-overall=.010）；§4.2 曲率可能；§4.3 竞争结构** ｜ PMID:42588110 = Kim J 等, Nutrients 2026, DOI:10.3390/nu18152488 ｜ abstract ｜ primary ｜ 摘要：KNHANES 2021–2024，20,504 人；RCS 咖啡因-焦虑 p-overall=0.010、p-nonlinear=0.016；短睡眠剂量-反应 p<0.001 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[15] §1 波黑 n=214、ρ=0.31（p<.001）；§2.2 频次口径上限参照；§4.2 量级对照** ｜ PMID:32124627 = Kusturica J 等, Acta Med Acad 2019, DOI:10.5644/ama2006-124.269 ｜ abstract ｜ primary ｜ 摘要：n=214 一年级学生；"The exam WTAS score was positively correlated with consumption of coffee (rho=0.31; P<0.001), energy drinks (rho=0.18...), nicotine (rho=0.22...)"；OR=0.55（0.31–0.97）预测自评学业 ｜ supported ｜ necessary ｜ clean ｜ 保留。注：ρ=0.31 已核；"频次口径"的定性（§2.2）在摘要级未直接体现（原文问卷测考前一周消费频次，推断合理），投稿版宜按原文测量条目再确认一次表述。

**[16] §1 韩国护生 n=180 分组比较（考试焦虑、抑郁更高、睡眠更差）；§1/§2.3 三联证据** ｜ DOI:10.29402/hn32.2.3 = Han J 等, Health & Nursing 2020（Crossref 落地 + KISS 收录页英文摘要）｜ abstract ｜ primary ｜ 英文摘要："180 participants of 1th to 4th grade nursing students"；"The mean scores of test anxiety, problematic drinking, depression, and quality of sleep in the high caffeine drink intake group were significantly high compared to those of the non-intake group"；睡眠分与考试焦虑正相关（高分=差睡眠口径）｜ supported ｜ necessary ｜ clean（OpenAlex false）｜ 保留。

**[17] §1 合并检出率 49.8%（39.9–59.6）、女性与低年级更高** ｜ PMID:42717343 = Omar YM 等, BMC Med Educ 2026, DOI:10.1186/s12909-026-10270-2 ｜ abstract ｜ primary（合并估计原始出处）｜ 摘要：35 项研究 13,489 人，49.8%（39.9–59.6，I²=98.2%）；女性 52.6% vs 男性 46.3%、一年级 58.6% vs 五年级 47.9% ｜ supported ｜ necessary ｜ clean（EuropePMC 类型 Meta-Analysis/Systematic Review）｜ 保留。注：摘要明言亚组检验仅 assessment tool 显著，性别/年级为数值更高（"numerically higher"）；初稿"一致更高"由 [18][19] 承担显著性与一致性，[17] 承担合并率与方向，建议投稿版补一句"（[17] 中亚组差异为数值性）"更稳。

**[18] §1 女性/低年级一致更高（系统综述）；参考文献注 R1 勘误（13 项）** ｜ PMID:42291660 = Mady MM 等, Adv Med Educ Pract 2026, DOI:10.2147/AMEP.S595472 ｜ abstract ｜ primary ｜ 摘要："Thirteen cross-sectional studies"（2019.01–2025.07，样本 82–735）；"Higher anxiety levels were consistently associated with female gender, early academic years..."；中重度 13.5%–72% ｜ supported ｜ necessary ｜ clean ｜ 保留。勘误后版本与摘要一致。

**[19] §1 女性/低年级更高（p=.01 / p<.001）；§4.2"以摄入应对考试压力"正向路径（49.6%）** ｜ PMID:39468103 = Jirjees F 等, Sci Rep 2024, DOI:10.1038/s41598-024-59739-4 ｜ abstract ｜ primary ｜ 摘要：n=925、14 所院校；女性 p=.01、低年级 p<.001、低 cGPA p<.001；"The most common non-pharmacological coping approaches are praying (59.5%), drink caffeine and/or energy beverages (49.6%)" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[20] §1 双向循环；§4.2 睡眠份额多元形态** ｜ PMID:33730347 = Hamilton NA 等, Int J Behav Med 2021, DOI:10.1007/s12529-021-09973-1 ｜ abstract ｜ primary ｜ 摘要：n=167，考前 2 天日记路径模型；"a reciprocal bi-directional relationship between Sleep Quality and restfulness (Q&R) and test anxiety" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[21] §1 睡眠质量调节作用** ｜ PMID:34134557 = Adams SK 等, Psychol Rep 2022（PubMed 2022 Oct，与初稿"年份取 PubMed 2022"一致），DOI:10.1177/00332941211025268 ｜ abstract ｜ primary ｜ 题名即"Examining the Moderator Role of Sleep Quality..."；摘要：考试焦虑与睡眠受损预测负性情绪（N=316）｜ supported ｜ necessary ｜ clean ｜ 保留。

**[21] §4.3"引言引用的女性更高证据"——R1 问题引用，R2 已关闭** ｜ R1 判定：wrong-context/unsupported（Adams 2022 题名与摘要均无性别比较结果，引言中"女性更高"引的是 [17][18][19]）。R2 复核：修订稿该句已改为"引言引用的女性更高证据[17][19]"——[17]（meta 亚组数值更高）与 [19]（UAE 原始研究 p=.01）均为引言该论点的实际支撑文献，引用一致。[21] 在修订稿中仅剩 §1"调节"一处用法（R1 已判 supported）。**问题关闭**。

**[22] §1 REM 前瞻预测；§4.2 睡眠份额形态** ｜ PMID:39080966 = Larios E 等, J Sleep Res 2025, DOI:10.1111/jsr.14298 ｜ abstract ｜ primary ｜ 摘要：52 人一周便携 EEG + 期末前复测；"rapid eye movement sleep was the most dominant factor predicting changes in participants' test anxiety"（方向为 REM 越多焦虑升幅越大）｜ supported ｜ necessary ｜ clean ｜ 保留。初稿只述"前瞻预测"不带方向，与原文一致。

**[23] §1 两波共变；§4.2 睡眠份额形态** ｜ PMID:40304155 = Van de Casteele M 等, Stress Health 2025, DOI:10.1002/smi.70040 ｜ abstract ｜ primary ｜ 摘要：121 人两波；"mean-level increases in controlled motivation, test anxiety, and poor sleep quality"；"test anxiety was robustly linked to decreased sleep quality" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[24] §1 零相关（r=-0.003，p=.957）；§4.2 阴性边界** ｜ DOI:10.70670/sra.v4i1.2484 = Ilyas S 等, Soc Sci Rev Arch 2026（Crossref 落地 + 期刊页摘要）｜ abstract ｜ primary ｜ 摘要原文："there was no relationship between sleep quality and test anxiety (r = -0.003, p = .957), while independent-samples t-tests presented no significant differences between men and women" ｜ supported ｜ necessary ｜ clean（OpenAlex false）｜ 保留。

**[25] §1/§2.3 三联证据（巴基斯坦医学生）** ｜ DOI:10.56536/sajms.v7i1.119 = Jawed F 等, South Asian J Med Sci 2026（Crossref 落地；期刊站被 Cloudflare 拦截，以 Semantic Scholar 摘要镜像核对）｜ abstract ｜ primary ｜ 摘要：AFMDC Faisalabad 185 名 MBBS 学生，PSQI + HAD；8–10 h 睡眠占比 27%（不摄入）→4.9%（摄入）；边缘焦虑 37.8%、重度 15.7%；软饮消费者 HAD 焦虑 8.24±2.91 最高 ｜ supported ｜ necessary ｜ clean（OpenAlex false）｜ 保留。

**[26] §1 约旦 853 人、睡眠差 70.6%、摄入更高；§2.2 PSQI 锚 70.6%；§2.3 三联证据** ｜ DOI:10.4103/japaj.japaj_30_25 = Shihadeh S 等, JAPA Academy Journal 2025（Crossref 落地 + Ovid 全文页）｜ fulltext ｜ primary ｜ 全文：853 名约旦大学生在线调查，周均 771.8±588.8 mg；"Poor sleep quality was reported by 70.6% and was significantly associated with higher caffeine intake (P < 0.001)"（PSQI，602/853）；摄入随抑郁（p=.047）、焦虑（p=.002）、应激（p<.001）严重度递增 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[27] §1 中国 791 名女性护生 TAS 18.42±7.96；§2.2 边际锚定与 Sarason 37 项 0/1 计分；§4.3 全女性锚说明** ｜ PMID:42502849 = Li Y 等, Psychol Res Behav Manag 2026, DOI:10.2147/prbm.s620453，PMC13401369 ｜ fulltext ｜ primary ｜ 摘要：791 名女性护生、8 所院校，TAS 18.42±7.96；全文方法节："Test anxiety was measured using the TAS, revised by Sarason in 1978... 37 dichotomous items (yes/no), with total scores ranging from 0 to 37" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[28] §1 摄入分布锚定（马来西亚）** ｜ DOI:10.25182/jgp.2024.19.supp.1.79-86 = Ikram EHK 等, Jurnal Gizi dan Pangan 2024（Crossref 落地 + 期刊 PDF 全文）｜ fulltext ｜ primary ｜ 全文：n=300、18–24 岁本科生、24 h 回顾咖啡因问卷；平均 193.54±142.74 mg/d；咖啡因×睡眠质量 χ²=25.12，p<0.01；社会人口学（含性别）与两者均无关联（Table 3）｜ supported ｜ necessary ｜ clean（OpenAlex false）｜ 保留。注：参考文献作者署名"Ikram K"宜作"Ikram EHK"（Emmy Hainida Khairul Ikram）。

**[38] §4.2 英国中学生调整后关联仍显著** ｜ PMID:26508718 = Richards G 等, J Psychopharmacol 2015, DOI:10.1177/0269881115612404，PMC4668773 ｜ abstract ｜ primary ｜ 摘要："After adjusting for additional dietary, demographic, and lifestyle covariates, positive associations between total weekly caffeine intake and anxiety and depression remained significant, and the effects differed between males and females" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[39] §4.2 睡眠困扰部分中介的青少年证据** ｜ PMID:42356346 = Chen X 等, Nutrients 2026, DOI:10.3390/nu18121960，PMC13304769 ｜ abstract ｜ primary ｜ 摘要：浙江队列 11,847 名 12–18 岁；≥3 天/周 OR=1.53（1.30–1.80）；"Exploratory mediation analysis suggested that sleep disturbance may be statistically related to a portion of the observed association" ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[40] §4.2 印度医学生 ≥3 杯/日成绩不升反降（曲率可能）** ｜ PMID:41841082 = Petkar SS 等, Cureus 2026, DOI:10.7759/cureus.103534，PMC12989166 ｜ fulltext ｜ primary ｜ 全文：印度马哈拉施特拉邦某政府医学院（BJ Government Medical College, Pune）249 名二年级医学生；Table 3 及正文：1–2 杯/日 124.1±22.9 > 不饮组 122.9±23.4 与 ≥3 杯/日组（ANOVA p=0.018）；摘要明言 1–2 杯组高于不饮与 ≥3 杯两组 ｜ supported ｜ necessary ｜ clean ｜ 保留。注：原文未在叙述中给出 ≥3 杯组均分（表格为图片），"≥3 杯低于不饮组"未见于文本，初稿"不升反降"按非单调（低于中剂量组）理解成立。

### 4.2 B 组：方法学与工具文献（照抄 05a §3 B 组）

**[29] §2.2 PSQI 工具** ｜ DOI:10.1016/0165-1781(89)90047-4 = Buysse DJ 等, Psychiatry Res 1989;28(2):193-213（Crossref 精确匹配）｜ none（标识符级）｜ primary ｜ Crossref 题名即"The Pittsburgh sleep quality index: A new instrument for psychiatric practice and research"，与正文工具归属完全对应 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[30] §2.4 95%CI 用 Fisher z 变换** ｜ Fisher RA, Metron 1921 ｜ none（标识符级；原文未读）｜ primary ｜ OpenAlex 与权威书目（Lehmann, Berkeley 统计技术报告 541；Adelaide 数字图书馆 Fisher 文集第 014 号）确认 1921 年 z 变换出处即此文 ｜ supported（归属正确）｜ necessary ｜ clean ｜ 保留。

**[30] 参考文献条目（题名与卷期）——R1 问题引用，R2 已关闭** ｜ R1 判定：unsupported（书目错误，"as deduced from the probability integral"与卷号 2 为流传的错误引文形式；正确题录 Metron 1921;1(4):3-32）。R2 复核：修订稿参考文献 30 已更正为"On the probable error of a coefficient of correlation deduced from a small sample. Metron. 1921;1(4):3-32"，并附更正注（标注按 OpenAlex 题录更正、SAP 原条目有误、正文归属不受影响、已登记上游修订清单）。修订稿注中引用的题录号 W404240460 经 OpenAlex 复验确为该文（1921、vol 1、is_retracted false）；§4.3"另有四点说明"亦同步登记"Fisher 条目书目错误"为三处 SAP 文字瑕疵之一。**问题关闭**。

**[31] §2.4 Holm 步降校正** ｜ Holm S, Scand J Stat 1979;6(2):65-70（OpenAlex 题录：vol 6, p 65, 1979，is_retracted false）｜ none（标识符级）｜ primary ｜ 题名"A Simple Sequentially Rejective Multiple Test Procedure"与步降程序名直接对应 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[32] §2.4 BH-FDR** ｜ DOI:10.1111/j.2517-6161.1995.tb02031.x = Benjamini Y & Hochberg Y, JRSS-B 1995;57(1):289-300（Crossref 精确匹配）｜ none（标识符级）｜ primary ｜ 题名"Controlling the False Discovery Rate"与 FDR 程序直接对应 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[33] §2.4 Cohen 效应量惯例** ｜ Cohen J. Statistical power analysis for the behavioral sciences. 2nd ed. 1988（Crossref 收录该书后续版本 DOI:10.4324/9780203771587，原版书目为通行记录）｜ none ｜ primary ｜ r 0.10/0.30/0.50 与 d 0.2/0.5/0.8 为该书通行惯例；本次未读原书，惯例数值属标准归属 ｜ supported（标识符级）｜ necessary ｜ clean（专著无撤稿记录可查）｜ 保留；投稿版可补页码（1988 版第 79–81、284–287 页区域）。

**[34] §2.4 HC3 稳健标准误** ｜ DOI:10.1016/0304-4076(85)90158-7 = MacKinnon JG & White H, J Econometrics 1985;29(3):305-325（Crossref 精确匹配）｜ none（标识符级）｜ primary ｜ 题名"Some heteroskedasticity-consistent covariance matrix estimators with improved finite sample properties"，HC3 为该文第三估计量 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[35] §2.4/§3.3 VIF、条件数与 Belsley 列标准化判定口径** ｜ Belsley DA, Kuh E, Welsch RE. Regression Diagnostics. Wiley 1980（Crossref 经 JSTOR 书评记录确认书目）｜ none ｜ primary ｜ 条件指数 κ 与列标准化诊断出自该书，为通行归属 ｜ supported（标识符级）｜ necessary ｜ clean（专著无撤稿记录可查）｜ 保留。

**[36] §2.4 多重插补（m=20，Rubin 规则）** ｜ Rubin DB. Multiple Imputation for Nonresponse in Surveys. Wiley 1987，DOI:10.1002/9780470316696（Crossref 精确匹配）｜ none（标识符级）｜ primary ｜ 合并规则（Rubin's rules）出自该书 ｜ supported ｜ necessary ｜ clean ｜ 保留。

**[37] §2.4 APA/JARS 报告规范** ｜ DOI:10.1037/amp0000191 = Appelbaum M 等, Am Psychol 2018;73(1):3-25（Crossref 精确匹配）｜ none（标识符级）｜ primary ｜ 题名"Journal article reporting standards for quantitative research in psychology" ｜ supported ｜ necessary ｜ **corrected** ｜ 保留，引用时注明存在正式更正：Correction to Appelbaum et al. (2018), DOI:10.1037/amp0000389（Am Psychol 2018）。更正非撤稿、非关注声明，不影响其作为报告规范依据。

### 4.3 问题引用与修订清单（照抄 05a §4）

1. **[8]@§2.4**（wrong-context）→ **已关闭**：修订稿删除该处 [8]，二分解读规则改由 SAP §4.2 设计解析计算支撑（点二列 r ≈ 0.17、效能 ≈ 0.83 vs 连续 0.94；手算自洽，见 §7）。
2. **[21]@§4.3**（wrong-context）→ **已关闭**：修订稿改为 [17][19]，与引言"女性更高"的实际支撑文献一致。
3. **[30] 参考文献条目**（书目错误）→ **已关闭**：修订稿更正题名与卷期为 Metron 1921;1(4):3-32 并附更正注；注中题录号 W404240460 复验通过。

R1 提出的三项非阻断精度提示在修订稿中未采纳（可选措辞项，不构成问题引用）：[17] 性别/年级亚组差异为数值性（仅 assessment tool 亚组显著），可补"（亚组差异为数值性）"；§1"连续 mg/d 口径的回归证据[2][5][6]"可改"关联证据"（[5][6] 为 Pearson 相关）；[28] 作者署名"Ikram K"宜作"Ikram EHK"。

深审边界（照抄要点，详见 05a §5）：B 组 9 条方法学文献均为标识符级核验、未读正文，具体数值未逐页核对，投稿版建议补页码；Retraction Watch 端点当日故障，以 Crossref `updated-by` 断言替代；[21] 与 [15] 未取得全文，分别以摘要级核验并给出处置建议。

**亲手验证动作**　任选一条深审条目复核。例如 [26]：打开 `papers/` 中无此文（付费墙），按 05a 记录访问 Ovid 全文页或期刊页，找"Poor sleep quality was reported by 70.6%"这句，与 `06-draft.md` §1 和 §2.2 中引述的 70.6% 对照。已下载的 16 篇直接开 `papers/` 对应 PDF 核对（清单见 08 §一）。

## 5 各关卡结论一览

> **通俗导读**　这一节像考完试看成绩单。每门课（关卡）一行：过没过、多少分、有没有没答的题。最后附一张「我亲手复测过的项目」表。复测过的才敢说复测过。

**Table 5** 关卡结论与遗留

| 关卡 | 结论 | 关键数字 | 遗留 |
|---|---|---|---|
| 引文核查（S2，证据表关卡） | 通过 | 核查 13 条、失败 0；条目[41]研究数 27→13 篇已更正（02 §9） | 无 |
| 完整性/复现性门（分析内置前置门） | 通过（10/10 PASS） | 三对实测 r=0.2003/0.1502/0.2506，偏差 +0.0003/+0.0002/+0.0006（门槛 ≤0.01）（table-S0） | 无 |
| 统计审稿 | accept | 0 轮退回（运行指标） | 无 |
| 同行评审 | 通过 | 1 轮、遗留 major 0 项；意见修订进 06 | 无 |
| 答辩拷问 | 完成作答 | 6 问逐条作答；每条附核验命令或修订落点（07） | 3 问待补（Table 6） |
| 引文深审（R1→R2） | 通过 | R1 43 点 3 处问题；R2 41 点 0 处问题，3 处全部关闭（05a §2/§7） | 3 项非阻断精度提示（可选措辞，见 §4.3） |
| 文献归档 | 完成 | 16 篇下载验证通过；24 条待获取（08） | 24 条需用户自行合法获取 |

**Table 6** 答辩拷问 3 问待补（照录 07 Unanswered 要点）

| # | 待补问题 | 所缺条件 |
|---|---|---|
| 1 | 全女性锚定对混合性别总体 TAS 均值的偏移量：方向可判（偏高），量级不可估 | 缺混合性别、同量表（Sarason TAS 0–37 口径）的本科生分布锚定文献；白名单 55 条内无此条目 |
| 2 | 真实 FFQ 测量误差的衰减系数：只能定性声明「系统性下降」 | 白名单内无咖啡因 FFQ 效度/信度研究；需测量效度文献或预调查重测信度数据 |
| 3 | 开发期是否存在未记录的蒙特卡洛修改尝试：日志从 02:18 首跑记起，此前编码期运行无日志 | 需更早的 shell 历史或版本控制记录（本目录非 git 仓库）；现有材料能证明的仅是「记录在案的修改一轮、修复后四次运行逐位复现」 |

**Table 7** 运行指标总览（取自本次运行的落盘指标；`99-metrics.json` 由流水线代码写入，本审计整理步骤检查时该文件尚未出现在产物目录，`find` 核实为无）

| 指标 | 数值 |
|---|---|
| 运行模式 / 完整性档位 / 编队 | pipeline / development / hybrid |
| 证据表纳入条目 | 55 |
| 引文核查 | checked 13，passed，failures 0 |
| 统计审稿 | accept，0 轮 |
| 同行评审 | 1 轮，openMajors 0 |
| 答辩拷问 | 6 问，3 问未答 |
| 引文深审 | 41 条，problems 0 |
| 文献归档 | 已下载 16，未下载 24 |

**Table 8** 本审计整理步骤亲测记录（2026-10-24 实际执行的命令与结果）

| 检查 | 命令 | 结果 |
|---|---|---|
| 冻结数据指纹 | `shasum -a 256 04-analysis/input/sim_data_frozen.csv` | `46ced49db1bd424a99bfd6c299fc8a674c26070ad1625f8202d53569218051d9`，与 freeze_manifest.json 及运行记录逐位一致 |
| 记录数 | `wc -l 04-analysis/input/sim_data_frozen.csv` | 301 行（表头+300 条记录），与 n=300 一致 |
| 完整性门 | 直接读取 `tables/table-S0-data-integrity-gate.csv` | 10 项全部 PASS，三对 r 偏差 +0.0003/+0.0002/+0.0006 |
| 主结果 | 直接读取 `tables/table-R2-primary-results.csv` | *r*(298)=0.200 [0.089, 0.307]、Holm 0.000962；*b*₁=1.248 [0.405, 2.091]、Holm 0.003852；衰减 17.7% |
| 蒙特卡洛 | 直接读取 `tables/table-S3-montecarlo.csv` | Null-A 0.0545、Null-B 0.0565，均 PASS；附带演示 0.117 |
| 文献计数 | `ls papers/ \| wc -l` | 16，与指标 downloaded=16 一致 |
| 指标文件位置 | `find . -name 99-metrics.json`（工作区内、排除 .venv） | 无结果（该文件由流水线代码落盘，非本步骤所写） |

未由本步骤执行的检查如实说明：`bash run_all.sh` 全量重跑未在本步骤执行。终次运行退出码 0（FINAL_EXIT=0，约 6 秒）与「两次独立运行 SHA256 一致」是分析阶段的运行声明（分析输出 reproducibility 记录；07 附表记录了回应会话的第五次全量重跑同值）。**亲手验证动作**　要亲自复现，运行 `cd provenance-lab-output/04-analysis && bash run_all.sh`，然后比对本节 Table 8 的四个数字：SHA256 前缀 `46ced49d`、Null-A 0.0545、Null-B 0.0565、table-R2 两行 Holm 后 p 值。

## 6 人工校对指引

> **通俗导读**　这一节是核对路线图。按顺序走。每一步写明打开哪个文件、看哪一节、什么算通过。全程约一小时。中途任何一步对不上，停下来查那一节，不要跳过。

**Table 9** 建议核对顺序（由数据到文字、由自动可验到需人工判断）

| 顺序 | 核对什么 | 打开哪里 | 通过标准 |
|---|---|---|---|
| 1 | 产物齐全性 | 00-README §1 目录树 | 树上每个文件都存在；papers/ 计 16 个 PDF |
| 2 | 变量字典与数据列一致 | 本文件 §2 Table 2 ↔ `04-analysis/input/sim_data_frozen.csv` 表头 ↔ `03-sap.md` §2.2 Table 3 | 列名一一对应，定义无冲突 |
| 3 | 数据没被改过 | `04-analysis/input/freeze_manifest.json` ↔ 对 CSV 重算 SHA256 | 哈希为 `46ced49d…51d9`；301 行 |
| 4 | 复现门真的过了 | `tables/table-S0-data-integrity-gate.csv` | 10 项全 PASS，三对偏差 ≤0.01（实测 ≤0.0006） |
| 5 | 主结果三处同数 | `tables/table-R2-primary-results.csv` ↔ `run-03-summary.txt` ↔ `06-draft.md` 摘要 | *r*=0.200、*b*₁=1.248、Holm 后 0.000962/0.003852 三处一致 |
| 6 | 校正家族没偷加检验 | `tables/table-S2-multiplicity.csv` ↔ `03-sap.md` 校正节 ↔ decisions-log D5 | F1 恰两项、F2 恰五项，无追加 |
| 7 | 蒙特卡洛口径与修复留痕 | `tables/table-S3-montecarlo.csv` ↔ decisions-log D3 ↔ `run-heartbeat.log` | 拒绝率在带内；FAIL→修复→PASS 只有一轮，日志可查 |
| 8 | 诊断与影响点 | `tables/table-S1-diagnostics.csv`、`table-S1b-cooks-distance.csv` ↔ decisions-log D10–D12 | BP/RESET/SW 均未触发；Cook's D 16 条且剔除后仅敏感性 |
| 9 | 引文逐条抽验 | 本文件 §4 ↔ `05a-citation-audit.md` ↔ `06-draft.md` 参考文献 | 每条定位、supported、必要性判定成立；至少抽验 [8][21][30] 三处关闭记录与 [26] 一条全文级 |
| 10 | 待补事项与文献缺口 | `07-rebuttal.md` Unanswered 节 ↔ `08-papers-manifest.md` §二 | 3 问待补的条件明确；24 条待获取文献有获取途径 |
| 11 | 图的数值没被改 | `09-figure-audit.md` ↔ `figures/figure-R1-scatter-ols-ci.png` ↔ `figures-polished/` 同名图 | 两版散点与拟合线一致；图例 ŷ=16.68+1.52×(mg/d)/100 对 M0 *b*=1.517 |
| 12 | 终极复现（可选，约 6 秒） | `cd 04-analysis && bash run_all.sh` | 退出码 0；SHA、Null-A/B、主结果与第 3–5 步同值 |

## 7 免责声明

**工具定位声明**：本流水线是科研提效工具，与任何工具一样不保证产出百分之百真实、正确或完整；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。

适用边界：

1. 本运行全部数据为固定种子模拟生成（演示口径），全部结果仅描述模拟总体，不外推任何真实人群，不用于真实推断、发表结论或决策。
2. 引文深审的 B 组方法学文献为标识符级核验（未读原文），Cohen 惯例数值与 Belsley κ 口径等未逐页核对；投稿版应补页码并做一次人工全文复核（05a §5）。
3. 答辩拷问尚有 3 问待补（§5 Table 6），文献归档尚有 24 条待获取（08 §二），两项均为显式遗留，未经人工补齐不得进入投稿流程。
4. 本审计包的文字是对产物的索引与照抄，任何核对以原始产物文件为准；发现不一致时以原始文件为准并回溯对应阶段。

# 06 初稿：大学生日均咖啡因摄入量与考试焦虑的横断线性关联（固定种子模拟数据演示）

运行口径：provenance-lab pipeline · development 严格度。本稿为 S5 写作产物，上游输入为 01 立题书（R1）、02 证据表（S2b，55 条）、03 SAP（v1.0 冻结）、04 分析结果（含 decisions-log 与统计审稿遗留问题清单）。语言：中文交付稿；投稿英文版另行翻译，图注附英文投稿版。

---

## 标题页

**中文标题**：大学生日均咖啡因摄入量与考试焦虑得分的横断线性关联：固定种子模拟数据演示（n = 300）

**英文标题**：Daily caffeine intake and test anxiety scores among undergraduates: a cross-sectional linear association analysis on fixed-seed simulated data (n = 300)

**数据性质声明（醒目，投稿时置于标题下方）**：本稿全部数据由预注册式模拟程序生成（固定种子，可复现），全部结果仅描述模拟总体，不外推任何真实人群，不用于真实推断、发表结论或决策。真实数据到位后沿用同一统计分析计划（SAP）更换数据源重新估计。

**作者与单位**：________（占位，由作者填写）

**通讯作者**：________（占位）

**目标期刊**（按优先序）：Psychology Research and Behavior Management；Journal of American College Health；中国临床心理学杂志。注：上述实证期刊为真实数据版的投稿目标；本演示稿不向实证期刊投稿，其流程方法学内容的对口载体为方法学/可复现性平台（正式预注册见 §4.4）。

**运行头（running head）**：咖啡因摄入与考试焦虑（模拟演示）

### 伦理声明（占位，作者不得删除本节）

- **数据来源**：本研究全部数据为固定种子（20261023 生成与校准、20261024 分折、20261025/20261026 蒙特卡洛）模拟生成，生成机制与冻结校准记录见 SAP §1.5 与 04-analysis 审计包；不包含任何人类或动物受试者的原始数据。
- **伦理委员会批准**：本研究不涉及人类受试者，无需伦理批准。真实数据版须提交机构伦理委员会审查（批准号：________，由作者填写）。
- **知情同意**：不适用（模拟数据）。真实数据版须获得参与者书面知情同意或豁免证明（状态：________，由作者填写）。

### AI 使用声明（草稿，作者不得删除；具体措辞按目标期刊 AI 披露政策调整）

本稿件由 AI 辅助生成，辅助范围包括：五源开放文献检索（PubMed、Europe PMC、OpenAlex、Semantic Scholar，arXiv 零命中）、证据表与引文逐条核查（全部 55 条纳入条目的标识符与撤稿状态经 API 复验）、统计分析计划起草与分析代码实现（01 校准、02 蒙特卡洛、03 冻结与分析脚本，一键重跑）、统计结果复算与本初稿撰写。稿件引用限于上游已核查证据表（02-evidence-table.md，55 条白名单）与 SAP 已核方法学文献，未引入任何未核查文献。AI 生成内容存在错误风险；全部数据、统计量与结论须由作者人工核验，作者对稿件的科学性与学术诚信承担全部责任。

---

## 结构式摘要

**目的**：以固定种子模拟数据演示估计大学生日均咖啡因摄入量与考试焦虑（TAS）得分的横断线性关联，并检验该关联在调整性别、年级与睡眠质量（PSQI）后是否持续存在。

**方法**：横断面观察性设计的模拟演示，n = 300（在校本科生口径，18–25 岁）。暴露为日均咖啡因摄入量（mg/d，食物频率问卷口径）；结局为 Sarason 考试焦虑量表总分（0–37）。数据由高斯骨架加单调边际变换生成，目标边际相关 r = 0.20，经骨架反解与 Fisher 迭代校准（2 次收敛，三对偏差 ≤ 0.0006）后冻结。主分析为 Pearson 相关（H1a）与多重线性回归（H1b，调整性别、年级、PSQI）；敏感性含 Spearman ρ、暴露二分（< 100 vs ≥ 100 mg/d）与年级连续编码；探索项为剂量-反应二次项（H2）。确证家族 Holm 校正，探索家族 BH-FDR；双侧 α = 0.05。报告遵循 STROBE 与 APA/JARS。

**结果**：模拟样本摄入量 M = 151.27 mg/d（SD = 105.56），TAS 得分 M = 18.03（SD = 7.99）。H1a：r(298) = 0.200，95%CI [0.089, 0.307]，t = 3.53，p < .001（Holm 校正后 p = .001），r² = 0.040。H1b：调整后每增加 100 mg/d 对应 TAS 得分升高 b₁ = 1.248 分，95%CI [0.405, 2.091]，t(293) = 2.91，p = .004（Holm 校正后 p = .004）；偏相关 r = 0.168，95%CI [0.055, 0.277]；相对仅协变量模型 ΔR² = 0.026。未调整斜率 1.517 分/100 mg·d⁻¹ 调整后衰减 17.7%。Spearman ρ = 0.195（q = .003），二分口径 Cohen's d = 0.38（q = .003），方向与结论一致；H2 二次项不显著（q = .191），线性模型充分。前提诊断（Breusch-Pagan p = .970、Ramsey RESET p = .845、Shapiro-Wilk p = .286、max VIF = 1.41）均未触发预注册后续处理。零假设蒙特卡洛（各 2,000 次）经验拒绝率 0.0545 与 0.0565，均落入合格带 [0.0404, 0.0596]。

**结论**：在该模拟总体中，主分析与全部敏感性口径一致检出生成机制设定的正向线性关联（r = 0.200，95%CI [0.089, 0.307]；调整后 b₁ = 1.248 分/100 mg·d⁻¹，95%CI [0.405, 2.091]，斜率衰减 17.7%，其中性别与年级为零相关协变量，实质调整量为 PSQI）。阳性检出是参数的回显，效应方向与量级由生成机制写定，不构成科学发现；全部结论限于模拟总体，不外推真实人群。演示的流程（预注册 SAP、冻结时序、type-I 校准、多重比较家族）即真实数据版的工作模板，其条件分支与竞争生成场景尚未压测。

**关键词**：咖啡因摄入；考试焦虑；横断面研究；睡眠质量；大学生；模拟数据

---

## 1 引言

咖啡因是大学生使用最普遍的精神活性物质。韩国医学生横断调查显示日均摄入 274.6 mg（SD 276.5），19.9% 达 400 mg/d 以上，27.1% 报告咖啡因相关焦虑症状[1]；土耳其大学生日均 166.5 mg（SD 101.9）[2]；巴林 727 名大学生半定量食物频率问卷（FFQ）估算人均 268 mg/d，≥ 400 mg/d 者"惊恐发作""过度担忧"等五项焦虑症状风险约翻倍[3]。

咖啡因-焦虑关联的证据正向与不一致并存。汇总层面，8 篇文献的荟萃分析给出 SMD = 0.94（95%CI [0.28, 1.60]），低剂量组 0.61、> 400 mg/d 组达 2.86，剂量梯度明确[4]。连续剂量口径的横断正向估计集中在一般焦虑结局：巴基斯坦拉合尔样本 GAD-7 相关 r = 0.258[5]，约旦样本 USDA 数据库 mg/d 口径下 DASS-21 得分与咖啡摄入正相关[6]。不一致证据同样清楚：沙特 Medina 样本以 mg/d 定量却与 DASS-21 焦虑无关联[7]；巴西样本中日常黑咖啡品类与重度焦虑相关而总咖啡因摄入不显著[8]；关联呈性别特异（日本男生显著女生无[9]、NutriNet 24,197 人样本女性显著男性无[10]、澳大利亚 Raine 队列仅男性调整后持续[11]、其纵向随访亦限于男性[12]）；反向路径存在——高特质焦虑者回避咖啡因，惩罚敏感性负向预测摄入[13]；韩国成人样本呈非线性（p-overall = .010）[14]。正向线性关联是多数证据支持的工作假设，不是定论，这直接支持双侧检验设计。

把结局换到考试焦虑，直接证据只剩两项。波黑一年级大学生（n = 214）的考试焦虑与咖啡消耗量 Spearman ρ = 0.31（p < .001）[15]；韩国护生研究（n = 180）比较高咖啡因饮品摄入组与非摄入组，摄入组考试焦虑、抑郁更高、睡眠更差[16]。两项分别为频次相关与分组比较：连续 mg/d × 连续考试焦虑得分的线性回归估计，在现有文献中没有先例——连续 mg/d 口径的回归证据[2][5][6]结局全部是一般焦虑量表。考试焦虑不是一般焦虑的亚型：它是情境性构念，医学生群体合并检出率达 49.8%（95%CI [39.9, 59.6]），女性与低年级一致更高[17][18][19]。协变量结构上，睡眠质量与考试焦虑的关系存在双向循环[20]、调节[21]、REM 睡眠前瞻预测[22]、两波共变[23]与零相关[24]五种并存的证据形态；咖啡因摄入、睡眠质量与焦虑三联共变的横断证据则见于韩国护生[16]、巴基斯坦医学生[25]与约旦 853 人样本（睡眠差者 70.6%，摄入更高）[26]。截至本次五源检索（87 条候选池），同时调整性别、年级与睡眠质量的咖啡因-焦虑研究为零。

本研究在（模拟）本科生总体中回答两个确证问题与一个探索问题：日均咖啡因摄入量与 TAS 得分是否存在横断线性关联（H1a）；调整性别、年级与 PSQI 后每增加 100 mg/d 的关联是否持续（H1b）；剂量-反应对线性模型的偏离是否需要二次项（H2）。全流程以固定种子模拟数据演示：预注册式 SAP 冻结于任何结果之前，数据生成参数锚定真实文献（TAS 分布锚定中国 791 名女性护生实测 18.42 ± 7.96[27]，摄入量分布锚定土耳其[2]、韩国[1]与马来西亚[28]实测），分析结论限于模拟总体，为真实数据版提供可复现的工作模板。

## 2 方法

### 2.1 设计与报告规范

横断面观察性设计（STROBE 横断条目逐条对照见附录 A；模拟口径在每一条目显式标注）。固定种子模拟数据演示，n = 300，推断对象为生成机制设定的真值：目标边际相关 r = 0.20（定义在变换后边际）、未调整边际斜率 ≈ 1.47、调整后斜率 ≈ 1.25 分/100 mg·d⁻¹。暴露与结局在同一（模拟）时点测量，统计推断定位为关联估计，不作因果方向陈述。结论解释范围限于模拟总体。统计分析计划（SAP v1.0，2026-10-24 冻结）先于任何数据生成与结果查看定稿，冻结时序与分析偏离全部留痕（04-analysis/decisions-log.md）。

### 2.2 数据生成与冻结（模拟机制）

数据由三维高斯骨架（摄入量、TAS、PSQI 对应的标准正态三元组，骨架相关阵初值含摄入×TAS 反解值 0.216）加单调边际变换生成：咖啡因摄入量为对数正态边际（中位数 130 mg/d，σ = 0.62，截断 [0, 800]），边际均值 ≈ 158 mg/d、SD ≈ 108 mg/d，锚定土耳其实测 166.5（SD 101.9）mg/d[2]；TAS 得分为正态边际 N(18.4, 8.0) 截断 [0, 37]（Sarason 量表 37 项 0/1 计分），锚定中国护理本科生实测 18.42（7.96）[27]；PSQI 得分为正态边际 N(6.5, 3.2) 截断 [0, 21]，P(PSQI > 5) = 0.68，锚定约旦 70.6% 差睡眠占比[26]；PSQI 工具为匹兹堡睡眠质量指数[29]。性别（女 = 1，概率 0.55）与年级（大一至大四均匀分布）独立于骨架生成，演示口径下不携带与暴露或结局的相关结构。

目标边际相关设定为 r(摄入, TAS) = 0.20、r(摄入, PSQI) = 0.15、r(TAS, PSQI) = 0.25。目标值的选取按口径匹配原则：与本研究同口径（连续 mg/d × 连续得分）的实测正向估计为 r = 0.137[2] 与 0.258[5]，0.20 取该连续口径区间的保守端；考试焦虑口径的 ρ = 0.31[15] 为频次口径、与连续 mg/d 不同量纲，作上限参照不作锚定；剂量分组口径的 SMD（总汇 0.94、低剂量组 0.61）[4]量纲亦不可比。取 0.20 而非更大值是设计内最难检出的选择——80% 与 90% 效能的最小可检 r 分别为 0.162 与 0.186（SAP §1.4），0.20 紧贴 90% 档。该选取含设计自由度，其辩护来自口径匹配论证，不来自预注册本身（§4.3）。校准程序为 Fisher 尺度加性迭代（种子 20261023）：实测 2 次迭代收敛，三对偏差 ≤ 0.0006，骨架终值 ρ* = (0.2496, 0.1599, 0.2685)。校准完成后冻结数据集（SHA256 = 46ced49db1bd424a99bfd6c299fc8a674c26070ad1625f8202d53569218051d9；两次独立重跑哈希一致，生成确定性验证通过）。完整性与复现性门 10 项全部通过：三对实测 r = 0.2003 / 0.1502 / 0.2506，与目标偏差 +0.0003 / +0.0002 / +0.0006（门槛 ≤ 0.01）。全部 300 条记录进入分析，无缺失（设计零缺失在数据上实现确认），无抽样权重，无事后剔除。

### 2.3 变量

结局为 TAS 总分（tas_total，0–37 连续）。暴露为日均咖啡因摄入量（caffeine_mg，mg/d，FFQ 式口径估算咖啡、茶、能量饮料与可乐贡献的总咖啡因），回归计量单位为 caffeine_100（mg/d ÷ 100），斜率按每 100 mg/d 解读。调整变量为性别（sex_female）、年级（主分析 3 个指示变量，参照 = 大一）与 PSQI 总分（psqi_total）；PSQI 为关键混杂——与暴露、结局均相关的三联横断证据[16][25][26]——横断数据无法区分混杂与中介，b₁ 按调整 PSQI 后的直接关联口径解释。敏感性派生暴露二分 caff_high（≥ 100 mg/d vs < 100 mg/d 参照组，固定界值预注册）；探索派生 caffeine_100_sq（二次项）。品类分项、抑郁、饮酒、GAD-7/STAI、年龄、BMI 与体力活动经预注册排除，理由见 SAP §2.3。

### 2.4 统计分析

**主分析**。H1a：摄入量与 TAS 得分的 Pearson 相关，双侧 t 检验（df = 298），95%CI 用 Fisher z 变换[30]。H1b：多重线性回归 M1（tas_total ~ caffeine_100 + sex_female + 年级指示 × 3 + psqi_total；k = 7，n/k = 42.9），双侧 t 检验 β₁（df = 293）；报告非标准化 b₁ 及 95%CI、标准化 β、偏相关 r、调整 R² 与 ΔR²（相对仅协变量模型）。混杂衰减指标为 (b_M0 − b_M1)/b_M0，其中 M0 为仅含 caffeine_100 的未调整模型。

**多重比较**。确证家族 F1（H1a、H1b）Holm 步降校正，FWER = 0.05[31]；探索家族 F2（H2、Spearman、二分 t 与二分调整 b、性别交互）BH-FDR，q = 0.05，只描述不判定[32]。确证判定只依据 Holm 校正后 p、效应方向与 CI 位置；实测方向为负时如实报告，不翻转、不改单侧。效应量惯例参照 Cohen[33]（r 0.10/0.30/0.50 为小/中/大；d 0.2/0.5/0.8）。

**敏感性与探索**。Spearman ρ 承担边际形态稳健性（摄入量偏度 1.57，右偏）；暴露二分口径比较两组 TAS 得分（独立样本 t 检验与调整回归），效应量为均值差与 Cohen's d，预注册解读规则（SAP §4.2，依据设计解析计算：二分后点二列 r ≈ 0.17、t 检验效能 ≈ 0.83，低于连续口径的 0.94）：二分信息损失下连续口径显著而二分口径不显著属设计属性而非结论不稳；年级连续编码（M1ord）相对变化 < 10% 判编码不敏感；H2 为 M1 加二次项（M2），β₂ 不显著判线性模型充分；性别×摄入交互（M3）仅描述。

**前提诊断**（预注册后续处理见 SAP Table 4）：线性（散点 + LOWESS、Ramsey RESET）、同方差（Breusch-Pagan，显著时 HC3 稳健标准误重报[34]）、残差正态（Shapiro-Wilk，诊断性报告）、共线性（VIF 与条件数[35]）、极端值（Cook's D > 4/n 逐一列出并做剔除后重拟合，仅敏感性）。多重插补预案（m = 20，Rubin 规则[36]）未触发（零缺失）。5 折分层交叉验证比较 M0/M1/M2 的预测性价比，不承担推断。

**type-I 错误率校准**。零假设蒙特卡洛先于任何演示数据结果查看执行（各 2,000 个 n = 300 重抽数据集）：Null-A 保留全部边际与 PSQI 结构、校准至 r(摄入, TAS) = 0；Null-B 保留混杂结构、校准至偏相关 = 0（此时未调整边际 r ≈ 0.04 保留，对应"混杂存在而直接关联为零"）。合格标准为经验拒绝率落入二项 95% 带 [0.0404, 0.0596]。执行偏离披露：Null 校准目标由 SAP 字面的"单固定样本实测 = 0"实现为"400 个重抽集平均实测 = 0"（容差 0.004）——首版单样本口径把该样本 − 0.144 的抽样噪声注入骨架，重抽中心系统性偏离 0，Null-A/Null-B 拒绝率 0.768/0.276 双 FAIL；按 SAP §5.6"不合格时排查实现与生成器，不得放宽带"的要求修正为平均口径后通过（decisions D3–D4，全程留痕）。该口径为 type-I 校准的正确语义，正式预注册版应写入 SAP。

统计量报告遵循 APA/JARS[37]：p < .001（不写 p = 0.000）、95%CI [LL, UL]、M (SD)、效应量与精确统计量成对。全部代码、种子、迭代记录与输出在审计包内（provenance-lab-output/04-analysis/，一键重跑 run_all.sh，终次运行退出码 0）。

### 2.5 伦理

见标题页伦理声明（占位）。本演示不涉及人类受试者。

## 3 结果

### 3.1 样本描述（模拟数据）

模拟样本 300 条记录（Table 1；源 table-R1-descriptives.csv）。日均咖啡因摄入量 M = 151.27 mg/d（SD = 105.56），中位数 117.49（IQR 105.84），范围 [15.8, 605.8]，偏度 1.57（右偏，形态由 Spearman 敏感性承担）。TAS 得分 M = 18.03（SD = 7.99），范围 [0, 37]，近正态（偏度 0.07）。PSQI 得分 M = 6.48（SD = 3.13），P(PSQI > 5) = 0.683（设计锚 0.68）。女生 178 名（59.3%）；大一至大四分别 87/81/70/62 名。摄入 < 100 mg/d 组 124 名（41.3%），≥ 100 mg/d 组 176 名（58.7%）；该固定种子数据集的低摄入占比高于理论值 33.6%——200 万大样本验证生成器无偏（0.3364 vs 0.3361），判固定种子的抽样实现，非生成器缺陷（decisions D2-3）。两组 TAS 得分 16.26 vs 19.28 分。边际形态与 SAP 生成设定的对照见补充图（Figure 3）。

### 3.2 主分析：H1a 与 H1b

**Table 1** 模拟样本描述统计（n = 300；源 tables/table-R1-descriptives.csv）

| 变量 | M (SD) | 中位数 (IQR) | 范围 / 构成 | 偏度 |
|---|---|---|---|---|
| 日均咖啡因摄入 (mg/d) | 151.27 (105.56) | 117.49 (105.84) | [15.8, 605.8] | 1.57 |
| TAS 考试焦虑总分 (0–37) | 18.03 (7.99) | 18.10 (11.16) | [0.0, 37.0] | 0.07 |
| PSQI 睡眠总分 (0–21) | 6.48 (3.13) | 6.43 (3.92) | [0.0, 16.1] | 0.19 |
| 性别 | — | — | 男 122 (40.7%)；女 178 (59.3%) | — |
| 年级 | — | — | 87 / 81 / 70 / 62（大一至大四） | — |
| 摄入二分 (mg/d) | — | — | < 100（参照）124 (41.3%)；≥ 100 176 (58.7%) | — |

注. TAS = Sarason 考试焦虑量表；PSQI = 匹兹堡睡眠质量指数。数据为固定种子模拟生成，P(PSQI > 5) = 0.683。

H1a（未调整关联）：摄入量与 TAS 得分的 Pearson r(298) = 0.200，95%CI [0.089, 0.307]，t = 3.53，p < .001（原始 p = .000481；Holm 校正后 p = .001），r² = 0.040，按 Cohen 惯例为小到中等关联。散点与 OLS 拟合线、95%CI 带及 LOWESS 平滑见 Figure 1：LOWESS 曲线与 OLS 线走向一致，未见系统性弯曲。

H1b（调整后关联）：M1 中每增加 100 mg/d 对应 TAS 得分升高 b₁ = 1.248 分，95%CI [0.405, 2.091]，t(293) = 2.91，p = .004（Holm 校正后 p = .004）。偏相关 r = 0.168（设计解析值 0.170），95%CI [0.055, 0.277]；标准化 β = 0.165，折算 0.156 个 TAS 标准差（实测 SD = 7.99）。调整 R² = 0.077，摄入量相对仅协变量模型贡献 ΔR² = 0.026。未调整 M0 斜率 b = 1.517 分/100 mg·d⁻¹（p < .001），调整后衰减 17.7%——实测两口径与设计真值（未调整 ≈ 1.47、调整 ≈ 1.25 分/100 mg·d⁻¹）一致，衰减量级即睡眠质量（及结构内其余协变量）承载的关联份额。

**Table 2** 主结果：H1a 与 H1b（源 tables/table-R2-primary-results.csv，p 值格式按 APA 修正）

| 条目 | 估计 (95%CI) | 统计量 | p | Holm 校正后 p | 判定 |
|---|---|---|---|---|---|
| H1a：Pearson r（未调整） | r = 0.200 [0.089, 0.307] | t(298) = 3.53 | <.001 | .001 | 拒绝 H0 |
| M0：未调整斜率（参照） | b = 1.517 分/100 mg·d⁻¹ | — | <.001 | — | 参照 |
| H1b：M1 调整斜率 b₁ | b = 1.248 分/100 mg·d⁻¹ [0.405, 2.091] | t(293) = 2.91 | .004 | .004 | 拒绝 H0 |
| H1b 辅助效应量 | 偏相关 r = 0.168 [0.055, 0.277]ᵃ；标准化 β = 0.165；0.156 SD | — | — | — | 调整 R² = 0.077，ΔR² = 0.026 |
| 睡眠混杂衰减 (b_M0 − b_M1)/b_M0 | 17.7% | — | — | — | 设计真值 1.47 / 1.25 分/100 mg·d⁻¹ |

注. M1 调整性别、年级（指示变量）与 PSQI。ᵃ 偏相关 95%CI 为本稿撰写时按 Fisher z 补算（控制 5 列，SE = 1/√(n − m − 3)，n = 300），属未预注册的报告完备性补充，不改变任何判定；SAP §3.3 未为该效应量预指定区间估计。源 CSV 的 p 列对 H1a 与 M0 行以 "0.000" 直格式输出（03_freeze_analyze.py 格式化瑕疵，统计审稿遗留问题 1），本表按 SAP §3.3 与 APA 规则修正为 p < .001，统计量与结论不变。

### 3.3 前提诊断与共线性

诊断全部未触发预注册后续处理（Table S1 源 table-S1-diagnostics.csv；图形见 Figure 2）。Breusch-Pagan LM = 1.33，p = .970，HC3 重报未触发；Ramsey RESET F(2, 291) = 0.17，p = .845，无需非线性注记；M1 残差 Shapiro-Wilk W = 0.994，p = .286。共线性：max VIF = 1.41（年级二指示），咖啡因 VIF = 1.04，远低于阈值 5。共线性双口径披露：含截距原始尺度 κ = 32.02，超 30 触发线，系截距常数与未缩放协变量的量纲性假信号；判定口径为 Belsley 式列标准化 κ = 1.88[35]。原始口径超阈触发的预注册义务为"报告与讨论"（SAP §5.3 原文条款），不含模型变更要求——本节双口径披露即该义务的履行，模型、推断与全部结果数字未因口径选择改变。SAP §5.3 未预先写明判定口径，执行层以列标准化口径判定"无实质共线"并在此披露（decisions D11）；正式预注册版应直接指定判定口径。Cook's D > 4/n（0.0133）标记 16 条记录（清单见 table-S1b-cooks-distance.csv，模拟记录序号非个人标识），剔除后重拟合 b₁ = 1.473 分/100 mg·d⁻¹，95%CI [0.638, 2.307]，t(277) = 3.47，p = .001——方向与显著性不变，该重拟合仅作敏感性，主分析保留全样本。

### 3.4 敏感性与探索分析（F2，BH-FDR 只描述）

**Table 3** 敏感性与探索结果（源 tables/table-R3-sensitivity-exploration.csv；Spearman 统计量与两处区间为本稿补齐）

| 条目 | 估计 (95%CI) | 统计量 | p / q |
|---|---|---|---|
| Spearman ρ（形态敏感性） | ρ = 0.195 [0.083, 0.301]ᵃ | t(298) = 3.43ᵃ；Σd² = 3,623,370（并列秩极少：咖啡因 0、TAS 4） | p < .001；q = .003 |
| 二分口径 t 检验（≥ 100 vs < 100 mg/d） | 均值差 3.02 分 [1.21, 4.83]；d = 0.38 [0.15, 0.62] | t(298) = 3.27 | p = .001；q = .003 |
| 二分口径调整回归（caff_high 入 M1 结构） | b = 2.68 分 [0.87, 4.50] | t(293) = 2.91 | p = .004；q = .006 |
| 年级连续编码 M1ord（编码敏感性） | b₁ = 1.249（相对 M1 变化 0.1%，< 10%） | t(295) = 2.92ᵇ | p = .004 |
| H2 二次项 M2（剂量-反应曲率） | β₂ = −0.381 [−0.952, 0.191] | t(292) = −1.31 | p = .191；q = .191 |
| 性别×摄入交互 M3（探索） | b = 1.835 [0.153, 3.516] | t(292) = 2.15 | p = .033；q = .041 |
| 剔除 Cook's D 超阈 16 条后重拟合（仅敏感性） | b₁ = 1.473 [0.638, 2.307] | t(277) = 3.47 | p = .001 |
| 交叉验证（5 折分层，种子 20261024） | CV-RMSE：M0 = 7.866 / M1 = 7.714 / M2 = 7.739 | CV-R²：0.028 / 0.066 / 0.059 | M2 相对 M1 改善 −0.32%（< 5%，复杂度不划算） |

注. ᵃ Spearman 的 t 统计量、Σd² 与 95%CI 为本稿撰写时按同一冻结数据补算（Fisher z 近似，SE = 1/√(n − 3)），源 CSV 该行统计量列硬编码 "S = —"（统计审稿遗留问题 3），属未预注册的报告完备性补充，不改变判定。ᵇ SAP §4.4 文字"M1ord df = 296"为笔误，实现与披露均按 n − k = 295（k = 5，statsmodels 自动计算，decisions D16）。AIC/BIC 辅助描述：M2 相对 M1 ΔAIC = +0.2、ΔBIC = +3.9；M1ord ΔAIC = −2.3、ΔBIC = −9.7。

连续口径与秩口径同向：Spearman ρ = 0.195（q = .003）与 Pearson 0.200 几乎重合，摄入量的右偏形态未驱动关联，"对分布形态稳健"按预注册规则成立。二分口径两组相差 3.02 分（d = 0.38），调整后 b = 2.68 分（q = .006），方向与主分析一致；二分信息损失未导致显著性丢失。年级编码不敏感（相对变化 0.1%）。H2 二次项 β₂ = −0.381，q = .191，95%CI 跨零，线性模型充分——与交叉验证互证：M2 的 CV-RMSE 相对 M1 改善为负（−0.32%），增加二次项不划算。性别×摄入交互 b = 1.835（q = .041）达到描述性显著。按生成机制该交互真值为零（性别独立于骨架、无交互项，§2.2），此行是 BH-FDR 在 q = 0.05 下容忍假发现的实况展示：F2 五项检验含两项设计真零（交互与 H2 二次项），交互被报出（q = .041）、二次项未被报出（q = .191）。该行不携带方向信息、不作追认，只说明"只描述不判定"规则在假阳性实际出现时的形态。

### 3.5 多重比较校正汇总

F1 确证家族（Holm，FWER = 0.05）：H1a 校正后 p = .001，H1b 校正后 p = .004，均拒绝 H0（源 table-S2-multiplicity.csv）。F2 探索家族（BH-FDR）：Spearman q = .003、二分 t q = .003、二分调整 b q = .006、交互 q = .041，均为描述性标注；H2 q = .191。无结果知晓后的模型更换或集合外检验。

### 3.6 蒙特卡洛 type-I 错误率校准

先于演示数据结果查看执行（源 table-S3-montecarlo.csv）。Null-A（H1a 零假设）下 2,000 次重抽的 H1a 经验拒绝率 0.0545，二项 95%CI [0.0450, 0.0654]；Null-B（H1b 零假设）下 M1 β₁ 检验经验拒绝率 0.0565，95%CI [0.0468, 0.0675]——均落入合格带 [0.0404, 0.0596]，双 PASS。附带演示：Null-B（混杂存在而直接关联为零）下未调整 H1a 检验拒绝率 0.117，重抽边际 r 均值 +0.041，量化了不调整睡眠质量时约 7 个百分点的假阳性膨胀——正是 H1b 调整设计的动因。蒙特卡洛内 H1b 检验用 numpy 解析 t 实现，与 statsmodels 在冻结数据上逐位等价（最大差异 2.66 × 10⁻¹⁵）。

## 4 讨论

### 4.1 主要发现

模拟总体中，咖啡因摄入量与考试焦虑得分存在正向线性关联（r = 0.200，95%CI [0.089, 0.307]），量级为小到中等；调整性别、年级与睡眠质量后关联持续（b₁ = 1.248 分/100 mg·d⁻¹，95%CI [0.405, 2.091]），斜率衰减 17.7%。调整集的信息量按构造折算：性别与年级独立于骨架生成、与暴露和结局零相关（§2.2），M1 中二者系数真值接近 0，调整后斜率与仅调整 PSQI 的解析值一致（SAP §1.5）——"调整三协变量后持续"陈述的是模型设定，其实质信息量为"调整 PSQI 后持续"，不构成三重混杂控制的稳健性证据。形态（秩相关）、口径（二分）与编码（年级连续）三方向的敏感性均不改变结论；剂量-反应无线性偏离。实测值与生成机制设定真值全部对齐：r 实测 0.200 对目标 0.20，b₁ 实测 1.248 对真值 1.25，偏相关 0.168 对解析值 0.170，衰减实测 17.7% 对设计路径（1.47 → 1.25 为 15%）——阳性检出是参数的回显，其信息含量限于管道验收；全流程的估计、检验与校准链条按预注册意图工作。

### 4.2 与既有证据对照

**量级**。实测 r = 0.200 落在证据表同类关联的实测区间内：考试焦虑口径 ρ = 0.31（频次）[15]、一般焦虑口径 r = 0.137[2] 与 0.258[5]。二分口径 d = 0.38 与低剂量组 SMD 0.61（95%CI [0.42, 0.79]）的荟萃估计同量级[4]。

**调整后持续与睡眠份额**。b₁ 在三协变量调整后保持（q 校正后 p = .004），与 Raine 队列 20 岁横断中能量饮料 mL/d 调整社会人口学、酒精、体力活动、BMI 与膳食后仍与焦虑相关（仅男性，β = 0.32）[11]、英国中学生调整膳食与生活方式后关联仍显著[38]的方向一致。衰减 17.7% 的份额与睡眠-焦虑证据的多元形态吻合：睡眠困扰部分中介的青少年证据[39]、双向循环[20]、REM 前瞻预测[22]、两波共变[23]与零相关[24]并存，说明睡眠承载的关联份额因人群与口径而异；本研究把 PSQI 同时放进生成结构与调整模型，是对这一未定结构的显式处理，17.7% 是该结构设定下的演示值。

**口径与形态**。巴西样本中品类显著而总量不显著的教训[8]由二分口径与 Spearman 敏感性承担：本演示中总量连续、总量二分与秩口径三线同向。韩国成人非线性证据[14]与印度医学生 ≥ 3 杯/日成绩不升反降的观察[40]指向剂量-反应的曲率可能，但本模拟在线性生成机制下 H2 二次项 q = .191、CV 改善为负，线性模型充分——这是生成机制的属性，真实数据版的 H2 检验仍按同一预注册规则执行。

**方向与边界**。高特质焦虑者回避咖啡因的反向路径[13]与"以摄入应对考试压力"的正向路径[19]在横断数据中不可区分；Null-B 演示量化了不调整时 +0.041 边际相关带来的假阳性膨胀，横断关联陈述因此严格保持关联口径。性别特异证据[9][10][12]是真实数据版预注册性别交互检验的动机；本演示的交互项 q = .041 按构造为假阳性（§3.4），不构成对该动机的支持证据——文献动机与模拟输出的区分正是 F2"只描述不判定"规则的用途。

### 4.3 适用边界

本演示的五条边界。其一，结论限于模拟总体：数据由文献锚定的参数生成，非真实测量；全部效应量是生成机制的回显，不构成任何真实人群的关联估计。其二，横断关联不携带时间方向：咖啡因→焦虑、焦虑→摄入与共同原因三种结构在横断数据内不可分，b₁ 是调整 PSQI 后的直接关联口径，非总效应。其三，暴露按真值 mg/d 注入、测量误差层未建模：真实 FFQ 的回忆偏倚与效度衰减会把观测相关压到注入值的一个分数，效能 0.937 与效应量预期搬到真实 FFQ 数据时系统性下降；"沿用同一 SAP 更换数据源"的承诺不覆盖测量误差层，真实数据版的样本量须按预期效度重估。品类分项（咖啡、茶、能量饮料）未进入生成结构，品类依赖的检出差异[8]在真实数据版按品类再评估；二分界值 100 mg/d 为预注册固定界值，非数据依赖。其四，单层独立同分布生成：无聚类（班级、宿舍）与重复测量结构，确证模型为固定效应 OLS，随机效应结构的缺失未获数据检验，真实数据若含聚类须回 SAP 变更流程修订；调整集的样本外预测增益单薄（CV-R² 0.028 → 0.066）系设计属性——性别与年级为零相关协变量、预测贡献按构造为零，复杂度论证的闭环（调整集增益、随机效应必要性）在真实数据版完成。其五，流程验证范围限于主干路径：多重插补（m = 20）、HC3 重报与 RESET 非线性注记三个条件分支在本次演示中零执行，其代码未经运行验证；反向路径[13]、非线性[14]与性别特异[9][10]三种竞争生成结构未压测，演示只覆盖预期成立的正向线性场景。真实数据首次触发上述分支即为该代码的生产首跑，正式使用前应以构造的分支触发场景（注入缺失与异方差的冒烟数据集）补压测。

另有四点说明。目标值 0.20 的选取含设计自由度（连续口径区间内取保守端，§2.2），其辩护来自口径匹配论证而非预注册本身。TAS 边际锚定取自全女性护生样本（18.42 ± 7.96[27]）而性别生成为与结局零相关的独立变量——引言引用的女性更高证据[17][19]与生成结构不相容，这是分布锚（取量表量级）与相关结构（控制演示混杂单一可解析）两个目标的分离实现；全女性锚用于混合性别总体时边际可能偏高，偏移量在白名单内无混合性别同量表锚可供校准。蒙特卡洛排查的中止条件未预注册：SAP §5.6 只禁止放宽带，未写排查轮次上限与"宣布流程不可用"条款，本次从 FAIL 到 PASS 依赖"缺陷有独立可验证的机制解释"这一未成文判据（decisions D3–D4），正式预注册版须补齐两条。偏相关与 Spearman 的区间估计为本稿补算（未预注册，Table 2/Table 3 注），源 CSV 的 p 格式瑕疵与 SAP 的三处文字瑕疵（M1ord df 笔误、条件数判定口径未预指定、Fisher 条目书目错误，已按 OpenAlex 题录更正于本稿参考文献 30）已在上游修订清单中登记。

### 4.4 意义与后续

演示的价值在流程本身：预注册 SAP 先行、生成参数锚定真实文献、冻结时序（校准 → 零假设蒙特卡洛 → 冻结 → 完整性门 → 分析）、type-I 经验校准、多重比较家族分层、封闭备选模型集与偏离留痕——这一链条即真实数据版的工作模板。本稿对读者可检验的主张有两项：空白映射（考试焦虑 × 连续 mg/d 无直接估计、三协变量同调为零、无前瞻/实验证据，证据表 §8）与管道验收（预注册分析全报告、拒绝率确定性复现、冻结哈希一致）；H1a/H1b 的阳性由构造写定，不构成发现。真实数据到位后沿用同一 SAP 更换数据源重新估计，改动仅限数据接入层；正式预注册时把 Null 校准的 400 重抽集平均口径、条件数判定口径、蒙特卡洛排查轮次上限与中止条款写入 SAP，提高零假设重抽次数（如 10,000 次，MC 标准误降至约 0.002）以压缩合格判定的抽样不确定性，为条件分支（多重插补、HC3、RESET 注记）补构造触发场景的压测记录，按混合性别同量表样本重锚 TAS 边际，按预期 FFQ 效度重估样本量，并按证据表 §8 补检索订阅库与三条待核题录。

## 5 结论

固定种子模拟演示（n = 300）中，主分析与全部敏感性口径一致检出生成机制设定的正向线性关联（r = 0.200，95%CI [0.089, 0.307]；调整后 b₁ = 1.248 分/100 mg·d⁻¹，95%CI [0.405, 2.091]，斜率衰减 17.7%，性别与年级为零相关协变量、实质调整量为 PSQI）；剂量-反应无线性偏离。阳性检出是参数的回显、不是数据的发现；全部结论限于模拟总体，不外推真实人群。预注册的估计与校准链条在主干路径上完整复现生成机制设定；模板的条件分支与竞争生成场景尚未压测（§4.3 其五），真实数据版据此补验后启用。

---

## 图表清单与投稿用图注

正文引用图为规范化版本（04-analysis/figures-polished/，600 dpi RGB，Arial；原图保留于 figures/ 不覆盖）。投稿时按期刊命名规则改名（R1 → Figure 1，R2 → Figure 2；S1 为补充材料图）。

**Figure 1**（源 figures-polished/figure-R1-scatter-ols-ci.png，另有 .tif 投稿版与 .pdf 矢量存档）模拟演示数据中日均咖啡因摄入量与考试焦虑得分的关联（n = 300）。每个点为一条模拟记录；黑线为 OLS 拟合（ŷ = 15.74 + 1.52 × 摄入量/100），浅色带为其 95%CI；橙色虚线为 LOWESS 平滑（frac = 2/3）。未调整 Pearson r(298) = 0.200，95%CI [0.089, 0.307]，p < .001。TAS = Sarason 考试焦虑量表（0–37）。数据为固定种子模拟生成，仅作流程演示，不用于真实推断。

*English caption (for submission).* Figure 1. Association between daily caffeine intake and examination anxiety (simulated demonstration data, n = 300). Each point is one record. The black line is the ordinary least-squares fit, ŷ = 15.74 + 1.52 × intake/100; the shaded band is its 95% CI; the dashed orange line is a LOWESS smoother (frac = 2/3). Unadjusted Pearson r(298) = 0.200, 95% CI [0.089, 0.307], p < .001. Abbreviation: TAS, Test Anxiety Scale (0–37). Note: fixed-seed simulated data for pipeline demonstration; not for real-world inference.

**Figure 2**（源 figures-polished/figure-R2-regression-diagnostics.png）主模型 M1 的回归诊断四联图（模拟数据，n = 300）。(A) M1 残差正态 Q-Q 图（Shapiro-Wilk W = 0.994，p = .286）；(B) 残差-拟合值图与 LOWESS 平滑（虚线），灰线为零参考；(C) 尺度-位置图（Breusch-Pagan p = .970；Ramsey RESET p = .845）；(D) 各记录 Cook's 距离，灰色虚线为 4/n = 0.0133 阈值，超阈 16 条以橙色高亮（仅敏感性剔除，主分析保留全样本）。TAS = Sarason 考试焦虑量表。

*English caption (for submission).* Figure 2. Regression diagnostics for the primary model M1 (simulated demonstration data, n = 300). (A) Normal Q–Q plot of M1 residuals (Shapiro–Wilk W = 0.994, p = .286). (B) Residuals versus fitted values with LOWESS smoother (dashed); the grey line marks zero. (C) Scale–location plot of √|standardized residuals| with LOWESS smoother (Breusch–Pagan p = .970; Ramsey RESET p = .845). (D) Cook's distance per record; the dashed grey line marks the 4/n = 0.0133 threshold; the 16 records above it are highlighted in orange (sensitivity-only exclusion; the primary analysis retains the full sample).

**Figure 3**（补充材料图，源 figures-polished/figure-S1-marginal-distributions.png）模拟列边际形态与 SAP 生成设定的对照（n = 300）。(A–C) 直方图（24 箱，密度尺度）叠加 SAP 设定的理论密度（灰色：咖啡因为对数正态，TAS 与 PSQI 为正态）；(D–F) 对同一理论分布的 Q-Q 图，尾部小幅偏离系设计截断所致，属预期。PSQI = 匹兹堡睡眠质量指数（0–21）；TAS = Sarason 考试焦虑量表（0–37）。

*English caption (for submission).* Figure S1. Marginal distribution checks of the simulated columns against the SAP data-generating settings (n = 300). (A–C) Histograms (24 bins, density scale) with theoretical lognormal (caffeine) or normal (TAS, PSQI) densities overlaid in grey. (D–F) Q–Q plots against the same theoretical distributions; minor tail deviations reflect the design truncation and are expected.

**表格清单**：正文 Table 1（描述统计）、Table 2（主结果）、Table 3（敏感性与探索）已随文给出；Table 4（多重性校正，源 tables/table-S2-multiplicity.csv）与 Table 5（蒙特卡洛校准，源 tables/table-S3-montecarlo.csv）数值已在 §3.5 与 §3.6 报告，投稿版随正文整表排版。补充表：Table S0 完整性与复现性门（table-S0-data-integrity-gate.csv）、Table S1 诊断明细（table-S1-diagnostics.csv）、Table S1b Cook's D 超阈清单（table-S1b-cooks-distance.csv）、Table S5 全模型系数（table-S5-models-full.csv）。

---

## 参考文献（Vancouver 格式）

A 组：研究证据，全部出自 02 证据表白名单（55 条，标识符与撤稿状态经 API 复验，证据表条目号附注）。B 组：方法学与工具文献，出自 03 SAP 已核参考文献表。本稿未引用任何白名单外文献。

1. Choi SW, 等. Caffeine consumption of medical students in Korea: amount and symptoms based on a 2023 survey. Korean J Med Educ. 2024. PMID: 39246108.（证据表 #51）
2. Keskin E, 等. Caffeine consumption and its association with anxiety and depression among Turkish university students: a cross-sectional study. J Health Psychol. 2026. PMID: 41956451.（证据表 #3）
3. Jahrami H, 等. Intake of caffeine and its association with physical and mental health status among university students in Bahrain. Foods. 2020. PMID: 32290044.（证据表 #9）
4. Liu C, 等. Caffeine intake and anxiety: a meta-analysis. Front Psychol. 2024. PMID: 38362247.（证据表 #23）
5. Aleem A, 等. Association of depression and anxiety with consumption of caffeine-containing beverages in university students of Lahore, Pakistan. J Health Rehabil Res. 2024. doi: 10.61919/jhrr.v4i3.1256.（证据表 #4）
6. Al-Dalaeen A, 等. The association between caffeine consumption, memory, anxiety, and stress levels among students: a cross-sectional study. J Educ Health Promot. 2026. PMID: 42491907.（证据表 #7）
7. Makki NM, 等. Caffeine consumption and depression, anxiety, and stress levels among university students in Medina: a cross-sectional study. Cureus. 2023. PMID: 37916247.（证据表 #17）
8. Gontijo ALA, 等. Associations between caffeine consumption, anxiety, temporomandibular disorders, and oral behaviors in university students in Brazil—a cross-sectional study. J Oral Facial Pain Headache. 2026. PMID: 42895008.（证据表 #8）
9. Mino Y, 等. Caffeine consumption and anxiety and depressive symptomatology among medical students. Arukoru Kenkyuto Yakubutsu Ison. 1990. PMID: 2085289.（证据表 #16）
10. Paz-Graniel I, 等. Caffeine intake and its sex-specific association with general anxiety: a cross-sectional analysis among general population adults. Nutrients. 2022. PMID: 35334898.（证据表 #18）
11. Trapp GS, 等. Energy drink consumption is associated with anxiety in Australian young adult males. Depress Anxiety. 2014. PMID: 24019267.（证据表 #20）
12. Kaur S, 等. Consumption of energy drinks is associated with depression, anxiety, and stress in young adult males: evidence from a longitudinal cohort study. Depress Anxiety. 2020. PMID: 32845046.（证据表 #21）
13. Lyvers M, 等. Caffeine use and alexithymia in university students. J Psychoactive Drugs. 2014. PMID: 25188705.（证据表 #25）
14. Kim J, 等. Beverage-derived caffeine intake, sleep duration, and mental health among Korean adults: a cross-sectional analysis of KNHANES 2021–2024. Nutrients. 2026. PMID: 42588110.（证据表 #30）
15. Kusturica J, 等. Neuroenhancing substances use, exam anxiety and academic performance in Bosnian-Herzegovinian first-year university students. Acta Med Acad. 2019. PMID: 32124627.（证据表 #1）
16. Han S, 等. Association between test anxiety, problematic drinking, depression, and quality of sleep among nursing students: focused on high caffeine drink intake and non-intake group. Health & Nursing. 2020. doi: 10.29402/hn32.2.3.（证据表 #2）
17. Omar YM, 等. Prevalence of test anxiety among medical students: a systematic review and meta-analysis. BMC Med Educ. 2026. PMID: 42717343.（证据表 #42）
18. Mady MM, 等. Prevalence and correlates of test anxiety among medical students: systematic review. Adv Med Educ Pract. 2026. PMID: 42291660.（证据表 #41；本文引用 R1 勘误后版本：纳入 13 项横断面研究）
19. Jirjees F, 等. Test anxiety and coping strategies among university students an exploratory study in the UAE. Sci Rep. 2024. PMID: 39468103.（证据表 #38）
20. Hamilton NA, 等. Test anxiety and poor sleep: a vicious cycle. Int J Behav Med. 2021. PMID: 33730347.（证据表 #33）
21. Adams SK, 等. Examining the moderator role of sleep quality in the relationship among test anxiety, academic success and mood. Psychol Rep. 2022. PMID: 34134557.（证据表 #34；年份取 PubMed 2022）
22. Larios E, 等. Habitual rapid eye movement sleep predicts changes in test-anxiety levels weeks in advance. J Sleep Res. 2025. PMID: 39080966.（证据表 #35）
23. Van de Casteele M, 等. Too pressured to sleep? Exploring the role of study motivation, test anxiety and procrastination in university students' sleep patterns during exam periods. Stress Health. 2025. PMID: 40304155.（证据表 #36）
24. Ilyas S, 等. Sleep quality and test anxiety in undergraduate students: the role of gender and socioeconomic status. Soc Sci Rev Arch. 2026. doi: 10.70670/sra.v4i1.2484.（证据表 #37）
25. Jawed F, 等. Impact of caffeine consumption on sleep quality and anxiety levels in undergraduate medical students. South Asian J Med Sci. 2026. doi: 10.56536/sajms.v7i1.119.（证据表 #6）
26. Shihadeh S, 等. Caffeine consumption, sleep quality, and mental health outcomes among Jordanian university students: a cross-sectional study. JAPA Acad J. 2025. doi: 10.4103/japaj.japaj_30_25.（证据表 #5）
27. Li Y, Liu M, Ji C. Bedtime procrastination and attention as serial mediators between premenstrual syndrome and test anxiety in nursing college students: a multicenter cross-sectional study. Psychol Res Behav Manag. 2026;19:620453. doi: 10.2147/prbm.s620453. PMID: 42502849.（证据表 #40）
28. Ikram K, 等. The effect of caffeine consumption on sleep quality among undergraduate students in Malaysia. Jurnal Gizi dan Pangan. 2024. doi: 10.25182/jgp.2024.19.supp.1.79-86.（证据表 #49）
29. Buysse DJ, Reynolds CF 3rd, Monk TH, Berman SR, Kupfer DJ. The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research. Psychiatry Res. 1989;28(2):193-213. doi: 10.1016/0165-1781(89)90047-4.（SAP 方法文献 #11）
30. Fisher RA. On the probable error of a coefficient of correlation deduced from a small sample. Metron. 1921;1(4):3-32.（SAP 方法文献 #13；题名与卷期按 OpenAlex 题录 W404240460 更正——SAP 原条目题名与卷（Metron 1921;2）有误，正文归属不受影响，已登记上游修订清单）
31. Holm S. A simple sequentially rejective multiple test procedure. Scand J Stat. 1979;6(2):65-70.（SAP 方法文献 #17）
32. Benjamini Y, Hochberg Y. Controlling the false discovery rate: a practical and powerful approach to multiple testing. J R Stat Soc Ser B. 1995;57(1):289-300. doi: 10.1111/j.2517-6161.1995.tb02031.x.（SAP 方法文献 #18）
33. Cohen J. Statistical power analysis for the behavioral sciences. 2nd ed. Hillsdale (NJ): Lawrence Erlbaum; 1988.（SAP 方法文献 #14）
34. MacKinnon JG, White H. Some heteroskedasticity-consistent covariance matrix estimators with improved finite sample properties. J Econom. 1985;29(3):305-325. doi: 10.1016/0304-4076(85)90158-7.（SAP 方法文献 #16）
35. Belsley DA, Kuh E, Welsch RE. Regression diagnostics: identifying influential data and sources of collinearity. New York: Wiley; 1980.（SAP 方法文献 #20）
36. Rubin DB. Multiple imputation for nonresponse in surveys. New York: Wiley; 1987.（SAP 方法文献 #12）
37. Appelbaum M, Cooper H, Kline RB, Mayo-Wilson E, Nezu AM, Rao SM. Journal article reporting standards for quantitative research in psychology: the APA Publications and Communications Board task force report. Am Psychol. 2018;73(1):3-25. doi: 10.1037/amp0000191.（SAP 方法文献 #15）
38. Richards G, 等. Caffeine consumption and self-assessed stress, anxiety, and depression in secondary school children. J Psychopharmacol. 2015. PMID: 26508718.（证据表 #31）
39. Chen X, 等. Associations of bubble tea consumption with sleep disturbance and anxiety in adolescents: findings from the Zhejiang Childhood Behavior and Health cohort. Nutrients. 2026. PMID: 42356346.（证据表 #29）
40. Petkar SS, 等. Association between coffee consumption and academic performance among second-year medical students. Cureus. 2026. PMID: 41841082.（证据表 #52）

注. 条目 18（PMID:42291660）引用 R1 勘误后版本（纳入研究数为 13 项而非初版误写的 27 项，证据表 §9 修订记录）；全部 55 条白名单条目状态核验为 clean（无撤稿、无编辑关注指针），本稿未引用任何撤稿或编辑关注状态文献。

---

## 附录 A：STROBE 横断条目对照（模拟口径逐条标注）

| STROBE 条目（横断版） | 稿件位置 | 模拟口径标注 |
|---|---|---|
| 1 题目与摘要（设计） | 标题页、摘要 | 题目与摘要均显式标注"固定种子模拟数据演示，不外推真实人群" |
| 2a 背景/原理 | §1 第 1–3 段 | 证据均为真实文献（白名单）；研究本身为模拟演示 |
| 2b 目的 | §1 末段 | 目标定义为估计模拟总体生成机制设定的真值 |
| 3 研究设计 | §2.1 | 横断面观察性设计的模拟实现，SAP 预注册式冻结 |
| 4 研究设定（地点、日期） | §2.2 | 无真实地点；生成与冻结日期 2026-10-24，种子与哈希全披露 |
| 5 参与者（纳入标准、抽样） | §2.2、§2.3 | "参与者"为模拟记录：n = 300，18–25 岁本科生口径，全记录入组，无应答率概念 |
| 6 变量（结局、暴露、协变量） | §2.3 | 变量字典含操作定义与生成设定（SAP Table 3） |
| 7 结局测量 | §2.3 | TAS 0–37，模拟列 N(18.4, 8.0) 截断，锚定实测[27] |
| 8 暴露测量 | §2.3 | FFQ 式 mg/d 总量口径，对数正态边际，锚定实测[2] |
| 9 混杂控制 | §2.3、§2.4 | PSQI/性别/年级预注册调整集；Null-B 校准量化未调整混杂膨胀 |
| 10 偏倚 | §4.3 | 模拟无测量/回忆偏倚；信息损失（二分）与口径依赖作为设计属性讨论 |
| 11 样本量 | SAP §1.4（承引） | n = 300 为演示口径；效能 0.937/0.8385 为设计输入 |
| 12 统计方法 | §2.4 | 全部方法、校正家族与判定规则预注册（SAP v1.0） |
| 13 参与者流程 | §3.1 | 300 条全部入组，零缺失，无剔除；复现门 10 项 PASS |
| 14 描述性资料 | §3.1、Table 1 | Table 1 给全部分布参数与生成设定对照（Figure 3） |
| 15 结局数据 | §3.2 | H1a/H1b 点估计、CI、t、p 全报告（Table 2） |
| 16 主要结果 | §3.2、§3.5 | Holm 校正后判定；每个结论带效应量与 95%CI |
| 17 其他分析 | §3.4、§3.6 | 敏感性/探索/CV/蒙特卡洛，全部预注册（SAP §4–§5），F2 只描述 |
| 18 关键结果概括 | §4.1、§5 | 与生成真值逐项对齐报告 |
| 19 局限性 | §4.3 | 写为适用边界：模拟总体、横断方向、自报总量口径、单层结构 |
| 20 解释 | §4.2 | 与证据表文献逐条对照，谨慎程度与横断设计匹配，无因果陈述 |
| 21 外推性 | 标题页声明、§5 | 显式声明不外推真实人群 |
| 22 资金 | 标题页（占位） | 无资助（占位，由作者填写） |

## 附录 B：文末伦理声明（占位，作者不得删除）

本研究使用固定种子模拟数据，不涉及人类或动物受试者，无需伦理批准与知情同意。真实数据版：数据来源将更换为考试季在校本科生实测数据，须提交机构伦理委员会审查（批准号：________），并取得参与者书面知情同意或豁免证明（状态：________）。作者不得删除本声明。

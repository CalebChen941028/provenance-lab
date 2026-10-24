# 02 证据表：大学生日均咖啡因摄入量与考试焦虑得分的横断线性关联（PRISMA 去重与筛选）

运行口径：provenance-lab pipeline · development 严格度。本文档为 S2b 证据综合产物，输入为 S2 五源检索代理返回的 87 条候选题录（PubMed、Europe PMC、OpenAlex、Semantic Scholar、arXiv，2026-10-23/24 执行），按 PRISMA 思路去重、按纳入/排除标准筛选，形成分层证据表；逐研究给出偏倚风险评估要点（横断研究用 NOS 要点、纵向用 NOS 队列版、实验用 RoB 2 思路、汇总证据说明 AMSTAR-2 适用性）。全部纳入条目的标识符与撤稿状态已于本会话重行核验（方法与命令见 §9）。上游检索细节与检索式原文见各代理记录，本文 §2 摘述。本版为 R1 修订版：引文核查发现条目[41]（PMID:42291660）纳入研究数初版误写为 27 篇（与 PMID:41549915 的 27 articles 串号），经 PubMed 摘要 efetch 复核更正为 13 项横断面研究，修订记录见 §9。

## 1 研究问题与筛选标准

### 1.1 研究问题（承 01 立题书）

在（模拟）在校本科生中，日均咖啡因摄入量与考试焦虑得分是否存在正向横断线性关联（双侧检验）？调整性别、年级与睡眠质量后该关联是否持续存在？固定种子模拟数据演示，n = 300。

### 1.2 纳入与排除标准

**Table 1** 证据筛选标准

| 维度 | 纳入标准 | 排除标准 |
|---|---|---|
| 人群 | 大学生、本科生、研究生或 18–30 岁年轻成人；备考青少年研究作间接人群证据保留于支持层 | 动物研究；儿童（<12 岁）；仅中学生且只有题录级信息 |
| 暴露 | 咖啡因摄入量（mg/d 连续估算、饮品频次/份数、使用者二分均可，分层标注口径） | 无咖啡因暴露测量 |
| 结局 | 焦虑类得分（考试焦虑量表优先；一般焦虑 STAI/BAI/GAD-7/DASS-21/HAD/HARS 保留并标注）；或结局/协变量结构证据（睡眠质量、考试焦虑分布） | 无焦虑或考试焦虑结局且不支撑协变量结构 |
| 设计 | 横断、纵向、实验、系统综述/荟萃分析均可，分层标注 | 统计方法学、数学建模、预印本主题外推类条目 |
| 信息完整度 | 有可核验的摘要级结果与真实可解析的 PMID/DOI/OpenAlex ID | 仅题录、无摘要、结果无法核验 |

用户纳入偏好核查：用户纳入偏好为「无」，无必纳条目，故不存在「用户必纳文献未检出」警示。

## 2 检索来源与候选池

五源检索均由技能脚本走官方开放接口完成，订阅库（Scopus、Web of Science、Embase、PsycINFO）无机构凭据未检索，未使用 Google Scholar。

**Table 2** 候选池构成（按检索源）

| 检索源 | 检索口径 | 筛阅量 | 送入候选池 |
|---|---|---|---|
| PubMed | NCBI E-utilities，主检索式 Count=101，加 Q2/Q3/Q4 四路并集 | 50 条题录+摘要 | 20 |
| Europe PMC | 官方 REST API（OPEN_ACCESS:y），7 式合计命中 6,666，相关性排序各组前 40 | 240 条题录 | 20 |
| OpenAlex | filter works 4 式，合并去重 100→91，截前 40 批量取摘要 | 40 条题录+摘要 | 20 |
| Semantic Scholar | Graph API 5 式（第 6 式被 429 限流未完成），500 条题录去重 455 取前 40 | 40 条题录+摘要 | 20 |
| arXiv | API 10 式，5 条直接检索式全部零命中（arXiv 不收录此类行为流行病学论文） | 10 条边缘题录 | 7 |
| 合计 | — | — | 87 |

## 3 去重与筛选流程（PRISMA）

```
        ┌──────────────────────────────────────────────────────────────┐
        │ 识别：五源候选题录 n = 87                                     │
        │ （PubMed 20｜Europe PMC 20｜OpenAlex 20｜S2 20｜arXiv 7）      │
        └──────────────────────────┬───────────────────────────────────┘
                                   ▼
        去重：跨源同一文献 13 组、重复记录 17 条次（Table 3）
                                   ▼
        唯一记录 n = 70
                                   ▼
        筛选排除 n = 15
        ├─ 题录级无摘要、结果未核实 ............ 3（E3–E5）
        ├─ 人群不符（动物/儿童/中学生题录）..... 3（E1、E8、E12）
        ├─ 无焦虑或考试焦虑结局 ................ 3（E2、E6、E7）
        └─ 主题或设计不符（预印本/方法学）...... 6（E9–E11、E13–E15）
                                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │ 纳入定性综合 n = 55                                           │
        │ ├─ 核心证据 26（Table 4：暴露×结局直接或汇总证据）             │
        │ └─ 支持证据 29（Table 5：协变量结构/分布锚定/时间方向/实验）    │
        └──────────────────────────────────────────────────────────────┘
```

**Figure 1** PRISMA 流程图：大学生咖啡因摄入与考试焦虑证据去重与筛选（2026-10）。识别层为五源检索代理送入的候选题录；去重按 PMID/DOI/OpenAlex ID 规范化后合并；排除理由逐条见 Table 6。

**Table 3** 跨源重复合并明细（13 组，删除重复记录 17 条次）

| 标识符 | 出现记录数 | 检出源 | 处理 |
|---|---|---|---|
| PMID:37916247 | 4 | PubMed、Europe PMC、OpenAlex、S2 | 合并保留 1 条 |
| PMID:39468103 | 3 | PubMed、Europe PMC、S2 | 合并保留 1 条 |
| PMID:42491907 | 3 | Europe PMC、OpenAlex、S2 | 合并保留 1 条 |
| PMID:33968523 | 2 | PubMed、Europe PMC | 合并保留 1 条 |
| PMID:38542705 | 2 | PubMed、Europe PMC | 合并保留 1 条 |
| PMID:27073610 | 2 | PubMed、Europe PMC | 合并保留 1 条 |
| PMID:41956451 | 2 | OpenAlex、S2 | 合并保留 1 条 |
| PMID:33730347 | 2 | PubMed、OpenAlex | 合并保留 1 条 |
| PMID:34134557 | 2 | PubMed、OpenAlex | 合并保留 1 条（年份取 PubMed 2022，见 §10） |
| PMID:42895008 | 2 | Europe PMC、S2 | 合并保留 1 条 |
| doi:10.29402/hn32.2.3 | 2 | OpenAlex（另含韩文重复记录 W3112588615）、S2 | 合并保留 1 条 |
| doi:10.61919/jhrr.v4i3.1256 | 2 | OpenAlex、S2 | 合并保留 1 条（数值取 S2 摘要版） |
| PMID:39298670 | 2 | PubMed、S2 | 合并后按排除标准剔除（E2） |

注. 重复记录的 design/finding 描述有差异时（如 doi:10.61919/jhrr.v4i3.1256 的 OpenAlex 版摘要截断、S2 版给出 r 值），取信息完整版本。私有库文献：候选池中无「私有库」来源条目，全部为检索来源，无需双标注私有库出处。

## 4 纳入证据总览

### 4.1 直接性分层

A 级（人群+暴露+结局同构）：大学生/年轻成人人群、咖啡因类暴露、焦虑类结局（含考试焦虑）。B 级（口径部分同构）：考试焦虑结局但暴露为分组口径，或一般焦虑结局但连续 mg/d 口径，或人群为青少年/成人的结构同构证据。C 级（汇总或方法学支撑）：荟萃分析、系统综述、实验证据。

### 4.2 主要证据线

考试焦虑结局的直接证据只有两项：波黑一年级大学生的横断调查给出考试焦虑与咖啡消耗量的正相关（*rho* = 0.31，*p* < .001）[1]，韩国护生研究比较高三咖啡因饮品摄入组与非摄入组的考试焦虑、抑郁与睡眠质量[2]。两项均为分组或频次口径，都没有连续 mg/d × 连续得分的线性回归，也都没有同时调整性别、年级与睡眠质量。

连续剂量口径的正向证据集中在一般焦虑结局：土耳其大学生日均摄入 166.5（*SD* 101.9）mg/d 与 Beck 焦虑分正相关（*r* = 0.137，*p* = .026；重度焦虑组摄入更高，回归 *OR* = 1.003，95%CI [1.001, 1.005]）[3]；巴基斯坦拉合尔样本 *r* = 0.258（*p* < .001，GAD-7）[4]；约旦 853 人样本中摄入随焦虑严重度分级递增（*P* = .002）且睡眠差者摄入更高（*P* < .001）[5]；巴林 FFQ 样本 ≥400 mg/d 者五项焦虑症状风险约翻倍[9]。汇总层面，8 篇文献的荟萃分析给出 SMD = 0.94（95%CI [0.28, 1.60]），低剂量 0.61、>400 mg/d 达 2.86，剂量梯度明确[23]。

不一致证据同样清楚：沙特 Medina 样本以 mg/d 定量却与 DASS-21 焦虑无关联[17]；关联呈性别特异（日本男生显著女生null[16]、NutriNet 女性显著男性null[18]、澳大利亚仅男性[20][21]）；巴西样本中黑咖啡品类显著而总咖啡因摄入不显著[8]；韩国成人呈非线性（*p*-overall = .010）[30]；反向路径存在（高特质焦虑者回避咖啡因，惩罚敏感性负向预测摄入）[25]。这构成双侧检验与「调整后是否持续」问题的直接动机。

协变量结构证据：女性与低年级考试焦虑更高的方向在阿联酋 925 人样本[38]、考试焦虑患病率荟萃分析（女 52.6% vs 男 46.3%，一年级 58.6% vs 五年级 47.9%）[42]中一致；睡眠质量与考试焦虑的关系则有调节[34]、双向循环[33]、REM 睡眠前瞻预测[35]、两波共变[36]与零相关（*r* = −0.003，*p* = .957）[37]并存。模拟参数锚定：TAS 均值 18.42（*SD* 7.96）来自中国 791 名女性护生[40]；mg/d 分布参照韩国医学生 274.6（*SD* 276.5）mg/d、19.9% ≥400 mg/d[51]、马来西亚本科生 193.54 mg/d[49]、土耳其 166.5 mg/d[3]。

## 5 核心证据表

**Table 4** 核心证据：咖啡因类暴露与焦虑类结局（n = 26）

| 研究 | 国家·人群·设计 | n | 暴露/结局测量 | 主要发现 | 直接性 | 偏倚风险 | 状态 |
|---|---|---|---|---|---|---|---|
| Kusturica 等[1]（2019） | 波黑，一年级大学生，横断 | 214 | 神经增强物质问卷（咖啡/能量饮料）／Westside 考试焦虑量表 | 考试焦虑×咖啡 *rho* = 0.31（*p* < .001），×能量饮料 *rho* = 0.18；考试焦虑预测自评学业 *OR* = 0.55（95%CI [0.31, 0.97]） | A（考试焦虑结局，频次口径） | 高：单校便利样本，双变量相关未调整 | clean |
| Han 等[2]（2020） | 韩国，护生 1–4 年级，横断分组 | 180 | 高咖啡因饮品摄入组 vs 非摄入组／考试焦虑+抑郁+PSQI | 摄入组考试焦虑、问题饮酒、抑郁均显著更高，睡眠质量更差 | A（考试焦虑×咖啡因×睡眠三联，分组口径） | 高：单校，分组测量粗，自报 | clean |
| Keskin 等[3]（2026） | 土耳其，伊斯坦布尔大学生，横断 | 261 | 咖啡因问卷（mg/d）／Beck 焦虑、抑郁量表 | 166.5（*SD* 101.9）mg/d；与焦虑分 *r* = 0.137（*p* = .026）；重度焦虑 *OR* = 1.003（95%CI [1.001, 1.005]） | A（连续 mg/d×连续得分，一般焦虑） | 高：单校，自报，调整有限 | clean |
| Aleem 等[4]（2024） | 巴基斯坦，拉合尔大学生，横断 | 324 | 含咖啡因饮料问卷／GAD-7、PHQ-9 | 咖啡因×焦虑 *r* = 0.258（*p* < .001），×抑郁 *r* = 0.216；茶为首要来源（75.9%） | A | 高：便利样本，自报，未调整 | clean |
| Shihadeh 等[5]（2025） | 约旦，大学生，横断 | 853 | Diet and Behaviour Scale 咖啡因条目／PSQI+DASS-21 | 周均 771.8（*SD* 588.8）mg；睡眠差 70.6% 与更高摄入相关（*P* < .001）；摄入随焦虑严重度递增（*P* = .002） | A（咖啡因×睡眠×焦虑三联） | 高：自报，非参数比较，未见多变量调整 | clean |
| Jawed 等[6]（2026） | 巴基斯坦，医学生，横断 | 185 | 咖啡因模式问卷／PSQI+HAD | 摄入者 8–10 h 睡眠占比 27%→4.9%；边缘焦虑 37.8%、重度 15.7%；软饮料消费者 HAD 焦虑最高（8.24±2.91） | A | 高：单校，自报，无调整 | clean |
| Al-Dalaeen 等[7]（2026） | 约旦，大学生，横断 | 204 | USDA 数据库 mg/d 估算／DASS-21+记忆问卷 | DASS 得分与黑巧克力、美式/速溶咖啡、红茶摄入正相关 | A（数据库 mg/d 口径） | 中：口径规范，横断自报 | clean |
| Gontijo 等[8]（2026） | 巴西，巴西利亚大学生，横断 | 182 | 咖啡因频次+期望问卷／焦虑、TMD、口腔行为 | 日常黑咖啡×重度焦虑 *p* < .001；总咖啡因摄入与结局无显著关联 | A（品类与总量口径分离的证据） | 高：单校，品类级测量 | clean |
| Jahrami 等[9]（2020） | 巴林，大学生，横断 FFQ | 727 | 半定量 FFQ 估算／身体与心理健康量表 | 人均 268 mg/d；≥400 mg/d 者「惊恐发作」「过度担忧」等 5 项焦虑症状风险约翻倍 | A（FFQ+剂量阈值） | 中：FFQ 口径，横断 | clean |
| Bertasi 等[10]（2021） | 美国，佛州立大学，横断 | 114 | 咖啡因摄入问卷／GAD-7+PHQ-9 | 焦虑、抑郁及高年级与更高摄入相关（*p* < .05）；性别、GPA 与摄入杯数无关联 | A（年级协变量方向） | 高：小样本，杯数口径 | clean |
| Di Martino 等[11]（2024） | 意大利，大学生（CCAP-Study），横断 | 404 | 咖啡摄入变化自报／STAI+失眠严重指数 | 报告咖啡摄入增加者 STAI 焦虑分与失眠指数均更高 | A | 高：变化自报，单校 | clean |
| Salim 等[12]（2025） | 印度尼西亚，医学生，横断 | — | 咖啡因频次问卷／HARS | 咖啡（*p* = .008）与茶（*p* = .029）消费均与焦虑水平相关 | A（名义检验，无连续效应量） | 高：卡方分析，样本量未核 | clean |
| Adegoke 等[13]（2014） | 尼日利亚，大学生，横断 | 447 | 咖啡消费问卷／STAI Y-1/Y-2 | 咖啡使用者状态焦虑显著高于非使用者；摄入频率无性别差异、低龄者更频繁 | A | 高：自报症状，无调整 | clean |
| Hire 等[14]（1978） | 美国，大学生，横断 | 91 | 含咖啡因饮料问项／Spielberger 状态-特质焦虑 | 焦虑与咖啡消费呈小相关（并及酒精与自评 GPA） | A（最早证据） | 高：小样本，相关分析 | clean |
| Gilliland 等[15]（1981） | 美国，大学生按 ad lib 摄入分组，横断 | — | 四组摄入量／STAI 特质焦虑+抑郁 | 中高消费组特质焦虑与抑郁显著高于戒断组；高消费组 caffeinism 症状更多、学业更差 | A | 高：分组自报，年代久远 | clean |
| Mino 等[16]（1990） | 日本，医学生，横断 | 291/423 | 咖啡因消费问卷／焦虑、抑郁量表 | 调整饮酒吸烟后男生咖啡因×焦虑显著；女生无焦虑关联、高摄入者抑郁反而更低 | A（性别分层证据） | 高：单校，调整不全 | clean |
| Makki 等[17]（2023） | 沙特，Medina 大学生，横断 | 520 | mg/d 定量问卷（0–4276.7）／DASS-21 | 日均摄入与 DASS-21 焦虑/抑郁/应激严重度均无显著关联 | A（同构设计的阴性结果） | 中：mg/d 口径规范，阴性证据 | clean |
| Paz-Graniel 等[18]（2022） | 法国，NutriNet-Santé 队列内横断 | 24,197 | ≥2 次 24 h 膳食记录／STAI-T | 最高 vs 最低三分位：女性高特质焦虑 *aOR* = 1.13（95%CI [1.03, 1.23]），男性无关联 | A（性别特异，多变量调整） | 中：大样本，多变量调整，膳食自报 | clean |
| Stasio 等[19]（2011） | 美国，大学生，横断 | 107 | 含咖啡因能量饮料使用问卷／焦虑+睡眠质量 | 能量饮料使用解释焦虑得分 29% 方差、睡眠困扰 20%；使用越频繁睡眠越差 | A（暴露×结局×睡眠同测） | 高：小样本，亚组分组 | clean |
| Trapp 等[20]（2014） | 澳大利亚，Raine 队列 20 岁横断 | 1,069 | 能量饮料 mL/d／DASS-21 | 调整社会人口学、酒精药物、体力活动、BMI、膳食后，每增 100 mL/d 与焦虑仍相关（仅男性，*β* = 0.32） | A（调整后持续，仅男性） | 中：出生队列，多变量调整 | clean |
| Kaur 等[21]（2020） | 澳大利亚，Raine Gen2 两年纵向 | 429 | 能量饮料使用变化／DASS-21 | 男性由不使用转为使用者焦虑分平均升高 3.76（95%CI 不含 0），女性不显著 | A（时间方向） | 中：前瞻队列（NOS 队列版），失访详情未核 | clean |
| Kosecka 等[22]（2025） | 波兰等，大学生两样本，横断中介 | 436/3,421 | 日均咖啡因摄入／PSS-4 等 | 咖啡因摄入部分中介问题性过度学习→感知应激（两样本复现），大样本中亦中介至焦虑与抑郁 | A（关联+中介方向） | 中：两样本复现，横断中介自报 | clean |
| Liu 等[23]（2024） | 健康人群，荟萃分析 | 8 篇/14 项 | 摄入剂量分组／焦虑结局 | SMD = 0.94（95%CI [0.28, 1.60]）；低剂量 0.61（[0.42, 0.79]），>400 mg/d 2.86（[2.50, 3.22]） | C（方向与剂量梯度汇总） | 中：异质性大（CI 宽），未评 AMSTAR-2 | clean |
| Nascimento 等[24]（2026） | 健康人群，系统综述 | 27 篇 | 急性与习惯性摄入／焦虑行为 | 剂量依赖致焦虑效应；习惯性低/高摄入者反应不同；咖啡因所致失眠可能部分介导焦虑 | C（机制+睡眠中介） | 中：未评 AMSTAR-2 | clean |
| Lyvers 等[25]（2014） | 澳大利亚，大学生，横断 | 106 | 日均咖啡因摄入／特质焦虑+惩罚敏感性 | 惩罚敏感性（特质焦虑相关维度）负向预测摄入：高特质焦虑者回避咖啡因；述情障碍正向预测摄入 | A（反向路径警示） | 高：小样本，探索性 | clean |
| Fitzgerald 等[26]（2024） | 美国，大学生，横断（会议摘要） | 未报告 | 使用者 vs 非使用者／焦虑水平 | 咖啡因使用者焦虑水平高于非使用者（*p* = .042） | A（二分口径） | 高：会议摘要，样本量未报告 | clean |

注. a 直接性分级见 §4.1。b 偏倚评估口径见 §7。c 状态核验方法见 §9；「clean」指本会话 API 核验无撤稿、更正、编辑关注指针。d n 为「—」者候选题录未给出样本量且本会话未取正文核实。

## 6 支持证据表

**Table 5** 支持证据：协变量结构、分布锚定、时间方向与实验证据（n = 29）

| 研究 | 国家·人群·设计 | 与本研究的支撑点（效应量） | 直接性 | 方法学要点 | 状态 |
|---|---|---|---|---|---|
| Cho 等[27]（2024） | 韩国，KYRBS 2022 全国青少年，横断 | 高咖啡因饮料过度摄入×焦虑：男 *aPR* = 1.19（95%CI [1.08, 1.31]）、女 1.14（[1.05, 1.23]）；短睡眠亚组更强 | B（青少年，间接人群） | NOS 要点：中风险——全国代表性样本、改良 Poisson 调整 | clean |
| Jin 等[28]（2016） | 韩国，大邱初中生，横断四分位 | 摄入四分位越高 BAI/BDI/ISI/GARS 越高（trend *P* < .005）；调整后重度抑郁与失眠仍随摄入升高 | B（青少年，三联同测范例） | 高风险：单校、自报 | clean |
| Chen 等[29]（2026） | 中国，浙江儿童行为与健康队列基线，横断 | 奶茶 ≥3 天/周焦虑 *OR* = 1.53（95%CI [1.30, 1.80]）；RCS 正向线性；睡眠困扰部分中介 | B（青少年，与本研究设定平行） | 中风险：大样本、多变量+中介 | clean |
| Kim 等[30]（2026） | 韩国，KNHANES 2021–2024 成人，横断 | 咖啡因×临床显著焦虑（GAD-7≥10）非线性（*p*-overall = .010）；与短睡眠单调剂量-反应（*p* < .001） | B（成人，联合建模范式） | 中风险：全国加权、RCS | clean |
| Richards 等[31]（2015） | 英国，中学生，横断（Cornish Academies） | 调整膳食、人口学与生活方式后，咖啡因总量×焦虑、抑郁正相关仍显著，存在性别差异 | B（中学生，调整后持续类比） | 中风险：协变量调整充分 | clean |
| Richards 等[32]（2016） | 英国，中学生，横断+6 个月随访 | 能量饮料频繁使用×压力/焦虑横断稳健；6 个月随访不再显著 | B（时间窗敏感性警示） | 中风险：两时点设计 | clean |
| Hamilton 等[33]（2021） | 英国，统计学课本科生，考前日记前瞻 | 考前 2 天睡眠质量/安适感与考试焦虑双向关系（恶性循环）；考试焦虑预测考试表现 | B（睡眠协变量的过程模型） | 中风险（NOS 队列版）：前瞻日记 | clean |
| Adams 等[34]（2022） | 美国，本科生，横断 | 考试焦虑升高与睡眠受损均预测负性情绪；睡眠质量在考试焦虑–情绪关系中起调节作用 | B（睡眠调整模型依据） | 高风险：单校、自报 | clean |
| Larios 等[35]（2025） | 西班牙，大学生，EEG 纵向一周 | 习惯性 REM 睡眠是数周后考试焦虑变化的最强预测因子 | B（睡眠→考试焦虑方向，客观测量） | 中风险（NOS 队列版）：小样本 n=52 | clean |
| Van de Casteele 等[36]（2025） | 比利时，大学生，两波纵向 | 临近考试考试焦虑、控制性动机与睡眠质量恶化同步上升，稳健共变 | B（协变量路径纵向证据） | 中风险（NOS 队列版） | clean |
| Ilyas 等[37]（2026） | 巴基斯坦，本科生，横断 | 睡眠质量×考试焦虑相关不显著（*r* = −0.003，*p* = .957）；性别间无差异 | B（睡眠混杂假设的阴性边界） | 高风险：单校、自报 | clean |
| Jirjees 等[38]（2024） | 阿联酋，14 所院校学生，横断 | 女性（*p* = .01）、低年级（*p* < .001）、低 GPA（*p* < .001）考试焦虑更高；49.6% 以咖啡因/能量饮料应对 | B（性别/年级协变量方向+反向解释警示） | 中风险：多校样本、Westside 量表 | clean |
| Green 等[39]（2016） | 美国，二年级医学生，前瞻 | 基线 Westside 2.48（*SD* 0.63）；与 USMLE Step 1 负相关（*β* = −0.24，*p* = .01，调整 MCAT） | B（考试焦虑连续结局分布参照） | 中风险（NOS 队列版） | clean |
| Li 等[40]（2026） | 中国，8 校女性护生，横断 SEM | TAS 均值 18.42（*SD* 7.96）——本研究模拟锚定值实测来源；PMS 直接效应 *β* = 0.20（95%CI [0.12, 0.28]），经就寝拖延与注意中介占 50% | B（结局分布锚定） | 高风险：单一性别、自报 | clean |
| Mady 等[41]（2026） | 全球，医学生考试焦虑，系统综述（13 项横断面研究，检索 2019.01–2025.07，样本量 82–735） | 中重度考试焦虑检出率 13.5%–72%；女性与低年级一致更高，伴情绪困扰、低自我效能 | B（结局与协变量方向汇总） | 中：MMAT 质量评估，叙述性合成，未评 AMSTAR-2 | clean |
| Omar 等[42]（2026） | 全球，医学生考试焦虑，SR-MA | 合并检出率 49.8%（95%CI [39.9, 59.6]）；女 52.6% vs 男 46.3%；一年级 58.6% vs 五年级 47.9% | B（TAS 量级与性别/年级调整锚定） | 中：随机效应 GLMM，异质性大 | clean |
| Pienyu 等[43]（2024） | 印度，备考青少年，横断 | 28.5% 中重度考试焦虑、86.0% 高学业应激；性别与年级/学科无显著差异 | B（备考人群分布，人群间接） | 高风险：单地区 | clean |
| Ćurčić 等[44]（2024） | 波黑，Foča 医学院，横断 | 考试焦虑与精神活性物质使用率相关；无性别差异、低年级学生显著更低 | B（年级协变量实证） | 高风险：单校 | clean |
| Norbury 等[45]（2019） | 英国，两所大学，横断 | 46% 自评睡眠相当差或非常差；睡眠差×更高特质焦虑相关；一年级睡眠更差 | B（睡眠协变量+低年级高风险） | 中：双校样本 | clean |
| Hajduk 等[46]（2024） | 德国，四院系学生，横断 | 12.4% 备考期使用神经增强物质（最常用咖啡因片剂），与应激及心理健康相关 | B（考试期摄入与情绪共变的情境证据） | 中：多院系网络调查 | clean |
| Alhawari 等[47]（2023） | 约旦，医学生 OSCE，基线-考试日对比 | 考试日咖啡消费与血压、心率显著上升；焦虑评分总体变化不显著但女性增幅更大 | B（考试期摄入×焦虑共变） | 高风险：无对照时点设计 | clean |
| Dodia 等[48]（2026） | 毛里求斯，医学院，考试期横断 | ≥3 份/日者「咖啡因崩溃」55.6% vs 15.4%（*p* = .031）；18 时后摄入者睡眠潜伏期延长 64.0% vs 28.0%（*p* = .009） | B（考试期三联情境证据） | 高风险：小样本混合方法 | clean |
| Ikram 等[49]（2024） | 马来西亚，本科生，横断 | 平均摄入 193.54 mg/d；咖啡因×睡眠质量显著（*p* < .01）；社会人口学（含性别）与两者均无关联 | B（n=300 同规模，睡眠协变量证据） | 高风险：单校、卡方口径 | clean |
| Islam Dola 等[50]（2026） | 孟加拉国，大学生，横断网络+SEM | 咖啡因消费率约 72%；咖啡因使用障碍对睡眠问题有直接效应并经抑郁症状间接传导 | B（咖啡因-睡眠-情绪网络依据） | 高风险：横断 SEM、自报 | clean |
| Choi 等[51]（2024） | 韩国，医学生，横断 | 274.6（*SD* 276.5）mg/d、每周 4.25 天；19.9% ≥400 mg/d；27.1% 报告咖啡因相关焦虑症状 | B（mg/d 分布真实锚定） | 中：多年级全样本 | clean |
| Petkar 等[52]（2026） | 印度，二年级医学生，横断 | 1–2 杯/日组理论考试成绩最高；≥3 杯/日不升反降；成绩随睡眠时长与咖啡因不良反应类别不同 | B（剂量-反应非单调警示） | 高风险：单校、结局为成绩 | clean |
| Svikis 等[53]（2022） | 美国，大学新生，横断 | 调整性别与种族后，咖啡组风险指标介于能量饮料+咖啡组与均不饮组之间 | B（以总摄入而非单一饮品测量的依据） | 中：大样本、多变量调整 | clean |
| Ogunkuade 等[54]（2017） | 尼日利亚，大学生，前后测对照实验 | 摄入咖啡因后低焦虑组精神运动表现改善（*p* < .05）、高焦虑组无变化 | C（咖啡因效应受焦虑水平调节的实验证据） | RoB 2：有些担忧——随机化与盲法细节未报告 | clean |
| Santos Villagrán 等[55]（2018） | 墨西哥等地，真实期中考试现场实验 | 考前随机分配咖啡 vs 无咖啡因草本浸液：咖啡因降低考试成绩，效应集中于无饮用习惯且自评考试紧张者 | C（考试情境「咖啡因→紧张/表现」因果线索） | RoB 2：有些担忧——现场随机、饮品单盲不完整 | clean |

## 7 排除清单与偏倚风险评估

### 7.1 排除清单

**Table 6** 排除条目（n = 15）

| 编号 | 标识符 | 题名（年份） | 排除原因 |
|---|---|---|---|
| E1 | PMID:27746260 | Protective effect of low dose caffeine on psychological stress and cognitive function（2017） | 人群不符：动物实验（雄性 SD 大鼠） |
| E2 | PMID:39298670 | Consumption of energy drinks among medical university students in Kazakhstan（2024） | 结局不符：仅摄入率与行为相关因素，无焦虑测量 |
| E3 | doi:10.4274/jtsm.galenos.2022.06078 | The Relationship Between Caffeine Consumption and Depression, Anxiety, Stress Level and Sleep Quality in Medical Students（2023） | 题录级：S2 无摘要，结果无法核验（补检建议见 §8） |
| E4 | doi:10.1016/j.cdnut.2024.103183 | Caffeine Consumption, Sleep Quality and Anxiety Among College Students（2024） | 题录级：会议摘要仅题录，结果无法核验（补检建议见 §8） |
| E5 | doi:10.35873/ajmahs.2017.7.8.068 | The Coping and the High-Caffeinated Drink Consumption according to Test Anxiety in College Students（2017） | 题录级：结果无法核验（与 PICO 高度相关，补检优先级最高，见 §8） |
| E6 | doi:10.22270/jddt.v16i5.7748 | Caffeine Consumption Patterns and Awareness Among Pharmacy Undergraduate Students（2026） | 结局不符：仅暴露模式描述 |
| E7 | doi:10.70135/seejph.vi.2406 | Effects of Caffeine Consumption on Exam Performance Throughout University Students（2024） | 结局不符：睡眠时长+考试成绩，无焦虑结局 |
| E8 | doi:10.48095/cccSP202514 | Sleep quality of secondary school students…（2025） | 人群不符（中学生）且仅题录级 |
| E9 | arXiv:2606.00791 | Global Patterns in Student Stress and Academic Performance（2026） | 主题不符：PISA 机器学习建模，非关联证据 |
| E10 | arXiv:2509.13725 | WatchAnxiety（2025） | 主题不符：被动传感方法学 |
| E11 | arXiv:2602.13302 | Complex networks map test anxiety and wellbeing（2026） | 主题不符：语义网络测量研究 |
| E12 | doi:10.1016/j.paid.2017.12.017 | Anxiety profiles and protective factors（2018） | 人群不符：3–6 年级儿童潜剖面分析 |
| E13 | doi:10.1214/15-AOAS846 | Bayesian analysis of ambulatory blood pressure dynamics（2015） | 设计不符：统计方法学（咖啡因为时变协变量先例，不入证据表） |
| E14 | arXiv:2403.10709 | Optimal Dosing Schedules for Substances Inducing Tolerance（2024） | 设计不符：数学建模 |
| E15 | arXiv:2604.07368 | Time-Varying Environmental and Polygenic Predictors of Substance Use Initiation（2026） | 主题不符：物质使用起始建模 |

### 7.2 偏倚风险评估要点

评估工具按设计匹配：横断研究按 NOS 横断改编口径评估样本选择（代表性、样本量、应答）、组间可比性（协变量调整）与测量质量（自报 vs 客观）三域；纵向研究用 NOS 队列版；两项实验按 RoB 2 域评估；系统综述与荟萃分析说明 AMSTAR-2 适用性但未获全文、未正式评定。

核心证据 26 项中：19 项判高偏倚风险，共同要点是单校便利样本、暴露与结局全部自报、多数未做协变量调整；5 项判中风险（大样本或队列内分析、多变量调整：Jahrami[9]、Makki[17]、Paz-Graniel[18]、Trapp[20]、Kaur[21]，另 Al-Dalaeen[7]、Kosecka[22] 因口径规范或双样本复现判中）；2 项汇总证据[23][24]因异质性与未评 AMSTAR-2 记为中风险限制。支持证据中两项实验[54][55]按 RoB 2 判「有些担忧」（随机化过程与盲法细节未报告，现场饮品分配难以双盲）；三项纵向[21][33][35][36]按 NOS 队列版判中风险；两项考试焦虑汇总证据[41][42]检出率异质性大（49.8%，95%CI [39.9, 59.6]），量级解释保留区间。全部横断证据共有的方向性限制：暴露与结局同时点测量，无法区分「摄入→焦虑」与「焦虑→摄入」[1][25][38]。

## 8 证据空白与新颖性定位

1. 考试焦虑结局×连续咖啡因摄入口径的直接估计缺位。以考试焦虑为结局的现患研究只有两项[1][2]，分别为频次 Spearman 相关与高/非摄入组比较；连续 mg/d×连续得分的线性回归证据[3][4][7]结局均为一般焦虑量表。本研究的问题在现有文献中无人直接回答过。
2. 同时调整性别、年级与睡眠质量三类协变量的咖啡因-焦虑研究为零。现有研究至多同时调整两类：性别+睡眠[5][6]、性别+种族[53]、多协变量但不含年级[20]；年级独立进入调整模型的只有作为摄入预测因子的研究[10]。
3. 三条高相关题录未获摘要，无法纳入（Table 6 E3–E5）。建议补充检索：PubMed `("test anxiety"[tiab] OR "examination anxiety"[tiab]) AND (caffeine[tiab] OR coffee[tiab] OR "energy drink"[tiab])`（去掉学生限定词，逐条取摘要）；Scopus `TITLE-ABS-KEY("test anxiety" AND caffein*)`（待机构凭据）；对 E5（ajmahs）直接按 DOI 取原文。
4. 方向与量级不稳健。无效结果[17]、性别特异[16][18][20][21]、品类与总量口径分离[8]、非线性[30]、反向路径[25]、横断显著而随访不显著[32]并存。正向线性关联是多数证据支持的工作假设，不是定论——这直接支持本研究采用双侧检验。
5. 睡眠质量的角色未定。调节[34]、双向循环[33]、REM 前瞻预测[35]、中介[29]与零相关[37]证据并存，无研究在咖啡因→考试焦虑模型内检验调整睡眠质量后的效应持续性。本研究把睡眠质量同时纳入数据生成结构与调整模型，是对这一未定结构的显式处理。
6. 检索覆盖边界。Scopus、Web of Science、Embase、PsycINFO 无机构凭据未检索；灰色文献与学位论文未查；非英语区期刊（如韩文 10.29402 仅经 OpenAlex 双语记录覆盖）存在漏检空间。
7. 无以考试焦虑为结局的前瞻或实验研究。时间方向证据只来自一般焦虑纵向[21]与考试情境现场实验[55]（结局为考试成绩）。

新颖性定位一句话：把既有研究中的协变量（咖啡因摄入，连续 mg/d）提升为焦点暴露，把一般焦虑量表换为考试焦虑这一情境性构念，在同一模型内同时调整性别、年级与睡眠质量，并以固定种子模拟（n = 300，锚定 TAS 18.42±7.96[40]与真实 mg/d 分布[3][49][51]）给出可复现的效应量演示——该组合在本次 5 源 87 条候选池中没有先例。

## 9 状态核查方法（本会话执行记录）

本会话于 2026-10-24 对全部 55 个纳入条目重行核验（curl 请求官方开放 API，本地 python3 解析）：

1. PubMed esummary（`eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=…`，42 个 PMID 分 3 批）：全部解析成功、题名与候选题录一致；pubtype 无 Retraction/Retracted Publication/Erratum/Comment/Correction 标记。
2. Crossref（`api.crossref.org/works/<doi>`，11 个 DOI）：全部 status ok、题名一致；无 update-to（撤稿/关注声明）指针。
3. OpenAlex（`api.openalex.org/works/<id>`，2 个 ID）：W162677935（2011）、W2795896692（2018）均 is_retracted = false。

年份校正 3 处（以 API 记录为准）：PMID:24019267 取 2014（Depress Anxiety，候选记 2013 为在线先发表年）；PMID:39080966 取 2025（J Sleep Res，候选记 2024）；PMID:34134557 取 2022（Psychol Rep，OpenAlex 源记 2021 为在线先发表年）。

R1 修订记录（2026-10-24，引文核查触发）：条目[41]（PMID:42291660）的结构化 design 字段初版误写「系统综述，27 篇（2019–2025）」。本会话经 `efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=42291660` 复核摘要：RESULTS 原文为「Thirteen cross-sectional studies … were included」，样本量区间 82–735，MMAT 质量评估，叙述性合成，摘要全文无「27」；「27 articles」实出自 PMID:41549915 摘要（「leaving 27 articles at the end」，条目[24]，该处无误）。处置：按核查意见修正而非剔除，Table 5 条目[41]设计列补入「13 项横断面研究，检索 2019.01–2025.07，样本量 82–735」，方法学要点补 MMAT；finding 字段（检出率 13.5%–72%、女性与低年级更高、情绪困扰与低自我效能）与摘要一致，无撤稿，维持纳入、状态 clean。

核查边界：PubMed 题录无独立的 expression of concern 出版类型，EoC 漏检概率极小但非零；卷期页码字段未取，参考文献以「作者. 题名. 期刊. 年. 标识符」格式给出，标识符可直接定位原文。上游检索细节（检索式、筛阅量）引自各检索代理记录，本会话未重跑检索。

## 10 适用边界

本表服务于固定种子模拟演示（n = 300）的立题与参数锚定，不构成系统综述级证据合成：未检索订阅库、未做双人独立筛选、未取全文核验方法学细节，偏倚风险评估为题录+摘要级要点判定。真实数据版沿用本表结论前，应补检索订阅库与 E3–E5 三条待核题录，并按 AMSTAR-2 与 RoB 2 正式评定汇总与实验证据。

## 参考文献

1. Kusturica J, 等. Neuroenhancing Substances Use, Exam Anxiety and Academic Performance in Bosnian-Herzegovinian First-Year University Students. Acta Med Acad. 2019. PMID: 32124627.
2. Han S, 等. Association between Test Anxiety, Problematic Drinking, Depression, and Quality of Sleep among Nursing Students: Focused on High Caffeine Drink Intake and Non-intake Group. Health & Nursing. 2020. doi: 10.29402/hn32.2.3.
3. Keskin E, 等. Caffeine consumption and its association with anxiety and depression among Turkish university students: A cross-sectional study. J Health Psychol. 2026. PMID: 41956451.
4. Aleem A, 等. Association of Depression and Anxiety with Consumption of Caffeine-Containing Beverages in University Students of Lahore, Pakistan. J Health Rehabil Res. 2024. doi: 10.61919/jhrr.v4i3.1256.
5. Shihadeh S, 等. Caffeine Consumption, Sleep Quality, and Mental Health Outcomes among Jordanian University Students: A Cross-sectional Study. JAPA Acad J. 2025. doi: 10.4103/japaj.japaj_30_25.
6. Jawed F, 等. Impact of Caffeine Consumption on Sleep Quality and Anxiety Levels in Undergraduate Medical Students. South Asian J Med Sci. 2026. doi: 10.56536/sajms.v7i1.119.
7. Al-Dalaeen A, 等. The association between caffeine consumption and memory, anxiety, and stress levels among students: A cross-sectional study. J Educ Health Promot. 2026. PMID: 42491907.
8. Gontijo ALA, 等. Associations between caffeine consumption, anxiety, temporomandibular disorders, and oral behaviors in university students in Brazil—a cross-sectional study. J Oral Facial Pain Headache. 2026. PMID: 42895008.
9. Jahrami H, 等. Intake of Caffeine and Its Association with Physical and Mental Health Status among University Students in Bahrain. Foods. 2020. PMID: 32290044.
10. Bertasi RAO, 等. Caffeine Intake and Mental Health in College Students. Cureus. 2021. PMID: 33968523.
11. Di Martino G, 等. Change in Caffeine Consumption after Pandemic (CCAP-Study) among University Students: A Cross-Sectional Study from Italy. Nutrients. 2024. PMID: 38674822.
12. Salim N, 等. The Effect of Caffeine Consumption on the Level of Anxiety Disorders in Medical Students. J Inov Pendidikan dan Sains. 2025. doi: 10.51673/jips.v6i3.2744.
13. Adegoke OA, 等. Self Reported Symptoms of Anxiety Associated with Coffee Consumption among University Students in Nigeria. Mediterr J Soc Sci. 2014. doi: 10.5901/mjss.2014.v5n15p464.
14. Hire JN. Anxiety and caffeine. Psychol Rep. 1978. PMID: 674508.
15. Gilliland K, 等. Ad lib caffeine consumption, symptoms of caffeinism, and academic performance. Am J Psychiatry. 1981. PMID: 7212112.
16. Mino Y, 等. Caffeine consumption and anxiety and depressive symptomatology among medical students. Arukoru Kenkyuto Yakubutsu Ison. 1990. PMID: 2085289.
17. Makki NM, 等. Caffeine Consumption and Depression, Anxiety, and Stress Levels Among University Students in Medina: A Cross-Sectional Study. Cureus. 2023. PMID: 37916247.
18. Paz-Graniel I, 等. Caffeine Intake and Its Sex-Specific Association with General Anxiety: A Cross-Sectional Analysis among General Population Adults. Nutrients. 2022. PMID: 35334898.
19. Stasio MJ, 等. Revving Up and Staying Up: Energy Drink Use Associated with Anxiety and Sleep Quality in a College Sample. J Caffeine Res. 2011. OpenAlex: W162677935.
20. Trapp GS, 等. Energy drink consumption is associated with anxiety in Australian young adult males. Depress Anxiety. 2014. PMID: 24019267.
21. Kaur S, 等. Consumption of energy drinks is associated with depression, anxiety, and stress in young adult males: Evidence from a longitudinal cohort study. Depress Anxiety. 2020. PMID: 32845046.
22. Kosecka O, 等. Caffeine Intake Mediates the Relationship Between Problematic Overstudying and Psychological Distress. Nutrients. 2025. PMID: 40944232.
23. Liu C, 等. Caffeine intake and anxiety: a meta-analysis. Front Psychol. 2024. PMID: 38362247.
24. Nascimento AOD, 等. The Effects of Caffeine on Anxiety Behavior in Healthy Individuals: A Systematic Review of the Literature. Stress Health. 2026. PMID: 41549915.
25. Lyvers M, 等. Caffeine use and alexithymia in university students. J Psychoactive Drugs. 2014. PMID: 25188705.
26. Fitzgerald E, 等. Caffeine Intake and Anxiety in College Students. Am J Occup Ther. 2024. doi: 10.5014/ajot.2024.78s2-po89.
27. Cho JA, 等. The Association between High-Caffeine Drink Consumption and Anxiety in Korean Adolescents. Nutrients. 2024. PMID: 38542705.
28. Jin MJ, 等. The Relationship of Caffeine Intake with Depression, Anxiety, Stress, and Sleep in Korean Adolescents. Korean J Fam Med. 2016. PMID: 27073610.
29. Chen X, 等. Associations of Bubble Tea Consumption with Sleep Disturbance and Anxiety in Adolescents: Findings from the Zhejiang Childhood Behavior and Health Cohort. Nutrients. 2026. PMID: 42356346.
30. Kim J, 等. Beverage-Derived Caffeine Intake, Sleep Duration, and Mental Health Among Korean Adults: A Cross-Sectional Analysis of KNHANES 2021–2024. Nutrients. 2026. PMID: 42588110.
31. Richards G, 等. Caffeine Consumption and Self-Assessed Stress, Anxiety, and Depression in Secondary School Children. J Psychopharmacol. 2015. PMID: 26508718.
32. Richards G, 等. Breakfast and Energy Drink Consumption in Secondary School Children…. Front Psychol. 2016. PMID: 26903914.
33. Hamilton NA, 等. Test Anxiety and Poor Sleep: A Vicious Cycle. Int J Behav Med. 2021. PMID: 33730347.
34. Adams SK, 等. Examining the Moderator Role of Sleep Quality in the Relationship Among Test Anxiety, Academic Success and Mood. Psychol Rep. 2022. PMID: 34134557.
35. Larios E, 等. Habitual rapid eye movement sleep predicts changes in test-anxiety levels weeks in advance. J Sleep Res. 2025. PMID: 39080966.
36. Van de Casteele M, 等. Too Pressured to Sleep? Exploring the Role of Study Motivation, Test Anxiety and Procrastination in University Students' Sleep Patterns During Exam Periods. Stress Health. 2025. PMID: 40304155.
37. Ilyas S, 等. Sleep Quality and Test Anxiety in Undergraduate Students: The Role of Gender and Socioeconomic Status. Soc Sci Rev Arch. 2026. doi: 10.70670/sra.v4i1.2484.
38. Jirjees F, 等. Test anxiety and coping strategies among university students an exploratory study in the UAE. Sci Rep. 2024. PMID: 39468103.
39. Green M, 等. Test anxiety and United States Medical Licensing Examination scores. Clin Teach. 2016. PMID: 26037042.
40. Li Y, 等. Bedtime Procrastination and Attention as Serial Mediators Between Premenstrual Syndrome and Test Anxiety in Nursing College Students: A Multicenter Cross-Sectional Study. Psychol Res Behav Manag. 2026. PMID: 42502849.
41. Mady MM, 等. Prevalence and Correlates of Test Anxiety Among Medical Students: Systematic Review. Adv Med Educ Pract. 2026. PMID: 42291660.
42. Omar YM, 等. Prevalence of test anxiety among medical students: a systematic review and meta-analysis. BMC Med Educ. 2026. PMID: 42717343.
43. Pienyu K, 等. Academic stress, perceived parental pressure, and anxiety related to competitive entrance examinations and the general well-being among adolescents—A cross-sectional survey from Karnataka, India. J Educ Health Promot. 2024. PMID: 39850288.
44. Ćurčić V, 等. Test anxiety as a risk factor for use of psychoactive compounds in medical students. Biomed Istraž. 2024. doi: 10.59137/bii202402406c.
45. Norbury R, 等. Time to think: Subjective sleep quality, trait anxiety and university start time. Psychiatry Res. 2019. PMID: 30502557.
46. Hajduk M, 等. Neuroenhancement and mental health in students from four faculties—a cross-sectional questionnaire study. GMS J Med Educ. 2024. PMID: 38504866.
47. Alhawari H, 等. Comparison of Baseline and Test Day Cardiovascular Parameters, Anxiety Scores and Coffee Consumption Among Medical Students Undergoing OSCE in Jordan. Int J Gen Med. 2023. PMID: 37745136.
48. Dodia K, 等. Impact of Energy Drinks and Caffeine on Cognition, Stress, and Sleep During Examination: A Mixed-Methods Cross-Sectional Study From a Medical School in Mauritius. Cureus. 2026. PMID: 42078218.
49. Ikram K, 等. The Effect of Caffeine Consumption on Sleep Quality among Undergraduate Students in Malaysia. Jurnal Gizi dan Pangan. 2024. doi: 10.25182/jgp.2024.19.supp.1.79-86.
50. Islam Dola ST, 等. From caffeine use motives to sleep disturbance: network and structural equation modeling of caffeine use disorder and depression among caffeine consumers. Addict Behav Rep. 2026. PMID: 42571332.
51. Choi SW, 等. Caffeine consumption of medical students in Korea: amount and symptoms based on a 2023 survey. Korean J Med Educ. 2024. PMID: 39246108.
52. Petkar SS, 等. Association Between Coffee Consumption and Academic Performance Among Second-Year Medical Students. Cureus. 2026. PMID: 41841082.
53. Svikis DS, 等. Coffee and energy drink use patterns in college freshmen: associations with adverse health behaviors and risk factors. BMC Public Health. 2022. PMID: 35346128.
54. Ogunkuade JO, 等. Effects of Caffeine and Anxiety Level on Psychomotor Performance. AFRREV IJAH. 2017. doi: 10.4314/ijah.v6i2.10.
55. Santos Villagrán RJ, 等. Doping to underperform: the impact of coffee consumption on test scores. 2018. OpenAlex: W2795896692.

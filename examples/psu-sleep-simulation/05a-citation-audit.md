# 05a 引文深审：06-draft.md 全部 72 条参考文献 × 正文引用点逐条审计

审计日期：2026-10-22（首轮）；**复审计（v2.3 复核轮）同日完成，见下节**。审计对象：`provenance-lab-output/06-draft.md` References 全部 72 条 + 正文中每个引用点（§1.1–§4.4 及 Table 1 注、回应信）。

## 复审计（v2.3 复核轮，2026-10-22）

初稿修订为 v2.3（头部声明"11 处引用按原文口径改写（条目 1/4/5/11/17/18/19/25/41/42/56）"）。本轮逐处复核该 11 条改写＋上一轮全部遗留项；复核方法：重读修订稿全文（633 行，重点 §1.1–§1.4、§4.2–§4.4、References 1–72），对照首轮已取回的原文材料（PubMed 摘要、PMC/MDPI 全文、OpenAlex/Crossref 元数据）逐点判定；[18] 补做一次全文可得性检索（OpenAlex best_oa_location、Semantic Scholar openAccessPdf、arXiv 标题检索——均无可及开放全文，OA 链接即付费墙 DOI）；对 11 个涉改 DOI 重跑 OpenAlex `is_retracted`（11/11 命中，全部 false，本轮口径）。

**复核结论：首轮 9 条问题引用中 7 条已完全修复（supported）**——[1]（改为"9 项研究、弱到中度、暂定、需客观测量与实验设计"，与摘要逐点一致；参考文献补作者与卷号 55:100897）、[4]（改为"以合并比值比（OR）报告、未给合并相关系数"，准确）、[11]（§4.2"跨波效应表现不一致"为摘要原文口径；§1.2"在不同模型与波次间表现不一致"亦在摘要"两模型均显示不一致"的自然读法内）、[19]（§1.3 改为"显著性随模型设定分化＋原文立场是按目标效应选择模型"，与 PMC7854859 全文一致；§4.2 两波句已改引 [17]，wrong-context 解除；参考文献补"Orth 等"与全文级核验注）、[25]（显式给出 .03/.07/.12 并判 β=0.08–0.09 属中等档、MDE 0.10 处中等档上沿——与原文基准一致，反向陈述已纠正）、[41]（"PSU 单向预测后续睡眠质量并与就寝拖延互惠"——准确）、[56]（主观 PR≈1.55 与腕动计客观关联属平板使用分开表述——准确）。另 [5] 新增睡眠 OR=2.60（1.39–4.85）经与摘要比对无误；[17] 顶替 [19] 的两波论点（"仅两波使替代模型不可检验"）为摘要直接支撑。

**残余问题 2 条（非 supported）**：
1. **[18]（overstated，幅度已收窄）**：§1.3 改写后去掉"样本量"，保留"其可辨识性依赖波次数与测量间隔等设计要素"；§4.2"波次数的决定性[18]"与 §4.4"或增加波次[18]"同。该具体主张仍无摘要支撑，本轮补查亦无可及全文（无法升级为全文级）。注：§4.2 该句为 [17]+[18] 并引，[17] 摘要（"仅两波不可能检验替代模型"）已在摘要级承载"波次数决定性"，[18] 的框架角色可保留但建议该论点主引 [17]、[18] 作框架参考，或在 [18] 处标注"全文级主张、未核"。
2. **[42]（overstated，本轮改写新引入）**：§4.2 主句"两波 PSU/拖延/心理健康间的互惠"已准确，但括注"（睡眠仅作前因变量之一）"与摘要不符——该研究中睡眠**亦为结局**（"PSU at Time 1 significantly predicted…sleep quality at Time 2"；心理健康 T1→睡眠 T2）。建议括注改为"睡眠不在互惠对之内"或径直删去。

**著录遗留（首轮已列、本轮复核状态）**：**[28] 错误 DOI 未修**（仍作 10.1016/j.chiabu.2022.105710，该 DOI 经 Crossref 核验指向 "Facilitators and barriers to Children's Advocacy Center-based multidisciplinary teamwork"；正确 DOI 10.1016/j.chiabu.2023.106065）——参考文献层必改项中唯一实质性定位风险；[22] 题名截断未补（仍缺 "used by Beckers et al. (2023)"）；[12]/[31]/[32]/[40] 期刊名未补（依次 BMC Psychology、Child Adolesc Psychiatry Ment Health、Frontiers in Psychology、Psychology Research and Behavior Management，PubMed 可证）；[42] 期刊与 DOI 已补（Psychol Res Behav Manag 2024, 10.2147/PRBM.S472299 ✓）。笔记级：[26] §1.4 首处仍作"PSU→睡眠"（应为 PSMU）；[16]"模型拟合可误导"保留（摘要列 fit issues，维持笔记级限定建议）。

**撤稿/更正状态**：与首轮一致（本轮对 11 个涉改 DOI 重跑 OpenAlex is_retracted 全部 false；PubMed 出版类型无 Retracted/Concern；[5][58] corrected 维持）。

## 审计方法与证据层级（首轮）

- **PubMed**（技能包装脚本 `pubmed_api.py`：efetch 摘要 49 个 PMID 批量取回；esummary 取出版类型/更正链接/期刊；PMC OA 全文接口取 3 篇关键全文）。
- **EuropePMC/PMC OA 全文**：条 7（PMC8306125）、条 19（PMC7854859）、条 8（PMC12835080）、条 5 第二更正通告（PMC）。**全文级**核对的共 4 篇 + 条 46（MDPI 开放网页全文）。
- **OpenAlex**：72 条中 70 条批量核 `is_retracted`（条 60、66 的 arXiv DOI 无 OpenAlex 记录）。全部 false。
- **Crossref**：条 1/49/58/69/70/71/72 的题录（期刊、年、卷页、作者）；条 58 勘误 DOI（10.1007/s11336-022-09890-6）确认存在；条 28 初稿错误 DOI 的指向确认。
- **arXiv abs 页**：9 个预印本存在性与题名逐字核对（export.arxiv.org API 限流，改用 arxiv.org/abs 页面）。
- **Semantic Scholar**：条 1 摘要（OpenAlex 无摘要）。
- **撤稿审计**：PubMed 出版类型（49 条均无 Retracted Publication/Expression of Concern）+ OpenAlex is_retracted（70 条）+ 更正/勘误链接核查。**注**：Crossform Retraction Watch 开放库（api.labs.crossref.org/retractions）本轮持续返回 400（接口变更/失效），未能使用；以 OpenAlex+PubMed 双轨替代，条 60/66 因此标 unknown。
- 核对层级标注：**全文级**（读过原文全文）/ **摘要级**（读过 PubMed 或 OpenAlex/S2 摘要并逐点比对）/ **题录级**（题名+元数据匹配，功能性一句话引用）。

## 总体结论（首轮口径；v2.3 复核结果以文首"复审计"节为准）

- **72/72 条全部定位到真实文献**，无幻觉引用；69 条与白名单证据表一一对应，条 33/34/70/71/72 为评审轮新增，本轮已独立核验。
- **问题引用 9 条**（accuracy 非 supported 或 necessity 异常）：**[4]（misleading：OR 元分析被表述为"中等正相关"）、[25]（misleading：效应量分档被反向陈述，β=0.08–0.09 按 .03/.07/.12 基准属中档而非"小效应"）、[1]（overstated）、[11]（overstated）、[18]（overstated）、[19]（overstated＋一处 wrong-context）、[41]（overstated）、[42]（overstated）、[56]（overstated）**。
- **撤稿/关注状态**：无 retracted/concern；条 5、58 为 corrected（均已如实标注，更正内容均非数值性——条 5 两条更正皆为作者名更正，已读更正通告全文确认；条 58 勘误 DOI 存在）；条 60、66 unknown（OpenAlex 无记录、非 PubMed 收录、RW 库不可用；arXiv 页面无撤回标记）。
- **著录缺陷（不改变 accuracy 判定，但须修）**：条 28 **DOI 错误**（初稿 10.1016/j.chiabu.2022.105710 实际指向另一篇文章 "Facilitators and barriers to Children's Advocacy Center-based multidisciplinary teamwork"；正确 DOI 为 10.1016/j.chiabu.2023.106065）；条 22 题名截断（漏 "used by Beckers et al. (2023)"）；条 12/31/32/40/42 缺期刊名（依次为 BMC Psychology、Child Adolesc Psychiatry Ment Health、Front Psychol、Psychol Res Behav Manag×2，均经 PubMed 核实）。
- **白名单外发现**：无。白名单此前记录的条 13 摘要订正（单向而非双向）与初稿一致；条 6 的 JAMA Pediatr 170(12):1146-1147 经核为随刊 Editorial/Comment（PMID 27802458），**非勘误**，条 6 无更正。

---

## 逐条明细

判定图例：比对 = supported（原文支持）/ overstated（夸大）/ misleading（误导性引用）/ unsupported（原文不支持）；必要性 = necessary / redundant / wrong-context；状态 = clean / corrected / unknown。

### 域A：纵向实证（条 7–13）

**[7] PMID:34299887 — Chen & Wu 2021, IJERPH（台湾两波）** ｜全文级（PMC8306125）
- 引用点：§1.2（n=1,039、7–12 年级、6 个月、双向 β=0.09/0.08、p<.01、男女一致）；Table 1（正向 0.08/反向 0.09/自回归 0.56/0.54/同时点 0.22/T2 侧 0.11）；§2.3、§4.2（S1 校准锚点）。
- 原文位置：Abstract（1,039、Grades 7–12、6-month、"applied to boys and girls"）；Results 第 2 段（sleep T1→PSU T2 β=0.09 p<0.01；PSU T1→sleep T2 β=0.08 p<0.01；自回归 sleep 0.54/PSU 0.56；T1 同时点 0.22 p<0.001；T2 侧 0.11 p<0.01；R²=32%/34%）；Table 2（W1 sleep×W1 PSU r=0.22）。
- 比对：**supported**——Table 1 全部冻结系数与原文逐字吻合；"T2 侧 0.11 为残差（创新）相关口径"的解读与 CLPM 的 T2 同期相关=残差协方差相符（原文表述 "within-time correlation at Time 2"）。一个提示："男女一致"为作者摘要原句，正文未见分性别分组模型（引用时可按摘要口径）。
- 溯源：primary｜必要性：necessary（S1 场景全部系数的唯一锚点）｜状态：clean（PubMed 无异常出版类型；OpenAlex false）。
- 建议：**保留**。

**[8] PMID:41436836 — Oh & Heo 2025, Sci Rep（韩国 KCYPS 三波）** ｜全文级（PMC12835080）
- 引用点：§1.2（三波 2,052 人、睡眠→PSU 方向证据更强）；Table 1 注（S3 方向锚定）；§4.2。
- 原文位置：Abstract（2,052、2020–2022 三波、ARCL、poor sleep quality consistently predicted later smartphone overdependence）；Discussion 第 1 段："reciprocal paths were not significant in the final model"；第 3 段："no significant lagged effect of smartphone overdependence on sleep quality"。
- 比对：**supported**——全文直接支持"仅反向"读法（PSU→睡眠滞后路径不显著），初稿 S3 的方向映射成立；睡眠单条目测量（National Institute 单题）与白名单一致。
- 溯源：primary｜必要性：necessary｜状态：clean。建议：**保留**。

**[9] PMID:41677479 — ABCD 2026, Am J Prev Med** ｜摘要级
- 引用点：§1.2（n=8,119 前瞻预测一年后睡眠障碍等多结局）；Table 1 注（S2 方向锚定）；§4.2（PICO 年龄下界外声明）。
- 原文位置：Abstract METHODS/RESULTS（N=8,119、11–12 岁、Year 2→Year 3、problematic mobile phone use 与 social media use prospectively associated with sleep disturbance 等）。
- 比对：**supported**（样本量、随访时长、结局逐点吻合；初稿自标"年龄处 PICO 下界外，S2 仅取方向"恰当）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

**[10] PMID:28581275 — Lee et al. 2017, J Korean Med Sci** ｜摘要级
- 引用点：§1.2（KCYPS 2011–2013、基线排除已有睡眠不良、高分升高新发差睡眠质量风险、不升高短睡眠时长风险）；Table 1 注（S2 方向锚定）。
- 原文位置：Abstract（1,125 after excluding those who already had poor sleep quality or short sleep duration；GEE；High mobile phone addiction (score>20) increased the risk of poor sleep quality but not short sleep duration）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

**[11] PMID:40891046 — Yu 2025, Psychol Health（六波双队列）** ｜摘要级（非 OA）
- 引用点：§1.2 与 §4.2（"手机依赖→睡眠时长的个体内效应在 CLPM 与 RI-CLPM 间不一致且微弱"）。
- 原文位置：Abstract RESULTS："Both a cross-lagged panel model (CLPM) and a random-intersect CLPM indicated that phone dependency had inconsistent effects on sleep duration, while having minimal effects on BMI."
- 比对：**overstated**——摘要支持"手机依赖对睡眠时长的效应不一致"（两模型共同显示，跨波口径）；"微弱"（minimal）在摘要中系对 BMI 的表述；"在两模型**间**不一致"为摘要未直接支持的精确化。另摘要还有"长睡眠时长→更高手机依赖"（个体内）的反向路径，初稿未提（非义务，但与 S3 讨论相关）。
- 溯源：primary｜必要性：necessary｜状态：clean。建议（首轮）：**改写陈述**为"手机依赖对睡眠时长的效应在 CLPM 与 RI-CLPM 两模型中均呈（跨波）不一致"；如需保留"微弱"须全文级复核。
- **v2.3 复核：已修复（supported）**——§4.2 改为"跨波效应表现不一致"（摘要原文口径）；§1.2 改为"在不同模型与波次间表现不一致"，在摘要"两模型均显示效应不一致"的自然读法内；"微弱"已删。

**[12] PMID:42629566 — BMC Psychology 2026（三波 n=6,153）** ｜摘要级
- 引用点：§1.2、§4.2（个体内抑郁→PSU 与睡眠、PSU–睡眠无稳定双向；MDE 外推计算）。
- 原文位置：Abstract（6,153、2024-04–2025-04 三波、RI-CLPM+CLPN；within-person: increases in depressive symptoms consistently predicted subsequent increases in PSU and SD, whereas no stable bidirectional relationship was found between PSU and SD）。
- 比对：**supported**（含 n=6,153 用于初稿 MDE 折算）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留＋**补期刊名 BMC Psychology**。
- **v2.3 复核：期刊名未补（笔记级遗留）**——参考文献条 12 仍无期刊名（PubMed：BMC Psychology 2026）。

**[13] PMID:38555341 — J Youth Adolesc 2024（孤独感）** ｜摘要级
- 引用点：§1.2、§4.2（孤独感→PSU 单向非互惠）。
- 原文位置：Abstract（3,132→1,120；loneliness significantly predicts PSU, but not vice versa；初中段与女性更强）。
- 比对：**supported**（白名单此前的摘要订正与初稿一致）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

### 域A 补充与调节/中介（条 26–32、36736032 系）

**[26] PMID:41452419 — J Youth Adolesc 2026（PSMU×睡眠，性别）** ｜摘要级
- 引用点：§1.4（个体内 PSU→睡眠两性均显著、睡眠→PSMU 仅女性）；§2.4（三波可估先例）；§2.8/§4.2（S*7 模板迁移）。
- 原文位置：Abstract（1,696、三波 6 个月、RI-CLPM 多组：PSMU→sleep both sexes stronger among females；sleep→PSMU significant only among females）。
- 比对：**supported**——数值结论逐点吻合；**一处构念笔误须修**：§1.4 首个路径写作"PSU→睡眠"，该研究暴露为 PSMU（problematic social media use），同句后半已用 PSMU，应统一。
- 溯源：primary｜必要性：necessary｜状态：clean。建议：保留＋统一 PSMU 标签。
- **v2.3 复核：标签未修（笔记级遗留）**——§1.4 首处仍作"个体内 PSU→睡眠两性均显著"，该研究暴露为 PSMU，应统一为 PSMU（同句后半已用 PSMU）。

**[27] PMID:40525102 — PRBM 2025（FOMO 三波 RI-CLPM）** ｜摘要级
- 引用点：§1.4（非对称系数范例）；§2.4（三波可估先例）。
- 原文位置：Abstract RESULTS（PSU→depression βs=0.19–0.21 ps<0.001；反向 βs=0.05–0.06 ns；FOMO↔PSU 双向）。
- 比对：**supported**（β 区间逐字吻合）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

**[28] PMID:36736032 — Child Abuse Negl 2023（网络受害四波）** ｜摘要级
- 引用点：§1.4（睡眠作个体内中介）；§2.4（四波可估先例）。
- 原文位置：Abstract（1,835、四波 6 个月、CLPM+RI-CLPM、within-person：cyber victimization→PMPU，sleep problems as explanatory mechanism）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留＋**改著录 DOI**：正确为 10.1016/j.chiabu.2023.106065（PubMed 记录）；初稿之 10.1016/j.chiabu.2022.105710 经 Crossref 核验指向另一篇无关文章。
- **v2.3 复核：DOI 未修（著录必改项中唯一实质定位风险）**——参考文献条 28 仍作 doi:10.1016/j.chiabu.2022.105710（指向 "Facilitators and barriers to Children's Advocacy Center-based multidisciplinary teamwork"），正确 DOI 为 10.1016/j.chiabu.2023.106065。正文陈述本身无变化、维持 supported。

**[29] PMID:40232758 — J Psychopathol Clin Sci 2025（情绪调节四波）** ｜摘要级
- 引用点：§1.4（睡眠→抑郁显著、反向不显著；情绪调节中介且性别差异）。
- 原文位置：Abstract（1,535、四波 6 个月；sleep problems→depressive symptoms not vice versa；emotion regulation mediator only in girls）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

**[30] PMID:41564432 — JMIR 2026（睡前屏幕限制调节）** ｜摘要级
- 引用点：§1.4（r=0.23、调节未获支持）；§2.4（三波可估先例）。
- 原文位置：Abstract RESULTS（n=2,500；r=0.23, 95%CI 0.15–0.31；Baseline screen time restriction did not moderate within-person effects Δχ²=5.3 P=.51）。
- 比对：**supported**（CI 与调节阴性逐点吻合）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

**[31] PMID:40119352 — 2025（IGD→品行问题三波中介）** ｜摘要级
- 引用点：§1.4（中介效应性别与发育阶段差异）。
- 原文位置：Abstract（20,137、初一/高一、三波；17.3% of total effect；more pronounced in early adolescents and varied by sex）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留＋**补期刊名** Child and Adolescent Psychiatry and Mental Health。
- **v2.3 复核：期刊名未补（笔记级遗留）**——参考文献条 31 仍无期刊名。

**[32] PMID:40438756 — 2025（压力/性别分组交叉滞后）** ｜摘要级
- 引用点：§1.4（低压力组仅依赖→拖延、高压力组仅拖延→依赖、拖延→依赖仅女生）。
- 原文位置：Abstract RESULTS（1,423、两波 2021-11/2022-05；low-stress MPA→BP、high-stress BP→MPA；BP→MPA only in female students）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留＋**补期刊名** Frontiers in Psychology。
- **v2.3 复核：期刊名未补（笔记级遗留）**——参考文献条 32 仍无期刊名。

### 域B：大学生/成人纵向（条 40–45）

**[40] PMID:38707963 — PRBM 2024（三波中介）** ｜摘要级
- 引用点：§4.2（直接效应 0.021 与情绪中介）。原文位置：Abstract RESULTS（direct 0.021, 0.010–0.033；焦虑 0.003、抑郁 0.004、序列 0.008，CI 吻合）。比对：**supported**。状态：clean。建议：保留＋补期刊名 Psychology Research and Behavior Management。
- **v2.3 复核：期刊名未补（笔记级遗留）**——参考文献条 40 仍无期刊名。

**[41] PMID:34507561 — BMC Psychiatry 2021（两波 12 个月）** ｜摘要级
- 引用点：§4.2（"两波 PSU–就寝拖延–睡眠互惠[41][42]"）。原文位置：Abstract RESULTS（1,181、12 个月；PMPU↔BP、PMPU↔抑郁、睡眠↔BP、睡眠↔抑郁双向；"Problematic mobile phone use predicted subsequent sleep quality **one-way**"）。
- 比对：**overstated**——PSU→睡眠在该文为**单向**；"互惠"只成立于 PSU↔就寝拖延等路径。溯源：primary｜必要性：necessary｜状态：clean。建议（首轮）：**改写陈述**："两波 PSU↔就寝拖延双向而 PSU→睡眠单向[41]"。
- **v2.3 复核：已修复（supported）**——§4.2 改为"两波样本中 PSU 单向预测后续睡眠质量并与就寝拖延互惠[41]"，与摘要逐点一致。

**[42] PMID:39359420 — PRBM 2024（两波 6 个月 n=683）** ｜摘要级
- 引用点：§4.2（同上句）。原文位置：Abstract RESULTS（PSU/BP/心理健康间 reciprocal；睡眠 T1→BP 与心理健康，**未列**睡眠→PSU）。
- 比对：**overstated**（同 [41]：句中"–睡眠互惠"对 [42] 亦无睡眠→PSU 支点）。溯源：primary｜必要性：necessary｜状态：clean。建议（首轮）：与 [41] 一并改写为准确路径列举；补期刊名。
- **v2.3 复核：主句已修复，新残余 overstated（括注）**——主句改为"两波 PSU/拖延/心理健康间的互惠"✓（期刊与 DOI 已补 ✓）；但新括注"（睡眠仅作前因变量之一）"与摘要不符：该文睡眠**亦为结局**（"PSU at Time 1 significantly predicted…sleep quality at Time 2"；心理健康 T1→睡眠 T2）。建议括注改为"睡眠不在互惠对之内"或删去。

**[43] PMID:32765310 — Front Psychiatry 2020（一年前瞻）** ｜摘要级
- 引用点：§4.2（一年双向检验）。原文位置：Abstract（940/902；MPAB↔PSQI/ESS 双向；BDI/SAS/ISI→MPAB 单向）。比对：**supported**（双向以 PSQI 为结局成立；注：暴露为 MPIQ 非 SAS-SV，初稿未误称）。状态：clean。建议：保留。

**[44] PMID:40549956 — J Behav Addict 2025（两波阴性）** ｜摘要级
- 引用点：§4.2（睡眠→负性元认知 β=0.202 p=.021；无双向）。原文位置：Abstract RESULTS 逐字吻合。比对：**supported**。状态：clean。建议：保留。

**[45] PMID:41804842 — Brain and Behavior 2026（日间功能障碍 RI-CLPM）** ｜摘要级
- 引用点：§2.8（次要结局占位依据）、§4.2。原文位置：Abstract（936、三波 4 个月；between r=0.319–0.495；social neglect 中介）。比对：**supported**（期刊名经 esummary 核为 Brain and Behavior，与初稿订正一致）。状态：clean。建议：保留。

### 域C：方法学（条 14–25、50–52、70）

**[14] PMID:25822208 — Hamaker et al. 2015** ｜摘要级。引用点：§1.3/§2.4/§2.6/Table 2 注/§4.1/§4.2。原文位置：Abstract（trait-like stability → lagged parameters do not represent within-person carry-over；erroneous conclusions regarding presence, predominance, and sign；random intercepts 分离）。比对：**supported**（核心机制与初稿用法逐点吻合）。状态：clean。建议：保留。

**[15] PMID:27878996 — Child Dev 2017** ｜摘要级。原文位置：Abstract（weighted—and typically uninterpretable—amalgam of between- and within-person associations；Monte Carlo＋两实证）。比对：**supported**。状态：clean。建议：保留。

**[16] PMID:38815066 — Psychol Methods 2024** ｜摘要级。原文位置：Abstract（contemporaneous and reciprocal effects 下 "Can cross-lagged panel modeling be relied on...? ...the answer is no"；Monte Carlo＋real data；identification/estimation/model fit issues）。比对：**supported**（"两估计器均不可靠"直接由摘要支撑；"模型拟合可误导"为全文级细节，摘要仅列 fit issues，未独立核——初稿该短语建议弱化或取全文）。状态：clean。建议：保留（可选：拟合句加"（全文级）"限定）。

**[17] PMID:31560683 — PLoS ONE 2019** ｜摘要级。原文位置：Abstract（more than 300 medical papers；49% only two time points；CLPM 与替代模型 different or even inconsistent parameter estimates...presence, predominance, and sign）。比对：**supported**（49% 与"甚至反号"均有摘要支撑）。状态：clean。建议：保留。
- **v2.3 复核：supported（新增用途）**——顶替 [19] 承担 §4.2 两波论点（"解释了阴性或相互冲突的两波证据为何不能裁决方向性[17]"），摘要"only two time points were used, which makes it impossible to test alternative models"直接支撑。

**[18] PMID:30998041 — Psychol Methods 2019（统一框架）** ｜摘要级（非 OA）
- 引用点：§1.3（"可辨识与区分能力取决于波次数、测量间隔与样本量"）；§4.2（波次数的决定性）；§4.4（或增加波次）。
- 原文位置：Abstract（统一框架、模型分类依据 unique factors/dynamic residuals/common factors；great risk of drawing different conclusions depending on models）。
- 比对：**overstated**——摘要支持"框架统一、模型选择改变结论"；"波次数、测量间隔与样本量"三元组为全文级主张（付费墙未核），且"样本量"与可辨识性的关系在计量意义上属功效而非识别。
- 溯源：primary｜必要性：necessary｜状态：clean。建议（首轮）：**改写陈述**为摘要可支撑口径（"不同交叉滞后模型的可辨识条件与参数含义不同，模型选择改变结论"），或取全文后再保留原表述。
- **v2.3 复核：部分修复，残余 overstated**——§1.3 已删"样本量"，保留"其可辨识性依赖波次数与测量间隔等设计要素"；§4.2"波次数的决定性[18]"、§4.4"或增加波次[18]"仍在；该主张仍无摘要支撑，本轮补查（OpenAlex/Semantic Scholar/arXiv）无可及开放全文。处置：§4.2 论点主引 [17]（摘要直接支撑"仅两波不可能检验替代模型"）、[18] 作框架参考，或标注"全文级主张、未核"。

**[19] PMID:32730068 — JPSP 2021（七模型比较）** ｜全文级（PMC7854859）
- 引用点：§1.3（"前瞻效应的显著性常随模型设定翻转，单一 CLPM 结论不可靠"）；§4.2（七模型"显著性随设定翻转"；"解释两波证据不能裁决方向性[19]"）。
- 原文位置：Results/Discussion（自尊→抑郁在 CLPM 显著、RI-CLPM 个体内"small and nonsignificant"；Discussion"the inferences that can be drawn from data depend directly on the model selected"）；摘要（10 样本均 ≥4 波；推荐 CLPM 用于 between-person、RI-CLPM 用于 within-person）。
- 比对：**overstated**——"显著性随设定分化"由全文成立；"单一 CLPM 结论不可靠"超出原文立场（原文按目标效应推荐 CLPM/RI-CLPM 各司其职）；§4.2 将"两波证据"句挂 [19] 属 **wrong-context**（该文样本全部 ≥4 波；两波论点的合适引用为 [17] 的 49% 统计）。
- 溯源：primary｜必要性：necessary（§1.3）/该句 wrong-context（§4.2）｜状态：clean。建议（首轮）：§1.3 加"（原文建议按目标效应选模型）"限定；§4.2 两波句改引 [17]。
- **v2.3 复核：已修复（supported；wrong-context 解除）**——§1.3 改为"显著性随模型设定分化（如 CLPM 显著而 RI-CLPM 个体内不显著），原文立场是按目标效应选择模型、而非弃用任一估计器"，与 PMC7854859 全文一致；§4.2 两波句已改引 [17]；参考文献补"Orth 等"与全文级核验注。

**[20] PMID:38739610 — PLoS ONE 2024（正念模拟再分析）** ｜摘要级。原文位置：Abstract（meta-analytic cross-lagged effects adjusted for prior outcome may be spurious due to correlations with residuals and regression to the mean；competing models on simulations）。比对：**supported**。状态：clean。建议：保留。

**[21] PMID:41446610 — Front Psychol 2025（反刍–睡眠模拟再分析）** ｜摘要级。原文位置：Abstract（simulated data to resemble Yang and Lei；triangulation/complementary models；contradicting effects；rumination–sleep）。比对：**supported**（"以睡眠为结局的校准式再分析"成立）。状态：clean。建议：保留。

**[22] PMID:42258527 — PLoS ONE 2026（RI-CLPM 伪效应）** ｜摘要级。原文位置：Abstract（common auto-correlated state factors → spurious；Dutch teenagers N=1,856 再分析）。比对：**supported**。状态：clean。建议：保留＋**补全题名**（漏 "used by Beckers et al. (2023)"）。
- **v2.3 复核：题名截断未修（笔记级遗留）**——参考文献条 22 题名仍止于 "problematic eating behaviors."。

**[23] doi:10.1080/10705511.2022.2065278 — Lüdtke & Robitzsch 2022, SEM** ｜摘要级（OpenAlex 摘要）。原文位置：Abstract（CLPM biased under unmeasured confounding；latent variable-type approaches strongly depend on parametric assumptions, biased under different DGM scenarios）。比对：**supported**（作者 Lüdtke/Robitzsch 经 Crossref/OpenAlex 核）。状态：clean。建议：保留。

**[24] doi:10.1080/10705511.2024.2379495 — Robitzsch & Lüdtke 2024, SEM** ｜摘要级。原文位置：Abstract（time-varying covariate processes omitted → illusory between-person components；necessary and sufficient conditions）。比对：**supported**。状态：clean。建议：保留。

**[25] PMID:35737548 — Psychol Methods 2024（效应量分档）** ｜摘要级
- 引用点：§1.3（分档指南作通用刻度）；§4.2（"效应量分档基准[25]下 β=0.08–0.09 属小效应"）。
- 原文位置：Abstract（CLPM 与 RI-CLPM 合并基准 .03（small）/.07（medium）/.12（large）；CLPM 分布 25/50/75 分位 .03/.07/.12）。
- 比对：**misleading**——按原文基准 β=0.08–0.09 高于中档线 .07、属**中等**效应档，初稿"属小效应"为反向陈述；该句直接影响 MDE 结论（β≈0.10）的解读框架。
- 溯源：primary｜必要性：necessary｜状态：clean。建议（首轮）：**必改**：改为"β=0.08–0.09 按 .03/.07/.12 基准属中等档（高于分布中位 .07），MDE β≈0.10 接近大档下沿"。
- **v2.3 复核：已修复（supported）**——§4.2 改为"效应量分档基准[25]（交叉滞后 β：.03 小／.07 中／.12 大）下 β=0.08–0.09 属中等档，MDE β≈0.10 处中等档上沿"，与原文基准一致，反向陈述已纠正。

**[50] doi:10.1080/10705511.2020.1821690 — Usami 2020, SEM（单作者）** ｜摘要级（OpenAlex）。原文位置：Abstract（GCLM 与 RI-CLPM 交叉滞后参数解释差异、统一框架下模型选择）。比对：**supported**（单作者 Satoshi Usami 核实）。状态：clean。建议：保留。

**[51] doi:10.1080/10705511.2020.1784738 — Mulder & Hamaker 2020, SEM** ｜摘要级。原文位置：Abstract（三扩展：person-level predictors/outcomes、multiple-group、multiple indicators；lavaan/Mplus 代码）。比对：**supported**（个体层预测因子与多组＝调节处理的规范路径）。状态：clean。建议：保留。

**[52] arXiv:2608.09951 — RI-CLPM 诊断敏感性（预印本）** ｜摘要级（arXiv abs 页摘要）。原文位置：Abstract（power depends jointly on reliability, ICC, waves, sample size, effect size；high ICC, modest reliability, and few waves can substantially reduce power even in large samples；186 empirical applications reviewed）。比对：**supported**（初稿§4.2/§4.3 引用点逐字落地；"三波"具体化为全文级）。状态：clean（OpenAlex 经其 OSF 孪生记录 is_retracted=false）。建议：保留（预印本身份已如实标注）。

**[70] doi:10.1080/10705511.2022.2122467 — Mulder 2023, SEM（powRICLPM）**［评审新增］｜摘要级（OpenAlex）+ Crossref 题录
- 引用点：§4.3/§4.4（高 ICC 削弱功效[52][70]；正式规划以 powRICLPM 核定[70]）。
- 原文位置：Crossref（SEM 30:645-658，在线 2022-11、印刷 2023；作者 Jeroen D. Mulder——初稿题录逐项吻合）；Abstract（RI-CLPM-specific power analysis strategy，powRICLPM R 包；含 measurement error 扩展）。
- 比对：**supported**（工具与规划角色成立；"高 ICC 削弱功效"的直接证据在 [52] 摘要，[70] 承担方法工具角色，初稿并引得当）。溯源：primary｜必要性：necessary｜状态：clean。建议：保留。

### 域D：方法族与推断工具（条 58–69、71、72）

**[58] doi:10.1007/s11336-022-09879-1 — Psychometrika 2023（两步法）** ｜题录级。Crossref：88:1466-1494、2023-12、Usami——题录吻合；勘误 DOI 10.1007/s11336-022-09890-6 经 Crossref 确认存在（"Erratum to: Within-Person Variability Score-Based…"）。功能性主张（显式 DGP 两步法、时变处理联合效应）由题名直接支撑。状态：**corrected**（初稿已标注引用更正后版本）。建议：保留（维持更正标注）。

**[59] arXiv:2202.11612 — 面板 Granger 非因果**｜题录级。arXiv 页题名逐字吻合；OpenAlex（10.48550/arxiv.2202.11612）is_retracted=false。比对：supported（题录级）。状态：clean。建议：保留。

**[60] arXiv:2508.10342 — 两阶段 LM-Wald**｜题录级。arXiv 页存在、题名吻合。OpenAlex 无该 arXiv DOI 记录；PubMed 不收录；RW 库不可用 → 状态：**unknown**（arXiv 页无撤回标记）。比对：supported（题录级：两阶段 LM-Wald 诊断面板因果模型序贯可忽略性）。建议：保留；状态按 unknown 如实标注。

**[61] doi:10.1007/s11336-024-09973-6 — PIMA, Psychometrika 2024**｜摘要级（OpenAlex）。原文位置：Abstract（multiverse analysis descriptive only → sign flipping score test 推断程序）；作者 Girardi/Vesely/Lakens 核实。比对：**supported**。状态：clean。建议：保留。

**[62] arXiv:2308.04963 — 缺失数据图因果指南**｜题录级（OpenAlex is_retracted=false；题名含 Teacher's Aides and Adolescent Mental Health）。比对：supported（题录级）。状态：clean。建议：保留。

**[63] arXiv:2608.23508 — 刷新样本 MAR 检验**｜题录级（OpenAlex false；题名 Testing selection on observables...with refreshment samples）。比对：supported（题录级）。状态：clean。建议：保留。

**[64] doi:10.1007/s11336-024-09984-3 — 序数状态空间, Psychometrika 2024**｜摘要级（OpenAlex）。原文位置：Abstract（ordinal/Likert 测量的 state-space 一般估计）。比对：**supported**。状态：clean。建议：保留。

**[65] arXiv:2410.14459 — 方差成分贝叶斯因子**｜题录级（OpenAlex false；题名 To Vary or Not To Vary...Testing Variance Components）。比对：supported（题录级）。状态：clean。建议：保留。

**[66] arXiv:2510.14044 — multi-VAR**｜题录级。arXiv 页存在、题名吻合（Joint modeling and inference of multiple-subject high-dimensional sparse VAR）。OpenAlex 无记录 → 状态：**unknown**（同条 60 口径）。比对：supported（题录级：共享/个体特异路径分解）。建议：保留；状态 unknown 如实标注。

**[67] arXiv:2603.04003 — DSEM 状态空间边缘化**｜题录级（OpenAlex false）。比对：supported（题录级）。状态：clean。建议：保留。

**[68] arXiv:2512.11063 — umx 4.5**｜题录级（OpenAlex false；题名含 CLPM、MR-DoC）。比对：supported（题录级）。状态：clean。建议：保留。

**[69] doi:10.11201/jjdp.33.267 — 発達心理学研究 2022**｜题录级。J-STAGE（DOI 内容协商）：発達心理学研究 33:267-286、2022 年、作者宇佐美（Usami）——初稿题录吻合；OpenAlex 记 2026 系索引异常，以 Crossref/J-STAGE 为准。比对：supported（题录级：个体内关系推断模型的系统梳理）。状态：clean。建议：保留。

**[71] doi:10.1111/j.1467-9531.2007.00180.x — von Hippel 2007, Sociol Methodol**［评审新增］｜题录级（Crossref：37:83-117、2007、von Hippel——逐项吻合）。题名 "Regression with missing Ys: an improved strategy for analyzing multiply imputed data" 直接支撑"插补后删除"主张。状态：clean。建议：保留。

**[72] doi:10.1111/j.1467-9531.2009.01215.x — von Hippel 2009, Sociol Methodol**［评审新增］｜题录级（Crossref：39:265-291、2009、von Hippel）。题名 "How to impute interactions, squares, and other transformed variables" 直接支撑"插补模型遗漏交互项的经典衰减"归因。状态：clean。建议：保留。

### 域E：测量（条 35–39）

**[35] PMID:24391787 — Kwon et al. 2013, PLoS ONE（SAS-SV）**｜摘要级（界值细节与白名单 PMC 全文核对一致）。原文位置：Abstract（10 题、α=0.911、男 cut-off 31/AUC 0.963/sens 0.867/spec 0.893、女 33/AUC 0.947/sens 0.875）。比对：**supported**（§2.3、§4.2、§4.3 全部数值吻合）。状态：clean。建议：保留。

**[36] PMID:26653055 — Psychol Assess 2015（PSQI 青年适配）**｜摘要级。原文位置：Abstract（adapt PSQI for adolescents and young adults；14–24 岁社区样本 N=216；单因子、α=.72）。比对：**supported**（初稿仅作"适配证据"引用，未引具体数值）。状态：clean。建议：保留（注：证据样本为 14–24 岁西班牙社区，可补充说明）。

**[37] PMID:36947534 — PLOS ONE 2023（性别等值性）**｜摘要级。原文位置：Abstract（1,112；college students；scalar 级等值由 "psychometrically robust...gender-based invariance...meaningful comparisons" 支撑）。比对：**supported**——注：样本为大学生，作为 12–18 岁模拟队列的测量前提是外推，建议在变量字典处注明。状态：clean。建议：保留。

**[38] PMID:32682269 — Addict Behav 2020（巴西验证）**｜摘要级。原文位置：Abstract（α=0.81、ω=0.78、ICC 0.846、n=451、13.1±1.22 岁、ROC 33）。比对：**supported**（§2.3 重测信度、§4.3 α 区间 0.81–0.91 吻合）。状态：clean。建议：保留。

**[39] PMID:26685805 — Addict Behav 2017（西/法语版）**｜摘要级。原文位置：Abstract（西/法语改编、α .88/.90、跨文化）。比对：**supported**——其中"跨文化**界值差异**"提法未见摘要（全文付费墙）；跨文化改编与信效度成立。状态：clean。建议：保留；界值差异句如需保留应取全文或改述为"跨文化版本与测量等价性"。

### 域F：综合证据与上游（条 1–6、53–57）

**[1] doi:10.1016/j.dr.2020.100897 — Dev Rev 2020（系统综述）**｜摘要级（Semantic Scholar；OpenAlex/Crossref 题录：Mac Cárthaigh, Griffin, Perry，2020）
- 引用点：§1.1（"证据以横断面为主、纵向稀少但支持双向关联假说……并明确呼吁三波及以上设计[1]"）；§4.2。
- 原文位置：Abstract（9 项研究；weak-to-moderate correlation between sleep quality and quantity and PSU；findings tentative until...objective measures and experimental designs）。
- 比对：**overstated**——摘要支持"9 项研究、弱到中度相关、结论暂定、需客观测量与实验设计"；"支持双向关联假说"与"呼吁三波及以上设计"未见于摘要（全文付费墙未核；白名单finding亦断言该呼吁，未能独立复核）。
- 溯源：primary（以综述身份被引）｜必要性：necessary（空白界定文献）｜状态：clean（OpenAlex false）。
- 建议（首轮）：**改写陈述**为摘要可支撑口径（"系统综述判定证据暂定、需客观测量与实验设计"），或取得全文后再保留"呼吁三波"表述。
- **v2.3 复核：已修复（supported）**——§1.1 改为"纳入 9 项研究……弱到中度……暂定……需要客观测量与实验设计"，§4.2 同口径；参考文献补作者（Mac Cárthaigh, Griffin, Perry）与卷号 55:100897 并标注"正文仅按摘要级口径引用"。

**[2] PMID:32903205 — J Behav Addict 2020（大学生元分析）**｜摘要级。原文位置：Abstract RESULTS（40 studies/33,650；anxiety 0.39/0.34–0.45；depression 0.36/0.32–0.40；impulsivity 0.38/0.28–0.47；sleep quality 0.28/0.22–0.33）。比对：**supported**——§1.1 四个 r 与 CI 逐字吻合（评审轮的 r=0.28 订正属实）。状态：clean。建议：保留。

**[3] PMID:37713408 — PLoS ONE 2023（医学生元分析）**｜摘要级。原文位置：Abstract（16 studies/9,466；SAS-SV×PSQI 0.30/0.24–0.36；duration 0.27/0.18–0.36；患病率 39%/0.30–0.50；均分 31.11/29.50–32.72）。比对：**supported**。状态：clean。建议：保留。

**[4] doi:10.1016/j.psychres.2019.112686 / PMID:31757638 — Psychiatry Res 2020（构念元分析）**｜摘要级（非 OA）
- 引用点：§1.1（"针对问题性使用构念的元分析得到量级相近的中等正相关[4]"）；§4.2（"构念元分析[4]"）。
- 原文位置：Abstract（14 studies；"We calculated **odds risk** and 95% CIs"；significantly increased **risks** of poor sleep quality, depression, and anxiety）。
- 比对：**misleading**——该元分析合并的是**比值比（OR）**而非相关系数，摘要无任何 r 值；"量级相近的中等正相关"把效应量类型张冠李戴（"与 r=0.28–0.30 量级相近"的语境加深误导）。
- 溯源：primary｜必要性：necessary（构念层 PSU 证据点，不可删）｜状态：clean。
- 建议（首轮）：**改写陈述**："针对问题性使用构念的元分析（14 项研究，合并 OR）同样显示 PSU 与差睡眠质量、抑郁、焦虑风险升高"——或直接改用 [5] 的睡眠 OR=2.60（1.39–4.85）支撑量级。
- **v2.3 复核：已修复（supported）**——§1.1 改为"以合并比值比（OR）报告其与睡眠质量差的关联、未给合并相关系数[4]"，与摘要（"calculated odds risk…increased risks"）一致；[5] 句内新增睡眠 OR=2.60（1.39–4.85），经与 [5] 摘要比对无误（标注"引文深审轮核录"）。

**[5] PMID:31779637 — BMC Psychiatry 2019（患病率元分析）**｜摘要级＋更正通告全文
- 引用点：§1.1（41 项/41,871、仅 3 项队列、中位患病率 23.3%（14.0–31.2）、抑郁 OR=3.17（2.30–4.37）、焦虑 3.05（2.64–3.53））；§3.7 表 9 注、表 11 注（23.3% 对照）。
- 原文位置：Abstract 逐字吻合（另：poor sleep quality OR=2.60, 1.39–4.85——初稿未引，见条 4 建议）；esummary 出版类型正常、无撤稿；两条更正通告（PMID 31842813、33482751）**均经全文读取确认只更正作者名**（Samantha Sohn→Sei Yon Sohn 等），无数值改动。
- 比对：**supported**（初稿"以两条更正通告后的版本为准"的标注与实际相符）。溯源：primary｜必要性：necessary｜状态：**corrected**（非数值性更正）。建议：保留。

**[6] doi:10.1001/jamapediatrics.2016.2341 / PMID:27802500 — JAMA Pediatr 2016**｜摘要级（PMC5380441 可全文，本轮摘要已足）
- 引用点：§1.1（就寝设备可得/使用与睡眠不足 OR=2.17（1.42–3.32）、差睡眠质量 1.46（1.14–1.88）、日间过度嗜睡 2.72（1.32–5.61））；§4.2。
- 原文位置：Abstract RESULTS 逐字吻合（含 access-only 1.79/1.53/2.27；20 项横断、125,198 名、mean 14.5）。另核：JAMA Pediatr 170(12):1146-1147 同期文章为随刊 **Editorial/Comment**（PMID 27802458），非勘误——本条**无更正**（esummary 更正链接初判有误，已排除）。
- 比对：**supported**。溯源：primary｜必要性：necessary｜状态：clean。建议：保留（初稿未涉"剂量-反应"从句，v2.1 已删，与白名单一致）。

**[53] PMID:42088647 — Neuropsychiatr Dis Treat 2026（限制研究）**｜摘要级。原文位置：Abstract（n=254 男性；SAS-SV 分组；高危组基线晚间使用更长、睡眠卫生/质量更差、日间嗜睡更重；限制后行为性睡眠指标改善而失眠/嗜睡变化有限）。比对：**supported**（初稿"睡眠指标改善"略宽——原文改善限于行为性指标；白名单已作 ROBINS-I serious 降权，初稿用法为"干预旁证"，可接受；建议补"行为性指标"限定）。状态：clean。建议：保留（可加限定词）。

**[54] PMID:40361037 — BMC Psychiatry 2025（抑郁青少年症状网络）**｜摘要级。原文位置：Abstract（'Anxiety and craving' 核心；daytime dysfunction 是受 PSU 影响最重的 PSQI 症状）。比对：**supported**（初稿"仅用于 PSQI 成分结局选择、横断不入方向性证据"的限定得当）。状态：clean。建议：保留。

**[55] PMID:29157587 — Sleep Med 2017（趋势）**｜摘要级。原文位置：Abstract（2009–2015 短睡眠上升 16–17%，新媒体屏幕时间暴露-反应关联）。比对：**supported**。状态：clean。建议：保留。

**[56] PMID:30716511 — Environ Res 2019（出生队列）**｜摘要级
- 引用点：§4.2（"问题性手机使用（MPPUS）与 PSQI 更低主观睡眠质量相关（PR≈1.55），并以腕动计客观睡眠平行验证"）。
- 原文位置：Abstract（MPPUS habitual PR 1.55（1.03–2.33）与**主观**睡眠质量；**客观**结局（睡眠效率、WASO）的显著关联来自**平板使用时长**，非问题性使用维度）。
- 比对：**overstated**——PR 1.55 属实；"以腕动计客观睡眠平行验证"把平板使用的客观关联错挂到问题性使用构念上。
- 溯源：primary｜必要性：necessary（自报/客观差异论点保留价值）｜状态：clean。
- 建议（首轮）：**改写陈述**："同研究中腕动计客观睡眠指标与睡眠效率/WASO 的关联见于平板使用时长而非问题性使用维度——自报与客观测量的分离本身支持初稿'测量误差需显式建模'的论点"。
- **v2.3 复核：已修复（supported）**——§4.2 改为"主观/客观测量口径的分离[56]（问题性手机使用与主观 PSQI 差相关 PR≈1.55，而腕动计客观睡眠指标关联见于平板使用时长、非问题性使用维度）"，与摘要逐点一致。

**[57] PMID:39085034 — BMJ Ment Health 2024（n=69 队列）**｜摘要级。原文位置：Abstract（69 人；β=0.18（0.04–0.32）p=0.013；conclusions 提及 inability to sleep 随 PSU 上升）。比对：**supported**（§4.2 数值与小样本限定吻合）。状态：clean。建议：保留。

### 报告规范与新增条目（条 33、34）

**[33] PMID:30652356 — Morris, White & Crowther 2019, Stat Med**［新增］｜摘要级。原文位置：Abstract（ADEMP：aims, data-generating mechanisms, estimands, methods, performance measures）。比对：**supported**（§2.1 四要素组织与 ADEMP 对应）。状态：clean。建议：保留。

**[34] PMID:30962953 — Baethge et al. 2019, Res Integr Peer Rev（SANRA）**［新增］｜摘要级。原文位置：Abstract（SANRA 六条目量表）。比对：**supported**（标题页与 §2.1/§4.3 用法为"叙述性综述定调"，与量表用途一致）。状态：clean。建议：保留。

### 条 46/47/48/49（补充域）

**[46] doi:10.3390/bs16101828 — Behav Sci 2026（六波 KCYPS）**｜全文级（MDPI 开放网页）
- 引用点：§4.2（"青少年六波研究的多不显著个体内睡眠路径[46]（新文、被引 0）"）。
- 原文位置：Methods（KCYPS 2018 初中一队列、2018–2023 六波、N=2,590；LGCM＋RI-CLPM）；Results（RI-CLPM：higher-than-usual smartphone dependence→suicidal ideation β=0.05 显著；**"no within-person lagged paths involving sleep quality were significant"**）。
- 比对：**supported**（白名单"据来源记录"的 hedge 本轮以全文落实）。溯源：primary｜必要性：necessary｜状态：clean（OpenAlex false；被引 0 与初稿标注一致）。建议：保留。

**[47] PMID:37025017 — J Adolesc 2023**｜摘要级。原文位置：Abstract（Study 1 纵向交叉滞后 PSU→投入/脱离单向；Study 2 学业拖延与睡眠质量中介）。比对：**supported**。状态：clean。建议：保留。

**[48] PMID:40618090 — CAPMH 2025（疲劳桥症状）**｜摘要级。原文位置：Abstract（558 人、三波 6 个月 CLPN；T1–T2 Withdrawal 与 Fatigue 桥症状；T2–T3 网络致密化、Sleep Disturbance 列高影响）。比对：**supported**。状态：clean。建议：保留。

**[49] doi:10.1016/j.chb.2020.106645 — Comput Hum Behav 2021（Boer et al.）**｜摘要级（OpenAlex 重建摘要；Crossref：116:106645、2021-03）
- 引用点：§4.2（"'问题性使用'维度而非总使用时长对心理健康具前瞻预测力[49]"，暴露操作化依据）。
- 原文位置：Abstract（三波 n=2,109、RI-CLPM：SMU problems→decreased mental health one year later, not vice versa；SMU intensity 与心理健康任何方向均无关联）。
- 比对：**supported**（"问题性使用 vs 强度"的对照逐字成立）。状态：clean。建议：保留。

---

## 汇总：问题引用与必改项（首轮；v2.3 状态见"复审计"节：9 条中 7 条已修复，残余 [18] 收窄、[42] 括注新残余；著录项除条 42 外均未修）

| 条 | 判定 | 一句话问题 | 建议动作 |
|---|---|---|---|
| [4] | misleading | OR 元分析被写成"中等正相关" | 改为 OR 口径或改用 [5] 的睡眠 OR |
| [25] | misleading | β=0.08–0.09 按 .03/.07/.12 基准属中档，非"小效应" | §4.2 该句必改 |
| [1] | overstated | "呼吁三波""支持双向假说"超出摘要 | 改写或取全文复核 |
| [11] | overstated | "两模型间不一致且微弱"超出摘要口径 | 改写 |
| [18] | overstated | "波次数/间隔/样本量"三元组未获摘要支撑 | 改写或全文级复核 |
| [19] | overstated＋一处 wrong-context | "单一 CLPM 不可靠"简化失当；"两波证据"句错配（该文≥4波） | §1.3 加限定；§4.2 两波句改引 [17] |
| [41] | overstated | PSU→睡眠在该文为单向，非"互惠" | 改写路径列举 |
| [42] | overstated | 同句"–睡眠互惠"无睡眠→PSU 支点 | 与 [41] 一并改写 |
| [56] | overstated | 腕动计客观关联属平板使用，非问题性使用 | 改写 |

著录必改：[28] DOI 更正为 10.1016/j.chiabu.2023.106065；[22] 补全题名；[12]/[31]/[32]/[40]/[42] 补期刊名。

无撤稿、无编辑关注；[5]/[58] corrected 已如实标注；[60]/[66] 状态 unknown（如实标注，见上）。

*审计产物：本文件。所用接口与页面：PubMed efetch/esummary/PMC OA（技能包装）、OpenAlex works API、Crossref works API 与 DOI 内容协商、Semantic Scholar Graph API、arxiv.org abs 页、mdpi.com 开放全文。Retraction Watch 开放库（api.labs.crossref.org）本轮不可用（持续 400），已在方法节如实声明。*

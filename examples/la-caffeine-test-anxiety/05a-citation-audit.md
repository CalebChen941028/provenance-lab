# 05a 引文深审：初稿 40 条参考文献逐条审计

审计对象：`provenance-lab-output/06-draft.md`（References 1–40 及正文全部引用点）。
审计日期：2026-10-24（R1 初审）；2026-10-24（R2 复核，针对修订稿的 3 处问题引用）。审计人：CiteAudit·引文深审员（provenance-lab S5a）。

> **R2 复核结论**：R1 标记的 3 处问题引用在修订稿中全部关闭——[8]@§2.4 已删引并改内部设计依据、[21]@§4.3 已改为 [17][19]、[30] Fisher 条目已按 OpenAlex 题录更正（W404240460 核验通过）。当前问题引用数为 **0**。详见 §7。

## 1 审计口径

- **取文路径**：PubMed efetch 摘要（pubmed_database 技能包装脚本）→ EuropePMC OA 全文（literature_search_europepmc 技能包装脚本，15/25 条 PMID 命中 OA 子集）→ 期刊站点/出版商页面（6 条 DOI-only 文献）→ Crossref/OpenAlex 元数据（9 条方法学文献）。本任务无私有库本地 PDF 标注条目。
- **文本层级**：fulltext = 开放获取全文（PMC OA 或出版商页面/PDF 全文）；abstract = 摘要级（PubMed 摘要、期刊落地页摘要或 Semantic Scholar 摘要镜像）；none = 只取得元数据、未读到正文文本（仅方法学经典文献与 Fisher 1921）。
- **判定**：supported（原文支持）/ overstated（夸大）/ misleading（误导）/ unsupported（原文不支持）；必要性 necessary / redundant / wrong-context（张冠李戴）。
- **撤稿审计**：三条路径。① OpenAlex `is_retracted`（35 条 A 组条目 34 DOI + 1 无 DOI PMID 全部落地，全部 false）；② Crossref `updated-by` 更新链（34 DOI，无 retraction / expression_of_concern；1 条 correction，见 [37]）；③ EuropePMC 出版类型（14 条 OA 记录，均为 research-article / Journal Article / Review / Meta-Analysis，无 Retracted Publication 或 Expression of Concern）。api.labs.crossref.org/retractions 路径式与查询式端点当日均返回故障包装响应（"Unable to extract known identifier key"），无法使用，故以主 Crossref API 的 `updated-by` 断言替代 Retraction Watch 开放库直查。PubMed 出版类型对 10 条非 OA 记录（2085289、24019267、32845046、25188705、32124627、33730347、34134557、39080966、40304155、41956451）未能直接核验——pubmed 包装脚本不返回出版类型字段，EuropePMC 检索被强制附加 OPEN_ACCESS 过滤；这 10 条以 OpenAlex + Crossref 双源覆盖。
- **结论边界**：只依据本 session 亲眼读到的摘要/全文/接口返回下结论；未读原文的方法学文献按标识符级核验如实降级并标注。

## 2 总体结果

| 项目 | R1 初审（修订前） | R2 复核（修订后） |
|---|---|---|
| 审计引用点 | 43（40 条参考文献；[8]、[21] 各拆 2 个引用点，[30] 另拆 1 条书目勘误项） | 41（[8]@§2.4 与 [21]@§4.3 两个错误引用点已随修订消失，[30] 书目项转为已更正核验） |
| 定位成功 | 43/43（无 untraceable） | 41/41 |
| 最原始源 | 43/43 为 primary（[4][17][18] 为合并估计的原始出处，用法正确） | 41/41 为 primary |
| supported | 40/43 | 41/41 |
| 问题引用 | **3** | **0** |
| 撤稿/关注 | 0 条 retracted、0 条 expression of concern；1 条 corrected（[37] JARS 2018，有正式更正 10.1037/amp0000389） | 同左（复核未发现新状态变化） |

与初稿参考文献注"全部 55 条白名单条目状态核验为 clean"的一致性：本稿实际引用的 31 条 A 组条目全部无撤稿、无编辑关注，该陈述成立；[37] 的更正属 B 组方法学文献且更正既非撤稿亦非关注声明，不与之矛盾，但引用时宜注明。

## 3 逐条明细

格式：**[n] 引用点** ｜ 定位 ｜ 层级 ｜ 原始性 ｜ 原文位置 ｜ 比对 ｜ 必要性 ｜ 状态 ｜ 结论。

### A 组：研究证据（31 条）

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

### B 组：方法学与工具文献（9 条）

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

## 4 问题引用与修订清单（R1 三项 → R2 全部关闭）

1. **[8]@§2.4**（wrong-context）→ **已关闭**：修订稿删除该处 [8]，二分解读规则改由 SAP §4.2 设计解析计算支撑（点二列 r ≈ 0.17、效能 ≈ 0.83 vs 连续 0.94；手算自洽，见 §7）。
2. **[21]@§4.3**（wrong-context）→ **已关闭**：修订稿改为 [17][19]，与引言"女性更高"的实际支撑文献一致。
3. **[30] 参考文献条目**（书目错误）→ **已关闭**：修订稿更正题名与卷期为 Metron 1921;1(4):3-32 并附更正注；注中题录号 W404240460 复验通过。

R1 提出的三项非阻断精度提示在修订稿中未采纳（可选措辞项，不构成问题引用）：[17] 性别/年级亚组差异为数值性（仅 assessment tool 亚组显著），可补"（亚组差异为数值性）"；§1"连续 mg/d 口径的回归证据[2][5][6]"可改"关联证据"（[5][6] 为 Pearson 相关）；[28] 作者署名"Ikram K"宜作"Ikram EHK"。

## 5 未尽事项与边界

- PubMed 出版类型直查仅覆盖 14 条 OA 记录（EuropePMC 通道）；其余 10 条非 OA 记录以 OpenAlex `is_retracted` + Crossref `updated-by` 双源覆盖，未做 PubMed pubtype 直查（包装脚本不返回该字段）。
- api.labs.crossref.org Retraction Watch 端点当日故障（400 "Unable to extract known identifier key"），以主 Crossref API 更新断言替代；对 34 条 DOI 均无 retraction / expression_of_concern 记录。
- B 组 9 条方法学文献均未读到正文（none 级）：[29][32][34][37] 经 Crossref 精确匹配到卷期页码，[30][31] 经 OpenAlex 题录，[33][35][36] 经 Crossref/通行书目；全部为各自方法归属的原始出处。Cohen 惯例数值、Belsley κ 口径等具体数值未逐页核对，属标准归属，投稿版建议补页码。
- [21] Adams 2022 与 [15] 波黑研究未取得全文（非 OA），性别亚组与"频次口径"两点分别以摘要级核验并给出处置建议。
- 初稿 §1"五源检索 87 条候选池…同时调整三协变量研究为零"与 AI 声明"55 条标识符经 API 复验"为上游 02 证据表主张，本次仅复核了初稿实际引用的 40 条，未重跑检索池复验。

## 6 数据与来源

本次审计使用的原文与接口（检索日期 2026-10-24）：

- PubMed efetch 摘要（25 条 PMID，经 pubmed_database 技能脚本）；EuropePMC 检索与全文（PMC13678550、PMC12989166、PMC13401369，经 literature_search_europepmc 技能脚本）。
- 期刊页面/PDF：https://jhrlmc.com/index.php/home/article/view/1256 （[5]）；https://kiss.kstudy.com/Detail/Ar?key=3837189 （[16]）；https://policyjournalofms.com/index.php/6/article/view/2484 （[24]）；https://journal.ipb.ac.id/jgizipangan/article/download/53501/27386/261995 （[28]）；https://www.ovid.com/jnls/japa/fulltext/10.4103/japaj.japaj_30_25 （[26]）；Semantic Scholar DOI:10.56536/sajms.v7i1.119 摘要镜像（[25]，期刊站被 Cloudflare 拦截）。
- 撤稿与状态：OpenAlex `is_retracted`（35 条 A 组）；Crossref 主 API `updated-by`（34 条 DOI，含 [37] 更正 10.1037/amp0000389）；EuropePMC 出版类型（14 条 OA）；Fisher 题名裁决：OpenAlex 题录 + Lehmann (Berkeley TR 541) + Adelaide 数字图书馆 Fisher 文集。

## 7 R2 复核记录（2026-10-24，针对修订稿）

复核范围：R1 三处问题引用在当前 `06-draft.md` 中的处置，及修订是否引入新的引用问题。

- **[8]@§2.4**：修订稿 §2.4"敏感性与探索"段已无 [8] 引用；二分解读规则改挂"SAP §4.2，依据设计解析计算：二分后点二列 r ≈ 0.17、t 检验效能 ≈ 0.83，低于连续口径的 0.94"。[8] 在修订稿中仅剩 §1、§4.2、§4.3 三处用法（R1 均已判 supported）。新增数字为内部设计量，非引用主张；手工近似复核自洽：二分衰减因子 φ(z)/√(p(1−p)) 在 p=0.664 下 ≈0.773，r_pb 区间 0.155（以边际 r=0.20 为基）至 0.193（以骨架 ρ*=0.2496 为基），0.17 在区间内；r_pb=0.17、n=300 双侧 α=.05 时 power≈0.85，与 0.83 同量级；0.94 与稿内 SAP 效能 0.937 一致。Bash 工具当日故障（spawn /bin/zsh ENOENT）未能执行脚本复核，以上为手工计算，精度以 SAP §4.2 原始解析为准。
- **[21]@§4.3**：修订稿该句为"引言引用的女性更高证据[17][19]与生成结构不相容"。[17]、[19] 均为引言 line 55"女性与低年级一致更高[17][18][19]"的实际成员，指向一致，无新错位。
- **[30] 参考文献条目**：修订稿条目为"Fisher RA. On the probable error of a coefficient of correlation deduced from a small sample. Metron. 1921;1(4):3-32"，附更正注。注中 OpenAlex 题录号 W404240460 经 https://api.openalex.org/works/W404240460 复验：题名逐字一致、1921、vol 1、is_retracted false（OpenAlex 页码字段渲染为 1–32，与标准引文 1(4):3–32 同指 vol 1，非原误引的 vol 2）。§4.3"另有四点说明"同步登记该书目错误。
- **其余抽查**：通读修订稿全文比对，除上述三处及 §4.3"两处文字笔误"改"三处文字瑕疵（…Fisher 条目书目错误…）"的对应表述外，未见其他引用点变动；40 条参考文献其余 39 条与 R1 核验状态一致（R2 未重跑撤稿接口，沿用 R1 双源结果；未发现修订引入新的文献）。

R2 结论：三处问题引用全部关闭，当前问题引用数为 0；非阻断精度提示三项维持原判（可选措辞）。

# 05 审计追踪（audit trail）

生成本轮：2026-10-22（审计整理员）。本文件把整条流水线整理为人工校对包：§1 流程图（每节点标注做了什么与为何这么做，关卡节点用菱形）；§2 变量字典（逐条照抄 SAP 的 variables）；§3 分析方法决策表（选择依据照抄 SAP 的 methodRationale，执行情况对照分析的 decisions 与 `04-analysis/decisions-log.md` D1–D26）；§4 引文深审明细（照抄 `05a-citation-audit.md` 逐条判定）；§5 各关卡结论一览；§6 人工校对指引；§7 免责声明。全部内容取自工作区真实文件与本轮结构化输入，未添加未发生事项、未美化结论。

---

## 1 流程图

**Figure 1** provenance-lab 流水线全景（矩形＝处理步骤，菱形＝关卡/判定）

```mermaid
flowchart TD
    A["① 五源系统检索<br/>PubMed／EuropePMC／OpenAlex／Semantic Scholar／arXiv（2026-10-17/18）<br/>做了：多组检索式、去重后 86 条唯一记录＋每源 20 条短名单｜为何：穷尽检索是证据综合的前提，防选择性引用"]
    B["② 01 立题书 v2.1<br/>做了：研究问题重构为四场景 DGM 下的模板性能命题；冻结四场景参数（Table 4）、校准系数（Table 5）与假设 H1–H4｜为何：单场景检验自身生成机制属循环论证，判别力只能在不同真值世界间评估"]
    C["③ 02 证据表 v2.1<br/>做了：五源 100 条候选两级去重＋资格筛选；证据按校准／判别力／调节范例／模板配套四层组织（SANRA 定调）｜为何：每个模拟参数须可溯源至已核实文献"]
    G1{"关卡：引文核查<br/>结论：通过<br/>据此删除 02 中不获文本支持的剂量-反应从句（v2.0 修订记录）"}
    D["④ 03 SAP v2.1 冻结（2026-10-18，先于任何模拟数据生成）<br/>做了：变量字典（Table 3）、方法依据（Table 10）、性能判定（Table 5）、种子方案（Table 6）预登记｜为何：固定估计目标与解释路由，杜绝结果导向的再解释"]
    E["⑤ 04-analysis 执行环境<br/>做了：锁定 R 4.6.1＋lavaan 0.7.3＋mice 3.19（D1）；v1.x 旧产物隔离 _v1_archive/（D2）｜为何：lavaan 为 SEM 等式约束＋FIML＋MLR 的金标准；新旧产物隔离防污染"]
    F1["01_calibrate 校准<br/>做了：n=10⁶ 超总体逐项复核＋targets.json 冻结；校准种子取区间外（D3）｜为何：保证所报 DGM＝所跑 DGM"]
    G2{"关卡：校准 §10.1 硬门槛<br/>结论：除 S1–S3 观测自相关四子项越出（SAP Table 1 文本不自洽→v2.1 勘误①，表 R1 双口径呈现）外，其余子项全部通过（D23）"}
    F2["02 Cell A<br/>做了：4 场景×1,000 次重复×（CLPM＋RI-CLPM＋S*1/S*2/S*4/S*5/S*7）＋双分类器｜为何：H1/H2/H3 性能与场景判别的主体"]
    F3["03 Cell B/C<br/>做了：调节功效三设定（ΔR²=0.005/0.0075/0.010）＋经验 α 与 FWER，含 CC 参考列（D9）｜为何：H4 调节检出与 I 类错误控制"]
    F4["04 Cell D<br/>做了：M1 非随机缺失×{FIML/MI/IPW/完整个案}四处理器对比｜为何：量化缺失处理器的偏差—覆盖—效能"]
    F5["05 S*6 堆叠双区间；06 MDE 网格（H3/H4 功效不足时条件触发）<br/>为何：S*6 检验堆叠策略前提；MDE 服务真实队列样本量规划"]
    F6["07 演示集<br/>做了：种子=B 的 STROBE 式队列模板与全套预登记诊断｜为何：描述与推断分层，模板呈现不污染性能汇总"]
    F7["08/08b 汇总<br/>做了：表 R1–R8b＋图 F1–F4；R5b 补 f²／简单斜率／Holm 调整 p（D26）｜为何：JARS 报告项补齐"]
    F8["09_verify 判定<br/>做了：H1–H4 判定汇总＋§3.5 解读网格路由（CLPM×S4 违例→情形 1：违例即判别信号）｜为何：解释路由在数据生成前固定"]
    R["复现性验证<br/>做了：run_all.sh 完整重跑（2026-10-19 07:36→10-20 11:46，退出码 0）；targets.json 与表 R2 的 MD5 首跑 vs 重跑逐位一致｜为何：种子确定性下字节级可复现"]
    G3{"关卡：统计审稿 第 1 轮（2026-10-20）<br/>结论：minor-revision<br/>意见 1–4：MDE 网格不同构／MI 结论错误／ANCOVA 目标推导错误／校准表述不实"}
    FIX1["修订重跑：run_mde_fix.sh（D22 同构网格）＋D18 ANCOVA 目标勘误＋D23 校准表述更正与 SAP 升 v2.1｜为何：审稿发现属实质错误，须修复并重跑而非辩解"]
    H["图件规范化轮（2026-10-21）<br/>做了：8 图按 Nature 规范重绘至 figures-polished/，统计数值零改动；订正 demo_fig2 维度索引（D24）｜为何：原图 CJK 字体缺失不可用；呈现层错误须与统计层分离处理"]
    G3b{"关卡：统计审稿 第 2 轮（2026-10-21）<br/>结论：M1 调节 DGP 实现勘误等<br/>（lib_dgp.R:145 重复计入 b_pu）"}
    FIX2["修订重跑：run_d25_fix.sh（03→09，γ 重校准）＋D26 报告项补齐｜为何：所报 DGM 与执行不符违反 Morris 规范，须勘误＋重跑留痕"]
    I["06 初稿（v2.0→v2.3）<br/>做了：Morris 规范主体＋STROBE 队列式骨架的结构式报告；两轮同行评审＋答辩拷问＋引文深审的修订均落稿｜为何：模拟演示稿与真实数据迁移模板双定位"]
    G4{"关卡：同行评审（2 轮）<br/>结论：遗留 11 项<br/>（处理状态逐项登记于 06 §4.5 L1–L10）"}
    G5{"关卡：答辩拷问（十问）<br/>结论：7 问待补<br/>（07-rebuttal 未答事项 7 条，各注明所缺条件）"}
    G6{"关卡：引文深审（2026-10-22，含 v2.3 复核轮）<br/>结论：72/72 条定位无幻觉引用；首轮问题 9 条→v2.3 后残余 2 条（[18][42]）＋著录必改项；关卡口径：18 条遗留 2 条（明细 05a）"}
    J["08 文献 PDF 归档<br/>做了：51/72 条下载（开放获取渠道），文件头尾与大小三重校验｜为何：引文可核验性的物理凭证；未绕过任何付费墙"}
    K["00/05 审计整理（本包）<br/>做了：目录树核实、变量字典与方法依据照抄、引文判定转录、关卡结论与校对指引汇编｜为何：供研究者逐一快速核对，防 AI 幻觉导致学术不端"]
    A-->B-->C-->G1-->D-->E-->F1-->G2-->F2-->F3-->F4-->F5-->F6-->F7-->F8-->R
    R-->G3-->FIX1-->H-->G3b-->FIX2-->I-->G4-->G5-->G6-->J-->K
```

执行链各步的一键重跑入口为 `04-analysis/run_all.sh`（校准→Cell A→Cell B/C→Cell D→S\*6→MDE→演示集→汇总→判定，任一步非零退出即中止）；两轮审稿触发的定向重跑为 `run_mde_fix.sh` 与 `run_d25_fix.sh`。

---

## 2 变量字典（照抄 SAP 的 variables，未改写）

来源：结构化输入随 SAP 交付的 variables 数组（与 `03-sap.md` §2.1 Table 3 同构）。列含义：「数据来源列」指模拟数据生成端的列名；「变换规则」为生成端到分析端的全链变换。

**Table 1** 变量字典（17 条，逐条照抄）

| 变量 | 操作定义 | 来源列 | 变换规则 | 选取理由 |
|---|---|---|---|---|
| `sim_id` | 个体标识符 | DGP主键 | 无 | 宽长转换与合并键；不进模型 |
| `psu_t0–psu_t2` | SAS-SV总分（10条×1–6，10–60，高分=更问题性），三波 | DGP潜层`z_psu_t*` | 33+6.5·z截断[10,60]；分析端重新z化为`psu_z_t*` | 系统变量/暴露；SAS-SV为青少年验证工具且带发表界值，直接可比的双向先例（A1/PMID 34299887）即用SAS-SV。排除候选：总屏幕时间/社交媒体时长（构念稀释，伞状综述证据显示问题性使用效应更强） |
| `psqi_t0–psqi_t2` | PSQI全球分（0–21，高分=睡眠质量差），三波；全篇方向约定载体 | DGP潜层`z_psqi_t*` | 7+2.5·z截断[0,21]；分析端重新z化 | 主结局构念；多维连续口径；高分=差的方向约定统一全部假设符号 |
| `psu_high` | PSU高危二分（界值敏感性分析的暴露口径） | `psu_t0`＋`sex` | 男≥31、女≥33（Kwon 2013发表界值） | 敏感性S*1对照口径（A5先例）；不进入确证性能判定 |
| `bscs_z` | 简版自我控制量表z分（13条，高分=自控强） | DGP `bscs`（与psu₀相关−0.25） | z标准化 | 确证层调节；高自控削弱成瘾→睡眠通路为最直接先例（02 C层） |
| `bps_z` | 就寝拖延量表z分（9条，高分=更拖延） | DGP `bps`（psu₀ +0.30、psqi₀ +0.20） | z标准化 | 确证层调节（01 Table 6冻结角色）；不作为协变量——位于PSU→睡眠通路上，调整中介会错估总效应（02 F层中介证据） |
| `rmeq_z` | 简版时型量表z分（5条，高分=晨型） | DGP `rmeq`（psqi₀ −0.15） | z标准化 | 探索层调节（时型×睡眠时长调节先例，02 C层） |
| `pmr_z` | 父母就寝前一小时媒介规则强度z分 | DGP `pmr`（psu₀ −0.15） | z标准化 | 探索层调节（保护因素边界条件先例） |
| `sex_female` | 性别（0=男，1=女） | DGP `sex`（Bernoulli 0.5；psqi₀ +0.10、psu₀ −0.05） | 0/1编码 | 探索层调节＋协变量；A3性别多组先例 |
| `school_hs` | 学段（0=初中，1=高中） | `age`派生 | age≥15→1 | 探索层调节；排除候选：年级（与年龄/学段高度共线，学段口径已覆盖） |
| `age_t0`/`age_z` | 基线年龄（岁，12–18） | DGP `age`（截断正态N(15,1.8)） | z标准化 | 协变量；排除其调节角色（与学段信息重叠且无独立先例） |
| `phq9_z` | PHQ-9总分z分（0–27，高分=抑郁重） | DGP `phq9`（psu₀ +0.20、psqi₀ +0.15） | z标准化 | 协变量（第三变量定位，01 PECO注二）；排除其调节角色——既有证据为中介/共病路径（A2），且调节族扩容摊薄Holm功效 |
| `parent_edu_z`/`famstruct` | 父母受教育年限z分／两亲家庭指示 | DGP `paredu`/`fam`（两亲Bernoulli 0.8） | z／0-1 | 协变量（01 Table 6冻结协变量集） |
| `r_t1`/`r_t2` | 波次应答指示（1=应答）；r_t2为IPW倾向模型结局 | DGP缺失过程（主MCAR 12%/20%；M1 logit +0.30×psu_z0） | 无 | 缺失机制描述与IPW构建；不进结局模型 |
| `w_ipw` | 稳定化逆概率权重 | 倾向logit于基线观测集派生 | 稳定化；截断于1/99百分位 | IPW敏感性分析权重（S*3） |
| `psu_z_t1×M_z` | 调节交互项（调节模块主检验参数载体） | 分析脚本派生 | 中心化乘积 | 01 §3.3冻结的中心化乘积口径；z×z缓和非本质共线 |
| `sleep_dur`/`psqi_c_daydys`/`psqi_c_subj`（模板占位） | 睡眠时长、PSQI日间功能障碍与主观睡眠质量成分分 | 不生成 | — | 01 PECO次要结局的模板占位——真实数据迁移时按本模板口径补入；本轮不模拟（不改变H1–H4估计目标，避免无信息单元格扩张）。另排除：卧室手机可用性（通路下游变量，调整会阻断总效应）、GAD-7作调节（证据为中介角色且摊薄功效）、周末补觉（与睡眠时长机械相关） |

---

## 3 分析方法决策表

「选择依据」列逐条照抄 SAP 的 methodRationale（方法名与其后论证原文）；「执行情况」对照分析的 decisions 与 `04-analysis/decisions-log.md`（D1–D26）。

**Table 2** 方法—依据—执行对齐表（18 条）

| 方法 | 选择依据（SAP methodRationale 照抄） | 执行情况（decisions／decisions-log） |
|---|---|---|
| 多场景DGM蒙特卡洛（4场景×1,000重复） | 判别力只能在不同真值世界间评估，单场景检验自身生成机制属循环论证——不采用单场景模拟或真实数据直接分析。 | 已执行：run_all.sh 01–09 全链（2026-10-19 07:36→10-20 11:46，退出码 0）；D2 旧产物隔离；D4 S1–S3 自相关双口径披露；D5 S4 条件正态分解构造 |
| CLPM主估计器（平稳约束＋MLR＋FIML） | 与校准来源（台湾CLPM系数）同构，结构真值=校准值、与先行文献可比——不采用仅RI-CLPM（与两波文献不可比且自身性能需对照基准）。 | 已执行（lavaan 实现，D1）；CLPM×S4 预期违例按 D16 字面计入 H2 并经 §3.5 路由 |
| RI-CLPM竞争估计器 | 个体间/个体内分离是区分S1与S4的唯一途经（Hamaker 2015）；A3/A4/A7/A9三波先例——不采用仅CLPM（稳定特质混淆，正是被检验的批评）或GEE/混合模型（不输出交叉滞后参数）。 | 已执行；D15 显式正交约束（df=7）；S*5 降级路径触发执行（D10，S1–S3 负方差率 0.733–0.746>5%，固定 0 重估） |
| S1–S3无随机截距、S4有（观测矩恒等原则） | 文献立场到DGM的清洁映射，四场景观测层一阶矩可比——不采用四场景统一加随机截距（CLPM在S1–S3亦混合偏倚，主估计器定位失效且校准系数含义不可知）。 | 已执行（D5 条件正态分解修复矩破坏）；超总体伪真值 0.1058/0.1002 对照预登记 0.106/0.102 于容差内 |
| 两估计器对称滞后1平稳约束 | 三波RI-CLPM识别所需且保证可比性（唯一差异=随机截距）——不采用不对称约束或均释放（S*4单独量化释放后果）。 | 已执行；S*4 释放后 SE 膨胀比恒为 1.414（=√2，自由参数翻倍的理论值）量化呈现（表 R8） |
| 性能指标族＋混淆矩阵（Morris框架） | 偏差/覆盖/α/功效分别对应H1–H3，混淆矩阵直接回答判别力——不采用单一指标。 | 已执行（表 R2–R5、R4 混淆矩阵）；H2 汇总曾误跳过 CLPM×S4，D16 修复为按 Table 5 字面并重出表 |
| 精确二项容差[37,64]/1,000 | R=1,000下经验率的精确接受域——不采用正态近似或无概率依据的宽容带。 | 已执行（H2/H4 判定口径）；09_verify 的 H4 判定原读取不存在的 pass 列，改为现算精确二项容差（L1，随 D25 连带修复） |
| Holm（m=2）＋FWER判定、BH仅探索层 | 确证层FWER控制且一致优于Bonferroni——不采用Bonferroni或确证层用BH。 | 已执行（表 R5）；MI 口径 FWER=0.010/1,000 越出容差（保守方向）如实报告，H4 的 H0 成立；探索层 BH q 值按描述层报告 |
| 场景判别＝RI-CLPM路径显著性组合的预登记分类器 | 与研究问题一一对应、无调参——不采用信息准则选择（比较拟合而非机制）。 | 已执行（表 R4 混淆矩阵：RI-CLPM 准确率 0.783（95%CI 0.770–0.796）、CLPM 0.725） |
| 调节载体＝OLS滞后回归（T1→T2）＋HC3＋MI | 立题书§3.3冻结的『滞后回归』口径，透明可迁移——不采用SEM内交互（三波识别复杂、迁移门槛高）或多层调节模型（超出必要复杂度）。 | 已执行；D8（单调缺失下 mice 构造性剔除应答指示，插补集移除该二列）；D9（MI 交互稀释按 SAP 字面执行主口径，Cell B/C 并列 CC 参考列） |
| ΔR²主设定0.0075＋端点单元格 | 区间中值代表＋边界显式呈现（立题书Table 5指示原样执行）——不采用只取宽松端或保守端。 | 已执行（0.005/0.0075/0.010 三设定＋D11 网格八点取值） |
| FIML（SEM载体）＋MI（OLS载体）分治 | 各自框架内MAR下的全信息方法——不采用全框架MI或完整个案为主策略（M1下偏倚，Cell D演示）。 | 已执行（Cell D 四处理器对比）；SAP『完整个案偏差』预期未获支持（四处理器全部无偏，|bias|≤0.0022），按预登记框架如实报告为方法学发现 |
| IPW稳定化＋截断 | 立题书指定敏感性估计器，截断控制权重方差——不采用未截断IPW或仅报告MAR结果。 | 已执行；D14（lavaan 0.7.3 sampling.weights 仅接受 character 形式）；截断率 0.021、最大权重 1.39 |
| 非收敛＝未拒绝计入分母 | 保守化功效、不放大I类错误、防选择性剔除——不采用剔除非收敛重复或重试换起点。 | 已执行（收敛率 1.000，表 R8；无重复需剔除） |
| MC功效R=1,000＋MDE预登记网格 | 组合模型无封闭式功效，DGP全知使经验功效直接可得，不足时MDE服务真实队列规划——不采用查表近似或事后补网格。 | 已执行；H3 RI-CLPM 正向两格 0.701/0.743 不足触发 Cell F；MDE 网格首版 DGP 不同构（低估约 12%），D22 修复为与 Cell B 同构并重跑（同构版 MDE(ΔR²)=0.00786、β 口径 CLPM 0.05/RI 0.10） |
| ANCOVA条件变化仅作敏感性 | 两波式口径的对照价值（演示其无法排除S4）——不采用其为主分析（正是批评所指向的口径局限）。 | 已执行（S*2，表 R6）；S4 目标 0.102 为 SAP 推导错误，D18 勘误为 0.1149（矩阵复算）并重出表（S4 bias 由 +0.013→+0.0002） |
| 演示集与性能单元格隔离 | 描述与推断分层，模板呈现不污染性能汇总——不采用以单次实现演示性能。 | 已执行（07_demo 产出 demo_* 表图，不入 R2–R5 性能汇总） |
| CLPM×S4预期违例与解读网格预登记（§3.5） | 在数据生成前固定H1/H2结果的解释路由——杜绝结果导向的再解释。 | 已执行（09_verify 路由为情形 1：CLPM 在 S4 复现伪真值 0.1068/0.1021、1,000/1,000 误判，违例即判别信号本身） |

补充：两条 SAP 预期违背（MI 插补模型与交互分析不相容；Cell D 完整个案无偏）均按预登记框架如实报告，未做事后调参或选择性呈现（结构化输入 decisions 末条）。

---

## 4 引文深审明细表（照抄 05a 逐条判定）

来源：`05a-citation-audit.md`（2026-10-22 首轮＋v2.3 复核轮）。核对层级：全文级／摘要级／题录级；判定图例：supported（原文支持）／overstated（夸大）／misleading（误导性引用）／unsupported（原文不支持）；必要性：necessary／redundant／wrong-context；状态：clean／corrected／unknown。「未单列」指 05a 该条未单独标注该字段。总体口径（05a 原文）：72/72 条全部定位到真实文献，无幻觉引用；无撤稿/编辑关注；[5][58] 为 corrected（更正内容均非数值性），[60][66] 状态 unknown（如实标注）。

**Table 3** 引文深审逐条明细（72 条）

| 条 | 文献 | 核对层级／溯源 | 原文位置 | 准确性（首轮→v2.3 复核） | 必要性 | 状态／备注 |
|---|---|---|---|---|---|---|
| [1] | Dev Rev 2020（系统综述） | 摘要级（Semantic Scholar；OpenAlex/Crossref 题录）｜溯源 primary（以综述身份被引） | Abstract（9 项研究、weak-to-moderate、tentative） | 首轮 overstated（"呼吁三波""支持双向假说"超出摘要）→已修复 supported（§1.1 改按摘要口径，补作者与卷号 55:100897） | necessary（空白界定文献） | clean |
| [2] | J Behav Addict 2020（大学生元分析） | 摘要级 | Abstract RESULTS（40 研究，四个 r 与 CI） | supported（§1.1 数值逐字吻合） | 未单列 | clean |
| [3] | PLoS ONE 2023（医学生元分析） | 摘要级 | Abstract | supported | 未单列 | clean |
| [4] | Psychiatry Res 2020（构念元分析） | 摘要级（非 OA）｜溯源 primary | Abstract（合并 odds risk） | 首轮 misleading（OR 被写成"中等正相关"）→已修复 supported（§1.1 改为 OR 口径） | necessary（构念层 PSU 证据点，不可删） | clean |
| [5] | BMC Psychiatry 2019（患病率元分析） | 摘要级＋更正通告全文｜溯源 primary | Abstract（两条更正通告全文读取，均只更正作者名） | supported（"以更正后版本为准"的标注与实际相符；新增睡眠 OR=2.60 经比对无误） | necessary | corrected（非数值性更正） |
| [6] | JAMA Pediatr 2016 | 摘要级（PMC5380441）｜溯源 primary | Abstract RESULTS（OR 逐字吻合；同期 170(12):1146-1147 经核为随刊 Editorial，非勘误） | supported | necessary | clean |
| [7] | Chen & Wu 2021, IJERPH（台湾两波） | 全文级（PMC8306125）｜溯源 primary | Abstract；Results 第 2 段；Table 2 | supported（Table 1 全部冻结系数逐字吻合；"男女一致"为摘要原句，按摘要口径引用） | necessary（S1 场景全部系数唯一锚点） | clean |
| [8] | Oh & Heo 2025, Sci Rep（韩国三波） | 全文级（PMC12835080）｜溯源 primary | Abstract；Discussion 第 1/3 段（"no significant lagged effect of smartphone overdependence on sleep quality"） | supported（S3"仅反向"映射成立） | necessary | clean |
| [9] | ABCD 2026, Am J Prev Med | 摘要级｜溯源 primary | Abstract METHODS/RESULTS（N=8,119、11–12 岁、Year 2→3） | supported（初稿自标"年龄处 PICO 下界外，S2 仅取方向"恰当） | necessary | clean |
| [10] | Lee et al. 2017, J Korean Med Sci | 摘要级｜溯源 primary | Abstract（基线排除设计、GEE、高分升高差睡眠质量风险） | supported | necessary | clean |
| [11] | Yu 2025, Psychol Health（六波双队列） | 摘要级（非 OA）｜溯源 primary | Abstract RESULTS（"inconsistent effects on sleep duration…minimal effects on BMI"） | 首轮 overstated（"微弱"系对 BMI 的表述）→已修复 supported（"跨波效应表现不一致"按摘要口径；"微弱"已删） | necessary | clean |
| [12] | BMC Psychology 2026（三波 n=6,153） | 摘要级｜溯源 primary | Abstract（within-person 抑郁→PSU 与睡眠；PSU–睡眠无稳定双向） | supported（含 n=6,153 用于 MDE 折算） | necessary | clean；期刊名未补（笔记级遗留） |
| [13] | J Youth Adolesc 2024（孤独感） | 摘要级｜溯源 primary | Abstract（loneliness→PSU 单向非互惠） | supported | necessary | clean |
| [14] | Hamaker et al. 2015 | 摘要级 | Abstract（trait-like stability→滞后参数不代表个体内传递；random intercepts 分离） | supported（核心机制逐点吻合） | 未单列 | clean |
| [15] | Child Dev 2017 | 摘要级 | Abstract（weighted—and typically uninterpretable—amalgam） | supported | 未单列 | clean |
| [16] | Psychol Methods 2024 | 摘要级 | Abstract（"Can cross-lagged panel modeling be relied on…? the answer is no"；fit issues） | supported（"模型拟合可误导"为全文级细节，摘要仅列 fit issues，建议弱化或取全文） | 未单列 | clean |
| [17] | PLoS ONE 2019 | 摘要级 | Abstract（300+ 医学论文、49% only two time points） | supported；v2.3 新增用途亦 supported（"仅两波不可能检验替代模型"直接支撑两波论点） | 未单列 | clean |
| [18] | Psychol Methods 2019（统一框架） | 摘要级（非 OA）｜溯源 primary | Abstract（统一框架、模型分类、结论依赖模型选择） | 首轮 overstated（"波次数/间隔/样本量"三元组无摘要支撑）→部分修复、**残余 overstated**（§1.3 已删"样本量"，"波次数的决定性"仍无摘要支撑；补查无可及开放全文） | necessary | clean；处置建议：论点主引 [17]、[18] 作框架参考或标注"全文级主张、未核" |
| [19] | JPSP 2021（七模型比较） | 全文级（PMC7854859）｜溯源 primary | Results/Discussion（自尊→抑郁 CLPM 显著而 RI-CLPM 个体内不显著；按目标效应推荐模型）＋Abstract（10 样本均 ≥4 波） | 首轮 overstated＋一处 wrong-context（两波句错配）→已修复 supported（§1.3 加"按目标效应选模型"限定；§4.2 两波句改引 [17]） | necessary | clean；参考文献补"Orth 等"与全文级核验注 |
| [20] | PLoS ONE 2024（正念模拟再分析） | 摘要级 | Abstract（调整先前结局的 meta-analytic cross-lagged effects 可能为 spurious） | supported | 未单列 | clean |
| [21] | Front Psychol 2025（反刍–睡眠模拟再分析） | 摘要级 | Abstract（simulated data to resemble Yang and Lei；complementary models） | supported | 未单列 | clean |
| [22] | PLoS ONE 2026（RI-CLPM 伪效应） | 摘要级 | Abstract（common auto-correlated state factors→spurious；N=1,856 再分析） | supported | 未单列 | clean；题名截断未补（漏 "used by Beckers et al. (2023)"，笔记级遗留） |
| [23] | Lüdtke & Robitzsch 2022, SEM | 摘要级（OpenAlex） | Abstract（CLPM under unmeasured confounding biased；参数假设依赖） | supported（作者经 Crossref/OpenAlex 核） | 未单列 | clean |
| [24] | Robitzsch & Lüdtke 2024, SEM | 摘要级 | Abstract（遗漏时变协变量→illusory between-person components） | supported | 未单列 | clean |
| [25] | Psychol Methods 2024（效应量分档） | 摘要级｜溯源 primary | Abstract（.03（small）/.07（medium）/.12（large）合并基准） | 首轮 misleading（β=0.08–0.09 属中等档被反述为"小效应"）→已修复 supported（§4.2 改为"属中等档、MDE β≈0.10 处中等档上沿"） | necessary | clean |
| [26] | J Youth Adolesc 2026（PSMU×睡眠，性别） | 摘要级｜溯源 primary | Abstract（1,696、三波 6 个月、RI-CLPM 多组） | supported（数值逐点吻合）；一处构念笔误（§1.4 首处"PSU→睡眠"应为 PSMU） | necessary | clean；PSMU 标签未修（笔记级遗留） |
| [27] | PRBM 2025（FOMO 三波 RI-CLPM） | 摘要级｜溯源 primary | Abstract RESULTS（PSU→depression β=0.19–0.21；反向 ns；FOMO↔PSU 双向） | supported（β 区间逐字吻合） | necessary | clean |
| [28] | Child Abuse Negl 2023（网络受害四波） | 摘要级｜溯源 primary | Abstract（1,835、四波 6 个月、CLPM+RI-CLPM、sleep problems as explanatory mechanism） | supported | necessary | clean；**DOI 未修（著录必改项中唯一实质定位风险）**：初稿 DOI 指向另一篇文章，正确为 10.1016/j.chiabu.2023.106065 |
| [29] | J Psychopathol Clin Sci 2025（情绪调节四波） | 摘要级｜溯源 primary | Abstract（sleep→depression not vice versa；中介仅女生） | supported | necessary | clean |
| [30] | JMIR 2026（睡前屏幕限制调节） | 摘要级｜溯源 primary | Abstract RESULTS（r=0.23, 95%CI 0.15–0.31；调节阴性 Δχ²=5.3 P=.51） | supported | necessary | clean |
| [31] | 2025（IGD→品行问题三波中介） | 摘要级｜溯源 primary | Abstract（20,137；17.3% of total effect；early adolescents 与性别差异） | supported | necessary | clean；期刊名未补（Child Adolesc Psychiatry Ment Health） |
| [32] | 2025（压力/性别分组交叉滞后） | 摘要级｜溯源 primary | Abstract RESULTS（1,423 两波；分组路径方向） | supported | necessary | clean；期刊名未补（Frontiers in Psychology） |
| [33] | Morris, White & Crowther 2019, Stat Med［新增］ | 摘要级 | Abstract（ADEMP 四要素） | supported（§2.1 组织与 ADEMP 对应） | 未单列 | clean |
| [34] | Baethge et al. 2019（SANRA）［新增］ | 摘要级 | Abstract（SANRA 六条目量表） | supported（定调用法与量表用途一致） | 未单列 | clean |
| [35] | Kwon et al. 2013, PLoS ONE（SAS-SV） | 摘要级（界值细节与白名单 PMC 全文核对一致） | Abstract（10 题、α=0.911、男 31/女 33 界值、AUC/sens/spec） | supported（§2.3/§4.2/§4.3 数值吻合） | 未单列 | clean |
| [36] | Psychol Assess 2015（PSQI 青年适配） | 摘要级 | Abstract（14–24 岁社区样本 N=216；单因子 α=.72） | supported（仅作适配证据引用；样本为 14–24 岁西班牙社区，可补充说明） | 未单列 | clean |
| [37] | PLOS ONE 2023（性别等值性） | 摘要级 | Abstract（1,112 大学生；scalar 级等值） | supported（作为 12–18 岁模拟队列测量前提是外推，建议在变量字典处注明） | 未单列 | clean |
| [38] | Addict Behav 2020（巴西验证） | 摘要级 | Abstract（α=0.81、ω=0.78、ICC 0.846、ROC 33） | supported | 未单列 | clean |
| [39] | Addict Behav 2017（西/法语版） | 摘要级 | Abstract（西/法语改编、α .88/.90） | supported（"跨文化界值差异"提法未见摘要，如保留应取全文或改述） | 未单列 | clean |
| [40] | PRBM 2024（三波中介） | 摘要级 | Abstract RESULTS（direct 0.021（0.010–0.033）及中介 CI） | supported | 未单列 | clean；期刊名未补（Psychol Res Behav Manag） |
| [41] | BMC Psychiatry 2021（两波 12 个月） | 摘要级｜溯源 primary | Abstract RESULTS（PMPU↔BP 等双向；"PSU predicted subsequent sleep quality one-way"） | 首轮 overstated（PSU→睡眠在该文为单向）→已修复 supported（§4.2 改为"PSU 单向预测后续睡眠质量并与就寝拖延互惠"） | necessary | clean |
| [42] | PRBM 2024（两波 6 个月 n=683） | 摘要级｜溯源 primary | Abstract RESULTS（PSU/BP/心理健康互惠；睡眠 T1→BP 与心理健康；未列睡眠→PSU） | 首轮 overstated（"–睡眠互惠"无支点）→主句已修复；**新残余 overstated（括注"（睡眠仅作前因变量之一）"与摘要不符——该文睡眠亦为结局）**；建议括注改为"睡眠不在互惠对之内"或删去 | necessary | clean；期刊与 DOI 已补（10.2147/PRBM.S472299） |
| [43] | Front Psychiatry 2020（一年前瞻） | 摘要级 | Abstract（MPAB↔PSQI/ESS 双向；BDI/SAS/ISI→MPAB 单向） | supported（暴露为 MPIQ 非 SAS-SV，初稿未误称） | 未单列 | clean |
| [44] | J Behav Addict 2025（两波阴性） | 摘要级 | Abstract RESULTS（β=0.202 p=.021；无双向） | supported（逐字吻合） | 未单列 | clean |
| [45] | Brain and Behavior 2026（日间功能障碍 RI-CLPM） | 摘要级 | Abstract（936、三波 4 个月；between r=0.319–0.495） | supported（期刊名经 esummary 核为 Brain and Behavior） | 未单列 | clean |
| [46] | Behav Sci 2026（六波 KCYPS） | 全文级（MDPI 开放网页）｜溯源 primary | Methods（KCYPS 2018 初中一队列、六波、N=2,590）；Results（"no within-person lagged paths involving sleep quality were significant"） | supported（白名单 hedge 以全文落实；被引 0 与标注一致） | necessary | clean |
| [47] | J Adolesc 2023 | 摘要级 | Abstract（Study 1 单向；Study 2 中介） | supported | 未单列 | clean |
| [48] | CAPMH 2025（疲劳桥症状） | 摘要级 | Abstract（558、三波 6 个月 CLPN；桥症状与网络致密化） | supported | 未单列 | clean |
| [49] | Comput Hum Behav 2021（Boer et al.） | 摘要级（OpenAlex 重建；Crossref 116:106645） | Abstract（三波 n=2,109；SMU problems→mental health 单向；intensity 无关联） | supported（"问题性使用 vs 强度"对照逐字成立） | 未单列 | clean |
| [50] | Usami 2020, SEM（单作者） | 摘要级（OpenAlex） | Abstract（GCLM 与 RI-CLPM 参数解释差异、模型选择） | supported（单作者 Satoshi Usami 核实） | 未单列 | clean |
| [51] | Mulder & Hamaker 2020, SEM | 摘要级 | Abstract（三扩展：person-level predictors/outcomes、multiple-group、multiple indicators；代码） | supported | 未单列 | clean |
| [52] | arXiv:2608.09951（RI-CLPM 诊断敏感性） | 摘要级（arXiv abs 页） | Abstract（power jointly depends on reliability, ICC, waves, n, effect size） | supported（"三波"具体化为全文级） | 未单列 | clean（OSF 孪生记录 is_retracted=false；预印本身份如实标注） |
| [53] | Neuropsychiatr Dis Treat 2026（限制研究） | 摘要级 | Abstract（n=254 男性；限制后行为性睡眠指标改善而失眠/嗜睡变化有限） | supported（"睡眠指标改善"略宽，建议补"行为性指标"限定） | 未单列 | clean |
| [54] | BMC Psychiatry 2025（症状网络） | 摘要级 | Abstract（'Anxiety and craving' 核心；daytime dysfunction 受 PSU 影响最重） | supported（限定为 PSQI 成分结局选择、横断不入方向性证据） | 未单列 | clean |
| [55] | Sleep Med 2017（趋势） | 摘要级 | Abstract（2009–2015 短睡眠上升 16–17%） | supported | 未单列 | clean |
| [56] | Environ Res 2019（出生队列） | 摘要级｜溯源 primary | Abstract（MPPUS habitual PR 1.55（1.03–2.33）与主观睡眠质量；客观关联来自平板使用时长） | 首轮 overstated（客观关联被错挂到问题性使用构念）→已修复 supported（§4.2 分开表述主观/客观口径） | necessary（自报/客观差异论点） | clean |
| [57] | BMJ Ment Health 2024（n=69 队列） | 摘要级 | Abstract（β=0.18（0.04–0.32）p=0.013） | supported（小样本限定吻合） | 未单列 | clean |
| [58] | Psychometrika 2023（两步法） | 题录级 | Crossref（88:1466-1494）；勘误 DOI 10.1007/s11336-022-09890-6 确认存在；题名直接支撑功能性主张 | supported（题录级） | 未单列 | corrected（初稿已标注引用更正后版本，维持标注） |
| [59] | arXiv:2202.11612（面板 Granger） | 题录级 | arXiv 页题名逐字吻合；OpenAlex is_retracted=false | supported（题录级） | 未单列 | clean |
| [60] | arXiv:2508.10342（两阶段 LM-Wald） | 题录级 | arXiv 页存在、题名吻合；OpenAlex 无记录、PubMed 不收录、RW 库不可用 | supported（题录级） | 未单列 | unknown（arXiv 页无撤回标记，如实标注） |
| [61] | PIMA, Psychometrika 2024 | 摘要级（OpenAlex） | Abstract（multiverse descriptive only→sign flipping score test）；作者核实 | supported | 未单列 | clean |
| [62] | arXiv:2308.04963（缺失数据图因果指南） | 题录级 | 题名（OpenAlex false） | supported（题录级） | 未单列 | clean |
| [63] | arXiv:2608.23508（刷新样本 MAR 检验） | 题录级 | 题名（OpenAlex false） | supported（题录级） | 未单列 | clean |
| [64] | Psychometrika 2024（序数状态空间） | 摘要级（OpenAlex） | Abstract（ordinal/Likert state-space 一般估计） | supported | 未单列 | clean |
| [65] | arXiv:2410.14459（方差成分贝叶斯因子） | 题录级 | 题名（OpenAlex false） | supported（题录级） | 未单列 | clean |
| [66] | arXiv:2510.14044（multi-VAR） | 题录级 | arXiv 页存在、题名吻合；OpenAlex 无记录 | supported（题录级） | 未单列 | unknown（同 [60] 口径） |
| [67] | arXiv:2603.04003（DSEM 边缘化） | 题录级 | 题录（OpenAlex false） | supported（题录级） | 未单列 | clean |
| [68] | arXiv:2512.11063（umx 4.5） | 题录级 | 题录（OpenAlex false；题名含 CLPM、MR-DoC） | supported（题录级） | 未单列 | clean |
| [69] | 発達心理学研究 2022 | 题录级 | J-STAGE DOI 内容协商（33:267-286、宇佐美）；OpenAlex 2026 系索引异常，以 Crossref/J-STAGE 为准 | supported（题录级） | 未单列 | clean |
| [70] | Mulder 2023, SEM（powRICLPM）［评审新增］ | 摘要级（OpenAlex）＋Crossref 题录｜溯源 primary | Crossref（SEM 30:645-658）；Abstract（RI-CLPM-specific power analysis；R 包） | supported（工具与规划角色成立；高 ICC 削弱功效的直接证据在 [52]） | necessary | clean |
| [71] | von Hippel 2007, Sociol Methodol［评审新增］ | 题录级（Crossref 37:83-117） | 题名 "Regression with missing Ys…" 直接支撑"插补后删除"主张 | supported | 未单列 | clean |
| [72] | von Hippel 2009, Sociol Methodol［评审新增］ | 题录级（Crossref 39:265-291） | 题名 "How to impute interactions, squares…" 直接支撑"插补模型遗漏交互项的经典衰减"归因 | supported | 未单列 | clean |

汇总（05a 原口径）：首轮问题引用 9 条（[4][25][1][11][18][19][41][42][56]）；v2.3 复核后 7 条完全修复，残余 2 条（[18] 收窄、[42] 括注新引入）。著录必改：[28] DOI 更正为 10.1016/j.chiabu.2023.106065；[22] 补全题名；[12]/[31]/[32]/[40] 补期刊名（[42] 期刊与 DOI 已补）。无撤稿、无编辑关注；[5]/[58] corrected 已如实标注；[60]/[66] unknown。Retraction Watch 开放库本轮持续 400 不可用，以 OpenAlex＋PubMed 双轨替代（05a 方法节声明）。

---

## 5 各关卡结论一览

**Table 4** 关卡结论与遗留（前五行为本轮结构化输入给定的关卡结论；后两行为工作区文件记载的内部关卡，供完整性）

| 关卡 | 结论 | 遗留／后续动作 | 记录位置 |
|---|---|---|---|
| 引文核查 | 通过 | 02 v2.0 据此删除"剂量-反应"从句（PMID:27802500 处） | `02-evidence-table.md` 头部修订记录；本轮结构化输入 |
| 统计审稿 | minor-revision（2 轮） | 第 1 轮 4 项意见全部落实（MDE 同构修复 D22、MI 结论更正 D9、ANCOVA 目标勘误 D18、校准表述更正 D23）；第 2 轮 M1 调节 DGP 勘误重跑（D25）＋报告项补齐（D26） | `04-analysis/README.md` 两轮修订记录；`decisions-log.md` D22/D23/D25/D26 |
| 同行评审 | 2 轮，遗留 11 项 | 稿面逐项登记处理状态（L1–L10：已修复/已补齐/已处理、部分处理、登记未改与缺位登记并存，逐项标注见原文）；第 11 项为本轮结构化输入口径所记，未在工作区文件中单独定位到对应条目 | 本轮结构化输入；`06-draft.md` §4.5 |
| 答辩拷问 | 7 问待补 | 07-rebuttal 十问逐条作答，文末未答事项 7 条（τ² 不可判定、MNAR 未测、信度网格未测、被动插补/SEM 内交互未测、τ²>0 MDE 变体未测、混合世界未测、第二独立实现未做），各注明所缺条件 | `07-rebuttal.md` 未答事项节 |
| 引文深审 | 18 条遗留 2 条（关卡口径） | 72/72 定位无幻觉；首轮问题 9 条→残余 2 条（[18] overstated 收窄、[42] 括注新残余）；著录必改项（[28] DOI、[22] 题名、[12]/[31]/[32]/[40] 期刊名）除 [42] 外均未修 | `05a-citation-audit.md`；本文件 §4 |
| 校准关卡（内部） | 除 S1–S3 观测自相关四子项越出（SAP Table 1 文本不自洽→v2.1 勘误①，表 R1 双口径呈现）外，其余硬门槛子项全部通过 | 越出根因是 SAP 文本内部不自洽而非实现错误（D4/D23）；是否采纳勘误由 SAP 制定者终审 | `04-analysis/decisions-log.md` D4/D23；`03-sap.md` §16；表 R1 |
| 复现验证（内部） | run_all.sh 完整重跑通过（退出码 0）；targets.json 与表 R2 的 MD5 首跑 vs 重跑逐位一致 | 首跑 03–08 段日志因 tee 覆盖由观察记录重建（数据产物不受影响）；现行 MD5 基准为 `logs/md5_d25.txt` | `04-analysis/logs/`（run_all.log、pre_rerun_md5.txt、first_run_summary.md、md5_d25.txt）；本轮结构化输入 reproducibility |

---

## 6 人工校对指引

按以下顺序核对，每步给出对应的文件与章节。整体原则：先核对"冻结了什么"（SAP），再核对"跑了什么"（decisions 与日志），再核对"得了什么"（表图与初稿），最后核对"审了什么"（关卡与引文）。

**Table 5** 校对顺序与对照位置

| 步 | 核对什么 | 打开哪里 | 怎么核对 |
|---|---|---|---|
| 1 | 变量字典转录一致性 | 本文件 §2 Table 1 ↔ `03-sap.md` §2.1 Table 3 | 逐行逐列比对 17 条变量的五要素；发现任何一字之差以 03 为准并回改本文件 |
| 2 | 方法依据与执行对齐 | 本文件 §3 Table 2 ↔ `03-sap.md` Table 10＋`04-analysis/decisions-log.md`（D1–D26） | 每条方法核对其"不采用"分支确实未被采用、执行情况所引 D 编号在 decisions-log 中存在且内容相符 |
| 3 | 判定数字抽查 | `04-analysis/tables/`（R2/R3/R4/R5/R3b）↔ `06-draft.md` 表 3–7 | 每张主表抽 2–3 个单元格：初稿数值应与 CSV 落盘值一致（如 RI-CLPM S4 bias +0.0001、判别准确率 0.783、Holm 联合 0.860） |
| 4 | 残余引文问题 | 本文件 §4 ↔ `06-draft.md` §1.3/§4.2（[18]）与 §4.2（[42] 括注）＋`papers/` 对应 PDF 或 PubMed | 重点核 2 条残余：[18] 的"波次数决定性"主张、[42] 的"睡眠仅作前因变量之一"括注；再核著录必改 6 处（[28] DOI、[22] 题名、[12]/[31]/[32]/[40] 期刊名） |
| 5 | 关卡遗留清点 | `06-draft.md` §4.5（L1–L10）＋`07-rebuttal.md` 未答事项（7 条） | 逐项确认处理状态标注与实际文件状态一致；重点：L3 表 R3b 落盘版待同步、L6 renv.lock 未生成、L7 调试残留 |
| 6 | 图件数值一致性 | `09-figure-audit.md`＋`04-analysis/figures-polished/_verify_output.py` | 重跑校验脚本确认 121 项检查通过；抽 F4 的 clpm_bpu 均值 0.106810 与表 R2 一致 |
| 7 | 复现性 | `04-analysis/run_all.sh`（约 6–8 小时）或 `04-analysis/logs/md5_d25.txt` | 有条件则全链重跑比对 MD5；至少核对现行基准文件存在且与 targets.json、表 R2 的当日 md5 一致 |
| 8 | 计数口径勘误 | `04-analysis/decisions-log.md` 第 5 行 ↔ 其 D26 条目 | decisions-log 头部标注"编号 D1–D25"而正文含 D26（00-README Table 2 已标注）；裁决是否同步头部 |
| 9 | 文献 PDF 完整性 | `08-papers-manifest.md` 未下载清单（21 条）↔ `papers/` | 按清单补齐缺失 PDF（条 6/9/19 可在 PMC 人工点击下载）；核对已下载 51 个文件可正常打开 |

---

## 7 免责声明

本研究为 provenance-lab 工作流内部生成的模拟方法学演示：全部数据为固定种子蒙特卡洛模拟数据，无人体对象、不涉及伦理审查；一切数值结论限于校准参数邻域与预登记 DGM 族，不外推至任何人群、不用于发表性人群推断或实际决策。本审计追踪由 AI 从工作区文件与结构化输入整理而成，§2/§3 的照抄内容以 `03-sap.md` 与 `04-analysis/decisions-log.md` 为最终依据，§4 以 `05a-citation-audit.md` 为最终依据，任何转录差异以源文件为准。各关卡遗留事项（§5）按原样列示，不含美化；引用判定中"题录级/摘要级"条目未读原文全文，相应结论的强度以 05a 标注的核对层级为限。研究者引用、发表或迁移真实数据前，须按 §6 指引完成人工核对。

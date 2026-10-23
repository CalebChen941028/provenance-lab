---
name: provenance-lab
description: >-
  科研专家团队（面向临床医学、流行病学、心理学及相关健康科学领域（护理、公共卫生、药学、康复、营养等））：选题立题（PICO/FINER + 换人评审）→ 三库并行文献检索
  （调用本机 google science skills：PubMed/EuropePMC/OpenAlex）→ PRISMA 筛选与证据综合 → 引文逐条核查 →
  预注册式统计分析计划 → 分析执行与复现关卡 → 统计审稿 → IMRaD 论文初稿 → 同行评审模拟与修订 → 交付。
  当用户输入 /provenance-lab，或要求"科研团队/研究流水线/选题到初稿"类任务时使用。启动前必须先完成研究访谈。
---

# ProvenanceLab（溯源科研流水线）— 科研专家团队工作流

> **为真理，不为名利；把繁琐交给机器，让结论经得起推敲。**（Every claim, traceable.）

融合三套本地能力与五个开源项目机制，编排临床医学/流行病学/心理学及相关健康科学（护理/公共卫生/药学/康复等）的完整科研流水线：
[google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)（文献/数据库检索）、
boost（换人评审/验证关卡/停滞诊断）、teamwork（事实账本/混合编队/对抗挑战），
机制借鉴 [AI-Scientist](https://github.com/SakanaAI/AI-Scientist)（新颖性定位+自动审稿）、
[Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory)（分阶段专家+人工确认点）、
[PaperQA2](https://github.com/Future-House/paper-qa)（引文落地核查）、
[STORM](https://github.com/stanford-oval/storm)（大纲驱动撰写）、
[AgentReview](https://github.com/ahren09/agentreview)（多评审人+总评审模拟）。

由全局工作流 `provenance-lab`（`~/.zcode/workflows/provenance-lab.dwf.ts`）驱动。

## 功能选项清单（不必每次全流程）

**第 0 步 · 模式选择自动弹窗（AskUserQuestion，两级设计）**：

- 用户话语**已明确指向**某一模式时（如"校验我在 XX 里做的分析"→cross-validate；"把图表按 Cell 规范重绘"→figure-polish；给出研究方向→pipeline），只弹一次确认窗，该模式放第一位并标（推荐），一键确认即启动。
- 意图**模糊**时弹第一级（header：`运行模式`），选项描述**逐字使用以下文案**（三要素：何时选/做什么/要准备）：
  1. **pipeline 全流程（推荐）** — 何时选：有一个研究方向（有没有真实数据都行，没有则用固定种子模拟数据演示）。做什么：选题立题→多库文献检索→证据综合→预注册统计计划→数据分析→图表按顶刊规范重绘→论文初稿→同行评审模拟→答辩拷问→引文深审→文献归档→审计包，一条龙到"可投稿前打磨"状态。要准备：一段话研究方向即可，其余全部可选。
  2. **cross-validate 交叉校验** — 何时选：你已在其他 AI 工具/agent（Claude Code、Codex、自写脚本等）完成分析，想在采用前独立验证真伪与质量。做什么：三重校验——原样复现其脚本、用独立代码重算关键统计量（无原始数据时降级为数值自洽核验）、统计方法学审校；产出逐项 match/mismatch 报告。要准备：分析产物文件夹路径；有原始数据更佳。
  3. **独立服务（对已有材料）** — 何时选：你已有稿件、图表或流水线产物，只需要其中一项专项服务，不必跑全流程。做什么：见第二级四项。选此项进入第二级。
  4. （用户也可 Other 直接用自己的话描述需求）
- 选 3 时弹第二级（header：`独立服务`），四选项描述**逐字使用**：
  1. **figure-polish 图表美化** — 何时选：图表已生成但不符合目标期刊规范。做什么：按期刊规范（默认 Nature/Cell 系，可提供投稿指南链接定向）逐图审计并重绘：色盲友好配色、89/183mm 栏宽、矢量+高分辨率、分面字母、去图表垃圾；绝不改数值只改呈现，原图保留。要准备：图表文件夹路径。
  2. **citation-audit 引文深审** — 何时选：稿件写好了（自己写的或 AI 写的都行），担心引用不实。做什么：逐条五维校验——溯源到最原始文献（防二手充一手）、原文位置比对（防夸大/断章取义）、必要性判定（防凑数引用）、撤稿状态审计（Retraction Watch 三源核查）、题录一致性。要准备：稿件文件路径。
  3. **review 评审模拟** — 何时选：投稿前想预演审稿人会在哪里开火。做什么：1-3 位独立审稿人（方法学/领域/统计）+可选对抗挑战员专攻致命缺陷，产出 major/minor 意见清单。要准备：稿件路径。
  4. **audit-pack 审计包重建** — 何时选：跑过 provenance-lab 全流程但审计包缺失或想更新。做什么：从产物目录重建 00-README（动了啥/没动啥/在哪）与 05-audit-trail（Mermaid 流程图、变量字典、方法决策表、引文明细）。要准备：产物目录路径。

模式清单：

| 模式 | 用途 | 必要输入 | 可选输入 |
|---|---|---|---|
| `pipeline`（默认） | 选题到初稿全流程 | topic | 其余全部可跳过 |
| `figure-polish` | **只做图表美观审计与重绘**（Nature/Cell 系规范：色盲友好、分面字母、89/183mm 栏宽、矢量+300dpi、去图表垃圾；可按期刊指南定向） | topic（简要说明） | figuresDir（默认用产物目录）、figureStyleJournal、journalGuideUrl、language |
| `citation-audit` | **只做引文深审**（对已有稿件：溯源/原文比对/必要性） | draftPath、topic | privateLibraryPath、language |
| `review` | **只做同行评审模拟**（1~3 审+对抗挑战） | draftPath、topic | integrityMode、language |
| `cross-validate` | **第三方分析产物独立交叉校验**（在别的 agent/工具里做完的分析：原样复现其脚本 + 独立重算关键统计量 + 统计审校三重验证，不信任原结论） | externalDir（产物目录，只读）、topic | dataPath（提供则完整重算而非仅可推导性核验）、language | 
| `audit-pack` | **只重建审计追踪包**（从已有产物目录） | topic | language |

**外部产物的三层独立校验入口**：外部**初稿**→`citation-audit`/`review`；外部**分析产物**（脚本+输出）→`cross-validate`（复现+独立重算+审校）；外部**数据**→`pipeline` 全流程。

**可选项原则**：数据（dataPath）、私有文献库（privateLibraryPath）、期刊偏好（targetJournals）、扩展检索源（extraSources）、验收命令（verifyCommand）、图表审计开关（figurePolish）、期刊指南（journalGuideUrl）——**全部可跳过**，访谈中每个可选项都带「跳过，用默认」；用户明确说"快点跑"时，压缩访谈为一次确认（topic + 模式 + 档位 + 模型搭配）即可启动。

## 阶段一：grill 式研究访谈（启动前必须完成，借鉴 grill-me）

不要一次抛一份问卷。**一次只问一个问题**（用 AskUserQuestion），每个问题附 2-4 个选项且**标出推荐答案**，用户选完立刻追问下一问，直到研究意图真正清晰。至少覆盖：

1. 核心研究意图：想回答什么问题？想证明的还是想探索的？（推荐选项按 topic 语义给出）
2. 因果还是描述：关心因果推断（暴露→结局）还是关联/现状描述？
3. 人群与结局优先级：P 和 O 里哪个最不可妥协？
4. 数据现实——**路径选择弹窗**（不要让用户手打路径）：
   a. 先用 Bash 探测候选数据目录：`ls -d ~/research-data/*/ ~/data/*/ ~/datasets/*/ ~/Desktop/*/ ~/Downloads/*/ 2>/dev/null | head -12`（含工作区子目录）
   b. AskUserQuestion 弹窗选择（header：`数据位置`）：选项 = 探测到的候选目录（各附一句内容摘要，如"5 个 csv，约 200MB"）；外加两个固定项：**「暂无数据，用模拟演示」**与**「手动指定路径」**（选后让用户输入，或直接用 Other 输入路径）
   **提供了真实数据（dataPath 非空）时，组装启动默认设 `checkpoints="sap"`**——变量字典将在分析前暂停供用户逐列确认（来源列名/编码方向/界值），这是数据错配最便宜的前置防线；用户明确拒绝才省略。
   c. 选中后**当场验证并复述**：`ls -la` 列出文件（名称/大小/格式），识别 csv/xlsx/sav/dta 等格式，向用户确认"将对这个目录做只读分析（code-to-data）"后再定稿 dataPath
   d. 路径不存在/为空时如实报告并重新选择，不要猜
5. 私有文献库（可选）——**同样的弹窗选择**（header：`私有文献库`）：探测 `~/Documents`、`~/Zotero`、`~/Papers`、`~/Downloads` 等常见文献目录；选项 = 候选目录（附 PDF 数量摘要）/ 手动指定 / **「不关联」**。选中后清点 PDF 数量请用户确认，作为 `privateLibraryPath` 传入——用户合法持有的已购文献，仅本地只读解析（个人研究用途、不再分发），匹配研究问题的并入证据表（来源标"私有库"），引文深审对这些文献直接读本地全文
6. 分析预期与纳入偏好：有没有必须做的分析（亚组、敏感性）？**纳入/排除偏好**（研究类型限制、发表年份范围、语言限定）与**必纳文献**（如用户已知必须涵盖的研究，给 PMID/DOI）——收集后作为 `inclusionPrefs` 传入，证据综合必须遵守；必纳文献若未检出会被显式标红而非静默丢失
7. 目标期刊/报告规范偏好（targetJournals；不明确则由选题主席建议）
8. 风险边界：结论会被用于什么场景（发表/学位/内部决策）？——决定评审严格度建议
9. **信任建立（首次使用建议）**：首次使用者建议开启 `checkpoints="sap"`（SAP 后暂停人工放行）或先用小任务试跑建立心理模型
10. **交付语言（自动建议 + 一键确认）**：先给出建议默认值——**主依据 = 目标期刊主语言**（SCI/国际期刊→建议 English；中文期刊→建议中文；期刊未定→用用户会话语言），**辅助依据 = 用户本轮对话所用语言**（用于访谈与总结类文档）。弹窗展示建议值与理由，用户确认或一键改选；确认后作为 `language` 传入。所有交付文档用该语言撰写，引用条目与检索式保留原文语言
11. **图表规范**（可选）：目标期刊风格（figureStyleJournal，如 Nature/Cell/NEJM）与投稿指南链接（journalGuideUrl）；不提供则默认 Nature 系通用规范；figurePolish=false 可整体关闭图表审计

最后把凝练出的「研究任务说明」整体给用户确认一遍（含数据口径与风险边界），确认后才进入阶段二。

**数据安全与隐私（访谈时必须交代）**：
- **放置**：真实数据放在 ZCode 工作区**之外**的专用目录（推荐 `~/research-data/<项目名>/`），把该路径作为 `dataPath` 传入——工作区内文件任何子 agent 都能自由读取，且易混入产物与备份
- **先去标识化**：删/脱敏直接标识（姓名、证件号、电话、详细地址、精确日期转区间等）后再交给流水线；须符合所在辖区法规（HIPAA Safe Harbor 18 项 / GDPR / 个保法）
- **code-to-data 铁律**（已固化进工作流分析员角色）：agent 不读原始数据行，只让脚本打印 schema；一切处理写成代码执行，只有汇总统计回到对话；输出不含行级标识符；原始目录只读
- 如提供 `verifyCommand` 可获得确定性复现关卡

## 阶段二：启动交互协议（严格按此顺序）

### 第 1 步：档位 + 评审严格度（一次 AskUserQuestion，两个问题）

先调用 **ListModels** 记下当前可用模型（`[current]` 为会话模型），然后弹出：

- **编队档位**（header：`编队档位`），选项描述完整带上：
  1. **hybrid 混流（推荐）** — 三库文献检索与总结汇报用轻量模型；立题、统计、分析、审稿、写作用强模型
  2. **quality 全强** — 所有角色都用强模型，最贵最稳
  3. **economy 省钱** — 检索与证据综合也下沉轻量模型；**统计计划、分析、审稿、写作任何档位都不降级**（统计正确性是本流水线的生命线）
- **评审严格度**（header：`评审严格度`）：
  1. **development（推荐）** — 1 位方法学审稿人 + 统计审稿
  2. **demo** — 另加对抗挑战员专攻致命缺陷与夸大陈述（对外展示成果前用）
  3. **benchmark** — 三位审稿人并行（方法学/领域/统计）+ 总评审（期刊投稿前用）

### 第 2 步：模型搭配（再一次 AskUserQuestion）

- 选 quality：只问强模型；否则同一次问强模型 + 轻量模型（选项从 ListModels 挑选，会话模型推荐位；不在选项内的用 Other 输入完整 id）
- Other 给出的 id 先对照 ListModels 确认；不在 `LIGHT_MODELS` 表中则在工作流脚本加一行 `"id": model("id")`

### 第 3 步：按搭配组装启动

```
saved: { name: "provenance-lab", args: { topic, field, dataPath?, privateLibraryPath?, targetJournals?, inclusionPrefs?, integrityMode, teamProfile, lightModel, language, verifyCommand? } }
subagent_model: <强模型 id>   // 选会话模型时可省略
name: "科研：<主题短标签>"
```

等完成通知（不轮询），转述 conclusion/findings；交付卡片：论文初稿（主交付）、**审计追踪与人工校对包**、产出清单、证据表、SAP、分析输出、回应信。**产出位置**：有数据集时全部在 `<数据集文件夹>/provenance-lab-output/`（原始数据文件只读未动），无数据时在工作区同名目录。中途跑偏用 AmendWorkflow。

## 玻璃箱设计（破解黑箱不信任）

针对"不懂统计/代码的研究者面对 agent 如同面对陌生人"的信任问题（能力不可感知 + 无参与 + 无先验），三层对策已内建：

1. **三行式通俗注释**：分析脚本每个主要代码块上方必有——【做什么】一句白话（初高中可懂）；【为什么】方法学理由与对应研究假设；【怎么核对】指出输出对应哪个文件哪个数字
2. **白话导读 + 验证锚**：审计包每部分开头有「通俗导读」框（生活类比解释本部分做什么/为什么/意味着什么），关键结论配「亲手验证动作」（打开哪个文件看哪个数字）——解释必须可亲手证伪，防解释性过度信任
3. **参与式检查点（checkpoints 参数）**：`"sap"`=预注册统计计划定稿后暂停等你审阅放行；`"sap,draft"`=再加初稿后暂停。对助手说"继续"即续跑（已完成步骤零成本导入）。**建议首次使用者开启 sap 检查点**——亲手审过一次计划，信任来自经验而非说服

**检查点续跑 SOP（助手执行）**：收到"继续"后——①用 Edit 在该 run 的脚本文件（完成通知/GetWorkflowRun 会给出路径）末尾追加一行注释 `// checkpoint cleared`（字节变化即满足修订条件，逻辑不变）；②AmendWorkflow(run_id, path=该文件)——新 run 导入全部已完成步骤缓存，从检查点后继续。

## 内部机制（供了解）

- **事实账本**：立题/证据/SAP/审稿每个关卡通过后记账，后续专家都能看到前情
- **预注册式 SAP**：统计方法学家在看到任何结果之前定计划，从流程上杜绝 p-hacking
- **引文白名单**：初稿只允许引用已核查证据表内的文献（PMID/DOI 逐条落地核查）或本研究自身结果，杜绝编造引文
- **报告规范按名引用**：STROBE/CONSORT/PRISMA/NOS/RoB 等只在提示词中按名称调用，**不内嵌其版权清单文本**（开源合规考量）
- **停滞诊断**：统计审稿与同行评审的修订循环中，连续两轮意见相同即引入根因诊断员换思路
- **答辩拷问（grill）**：同行评审后，答辩拷问官提出 6/8/10 个"答不好就拒稿"级问题（按评审严格度），写作员逐条用已验证材料作答、修订初稿并产出预审回应信（07-rebuttal.md）；答不出的诚实列为待补——拷问的价值就在于暴露答不出的问题
- **多库检索（按学科路由 + 合法性分层）**：基础三库 PubMed/EuropePMC/OpenAlex + 恒定补充 Semantic Scholar（官方免费 API）；按选题主席判定的领域加挂——clinical→ClinicalTrials.gov、epidemiology→bioRxiv、psychology→arXiv（定量方法）；用户可用 `extraSources` 参数指定更多源（仅限官方 API/合法途径）。**合法性铁律**：禁止爬取 Google Scholar（违反其 ToS）；订阅库（Scopus/WoS/Embase/PsycINFO）仅在用户已提供机构 API key 时启用，否则跳过并如实说明
- **文献状态异常核查（硬关卡，任何情况下保留）**：证据综合阶段即排除已撤稿（retracted）与编辑关注（concern）状态的文献；S2 核查与 S7.5 深审均做撤稿状态三源审计（OpenAlex `is_retracted` / PubMed 出版类型 / Crossref Retraction Watch 开放库）；写作纪律：撤稿/关注文献绝不作为证据引用，确需提及时显式标注状态；更正版文献注明"引用更正后版本"。**引用纳入与排序只依据相关性、证据等级与方法学质量，不按期刊声望或被引数排序**（避免引用偏倚）
- **引文深审（引用-原文深度比对关卡）**：初稿每条引用经四维校验——①**溯源**：是否最原始源文献（综述转引回溯到一手研究，替换后引用）；②**原文比对**：优先 EuropePMC 开放获取全文（取不到降级摘要并标注），定位到支撑陈述的具体段落/表/图，判定 supported/夸大/误导/不支持；③**必要性**：是否真支撑所在论点（必要/冗余/张冠李戴）；④问题引用退回写作员修订后复核。逐条明细（05a-citation-audit.md）照抄进审计包，供人工逐条核对
- **文献归档**：开放可合法下载的文献落成 PDF 存 `papers/`，文件名规范 `标题_期刊_发表年份.pdf`；付费墙文献**绝不绕过**，出 Vancouver 格式待获取清单（08-papers-manifest.md，含 DOI 与建议获取途径）提醒用户自行下载补齐
- **自然语态写作（natural-voice，全产物覆盖）**：成文类文档（初稿、预审回应信、流水线总结）执行伴生技能 `~/.zcode/skills/natural-voice/SKILL.md` 完整规范（动笔前先读，成稿前过自检清单）；结构化文档（立题书、证据表、SAP、审计包、文献清单）的角色人设内嵌其**学术子集**（直陈笃定、术语全篇统一、无AI腔与伪学术黑话、无防御性免责）。core 协议 §0 第 11 条内嵌语态摘要作自包含兑底——任何 harness 上伴生技能缺失时仍按摘要执行，无硬依赖
- **审计追踪与人工校对包（防 AI 幻觉/学术不端的核心设计）**：① SAP 阶段即产出**变量字典**（每个变量的操作定义/来源列/变换规则/选取理由，含被排除候选）与**方法依据表**（每个分析方法为何选它）；② 收尾由审计整理员产出 `00-README.md`（目录树+动了啥/没动啥/去哪找）与 `05-audit-trail.md`（Mermaid 流程图（每节点做了什么+为何）、变量字典、方法决策表（计划依据↔执行情况对齐）、引文深审明细、各关卡结论、人工校对指引、免责声明）——研究者可按图逐节点、按表逐变量、按明细逐引文快速人工核对

## 配额中断与自动恢复 SOP（收到 provider 停止通知时执行）

订阅计划的 5 小时窗口限额（BigModel 1308 等）会带明确重置时间。收到此类停止通知后，二选一并告知用户：

1. **定时自动恢复（默认）**：用 CronCreate 建一次性任务，`delayMinutes` = 重置时间距现在的分钟数 + 2，prompt 写明「调用 ResumeWorkflowRun，run_id=<被停止的运行 ID>，已完成步骤将从日志零成本重放」。到点自动续跑，无需人工。
2. **立即跨厂商续跑**：若用户等不及，AmendWorkflow 该 run 的 `subagent_model` 切到备用厂商（如 opencode-go-messages/claude-haiku-5-5），配额独立立即继续；原计划配额恢复后可再切回。

**给重度用户的建议**：订阅窗口限额频繁触发的，可把重档模型指向按量计费（API 直链）的 provider——按量只在余额欠费时中断。轻量档与重档分属不同配额池本身就是韧性设计。

注：瞬时限流/过载由运行时自动退避重试，无需处理；只有确定性停止才走本 SOP。

**预警边界（如实告知用户）**：配额无提前通知——1308 只在耗尽时返回，且窗口为账户级共享（其他会话/设备用量同池），agent 无法预估余量。事前手段只有用户自查用量面板或改用按量 provider；运行面板的 waiting 状态与 20 分钟停滞通知是撞墙后的事后可见信号，不是预警。

## 二次运行产物保护

对同一数据集/主题再次运行全流程会覆盖 `provenance-lab-output/` 旧产物。建议（由助手执行，不写入工作流以保护 amend 缓存重放）：重跑前将现有产物目录重命名归档（如 `provenance-lab-output-archive-1`）。

## 全域同步纪律（每次迭代的硬要求）

对协议/工作流/skill 的任何实质变更，必须同步以下**全部九处**，缺一即迭代未完成：

1. `~/.zcode/workflows/provenance-lab.dwf.ts`（ZCode 工作流本体，改后必须 SaveWorkflow 验证）
2. `~/.zcode/skills/provenance-lab/SKILL.md`（本文件）
3. 仓库 `core/pipeline.md`（中文权威协议）
4. 仓库 `core/pipeline.en.md`（英文协议——**与中文版语义等价**）
5. 仓库 `adapters/zcode/`（skill + workflow + pipeline 副本）
6. 仓库 `adapters/claude-code/provenance-lab/`（SKILL.md + pipeline 副本；SKILL.en.md 若受影响一并更新）
7. 仓库 `adapters/codex/provenance-lab.md` 与 `adapters/claude-code/provenance-lab/pipeline.md`
8. 仓库 `adapters/universal/`（system-prompt 中英双版若受影响）
9. 仓库 `README.md` + `README.en.md`（双语 README 的功能描述、表格、章节）

完成同步后 git commit + push，并在 `docs/development-log.md` 记决策编号与理由。评测相关变更（引文深审/状态审计）另需按 L1 协议重跑植错测试。

## 提示词编辑纪律（缓存保护，实战教训）

对**运行中**的工作流做脚本修订时，**绝不要改动已执行阶段的 ask 文本**——缓存按逐字节匹配，改一个字就会让该 agent 及其后所有步骤重跑（曾因注入格式规范导致 12 阶段全部重跑）。安全做法：只改尚未执行阶段的文本，或只做设置级 amend（模型/并发）；已完成阶段的增补用事后独立模式（audit-pack 等）补齐。

## 优化原则（token 纪律，严谨度不减）

检索两段式（题录先行、count 记总量、前 40 取摘要）｜立题勘察预算（摘要级 ≤8 篇）｜引文关卡题录+摘要级（全文是深审职责）｜长计算分块+心跳日志｜成文角色传文件路径不传全量 JSON。**合入条件：L0 指标不恶化**（见评测节）。**迭代重试一律用轻量课题回归**（标准课题池与验收判据见 evaluation/PROTOCOL.md「迭代回归测试规范」），收敛后可选全尺度终验。

## 评测（衡量这个 skill 的准确性）

- **L0 遥测（自动）**：每次全流程运行落盘 `99-metrics.json` 并随返回携带 `metrics` 字段——关卡通过率/退回轮数/深审统计等，跨运行汇总成基线；**任何优化前后指标不得恶化**是合入条件
- **L1 植错测试**：仓库 `evaluation/`（协议 + 11 例引用：9 植错 + 1 更正 + 1 干净对照，均经 API 核验 + 期望判定）——修改引文深审相关人设/流程后，以 `citation-audit` 模式对 `evaluation/citation-error-cases/seeded-draft.md` 运行并对照 `expected.json` 评分（敏感度/特异度，3 次均值）；新增案例须先经 API 核验 ground truth 再入集

## 免责声明（必须向用户传达的边界）

- **工具定位**：本 skill 是科研提效工具，与大多数工具一样**不保障产出百分百真实完美**；所有结论、数据、引文与文本必须经**用户人工审核**，并由具备专业能力的研究者**从专业层面对结果进行取舍**；AI 不能替代同行评审、伦理审查与作者的学术责任
- 产出为**研究辅助**，不构成临床建议；投稿前所有引文与统计结果须经人工复核
- 初稿若使用了 AI 辅助写作，按 ICMJE/目标期刊政策**如实披露**
- 模拟数据口径的演示结果**不可**用于任何正式发表或决策

## 开源说明

本 skill 采用「**可移植 core + harness 适配层**」架构：`core/pipeline.md` 是与具体 agent 平台无关的流水线协议（阶段×角色×关卡×提示词），任何 agent（ZCode/Claude Code/Codex/DeepSeek harness/WorkBuddy…）都能照此执行；本 SKILL.md 与 `~/.zcode/workflows/provenance-lab.dwf.ts` 是 ZCode 适配层（动态工作流加速）。以 Apache-2.0 发布（LICENSE/NOTICE 见仓库）；机制借鉴的开源项目见文首链接与 NOTICE；运行时依赖本机已安装的 google-deepmind/science-skills（Apache-2.0，不在本包内再分发）。

---
name: provenance-lab
description: >-
  ProvenanceLab 溯源科研流水线（临床医学/流行病学/心理学及相关健康科学（护理/公共卫生/药学/康复等））：选题（PICO/FINER）→ 多库文献检索
  （PubMed/EuropePMC/OpenAlex/SemanticScholar+按领域路由）→ 引文逐条核查 → 预注册式统计计划 →
  分析与复现关卡 → 统计审稿 → IMRaD 初稿 → 同行评审模拟 → 答辩拷问 → 引文深审（溯源/原文比对/必要性）→
  文献 PDF 归档 → 审计包。当用户要求"科研团队/研究流水线/选题到初稿"时使用。启动前先完成 grill 式研究访谈。
---

# ProvenanceLab（Claude Code 适配层）

完整协议见本 skill 目录内的 `pipeline.md`（与本文件同目录，安装时已复制）——**它是唯一权威来源**，请严格按其执行。

## 执行要点（Claude Code 特化）

1. **研究访谈**：按 pipeline.md §1 的 grill 式逐问（一次一问、附推荐答案），可选项时给出你的建议并等用户确认。
2. **角色与子 agent**：每个阶段角色尽量用 Agent 工具（旧称 Task）派独立子 agent（把关角色必须独立上下文）；多库检索并行派出。无法派子 agent 时由你自己按角色顺序执行，但把关角色的结论必须亲自读文件/跑命令得出。
3. **模型分层（可选）**：如可用多模型，把关与核心角色（统计、审稿、写作、引文深审）用最强模型，检索可用轻量模型；统计永不降级。
4. **工具**：文献检索优先用 WebFetch/WebSearch 直接调 PubMed E-utilities、EuropePMC、OpenAlex、Semantic Scholar API（pipeline.md §0 规则 6 与 S2 合法性分层）；分析用 Bash 跑 Python（uv/pip 安装依赖）。
5. **产物**：全部写入 `provenance-lab-output/`（有数据集时放数据集文件夹下），最终按 pipeline.md §8 交付五件套 + 审计包并输出结论/发现/已验证/未覆盖四段式报告。
6. **确定性工具层**（pipeline.md §0 规则 12）：本 skill 目录下的 `tools/plab.py`（安装时已复制，仅需 python3）用 Bash 调用——S2 关卡前 `resolve --file <纳入文献 JSON>` 逐条解析标识符与撤稿状态；S4 第一步 `schema <数据文件>`；S7.6 `oa-fetch --draft 06-draft.md --dir provenance-lab-output/papers`；S8 `whitelist 06-draft.md --allowed <证据表 id> --allowed-from 03-sap.md` 与 `statcheck 06-draft.md`。工具结论优先于子 agent 自报；工具结果 JSON 存到 `provenance-lab-output/tool-records/` 供审计；工具不可用时回落到 agent 核查并写进未覆盖清单。
7. **诚实红线**：查不到、答不出就进"未覆盖"清单；绝不编造文献与数据；绝不绕过付费墙或爬取 Google Scholar。

**D39 关卡纪律**：轻微转述/限定语警示也须修正复核，保留文献不等于保留错误表述；无原文支持的实质限定语判 unsupported。设计期效能计算连同脚本/种子/命令/汇总冻结至 `03-sap-code/` 并交付。statcheck 支持 Markdown 斜体与中间 CI，零匹配必须披露，不能判通过；解析未确认条目与未知 PDF 许可证单列，未下载不等于付费墙。
最近审稿 minor 无关闭复核须披露，图表返工未再次复核不得称验收通过，总交付状态涵盖未通过关卡。

**D40 全量账本与复现计数**：深审每个引用点分配稳定 auditEntryId，定向复核按键更新并保留其余点，缺失/重复/范围外键须披露，汇总不能替代明细；Markdown/JSON/遥测由同一账本生成。分析产物 SHA-256 清单以 `plab manifest` 核对，数量取 listed/verified；当前清单匹配不等于独立干净重跑。

**D41 修正与版本边界**：第 2 轮除确定性硬失败外的所有失败均获最后一次定向修正复核，同 PMID/DOI 的新问题也不例外；纠正 title/design/finding 等字段，禁止静默删换文献，最后仍失败才剔除，标识符不存在/撤稿/关注硬关卡不变。分析员初次完成及 verifyCommand/可移植性修复后、统计审稿前记录基线，文献归档结束、审计包前以 `plab source-snapshot` 比较 `03-sap-code/` 与 `04-analysis/` 的脚本/依赖锁文件增删改（排除 `figures-polished/` 等呈现目录）；变化使此前复现记录不再确认最终版本，须正式重跑重冻结，未变也不证明独立重跑，产物 `manifest` 仍只核对当前快照。图表角色只在 `figures-polished/` 新建脚本，不改原分析/SAP；原分析缺陷须正式修订重跑，返工后独立视觉复核一次，仍不过就披露。SAP runner 自建输出目录。审计包与总结显式收到 textLevel 计数；摘要/无原文不可统称亲见全文核验，可纠正转述失败不可叫硬失败。真实 D41 效果待回归验证。

**D42 问题归属与最终记录**：末轮 G 键绑定文献及 originalIssues，分别记录原问题是否修好与 newIssues。原问题已修但首次出现新问题、复核返回无效、修正时未经批准删换ID，均列 pending 并禁止引用，不自动剔除或加轮次；corrected/excluded/pending 分列。02 证据表与 evidence-final.json 由代码同源生成，原综合员版另存 evidence-agent.md，写作只取非pending条目。outputsPath 固定为 04-analysis/，发布入口单列。首审单个/组合编号绑定 auditReferences 身份，复核保留身份，终稿按标识符及别名核对；身份冲突不按编号放行，none 不得授权新白名单来源。设计计算归档旧脚本，不消费正式主种子展示结果；已见结果写入 SAP，不能倒追证明先验性。D42 真实效果待回归。

**D43 身份匹配与评审材料**：复合 failedIds 先提取纯 PMID/DOI，用同一确定性记录的已核别名唯一绑定；跨文献歧义和未定位原ID保留待确认，末次 passed 不抹掉未解决的历史意见。majorIssues 非空优先于 verdict 标签，触发最多2轮修复与独立复审；完整返修 AnalysisResult 更新下游摘要，原始与实际判定存 statistical-reviews.json，未关闭 major 如实保留。答辩前保存 facts-ledger.md、review-context.json（均在 tool-records/），向拷问官与写作者提供完整评审意见及引文待确认清单，内部漏传不推给用户补材料。pipeline 图表目标依次取 figureStyleJournal、targetJournals、立题首选期刊、Nature，艺术总监与复核员使用同一目标。D43真实 L-A/L1 效果待验证。

**D44 输出与复核纪律**：manifest 跳过空白及 `#` 注释，空清单、坏条目和路径防护保留；源码快照排除 venv/.venv 及 `-`、`_` 后缀环境，不误漏普通代码目录。ZCode 工具 stdout/stderr 先落临时文件再限量回读，`--out` 完整结果保留，超限或解析失败须回落披露。深审定向复核写 JSON 文件、只回复完成短句，先清空防旧文件；代码校验对象/数组、唯一键、枚举和删除依据，无效则保留首审问题。题录单列 bibliography=match/mismatch/unknown；作者、期刊等已确认错误须标 mismatch 送修，旧记录缺省 unknown，不以 supported 加 note 放行。analysisSummaryIssues 与 major 一同触发最多2轮分析修订和独立复审，刷新完整 AnalysisResult，建议型 minor 继续待关闭。统计图须核对计算对象：CPR 用全模型残差加 βx；原分析缺陷须正式修订、重跑、重冻结，旧复现记录失效。续跑核对原 args、实际脚本差异及累计 tokens/耗时，不能只报末段耗时；Amend 缺参数属宿主续跑问题，不把本轮课题硬编码进通用工作流。未关闭摘要错误与题录未确认数分别计 openSummaryIssues、bibliographyUnknown；评审语义判断仍为 medium/unconfirmed，不冒充代码确认。真实 D45 和 L1 尚未验证。

**D45 执行修复**：深审复核文件的 updated 允许完整条目平铺或 {entry} 外壳，取出对象后仍须通过稳定键、枚举、删除依据与源身份检查；禁止按顺序或 DOI 猜配。首审解析具体引用点中前置、中置、后置及组合范围编号，绑定当时文献身份，复核与最终核对不借当前编号重绑；none 仍不能扩白名单，身份覆盖不证明语义。图表角色以 sourceIssues 明列原源码错误，编排最多一次 Analyst 正式修订重跑重冻、StatRev 独立复审及图表重绘复核；未执行或仍失败则关卡 issues，passed 标签与移交待办不能清除。正式修订机会针对首轮图表审计/复核已报告的源错误；最后一次复核首次发现的新源错误保留并阻断，不再增加循环。独立 figure-polish 模式只披露原源码问题并标 issues，不自行新增 SAP/分析流程。保留初始源快照，源码变化使旧复现声明失效。统计审稿亦须 code-to-data，只回传计数、比例、范围与核对布尔，禁止回显数据 CSV 行或原始单元格；这是提示约束，实际越界照实记录。sourceIssues 缺失或错形状时保留“关闭状态未确认”，不得崩溃或当空数组通过。首稿 Writer 直接收到 figuresVerified、figureSourceIssues 和 AnalysisResult.caveats；末轮新源错误同样披露，涉错图件及结果不得作为已验收内容引用。画像须区分全程墙钟、末段、同一运行 ID 内完整成对 run-started/run-settled 事件的区间合计及段间隔；缺失、错序或重叠事件不推算活动时间。累计 tokens 仍不按续跑段相加。D44 实测摘要修订与题录送修，但整轮未通过；真实 D45 与 L1 尚待验证。


**D46 文件与标识符边界**：DOI 后的 `〔来源说明〕` 是题录注释，不属于 DOI；工具层与编排层使用一致边界，仍以规范标识符及已核别名匹配，不能靠标题或“证据表”字样放行，deny/撤稿关卡保留。角色返回文件路径时，先核实原路径为真实文件（合法括号文件名照常保留）；仅当返回值是约定路径加括注说明、且约定文件确实存在时分离说明并留档，其他不存在路径尽早报错，不猜文件、不制造替代品。SAP 路径须在分析和白名单读取前核对，修订稿路径每次返回后核对，发布入口也核对。新深审响应必须填 bibliography，历史缺字段仍按 unknown 披露，不能自动补 match。 已核PMID/DOI须写入参考文献，包括SAP方法学来源；未取到标识符的文献如实待确认，不能编造ID或跳过状态审计。首轮转述问题经第二次核查明确通过后也计 corrected；中间有歧义或 pending 不凭遗漏意见判修正。画像允许运行字段与起止事件最多1秒的持久化偏差，超过范围仍披露事件不足；累计 tokens 不相加。许可证未知数须实际插值。宿主 Amend 丢 args 或缓存断链只记录实际恢复证据，不把课题参数硬编码入通用工作流。D45 部分机制实测生效，整轮未通过；真实 D46 与 L1 三次尚未验证。


**D48 引用点溯源边界**：primary 按当前论断的直接出处判定；综述/meta 自身汇总结果、方法或新分析可直接引用，不因文献类型被判为二手。借综述转述原研、或把综述冒充原始队列/试验，仍须 secondary-needs-tracing 并纠正。逐条核对结构字段与处置说明，不能用“建议保留”自动清除问题。既有引文关卡保持；新提示的真实遵从效果待验证。运行协议不携带植错集答案或历史分数，评测结果单独留在evaluation中。


**D49 复核输入与修正计数**：每次统计审稿前，由代码按轮次保存原始SAP/AnalysisResult到tool-records/statistical-review-input-N.json；返修和图表源修订均保存新轮，旧轮不覆盖。逐字比对须直接读取本轮JSON与冻结输出，禁止手工重建数组后冒充原始提交；输入归档失败保留未确认，不自动通过。引文二次核查可用passedIds逐条明确首轮送修项已通过，即使其他条目仍失败，也计入修正保留；未列失败不等于通过，缺失/重复/与失败冲突/身份不明或pending不计。统计审稿轮数取实际历史记录长度，包含首次审稿及全部复审。硬失败、末轮定向复核和科研完整性规则不变。上述改动经预检后仍须真实运行验证。


**D50 有界归档与工具异常**：OA下载仍保留900秒停止新增请求的软预算；ZCode外层调用显式允许1200秒，包含解析与在途请求收尾，不沿用300秒默认值。确定性工具调用抛出超时或其他异常时记失败与未确认、保留已有文件，回落后继续审计包及指标交付，不冒充工具成功。归档回落先盘点部分PDF并核对身份/文件类型，不清空覆盖、不凭文件数宣称完成，来源及许可证未知照实披露。科学关卡和下载合法性规则不变；模拟时间与异常预检不代表真实宿主超时已验证。

**D51 分析交接记录**：代码保存审稿后 AnalysisResult 快照；Writer、Archivist、Scribe只读机器记录，勘误写入各自文稿，不静默改写上游 JSON 或冒充独立复审。审计包前及最终交付前按 JSON 内容核对交接文件与快照；变化、缺失或非法内容留档并标记未通过，核对失败标未确认，保留现场不自动覆盖。只改空白或键序不算内容变化；此核对不替代分析重跑、科学判断或宿主隔离。

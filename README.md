# ProvenanceLab — 溯源科研流水线

[**中文**](README.md) | [English](README.en.md)

> **为真理，不为名利；把繁琐交给机器，让结论经得起推敲。**
> *For truth, not glory. Machines take the toil — every claim stands scrutiny.*
>
> 为真理而研究，为人民而应用，让世界更进一步——不为名利。把繁琐交付 AI，把时间还给研究者，去想清楚一个真正的科学问题。让科研看得见：每一步有迹可循，每个结论经得起推敲与论证。
>
> （产品副标语：Every claim, traceable. 每一个论断，都可溯源。）

**ProvenanceLab**（provenance-lab）— 跨 harness 溯源科研流水线，面向临床医学、流行病学、心理学及相关健康科学领域（护理、公共卫生、药学、康复、营养等）的"选题 → 文献证据 → 统计分析 → 交叉验证 → 论文初稿 → 答辩拷问"全流水线，一套协议适配多种 agent（ZCode / Claude Code / Codex / DeepSeek harness / WorkBuddy…）。多语言交付（English / 中文 / Español…），支持关联用户合法持有的私有文献库。

```
core/pipeline.md（平台无关协议：阶段×角色×关卡×提示词）
        │
        ├── adapters/zcode        skill + 动态工作流（多agent编排加速）
        ├── adapters/claude-code  SKILL.md（Agent Skills 开放格式）
        ├── adapters/codex        /provenance-lab 提示
        └── 其他 harness          直接把 pipeline.md 放进系统提示/规则文件
```

```
选题主席 → 方法学评审 → 检索×3(PubMed/EuropePMC/OpenAlex) → 证据综合 → 引文核查 ─┐
                                                                                ↓
预审回应信 ← 答辩拷问(grill-me式) ← 同行评审模拟(1~3审+总评审+对抗挑战)          ← 统计审稿 ← 分析执行 ← 预注册SAP
     ↓
交付五件套：论文初稿 / 回应信 / 证据表 / SAP / 分析脚本与输出
```

## 它防什么

多智能体科研自动化最大的风险不是"做不出来"，而是"看起来做出来了"：编造引文、p-hacking、结果驱动的分析切换、报喜不报忧。每个环节针对一类造假设关卡：

| 风险 | 对策 |
|---|---|
| 编造文献 | 引文白名单：初稿只准引用经逐条落地核查（PMID/DOI）的证据表文献或本研究自身结果；标识符存在性与撤稿/更正状态由代码逐条解析，交付前代码终检"初稿引用 ⊆ 白名单"（`tools/plab.py`） |
| p-hacking | 预注册式 SAP：统计方法学家在看到任何结果**之前**定死分析计划 |
| 统计不规范 | 统计审稿：假设检验、多重比较校正、效应量+95% CI、与 SAP 一致性 |
| 统计报告与数值不符 | 代码从 APA 格式报告（t/F/χ²/r/z + 自由度）复算 p 值，标记不一致与显著性判定翻转（statcheck 思路，独立实现） |
| 结论夸大 | 对抗挑战员 + 答辩拷问官（6/8/10 个"答不好就拒稿"级问题，答不出就诚实列为待补） |
| 修不动就摆烂 | 停滞检测：审稿人报告上轮问题仍未解决的条数，全部遗留 → 根因诊断员换思路 |
| 不可复现 | 固定随机种子 + 一键重跑 + 可选确定性验收命令 |
| 报喜不报忧 | 最终报告强制"未覆盖/待补"清单 |

D39：转述与限定语警示均先修正复核，阴性证据不因可纠正表述而删除；统计终检支持 Markdown/CI，零匹配与未解析标识符如实披露；设计期效能脚本随 SAP 冻结交付，PDF 未知许可证与下载失败原因单列。最近审稿 minor 无关闭复核须披露，图表返工未再次复核不得称验收通过，总交付状态涵盖未通过关卡。

深审复核按稳定引用点键更新全量账本，防止明细与摘要级覆盖数丢失；`plab manifest` 核对冻结清单和实际产物数，当前快照核对与独立重跑分别披露。

D41：第二轮所有可纠正失败再获最后一次定向修正复核，包括同一文献新引入的错误；源码快照追踪分析/SAP脚本和锁文件变化，旧复现记录不能确认改过的最终版本。图表角色只写呈现目录，返工后独立复核一次；原分析缺陷须正式重跑重冻结。审计包与总结分列全文、摘要、无原文覆盖。源码未变和产物清单匹配均不等于独立重跑；真实回归效果待验证。

D42：末轮复核区分原问题与新问题；新问题或无效复核列为待确认并禁止引用，不自动删除。最终证据表与机器记录由代码同源生成；分析目录与发布入口分开，组合引用按源身份核对，无原文条目不能授权新引用。已见主种子结果须在 SAP 披露，旧脚本随设计计算归档。真实效果待回归。

D43：复合标识符按已核别名绑定到同一文献，歧义意见保留待确认。统计 major 列表优先于标签，返修结果更新下游摘要；答辩共享已落盘的完整账本与评审意见。图表重绘和验收使用同一期刊目标。真实 L-A/L1 效果待验证。

D44 实测分析摘要修订与题录送修，仍暴露复核条目形状、首审编号绑定和原图源码修订未执行等问题。D45 接受平铺或外壳复核条目并保留逐键校验，首审绑定含范围的中后置编号；原图源码错误须有界正式修订、重跑重冻与复审，未关闭则图表关卡不通过。统计审稿禁止回显数据行或原始单元格；提示约束不冒充技术拦截。sourceIssues 缺失或错形状时保留“关闭状态未确认”，不得崩溃或当空数组通过。首稿 Writer 直接收到 figuresVerified、figureSourceIssues 和 AnalysisResult.caveats；末轮新源错误同样披露，涉错图件及结果不得作为已验收内容引用。画像须区分全程墙钟、末段、同一运行 ID 内完整成对 run-started/run-settled 事件的区间合计及段间隔；缺失、错序或重叠事件不推算活动时间。累计 tokens 仍不按续跑段相加。 真实 D45 与 L1 尚待验证。

## 安装

```bash
git clone https://github.com/CalebChen941028/provenance-lab.git
cd provenance-lab
bash install.sh     # 自动探测 ZCode / Claude Code / Codex / opencode 并安装对应适配层
```

| Harness | 安装内容 | 用法 |
|---|---|---|
| ZCode | skill + 动态工作流（多 agent 并行、看板、混合编队）+ 确定性工具层 | `/provenance-lab <研究方向>` |
| Claude Code | SKILL.md（+ 英文速览）+ 中英协议副本 + 确定性工具层（Agent 工具派子 agent 扮演各角色） | `/provenance-lab <研究方向>` |
| Codex CLI | `/provenance-lab` 自定义提示；协议与确定性工具层装在 `~/.codex/provenance-lab/` | `/provenance-lab <研究方向>` |
| opencode | 协议、注入器与确定性工具层装到 `~/.config/opencode/provenance-lab/`，把注入器内容追加进 AGENTS.md | 对 agent 说"按 ProvenanceLab 协议执行：<研究方向>" |
| DeepSeek harness / WorkBuddy 等 | 把 `adapters/universal/system-prompt.zh.md` 与 `core/pipeline.md` 放入系统提示/规则文件（可附 `tools/plab.py`） | 对 agent 说"按 ProvenanceLab 协议执行：<研究方向>" |

**伴生技能 [natural-voice](adapters/zcode/skills/natural-voice/SKILL.md)**：中英双语去AI腔语态引擎（学术论文/课题申报/科普/社媒/商务），ProvenanceLab 的初稿、回应信与总结均按其规范撰写；也可单独使用（把任意文案丢给 agent 说"按 natural-voice 重塑"）。

可选增强：[google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)（提升文献检索质量，未安装时自动降级为直接 API 调用）、[uv](https://docs.astral.sh/uv/)（Python 依赖管理）。确定性工具层只需系统自带的 `python3`，无需安装任何包；设置环境变量 `PLAB_MAILTO` 可加入 OpenAlex/Crossref 礼貌访问池并启用 Retraction Watch 查询（不设则不发送任何邮箱）。

## 使用

`/provenance-lab 二甲双胍与乳腺癌风险：队列研究的证据综合`

交互流程（各 harness 一致）：

1. **grill 式研究访谈**：一次一问、附推荐答案，直到研究意图/数据现实/期刊/用途清晰（借鉴 [grill-me](https://github.com/mattpocock/skills)）
2. **配置确认**：编队档位（hybrid/quality/economy）+ 评审严格度（development/demo/benchmark）+ 强/轻模型搭配（支持的 harness）
3. 自动执行全流水线，产出五件套交付物 + 四段式报告（结论/发现/已验证/未覆盖）

**数据条件**：无真实数据时用固定种子模拟数据演示全流程（一切产物显式标注，不得用于发表）；有数据须先去标识化。

## 仓库结构

```
├── LICENSE / NOTICE.md            # Apache-2.0；归属、版权边界、免责声明
├── install.sh                     # 多 harness 自动安装（含确定性工具层）
├── core/pipeline.md · .en.md      # ★ 平台无关协议（中文权威版 + 英文等价版）
├── tools/plab.py                  # 确定性工具层（仅标准库）：标识符/撤稿解析、白名单终检、p 值复算、合法 OA 下载、schema
├── adapters/
│   ├── zcode/                     # SKILL.md + provenance-lab.dwf.ts（动态工作流）
│   ├── claude-code/               # SKILL.md（+ 英文速览）
│   ├── codex/                     # /provenance-lab 提示
│   └── universal/                 # DeepSeek harness / WorkBuddy / opencode 等通用注入
├── evaluation/                    # 评测协议、L1 植错集、评分与逐角色 token 画像脚本、结果汇总
├── ci/                            # 工作流类型检查、对抗式模拟运行、全域同步检查
├── examples/                      # 示例产物：psu-sleep-simulation（基准全流程）、la-caffeine-test-anxiety（轻量回归，全套产物可一键重跑并 sha256 核验）
└── docs/development-log.md        # 设计与决策日志（D0 起）
```

为新 harness 贡献适配层：在 `adapters/<name>/` 放一个薄入口（引用 core/pipeline.md，翻译成该平台的 skill/提示词格式）。适配层里的协议副本由 `python3 ci/check_sync.py` 保证与 core 逐字节一致，core 是单一来源。

## 配额韧性与自动恢复

订阅制模型计划的 5 小时窗口限额会中断长流程。ProvenanceLab 的应对：

- **瞬时限流**：运行时自动退避重试，无需干预
- **确定性配额停止（含重置时间）**：skill 会按重置时间创建一次性定时任务**自动恢复运行**（已完成步骤零成本重放），或立即把重档模型切到备用厂商续跑（跨厂商配额池独立）
- **重度用户建议**：把重档模型指向按量计费（API 直链）provider——只在余额欠费时中断
- **注意**：配额不会提前预警（1308 仅在耗尽时返回，窗口为账户级共享、无法预估余量）；事前只能自查用量面板或改按量

## 伦理与合规

- 输入数据须**去标识化**，分析全部本地执行，本项目不收集任何数据
- 产出为研究辅助，不构成临床建议；**投稿前必须人工复核全部引文与统计结果**
- AI 辅助写作按 ICMJE/目标期刊政策如实披露
- 报告规范（CONSORT/STROBE/PRISMA 等）仅按名称引用，不内嵌版权文本（见 NOTICE）

## 评测（How it is measured）

口号要求 every claim stands scrutiny，评测体系自身也一样：

- **L0 遥测**：每次运行由代码落盘 `99-metrics.json`（关卡通过率/退回轮数/深审统计/确定性工具层结果），跨运行成基线，优化合入以指标不恶化为条件；`evaluation/run_profile.py` 生成逐角色 token 对照
- **L1 植错测试集**：`evaluation/` 提供 11 例引用（9 例植错：编造/撤稿/夸大/张冠李戴/二手充一手/错位；1 例更正状态文献；1 例干净对照），标识符与状态均经 PubMed/Crossref/OpenAlex 核验，附期望判定——`evaluation/score_l1.py` 确定性计分（敏感度/特异度，多次运行报均值与范围）；协议见 [evaluation/PROTOCOL.md](evaluation/PROTOCOL.md)
- **离线预检与 CI**：工具层单元测试、工作流类型检查、对抗式模拟运行（脚本化 agent + 真实工具：核查员漏判、检索源崩溃、白名单外引用、p 值不自洽都须被代码关卡拦下；工具缺失时须优雅回落）、全域同步检查——每次推送由 GitHub Actions 运行，零 token

## 路线图

- **v1.1 神经影像模块（EEG / fNIRS）**：预处理+ERP/频域+cluster 级校正（EEG）；探头几何/MBLL/GLM（fNIRS）。以领域关卡保证质量——领域 SAP 模板冻结方法学决策点、领域审稿人、高维多重比较进预注册
- **v1.2 fMRI**：BIDS、流水线参数、FWE/FDR 校正

详见 [docs/development-log.md](docs/development-log.md)（决策 D14）。当前版本支持结构化表格数据；神经信号以"派生特征表"方式接入全流程，原始信号级支持随上述模块交付。

## 致谢

机制借鉴（未复制代码）：[AI-Scientist](https://github.com/SakanaAI/AI-Scientist)、[Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory)、[PaperQA2](https://github.com/Future-House/paper-qa)、[STORM](https://github.com/stanford-oval/storm)、[AgentReview](https://github.com/ahren09/agentreview)、[Magentic-One](https://github.com/microsoft/autogen)、[claude-flow](https://github.com/ruvnet/ruflo)、[grill-me](https://github.com/mattpocock/skills)；运行时可选依赖 [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills)。完整归属见 [NOTICE.md](NOTICE.md)。

## 许可

[Apache-2.0](LICENSE) © 2026 provenance-lab contributors


**D46 文件与标识符边界**：DOI 后的 `〔来源说明〕` 是题录注释，不属于 DOI；工具层与编排层使用一致边界，仍以规范标识符及已核别名匹配，不能靠标题或“证据表”字样放行，deny/撤稿关卡保留。角色返回文件路径时，先核实原路径为真实文件（合法括号文件名照常保留）；仅当返回值是约定路径加括注说明、且约定文件确实存在时分离说明并留档，其他不存在路径尽早报错，不猜文件、不制造替代品。SAP 路径须在分析和白名单读取前核对，修订稿路径每次返回后核对，发布入口也核对。新深审响应必须填 bibliography，历史缺字段仍按 unknown 披露，不能自动补 match。 已核PMID/DOI须写入参考文献，包括SAP方法学来源；未取到标识符的文献如实待确认，不能编造ID或跳过状态审计。首轮转述问题经第二次核查明确通过后也计 corrected；中间有歧义或 pending 不凭遗漏意见判修正。画像允许运行字段与起止事件最多1秒的持久化偏差，超过范围仍披露事件不足；累计 tokens 不相加。许可证未知数须实际插值。宿主 Amend 丢 args 或缓存断链只记录实际恢复证据，不把课题参数硬编码入通用工作流。D45 部分机制实测生效，整轮未通过；真实 D46 与 L1 三次尚未验证。


**D48 引用点溯源边界**：primary 按当前论断的直接出处判定；综述/meta 自身汇总结果、方法或新分析可直接引用，不因文献类型被判为二手。借综述转述原研、或把综述冒充原始队列/试验，仍须 secondary-needs-tracing 并纠正。逐条核对结构字段与处置说明，不能用“建议保留”自动清除问题。既有引文关卡保持；新提示的真实遵从效果待验证。运行协议不携带植错集答案或历史分数，评测结果单独留在evaluation中。


**D49 复核输入与修正计数**：每次统计审稿前，由代码按轮次保存原始SAP/AnalysisResult到tool-records/statistical-review-input-N.json；返修和图表源修订均保存新轮，旧轮不覆盖。逐字比对须直接读取本轮JSON与冻结输出，禁止手工重建数组后冒充原始提交；输入归档失败保留未确认，不自动通过。引文二次核查可用passedIds逐条明确首轮送修项已通过，即使其他条目仍失败，也计入修正保留；未列失败不等于通过，缺失/重复/与失败冲突/身份不明或pending不计。统计审稿轮数取实际历史记录长度，包含首次审稿及全部复审。硬失败、末轮定向复核和科研完整性规则不变。上述改动经预检后仍须真实运行验证。


**D50 有界归档与工具异常**：OA下载仍保留900秒停止新增请求的软预算；ZCode外层调用显式允许1200秒，包含解析与在途请求收尾，不沿用300秒默认值。确定性工具调用抛出超时或其他异常时记失败与未确认、保留已有文件，回落后继续审计包及指标交付，不冒充工具成功。归档回落先盘点部分PDF并核对身份/文件类型，不清空覆盖、不凭文件数宣称完成，来源及许可证未知照实披露。科学关卡和下载合法性规则不变；模拟时间与异常预检不代表真实宿主超时已验证。

**D51 分析交接记录**：代码保存审稿后 AnalysisResult 快照；Writer、Archivist、Scribe只读机器记录，勘误写入各自文稿，不静默改写上游 JSON 或冒充独立复审。审计包前及最终交付前按 JSON 内容核对交接文件与快照；变化、缺失或非法内容留档并标记未通过，核对失败标未确认，保留现场不自动覆盖。只改空白或键序不算内容变化；此核对不替代分析重跑、科学判断或宿主隔离。

**D52 组合标识符分隔**：DOI 与补充标识符之间的 `|` 或 `｜` 是分隔符，不属于 DOI；工具与编排按同一边界提取。只解析实际 DOI，不据相邻文本自动确认别名、恢复被删条目或清除未经批准换 ID 的 pending；白名单、deny、撤稿及真正不存在的硬失败规则不变。 所有角色均须显式收到code-to-data约束，模拟数据同样适用；查结构用schema，禁止head/cat/tail/grep/sed原始CSV或回显DataFrame行。提示合同不代表宿主隔离，真实回显仍判违规。

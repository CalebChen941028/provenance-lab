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

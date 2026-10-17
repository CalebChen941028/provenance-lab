# NOTICE

**ProvenanceLab**（provenance-lab）— 跨 harness 溯源科研流水线（agent skill + workflow 协议）

Copyright 2026 provenance-lab contributors. Licensed under the Apache License, Version 2.0.

## 归属说明（Attribution）

本项目在**机制设计**上借鉴了以下开源项目/技能（均为思想层面借鉴，未复制任何源代码）：

| 项目 | 许可证 | 借鉴的机制 |
|---|---|---|
| [SakanaAI/AI-Scientist](https://github.com/SakanaAI/AI-Scientist) | Apache-2.0（代码） | 新颖性定位、自动审稿+修订循环 |
| [SamuelSchmidgall/AgentLaboratory](https://github.com/SamuelSchmidgall/AgentLaboratory) | Apache-2.0 | 分阶段专家流水线、人工确认点 |
| [Future-House/paper-qa (PaperQA2)](https://github.com/Future-House/paper-qa) | Apache-2.0 | 引文落地核查（主张↔真实文献） |
| [stanford-oval/storm](https://github.com/stanford-oval/storm) | Apache-2.0 | 大纲驱动写作、多视角提问 |
| [ahren09/AgentReview](https://github.com/ahren09/agentreview) | MIT | 多评审人 + 总评审的评审模拟 |
| [microsoft/autogen (Magentic-One)](https://github.com/microsoft/autogen) | MIT / CC-BY-4.0 | 双账本、停滞检测与重规划 |
| [ruvnet/claude-flow](https://github.com/ruvnet/ruflo) | MIT | 共享事实账本（黑板模式） |
| [mattpocock/skills（grill-me / grilling）](https://github.com/mattpocock/skills) | 见其仓库 | 一次一问+推荐答案的拷问式访谈、答辩拷问思想 |
| [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills) | Apache-2.0（代码）/ CC-BY-4.0（内容） | 运行时可选依赖：文献/数据库检索技能（本项目不再分发其内容） |

技能文件格式遵循开放的 [Agent Skills](https://agentskills.io) 规范（SKILL.md + YAML frontmatter）。

## 版权边界声明

- **报告规范不内嵌**：CONSORT、STROBE、PRISMA、GRADE、Cochrane RoB 2 / ROBINS-I、NOS 等官方清单/文本受各自版权保护（EQUATOR Network 及各协作组），本项目仅**按名称引用**，由 agent 运行时查阅原版，仓库内不包含其文本。
- **不使用受保护的患者数据**：本项目不收集、不传输任何数据；分析全部在用户本机执行。用户须自行确保输入数据已去标识化并符合所在辖区隐私法规（HIPAA、GDPR、个人信息保护法等）。
- **商标**：ZCode、Claude、Codex、DeepSeek、Google、Antigravity、PubMed、EuropePMC、OpenAlex 等名称权利归各自所有者；提及仅为兼容性描述，不构成背书。

## 免责声明

**工具定位**：本项目是科研提效工具，与大多数工具一样不保障产出百分百真实完美；所有结论、数据、引文与文本必须经用户人工审核，并由具备专业能力的研究者从专业层面取舍与负责；AI 不能替代同行评审、伦理审查与作者的学术责任。

产出为**研究辅助材料**，不构成医学临床建议，不能替代同行评审与人工核验。投稿前必须人工复核全部引文与统计结果；AI 辅助写作按 ICMJE/目标期刊政策如实披露。模拟数据演示口径的结果不得用于正式发表或任何决策。

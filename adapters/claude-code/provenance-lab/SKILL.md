---
name: provenance-lab
description: >-
  ProvenanceLab 溯源科研流水线（临床医学/流行病学/心理学）：选题（PICO/FINER）→ 多库文献检索
  （PubMed/EuropePMC/OpenAlex/SemanticScholar+按领域路由）→ 引文逐条核查 → 预注册式统计计划 →
  分析与复现关卡 → 统计审稿 → IMRaD 初稿 → 同行评审模拟 → 答辩拷问 → 引文深审（溯源/原文比对/必要性）→
  文献 PDF 归档 → 审计包。当用户要求"科研团队/研究流水线/选题到初稿"时使用。启动前先完成 grill 式研究访谈。
---

# ProvenanceLab（Claude Code 适配层）

完整协议见本 skill 目录内的 `pipeline.md`（与本文件同目录，安装时已复制）——**它是唯一权威来源**，请严格按其执行。

## 执行要点（Claude Code 特化）

1. **研究访谈**：按 pipeline.md §1 的 grill 式逐问（一次一问、附推荐答案），可选项时给出你的建议并等用户确认。
2. **角色与子 agent**：每个阶段角色尽量用 Task 工具派独立子 agent（把关角色必须独立上下文）；多库检索并行派出。无法派子 agent 时由你自己按角色顺序执行，但把关角色的结论必须亲自读文件/跑命令得出。
3. **模型分层（可选）**：如可用多模型，把关与核心角色（统计、审稿、写作、引文深审）用最强模型，检索可用轻量模型；统计永不降级。
4. **工具**：文献检索优先用 WebFetch/WebSearch 直接调 PubMed E-utilities、EuropePMC、OpenAlex、Semantic Scholar API（pipeline.md §0 规则 6 合法性分层）；分析用 Bash 跑 Python（uv/pip 安装依赖）。
5. **产物**：全部写入 `provenance-lab-output/`（有数据集时放数据集文件夹下），最终按 pipeline.md §8 交付五件套 + 审计包并输出结论/发现/已验证/未覆盖四段式报告。
6. **诚实红线**：查不到、答不出就进"未覆盖"清单；绝不编造文献与数据；绝不绕过付费墙或爬取 Google Scholar。

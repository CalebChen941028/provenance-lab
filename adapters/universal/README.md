# Universal Adapter（DeepSeek harness / WorkBuddy / opencode / 任意 agent）

适用于一切支持"系统提示 / 自定义指令 / 规则文件 / AGENTS.md"的 agent。两种语言版本按用户选择其一注入：

- 中文用户：把 `system-prompt.zh.md` 全文放入你的 agent 的系统提示/规则设置，并附上 `../../core/pipeline.md`
- English users: inject `system-prompt.en.md` into your agent's system prompt / custom instructions, alongside `../../core/pipeline.en.md`
- 可选 / optional：把 `../../tools/plab.py` 放到 agent 能执行的位置并在提示中注明路径，即启用确定性工具层（仅需 python3）

## 各平台注入位置速查

| Harness | 注入位置 |
|---|---|
| **opencode** | `~/.config/opencode/AGENTS.md`（全局）或项目 `AGENTS.md`——追加 `system-prompt.zh/en.md` 内容；协议全文放同目录并在其中引用 |
| **DeepSeek harness** | 自定义指令/系统提示设置 |
| **WorkBuddy** | 规则/自定义指令设置 |
| 其他任意 agent | 任何"常驻指令"入口 |

使用：对 agent 说「按 ProvenanceLab 协议执行：<研究方向>」（或 "Follow the ProvenanceLab protocol: <topic>"）。

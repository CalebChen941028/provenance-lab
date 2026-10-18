#!/bin/bash
# provenance-lab 安装脚本：自动探测已安装的 agent harness 并安装对应适配层
set -e
cd "$(dirname "$0")"
TS=$(date +%Y%m%d-%H%M%S)
backup() { [ -f "$1" ] && cp "$1" "$1.bak-$TS" && echo "已备份：$1 → $1.bak-$TS" || true; }
installed=0

# ZCode
if [ -d "$HOME/.zcode" ]; then
  mkdir -p ~/.zcode/workflows ~/.zcode/skills/provenance-lab ~/.zcode/skills/natural-voice
  backup ~/.zcode/workflows/provenance-lab.dwf.ts
  backup ~/.zcode/skills/provenance-lab/SKILL.md
  cp adapters/zcode/workflows/provenance-lab.dwf.ts ~/.zcode/workflows/
  cp adapters/zcode/skills/provenance-lab/SKILL.md ~/.zcode/skills/provenance-lab/
  cp adapters/zcode/skills/natural-voice/SKILL.md ~/.zcode/skills/natural-voice/
  cp core/pipeline.md ~/.zcode/skills/provenance-lab/pipeline.md
  echo "[ZCode] 已安装（skill + 动态工作流 + 协议副本）"
  installed=1
fi

# Claude Code
if [ -d "$HOME/.claude" ]; then
  mkdir -p ~/.claude/skills/provenance-lab
  backup ~/.claude/skills/provenance-lab/SKILL.md
  cp adapters/claude-code/provenance-lab/SKILL.md ~/.claude/skills/provenance-lab/
  mkdir -p ~/.claude/skills/natural-voice
  cp adapters/claude-code/natural-voice/SKILL.md ~/.claude/skills/natural-voice/
  cp core/pipeline.md ~/.claude/skills/provenance-lab/pipeline.md
  echo "[Claude Code] 已安装（skill + 协议副本，重启会话生效）"
  installed=1
fi

# Codex CLI
if [ -d "$HOME/.codex" ]; then
  mkdir -p ~/.codex/prompts
  backup ~/.codex/prompts/provenance-lab.md
  cp adapters/codex/provenance-lab.md ~/.codex/prompts/provenance-lab.md
  cp core/pipeline.md ~/.codex/prompts/provenance-lab-protocol.md
  echo "[Codex] 已安装（/provenance-lab 提示 + 协议副本）"
  installed=1
fi

# opencode (AGENTS.md convention)
if [ -d "$HOME/.config/opencode" ]; then
  mkdir -p ~/.config/opencode/provenance-lab
  cp core/pipeline.md core/pipeline.en.md ~/.config/opencode/provenance-lab/ 2>/dev/null
  cp adapters/universal/system-prompt.zh.md ~/.config/opencode/provenance-lab/
  echo "[opencode] 协议已装到 ~/.config/opencode/provenance-lab/——把 adapters/universal/system-prompt.zh.md 内容追加进 AGENTS.md 即启用（英文用户：system-prompt.en.md + pipeline.en.md）"
  installed=1
fi

if [ "$installed" -eq 0 ]; then
  echo "未检测到 ZCode / Claude Code / Codex。"
  echo "对其他 harness（DeepSeek harness、WorkBuddy 等）：把 core/pipeline.md 全文放进你的 agent 的系统提示/规则文件/自定义指令即可——协议本身与平台无关。"
  exit 0
fi

echo ""
echo "安装完成（备份后缀 .bak-$TS）。ZCode 首次运行前建议对照可用模型调整 workflows/provenance-lab.dwf.ts 顶部的 LIGHT_MODELS 表。"

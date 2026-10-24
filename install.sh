#!/bin/bash
# provenance-lab 安装脚本：自动探测已安装的 agent harness 并安装对应适配层
set -e
cd "$(dirname "$0")"
TS=$(date +%Y%m%d-%H%M%S)
backup() { if [ -f "$1" ]; then cp "$1" "$1.bak-$TS" && echo "已备份：$1 → $1.bak-$TS"; fi; }
# 确定性工具层（tools/plab.py，仅依赖 Python 标准库）：标识符解析、撤稿状态、引文白名单、统计一致性、OA 下载
install_tools() {
  mkdir -p "$1/tools"
  backup "$1/tools/plab.py"
  cp tools/plab.py tools/README.md "$1/tools/"
}
installed=0

# ZCode
if [ -d "$HOME/.zcode" ]; then
  mkdir -p ~/.zcode/workflows ~/.zcode/skills/provenance-lab ~/.zcode/skills/natural-voice
  backup ~/.zcode/workflows/provenance-lab.dwf.ts
  backup ~/.zcode/skills/provenance-lab/SKILL.md
  backup ~/.zcode/skills/natural-voice/SKILL.md
  cp adapters/zcode/workflows/provenance-lab.dwf.ts ~/.zcode/workflows/
  cp adapters/zcode/skills/provenance-lab/SKILL.md ~/.zcode/skills/provenance-lab/
  cp adapters/zcode/skills/natural-voice/SKILL.md ~/.zcode/skills/natural-voice/
  cp core/pipeline.md ~/.zcode/skills/provenance-lab/pipeline.md
  install_tools ~/.zcode/skills/provenance-lab
  echo "[ZCode] 已安装（skill + 动态工作流 + 协议副本 + 确定性工具层）"
  installed=1
fi

# Claude Code
if [ -d "$HOME/.claude" ]; then
  mkdir -p ~/.claude/skills/provenance-lab ~/.claude/skills/natural-voice
  backup ~/.claude/skills/provenance-lab/SKILL.md
  backup ~/.claude/skills/provenance-lab/SKILL.en.md
  backup ~/.claude/skills/natural-voice/SKILL.md
  cp adapters/claude-code/provenance-lab/SKILL.md adapters/claude-code/provenance-lab/SKILL.en.md ~/.claude/skills/provenance-lab/
  cp core/pipeline.md core/pipeline.en.md ~/.claude/skills/provenance-lab/
  cp adapters/claude-code/natural-voice/SKILL.md ~/.claude/skills/natural-voice/
  install_tools ~/.claude/skills/provenance-lab
  echo "[Claude Code] 已安装（skill + 中英协议副本 + 确定性工具层，重启会话生效）"
  installed=1
fi

# Codex CLI：~/.codex/prompts/ 下每个 .md 都会成为一条斜杠命令，协议与工具放在独立目录
if [ -d "$HOME/.codex" ]; then
  mkdir -p ~/.codex/prompts ~/.codex/provenance-lab
  backup ~/.codex/prompts/provenance-lab.md
  cp adapters/codex/provenance-lab.md ~/.codex/prompts/provenance-lab.md
  cp core/pipeline.md core/pipeline.en.md ~/.codex/provenance-lab/
  install_tools ~/.codex/provenance-lab
  if [ -f ~/.codex/prompts/provenance-lab-protocol.md ]; then
    # 旧版把协议放在 prompts/ 下，会多出一条 /provenance-lab-protocol 命令：改名保留，不删除
    mv ~/.codex/prompts/provenance-lab-protocol.md ~/.codex/prompts/provenance-lab-protocol.md.bak-"$TS"
    echo "已停用旧协议副本：~/.codex/prompts/provenance-lab-protocol.md → .bak-$TS（协议已移至 ~/.codex/provenance-lab/）"
  fi
  echo "[Codex] 已安装（/provenance-lab 提示 + ~/.codex/provenance-lab/ 协议与确定性工具层）"
  installed=1
fi

# opencode (AGENTS.md convention)
if [ -d "$HOME/.config/opencode" ]; then
  mkdir -p ~/.config/opencode/provenance-lab
  cp core/pipeline.md core/pipeline.en.md ~/.config/opencode/provenance-lab/
  cp adapters/universal/system-prompt.zh.md adapters/universal/system-prompt.en.md ~/.config/opencode/provenance-lab/
  install_tools ~/.config/opencode/provenance-lab
  echo "[opencode] 协议与确定性工具层已装到 ~/.config/opencode/provenance-lab/——把 system-prompt.zh.md（英文用户：system-prompt.en.md + pipeline.en.md）内容追加进 AGENTS.md 即启用"
  installed=1
fi

if [ "$installed" -eq 0 ]; then
  echo "未检测到 ZCode / Claude Code / Codex / opencode。"
  echo "对其他 harness（DeepSeek harness、WorkBuddy 等）：把 core/pipeline.md 全文放进你的 agent 的系统提示/规则文件/自定义指令即可——协议本身与平台无关；tools/plab.py 可放在任意位置并在提示中注明路径。"
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "提示：未找到 python3，确定性工具层暂不可用（流程会自动回落到 agent 核查，并在报告的未覆盖清单中注明）。"
fi

echo ""
echo "安装完成（备份后缀 .bak-$TS）。ZCode 首次运行前建议对照可用模型调整 workflows/provenance-lab.dwf.ts 顶部的 LIGHT_MODELS 表。"

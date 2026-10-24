#!/usr/bin/env bash
# run_all.sh — 一键复现全套分析（模拟数据演示口径）
# 【做什么】按 SAP §6.1 冻结时序依次执行：01 校准 → 02 零假设蒙特卡洛 → 03 冻结+分析。
# 【为什么】固定种子 + 固定脚本顺序 = 任何人重跑都得到同一份结果（退出码 0）。
# 【怎么核对】bash run_all.sh 后看终端摘要与 run-heartbeat.log；echo $? 应为 0。
set -euo pipefail
cd "$(dirname "$0")"
echo "=== [1/3] 01_calibrate.py：骨架相关 Fisher 校准 ==="
uv run python 01_calibrate.py
echo "=== [2/3] 02_montecarlo.py：Null-A/Null-B type-I 校准（各 2000 次） ==="
uv run python 02_montecarlo.py
echo "=== [3/3] 03_freeze_analyze.py：冻结数据 + 完整分析 + 表图 ==="
uv run python 03_freeze_analyze.py
echo "=== 全部完成，退出码 0 ==="

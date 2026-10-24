# -*- coding: utf-8 -*-
"""
01_calibrate.py — SAP §1.5：模拟数据骨架相关的 Fisher 尺度迭代校准（先冻结数据之前）
数据性质：固定种子模拟数据（演示口径）。本脚本只定参数、不出任何分析结果。
"""

from pathlib import Path
import json
import sys
import numpy as np
import pandas as pd
from scipy import stats

from common_sim import (N, SEED_GEN, RHO0, R_TARGET, CAL_TOL, MAX_ITER,
                        generate_dataset, fisher_update, min_eig, heartbeat)

HERE = str(Path(__file__).resolve().parent)  # 入库示例：原为本机绝对路径，改为相对脚本目录（见示例 README）
LOG = f"{HERE}/run-heartbeat.log"

if __name__ == "__main__":
    heartbeat("01-calibrate", "start 校准开始（种子 20261023，Table 2 初值）", LOG)

    # ------------------------------------------------------------------
    # 【做什么】反复“生成 300 行 → 量三对相关 → Fisher 修正骨架”，直到三对
    #          实测与目标（0.20 / 0.15 / 0.25）的偏差都 ≤ 0.005。
    # 【为什么】SAP §1.5 预注册的确定性校准程序；每次用同一种子重新生成，
    #          实测相关就是骨架参数的确定函数，修正会稳定收敛。
    # 【怎么核对】终端打印的迭代轨迹表 + calibration-params.json 的 trace 字段，
    #          最后一行三列 dev_* 的绝对值应都 ≤ 0.005。
    rho = dict(RHO0)
    trace = []
    converged = False
    for it in range(1, MAX_ITER + 1):
        df = generate_dataset(rho["ct"], rho["cp"], rho["tp"], SEED_GEN, N)
        r_obs = {
            "ct": float(stats.pearsonr(df["caffeine_mg"], df["tas_total"])[0]),
            "cp": float(stats.pearsonr(df["caffeine_mg"], df["psqi_total"])[0]),
            "tp": float(stats.pearsonr(df["tas_total"], df["psqi_total"])[0]),
        }
        dev = {k: r_obs[k] - R_TARGET[k] for k in R_TARGET}
        me = min_eig(rho["ct"], rho["cp"], rho["tp"])
        trace.append({"iter": it, **{f"rho_{k}": round(rho[k], 6) for k in rho},
                      **{f"r_{k}": round(r_obs[k], 6) for k in r_obs},
                      **{f"dev_{k}": round(dev[k], 6) for k in dev},
                      "min_eig": round(me, 6)})
        print(f"iter {it:2d}  rho(ct,cp,tp)=({rho['ct']:.4f},{rho['cp']:.4f},{rho['tp']:.4f})"
              f"  r=({r_obs['ct']:.4f},{r_obs['cp']:.4f},{r_obs['tp']:.4f})"
              f"  dev=({dev['ct']:+.4f},{dev['cp']:+.4f},{dev['tp']:+.4f})"
              f"  min_eig={me:.4f}")
        if max(abs(v) for v in dev.values()) <= CAL_TOL:
            converged = True
            break
        # Fisher 尺度加性更新（SAP §1.5 第 2 条），更新前不修改、更新后另查正定性
        new_rho = {k: fisher_update(rho[k], R_TARGET[k], r_obs[k]) for k in rho}
        if min_eig(new_rho["ct"], new_rho["cp"], new_rho["tp"]) <= 0:
            print("错误：Fisher 更新后骨架矩阵非正定，校准中止", file=sys.stderr)
            sys.exit(1)
        rho = new_rho

    if not converged:
        print(f"错误：{MAX_ITER} 次迭代未达偏差 ≤ {CAL_TOL}，判校准失败", file=sys.stderr)
        sys.exit(1)

    # ------------------------------------------------------------------
    # 【做什么】把校准终值、迭代轨迹与参数指纹写成 JSON 交给 02/03 脚本。
    # 【为什么】冻结时序（SAP §6.1）要求蒙特卡洛与分析用同一套骨架参数，
    #          参数只落盘一次，后续只读不重算。
    # 【怎么核对】cat calibration-params.json，rho_final 与上方最后一行一致。
    out = {
        "n": N, "seed_gen": SEED_GEN,
        "rho_final": {k: round(rho[k], 6) for k in rho},
        "r_target": R_TARGET, "cal_tol": CAL_TOL, "iterations": len(trace),
        "converged": converged, "trace": trace,
        "note": "模拟数据演示口径；参数为 SAP §1.5 Table 2 定稿值",
    }
    with open(f"{HERE}/calibration-params.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"校准收敛：迭代 {len(trace)} 次，rho_final={out['rho_final']}")
    heartbeat("01-calibrate", f"done 迭代{len(trace)}次收敛 rho_final={out['rho_final']}", LOG)

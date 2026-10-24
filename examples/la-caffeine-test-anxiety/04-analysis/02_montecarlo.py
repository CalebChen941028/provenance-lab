# -*- coding: utf-8 -*-
"""
02_montecarlo.py — SAP §5.6：零假设蒙特卡洛 type-I 错误率校准（先于演示数据集任何结果查看）
数据性质：固定种子模拟数据（演示口径）。本脚本不接触演示数据集本身。
用法：uv run python 02_montecarlo.py [--resume]   # 默认全量重算
"""

from pathlib import Path
import sys
import numpy as np
import pandas as pd
from scipy import stats

from common_sim import (N, SEED_NULL_A, SEED_NULL_B, generate_dataset,
                        partial_corr_control_psqi, fast_beta1_test,
                        fisher_update, load_params, heartbeat)

HERE = str(Path(__file__).resolve().parent)  # 入库示例：原为本机绝对路径，改为相对脚本目录（见示例 README）
LOG = f"{HERE}/run-heartbeat.log"
CACHE = f"{HERE}/mc-cache"
N_SIM = 2000
BLOCK = 500                      # 每块 500 次，共 4 块（分块长计算 + 心跳）
BAND = (0.0404, 0.0596)          # 二项 95% 合格带（SAP §5.6 第 4 条）
N_CAL = 400                      # 零假设校准用的重抽集数（平均实测的抽样 SE≈0.003）
CAL_TOL_NULL = 0.004             # 零假设校准容差（平均口径，严于 SAP 的 0.005）


def calibrate_null(rng, mode, rho_cp, rho_tp, rho_ct0):
    # ------------------------------------------------------------------
    # 【做什么】微调“摄入×TAS”骨架相关，直到 400 个重抽数据集的平均目标量
    #          （Null-A 用边际 r、Null-B 用控制 PSQI 的偏相关）实测为 0。
    # 【为什么】type-I 校准要求“重抽分布中心”为 0：若只把某一个固定样本校到 0，
    #          会把该样本的抽样噪声（±0.058）注入参数，检验集中心系统性偏离 0；
    #          400 集平均把校准噪声压到 ≈0.003，容差 0.004 严于 SAP 的 0.005。
    # 【怎么核对】终端打印的校准轨迹，最后一行 |平均实测| 应 ≤ 0.004。
    rho_ct = rho_ct0
    for it in range(1, 21):
        obs = []
        for _ in range(N_CAL):
            df = generate_dataset(rho_ct, rho_cp, rho_tp,
                                  int(rng.integers(0, 2**31 - 1)), N)
            obs.append(float(stats.pearsonr(df["caffeine_mg"], df["tas_total"])[0])
                       if mode == "A" else partial_corr_control_psqi(df))
        mean_obs = float(np.mean(obs))
        print(f"  [{mode}] iter {it:2d}  rho_ct={rho_ct:+.5f}  400集平均实测="
              f"{'r' if mode == 'A' else '偏相关'}{mean_obs:+.5f}")
        if abs(mean_obs) <= CAL_TOL_NULL:
            return rho_ct
        rho_ct = fisher_update(rho_ct, 0.0, mean_obs)
    print(f"错误：Null-{mode} 校准 20 次未收敛", file=sys.stderr)
    sys.exit(1)


def run_block(rng, null_name, rho_ct, rho_cp, rho_tp, sims, fresh=True):
    # ------------------------------------------------------------------
    # 【做什么】用同一个顺序 RNG 流生成并检验一小块（500 个）零假设数据集，落盘缓存。
    # 【为什么】把 2000 次重抽切块便于监测与断点续跑；rng 必须跨块连续消耗，
    #          否则各块会重复同一批随机数（本脚本开发期发现并已修复的缺陷）。
    # 【怎么核对】mc-cache/null*_block*.csv 行数相加 = 2000；心跳日志逐块递增。
    rows = []
    for s in sims:
        # 与 generate_dataset 同参数的逐次生成（每次消耗同一 RNG 流的下一整块随机数）
        df = generate_dataset(rho_ct, rho_cp, rho_tp,
                              int(rng.integers(0, 2**31 - 1)), N)
        r_obs, p_a = stats.pearsonr(df["caffeine_mg"], df["tas_total"])
        row = {"sim": s, "r_obs": float(r_obs),
               "p_h1a": float(p_a), "reject_h1a": int(p_a < 0.05)}
        if null_name == "nullB":
            ft = fast_beta1_test(df)
            row.update({"b1": ft["b1"], "p_h1b": ft["p"],
                        "reject_h1b": int(ft["p"] < 0.05)})
        rows.append(row)
    return rows


def main(fresh=True):
    params = load_params(f"{HERE}/calibration-params.json")
    rho_cp, rho_tp = params["rho_final"]["cp"], params["rho_final"]["tp"]
    print(f"读入校准终值：rho_cp={rho_cp}, rho_tp={rho_tp}")

    # ------------------------------------------------------------------
    # 【做什么】校准两个“零假设世界”：Null-A（边际 r=0，保留 PSQI 结构）与
    #          Null-B（控制 PSQI 后偏相关=0，保留混杂结构，骨架初值 0.0439）。
    # 【为什么】SAP §5.6 第 1-2 条：检验在这两个世界里被误报的比例必须是 5%，
    #          否则说明实现有偏，不得进入分析。
    # 【怎么核对】下面两行轨迹的终值 |实测| ≤ 0.005；rho 初值 0.0439 见 SAP §5.6。
    print("Null-A 校准（种子 20261025 前段，重抽中心边际 r → 0）：")
    rng_a = np.random.default_rng(SEED_NULL_A)
    rho_ct_A = calibrate_null(rng_a, "A", rho_cp, rho_tp, 0.0)
    print("Null-B 校准（种子 20261026 前段，重抽中心偏相关 → 0，初值 0.0439）：")
    rng_b = np.random.default_rng(SEED_NULL_B)
    rho_ct_B = calibrate_null(rng_b, "B", rho_cp, rho_tp,
                              0.1623 * 0.2706)  # SAP §5.6 字面初值 0.0439
    print(f"Null-A 骨架 rho_ct={rho_ct_A:+.5f}；Null-B 骨架 rho_ct={rho_ct_B:+.5f}")

    results = {}
    for null_name, rho_ct, rng in (("nullA", rho_ct_A, rng_a),
                                   ("nullB", rho_ct_B, rng_b)):
        all_rows = []
        blocks = list(range(0, N_SIM, BLOCK))
        for bi, start in enumerate(blocks, 1):
            path = f"{CACHE}/{null_name}_block{bi}.csv"
            if not fresh:  # --resume：块缓存有效则直接读，不重算
                try:
                    blk = pd.read_csv(path)
                    if len(blk) == min(BLOCK, N_SIM - start):
                        all_rows.extend(blk.to_dict("records"))
                        heartbeat(f"02-mc-{null_name}", f"block{bi} 缓存命中 ({len(blk)} 行)", LOG)
                        continue
                except FileNotFoundError:
                    pass
            rows = run_block(rng, null_name, rho_ct, rho_cp, rho_tp,
                             range(start, min(start + BLOCK, N_SIM)))
            pd.DataFrame(rows).to_csv(path, index=False)
            all_rows.extend(rows)
            heartbeat(f"02-mc-{null_name}",
                      f"block{bi}/{len(blocks)} 完成 sims {start+1}-{start+len(rows)}", LOG)
        results[null_name] = pd.DataFrame(all_rows)

    # ------------------------------------------------------------------
    # 【做什么】把两个零假设世界的经验拒绝率与合格带 [0.0404, 0.0596] 对表。
    # 【为什么】SAP §5.6 第 4 条的硬关卡：超出带子说明检验水平失真，须排查实现。
    # 【怎么核对】tables/table-S3-montecarlo.csv 的 rate 列应落在带内、verdict=PASS。
    def binom95(rate, n=N_SIM):
        lo = stats.beta.ppf(0.025, max(rate * n, 0), n - max(rate * n, 0) + 1) if rate > 0 else 0.0
        hi = stats.beta.ppf(0.975, rate * n + 1, n - rate * n) if rate * n < n else 1.0
        return lo, hi

    rows = []
    ra = results["nullA"]["reject_h1a"].mean()
    lo, hi = binom95(ra)
    rows.append({"检验": "Null-A 下 H1a（Pearson r=0）", "拒绝率": round(ra, 4),
                 "二项95%CI": f"[{lo:.4f}, {hi:.4f}]", "合格带": f"[{BAND[0]}, {BAND[1]}]",
                 "判定": "PASS" if BAND[0] <= ra <= BAND[1] else "FAIL"})
    rb = results["nullB"]["reject_h1b"].mean()
    lo, hi = binom95(rb)
    rows.append({"检验": "Null-B 下 H1b（M1 β₁=0）", "拒绝率": round(rb, 4),
                 "二项95%CI": f"[{lo:.4f}, {hi:.4f}]", "合格带": f"[{BAND[0]}, {BAND[1]}]",
                 "判定": "PASS" if BAND[0] <= rb <= BAND[1] else "FAIL"})
    ra_b = results["nullB"]["reject_h1a"].mean()
    lo, hi = binom95(ra_b)
    rows.append({"检验": "Null-B 下 H1a（附带演示：未调整检验的混杂膨胀）", "拒绝率": round(ra_b, 4),
                 "二项95%CI": f"[{lo:.4f}, {hi:.4f}]", "合格带": "不设带（教学演示）",
                 "判定": f"实测边际r均值 {results['nullB']['r_obs'].mean():+.4f}"})
    tbl = pd.DataFrame(rows)
    tbl.to_csv(f"{HERE}/tables/table-S3-montecarlo.csv", index=False, encoding="utf-8-sig")
    print(tbl.to_string(index=False))

    ok = (tbl["判定"].iloc[0] == "PASS") and (tbl["判定"].iloc[1] == "PASS")
    heartbeat("02-montecarlo", f"done NullA={ra:.4f} NullB(H1b)={rb:.4f} "
                               f"NullB(H1a附带)={ra_b:.4f} verdict={'PASS' if ok else 'FAIL'}", LOG)
    if not ok:
        print("错误：蒙特卡洛校准不合格，按 SAP §5.6 不得放宽带，分析中止", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main(fresh="--resume" not in sys.argv)

# -*- coding: utf-8 -*-
"""
common_sim.py — 模拟生成器与工具（SAP §1.5 Table 2 定稿参数的唯一定义处）
数据性质：固定种子模拟数据（演示口径），一切输出均须标注“模拟数据”。
"""

import json
import hashlib
import numpy as np
import pandas as pd
from scipy import stats

# ------------------------------------------------------------------
# 【做什么】把 SAP Table 2 的生成参数集中写成常量，三个脚本共用一套数字。
# 【为什么】参数只写一处，能避免各脚本抄错；这些值是 SAP 冻结的设计输入。
# 【怎么核对】对照 provenance-lab-output/03-sap.md 的 Table 2 逐行比对。
N = 300
SEED_GEN = 20261023        # SAP §6.4：生成与校准
SEED_CV = 20261024         # SAP §6.4：CV 分折
SEED_NULL_A = 20261025     # SAP §6.4：Null-A 蒙特卡洛
SEED_NULL_B = 20261026     # SAP §6.4：Null-B 蒙特卡洛

CAF_MED, CAF_SIGMA = 130.0, 0.62          # 对数正态：中位数 130，σ=0.62
CAF_CLIP = (0.0, 800.0)                    # 截断 [0, 800]
TAS_M, TAS_SD = 18.4, 8.0                  # N(18.4, 8.0)
TAS_CLIP = (0.0, 37.0)                     # 截断 [0, 37]
PSQI_M, PSQI_SD = 6.5, 3.2                 # N(6.5, 3.2)
PSQI_CLIP = (0.0, 21.0)                    # 截断 [0, 21]
P_SEX = 0.55                               # 女生概率

# 骨架相关初值（SAP Table 2：摄入×TAS 0.216；另两对按收缩因子 0.924 反解）
RHO0 = {"ct": 0.216, "cp": 0.1623, "tp": 0.2706}
# 变换后边际的目标相关（复现性门槛按这三对执行，SAP §1.5 第 4 条）
R_TARGET = {"ct": 0.20, "cp": 0.15, "tp": 0.25}
CAL_TOL = 0.005   # 校准内层容差（SAP §1.5 第 3 条）
GATE_TOL = 0.01   # 复现性门槛容差（SAP §1.5 第 4 条）
MAX_ITER = 20     # 校准迭代上限


def build_skeleton(rho_ct: float, rho_cp: float, rho_tp: float) -> np.ndarray:
    # ------------------------------------------------------------------
    # 【做什么】把三个骨架相关数拼成 3×3 相关矩阵。
    # 【为什么】高斯骨架 (Z_摄入, Z_TAS, Z_PSQI) 的相关结构由它完全决定。
    # 【怎么核对】矩阵非对角元应分别等于传入的三个 rho 值。
    return np.array([
        [1.0, rho_ct, rho_cp],
        [rho_ct, 1.0, rho_tp],
        [rho_cp, rho_tp, 1.0],
    ])


def generate_dataset(rho_ct: float, rho_cp: float, rho_tp: float, seed: int,
                     n: int = N) -> pd.DataFrame:
    # ------------------------------------------------------------------
    # 【做什么】按“高斯骨架 + 单调边际变换”生成一份 n=300 的模拟数据集。
    # 【为什么】SAP §1.5 定稿方案：先造三维标准正态骨架（带相关），
    #          再分别换成对数正态（摄入）与截断正态（TAS、PSQI）边际，
    #          这样能同时控制边际形态与变换后相关；性别、年级独立生成。
    # 【怎么核对】列名与 SAP Table 3 变量字典一致；范围核查见 03 脚本表 S0。
    rng = np.random.default_rng(seed)
    L = np.linalg.cholesky(build_skeleton(rho_ct, rho_cp, rho_tp))
    Z = rng.standard_normal((n, 3)) @ L.T
    df = pd.DataFrame({
        "caffeine_mg": np.clip(CAF_MED * np.exp(CAF_SIGMA * Z[:, 0]),
                               CAF_CLIP[0], CAF_CLIP[1]),
        "tas_total": np.clip(TAS_M + TAS_SD * Z[:, 1], TAS_CLIP[0], TAS_CLIP[1]),
        "psqi_total": np.clip(PSQI_M + PSQI_SD * Z[:, 2], PSQI_CLIP[0], PSQI_CLIP[1]),
        "sex_female": rng.binomial(1, P_SEX, n),
        "grade": rng.integers(1, 5, n),
    })
    # 派生列（SAP Table 3：caffeine_100 / caff_high / caffeine_100_sq / 年级指示）
    df["caffeine_100"] = df["caffeine_mg"] / 100.0
    df["caff_high"] = (df["caffeine_mg"] >= 100).astype(int)
    df["caffeine_100_sq"] = df["caffeine_100"] ** 2
    for g in (2, 3, 4):
        df[f"grade_y{g}"] = (df["grade"] == g).astype(int)
    df.insert(0, "sid", np.arange(1, n + 1))  # 行号（模拟记录序号，非个人标识）
    return df


def fisher_update(rho_now: float, target: float, observed: float) -> float:
    # 【做什么】在 Fisher z 尺度上加性修正一个骨架相关数。
    # 【为什么】相关系数不是可加尺度，atanh 变换后加减才是标准校准动作（SAP §1.5 第 2 条）。
    # 【怎么核对】实测正好等于目标时，返回值应等于原值（修正量为 0）。
    return rho_now + (np.arctanh(target) - np.arctanh(observed))


def min_eig(rho_ct: float, rho_cp: float, rho_tp: float) -> float:
    # 【做什么】算骨架相关矩阵的最小特征值。
    # 【为什么】Fisher 更新后必须确认矩阵仍正定，否则生成器非法（SAP §1.5 第 2 条）。
    # 【怎么核对】最小特征值 > 0 即正定；结果写入 01 脚本输出的校准轨迹表。
    return float(np.linalg.eigvalsh(build_skeleton(rho_ct, rho_cp, rho_tp))[0])


def heartbeat(block_name: str, status: str, log_path: str) -> None:
    # ------------------------------------------------------------------
    # 【做什么】往心跳日志追加一行“块名 + 时间 + 一行状态”。
    # 【为什么】长计算分块执行时，外部监测只看这个文件就知道跑到哪、是否健康。
    # 【怎么核对】打开 run-heartbeat.log，每块应有一行且时间递增。
    from datetime import datetime
    line = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {block_name} :: {status}\n"
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(line)


def sha256_file(path: str) -> str:
    # 【做什么】算一个文件的 SHA256 校验和。
    # 【为什么】冻结数据集要有指纹，后续分析能证明读的是同一份数据。
    # 【怎么核对】shasum -a 256 <文件> 的输出应与 manifest 里记录一致。
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def load_params(path: str) -> dict:
    # 【做什么】读取 01 脚本写出的校准参数 JSON。
    # 【为什么】02/03 脚本要用同一套校准结果，不能各自重算。
    # 【怎么核对】JSON 里的 rho_final 三数与 01 终端输出的最后一次迭代一致。
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def fast_beta1_test(df: pd.DataFrame) -> dict:
    # ------------------------------------------------------------------
    # 【做什么】用 numpy 直接解一次 M1 回归，返回 β₁（咖啡因斜率）的 t 值与 p 值。
    # 【为什么】蒙特卡洛要跑 4000 次同一检验，公式 API 太慢；本函数与
    #          statsmodels.OLS 在数学上完全等价，03 脚本里有逐位一致性验证。
    # 【怎么核对】03 脚本输出的“等价性验证”行：两种实现的 b/se/t/p 差异应 < 1e-8。
    y = df["tas_total"].to_numpy(float)
    X = np.column_stack([
        np.ones(len(df)), df["caffeine_100"], df["sex_female"],
        df["grade_y2"], df["grade_y3"], df["grade_y4"], df["psqi_total"],
    ]).astype(float)
    XtX_inv = np.linalg.inv(X.T @ X)
    b = XtX_inv @ X.T @ y
    e = y - X @ b
    n, k = X.shape
    s2 = float(e @ e) / (n - k)
    se = float(np.sqrt(s2 * XtX_inv[1, 1]))
    tval = float(b[1] / se)
    pval = float(2.0 * stats.t.sf(abs(tval), n - k))
    return {"b1": float(b[1]), "se": se, "t": tval, "p": pval, "df": n - k}


def partial_corr_control_psqi(df: pd.DataFrame) -> float:
    # ------------------------------------------------------------------
    # 【做什么】在数据里计算“控制 PSQI 后”摄入与 TAS 的偏相关。
    # 【为什么】Null-B 的校准目标是这个量实测为 0（SAP §5.6 第 2 条）；
    #          做法是两组一元回归残差再求相关。
    # 【怎么核对】与 t 换算式 t/sqrt(t^2+df) 在同一模型上应一致（03 脚本有断言）。
    rx = df["caffeine_100"] - np.polyval(
        np.polyfit(df["psqi_total"], df["caffeine_100"], 1), df["psqi_total"])
    ry = df["tas_total"] - np.polyval(
        np.polyfit(df["psqi_total"], df["tas_total"], 1), df["psqi_total"])
    return float(stats.pearsonr(rx, ry)[0])

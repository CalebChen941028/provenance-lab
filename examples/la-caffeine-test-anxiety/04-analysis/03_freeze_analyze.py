# -*- coding: utf-8 -*-
"""
03_freeze_analyze.py — 冻结演示数据集（SAP §6.1）→ 完整性/复现性门（§6.3、§1.5-4）
→ 按 SAP §3-§5 执行全部分析：H1a/H1b 主分析、Table 4 诊断、敏感性、H2、交互、CV、Holm/BH。
数据性质：固定种子模拟数据（演示口径），全部表图已标注“模拟数据”。
"""

from pathlib import Path
import json
import sys
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.formula.api as smf
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan
try:
    from statsmodels.stats.diagnostic import linear_reset
    HAS_RESET = True
except ImportError:                      # pragma: no cover
    HAS_RESET = False
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.nonparametric.smoothers_lowess import lowess

from common_sim import (N, SEED_GEN, SEED_CV, R_TARGET, GATE_TOL,
                        generate_dataset, partial_corr_control_psqi,
                        fast_beta1_test, load_params, heartbeat, sha256_file)

HERE = str(Path(__file__).resolve().parent)  # 入库示例：原为本机绝对路径，改为相对脚本目录（见示例 README）
LOG = f"{HERE}/run-heartbeat.log"
FROZEN = f"{HERE}/input/sim_data_frozen.csv"
MANIFEST = f"{HERE}/input/freeze_manifest.json"

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.sans-serif"] = ["PingFang SC", "Heiti SC", "Arial Unicode MS",
                                    "Songti SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

SUMMARY = []   # 每个计算单元回读的摘要行（关键统计量 + 状态）


def say(block, msg):
    line = f"[{block}] {msg}"
    print(line, flush=True)
    SUMMARY.append(line)


def fmt_p(p):
    return "p < .001" if p < 0.001 else f"p = {p:.3f}"


# ==================================================================
# 步骤一：冻结演示数据集（SAP §6.1 时序：校准与蒙特卡洛已完成，此处冻结）
# ==================================================================
def freeze_data(params):
    # ------------------------------------------------------------------
    # 【做什么】用校准终值骨架与种子 20261023 生成那一份 300 行演示数据，写盘锁存。
    # 【为什么】冻结后数据不再变动，分析、图表、审计全部指向同一份文件与 SHA256；
    #          若目录里已有旧冻结件，重生成后比对 SHA，证明生成是确定性的。
    # 【怎么核对】input/freeze_manifest.json 的 sha256 字段与
    #          `shasum -a 256 input/sim_data_frozen.csv` 输出一致。
    rho = params["rho_final"]
    df = generate_dataset(rho["ct"], rho["cp"], rho["tp"], SEED_GEN, N)
    df.to_csv(FROZEN, index=False)
    sha = sha256_file(FROZEN)
    old_sha = None
    try:
        with open(MANIFEST, "r", encoding="utf-8") as f:
            old_sha = json.load(f).get("sha256")
    except FileNotFoundError:
        pass
    manifest = {"n": N, "seed_gen": SEED_GEN, "rho_final": rho,
                "sha256": sha, "rows": int(len(df)),
                "note": "模拟数据（演示口径）；生成与校准细节见 calibration-params.json"}
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    determinism = ("SHA 与既有冻结件一致（确定性复现通过）" if sha == old_sha
                   else "首次冻结（无旧件可比）" if old_sha is None
                   else "警告：与旧冻结件 SHA 不一致（参数或代码已变动）")
    say("freeze", f"冻结 300 行，sha256={sha[:16]}…，{determinism}")
    if old_sha is not None and sha != old_sha:
        sys.exit(1)
    return df, sha


# ==================================================================
# 步骤二：完整性核查与复现性门（SAP §6.3、§1.5 第 4 条）
# ==================================================================
def integrity_gate(df):
    # ------------------------------------------------------------------
    # 【做什么】核对行数、缺失、每个变量的取值范围，以及三对实测相关对
    #          目标（0.20/0.15/0.25）的偏差是否都 ≤ 0.01。
    # 【为什么】这是进入分析的预注册前置门：不通过判生成或校准缺陷，必须
    #          回退修复重冻结，而不是带着缺陷的数据做分析。
    # 【怎么核对】tables/table-S0-data-integrity-gate.csv 每行 verdict 应为 PASS。
    rows = []
    checks = [
        ("记录数 = 300", len(df) == N, f"实测 {len(df)}"),
        ("全表零缺失", int(df.isna().sum().sum()) == 0, f"缺失单元格 {int(df.isna().sum().sum())}"),
        ("caffeine_mg ∈ [0, 800]", df.caffeine_mg.between(0, 800).all(),
         f"[{df.caffeine_mg.min():.1f}, {df.caffeine_mg.max():.1f}]"),
        ("tas_total ∈ [0, 37]", df.tas_total.between(0, 37).all(),
         f"[{df.tas_total.min():.1f}, {df.tas_total.max():.1f}]"),
        ("psqi_total ∈ [0, 21]", df.psqi_total.between(0, 21).all(),
         f"[{df.psqi_total.min():.1f}, {df.psqi_total.max():.1f}]"),
        ("grade ∈ {1,2,3,4}", set(df.grade.unique()) <= {1, 2, 3, 4},
         f"取值 {[int(g) for g in sorted(df.grade.unique())]}"),
        ("sex_female ∈ {0,1}", set(df.sex_female.unique()) <= {0, 1},
         f"女生 {df.sex_female.mean()*100:.1f}%"),
    ]
    r_obs = {
        "ct": float(stats.pearsonr(df.caffeine_mg, df.tas_total)[0]),
        "cp": float(stats.pearsonr(df.caffeine_mg, df.psqi_total)[0]),
        "tp": float(stats.pearsonr(df.tas_total, df.psqi_total)[0]),
    }
    names = {"ct": "r(摄入,TAS) vs 0.20", "cp": "r(摄入,PSQI) vs 0.15",
             "tp": "r(TAS,PSQI) vs 0.25"}
    for k, v in r_obs.items():
        checks.append((f"复现门：{names[k]} 偏差≤{GATE_TOL}",
                       abs(v - R_TARGET[k]) <= GATE_TOL,
                       f"实测 {v:.4f}，偏差 {v - R_TARGET[k]:+.4f}"))
    all_pass = True
    for name, ok, detail in checks:
        rows.append({"检查项": name, "结果": "PASS" if ok else "FAIL", "详情": detail})
        all_pass &= ok
    pd.DataFrame(rows).to_csv(f"{HERE}/tables/table-S0-data-integrity-gate.csv",
                              index=False, encoding="utf-8-sig")
    say("gate", f"完整性/复现性门：{'全部 PASS' if all_pass else '存在 FAIL'}；"
                f"三对实测 r=({r_obs['ct']:.4f}, {r_obs['cp']:.4f}, {r_obs['tp']:.4f})")
    if not all_pass:
        sys.exit(1)
    return r_obs


# ==================================================================
# 步骤三：描述统计（Table R1）
# ==================================================================
def descriptives(df):
    # ------------------------------------------------------------------
    # 【做什么】给每个变量算均值、标准差、中位数、四分位距、范围、偏度峰度；
    #          分类变量给人数与占比，另按“≥100 mg/d 与否”分组描述 TAS。
    # 【为什么】SAP §6.5 Table R1：先看清数据长什么样，再谈关联；
    #          偏度峰度同时服务 §6.3 的边际形态核查。
    # 【怎么核对】tables/table-R1-descriptives.csv；P(PSQI>5) 应接近 0.68。
    rows = []
    for col, label in [("caffeine_mg", "日均咖啡因摄入 (mg/d)"),
                       ("tas_total", "TAS 考试焦虑总分 (0–37)"),
                       ("psqi_total", "PSQI 睡眠总分 (0–21)")]:
        x = df[col]
        rows.append({
            "变量": label, "类型": "连续", "n": N, "缺失": 0,
            "M (SD)": f"{x.mean():.2f} ({x.std(ddof=1):.2f})",
            "中位数 (IQR)": f"{x.median():.2f} ({x.quantile(.75)-x.quantile(.25):.2f})",
            "范围": f"[{x.min():.1f}, {x.max():.1f}]",
            "偏度": round(float(stats.skew(x)), 3),
            "峰度(超额)": round(float(stats.kurtosis(x)), 3),
        })
    for col, label, mapping in [
            ("sex_female", "性别", {0: "男", 1: "女"}),
            ("grade", "年级", {1: "大一", 2: "大二", 3: "大三", 4: "大四"}),
            ("caff_high", "摄入≥100 mg/d", {0: "<100（参照）", 1: "≥100"})]:
        vc = df[col].value_counts().sort_index()
        rows.append({"变量": label, "类型": "分类", "n": N, "缺失": 0,
                     "M (SD)": "—", "中位数 (IQR)": "—",
                     "范围": "；".join(f"{mapping[i]}: {c} ({c/N*100:.1f}%)" for i, c in vc.items()),
                     "偏度": "—", "峰度(超额)": "—"})
    pd.DataFrame(rows).to_csv(f"{HERE}/tables/table-R1-descriptives.csv",
                              index=False, encoding="utf-8-sig")
    hi = df[df.caff_high == 1].tas_total
    lo = df[df.caff_high == 0].tas_total
    say("R1", f"描述（模拟数据）：caf {df.caffeine_mg.mean():.1f}±{df.caffeine_mg.std(ddof=1):.1f} mg/d，"
              f"TAS {df.tas_total.mean():.2f}±{df.tas_total.std(ddof=1):.2f}，"
              f"PSQI {df.psqi_total.mean():.2f}±{df.psqi_total.std(ddof=1):.2f}，"
              f"P(PSQI>5)={float((df.psqi_total>5).mean()):.3f}（锚 0.68），"
              f"<100 mg/d 组占 {len(lo)/N*100:.1f}%（预期约 34%），"
              f"两组 TAS {lo.mean():.2f} vs {hi.mean():.2f}")


# ==================================================================
# 步骤四：H1a 主分析（Pearson + Fisher z CI）
# ==================================================================
def h1a(df):
    # ------------------------------------------------------------------
    # 【做什么】算摄入量与 TAS 的 Pearson r，双侧 t 检验（df=298），
    #          用 Fisher z 变换给 95%CI。
    # 【为什么】SAP §3.1 主分析：研究问题是线性关联强度，n=300 推断稳健。
    # 【怎么核对】本行打印 r(298)、CI；数值进 table-R2 与 figure-R1 图注。
    r, p = stats.pearsonr(df.caffeine_mg, df.tas_total)
    dfree = N - 2
    t_val = r * np.sqrt(dfree / (1 - r ** 2))
    z = np.arctanh(r)
    se = 1 / np.sqrt(N - 3)
    ci = (np.tanh(z - 1.959963985 * se), np.tanh(z + 1.959963985 * se))
    say("H1a", f"模拟数据：r({dfree}) = {r:.3f}，95%CI [{ci[0]:.3f}, {ci[1]:.3f}]，"
               f"t = {t_val:.2f}，{fmt_p(p)}，r² = {r**2:.3f}")
    return {"r": r, "p": float(p), "t": float(t_val), "df": dfree,
            "ci": (float(ci[0]), float(ci[1])), "r2": float(r ** 2)}


# ==================================================================
# 步骤五：H1b 主分析（M0 / Mcov / M1 与混杂衰减）
# ==================================================================
FORMULA_M1 = ("tas_total ~ caffeine_100 + sex_female + grade_y2 + grade_y3 "
              "+ grade_y4 + psqi_total")


def h1b(df):
    # ------------------------------------------------------------------
    # 【做什么】拟合三个回归：M0（只放咖啡因）、Mcov（只放性别年级睡眠）、
    #          M1（全模型），报告咖啡因斜率 b₁、95%CI、t(293)、标准化 β、
    #          偏相关、调整 R²、ΔR² 与“调整后衰减百分比”。
    # 【为什么】SAP §3.2：b₁ 回答“每多 100 mg/d，焦虑分动几分”；
    #          (b_M0−b_M1)/b_M0 演示睡眠等协变量把未调整关联吃掉多少。
    # 【怎么核对】table-R2 主结果行与 table-S5-models-full.csv 的 M1 行一致。
    m0 = smf.ols("tas_total ~ caffeine_100", data=df).fit()
    mcov = smf.ols(FORMULA_M1.replace("caffeine_100 + ", ""), data=df).fit()
    m1 = smf.ols(FORMULA_M1, data=df).fit()
    b1, se1 = m1.params["caffeine_100"], m1.bse["caffeine_100"]
    ci = m1.conf_int().loc["caffeine_100"]
    beta_std = b1 * df.caffeine_100.std(ddof=1) / df.tas_total.std(ddof=1)
    pr_t = m1.tvalues["caffeine_100"]
    pr_formula = pr_t / np.sqrt(pr_t ** 2 + m1.df_resid)
    # 残差法互证：对 M1 的全部协变量（性别+年级 3 指示+PSQI）取双残差再求相关，
    # 应与 t 换算式 t/sqrt(t^2+df) 严格一致（同一模型的两种等价算法）
    Xc = np.column_stack([np.ones(N), df.sex_female, df.grade_y2, df.grade_y3,
                          df.grade_y4, df.psqi_total]).astype(float)
    rx = df.caffeine_100.to_numpy(float) - Xc @ np.linalg.lstsq(Xc, df.caffeine_100, rcond=None)[0]
    ry = df.tas_total.to_numpy(float) - Xc @ np.linalg.lstsq(Xc, df.tas_total, rcond=None)[0]
    pr_resid = float(stats.pearsonr(rx, ry)[0])
    assert abs(pr_formula - pr_resid) < 1e-6, "偏相关两种算法不一致，须排查"
    b0 = m0.params["caffeine_100"]
    atten = (b0 - b1) / b0 * 100
    sd_tas = df.tas_total.std(ddof=1)
    say("H1b", f"模拟数据：M1 b₁ = {b1:.3f} 分/100mg·d⁻¹，95%CI "
               f"[{ci[0]:.3f}, {ci[1]:.3f}]，t({int(m1.df_resid)}) = {pr_t:.2f}，"
               f"{fmt_p(m1.pvalues['caffeine_100'])}；偏相关 r = {pr_formula:.3f}"
               f"（设计解析 0.170），标准化 β = {beta_std:.3f}，调整 R² = {m1.rsquared_adj:.3f}，"
               f"ΔR²(vs 仅协变量) = {m1.rsquared - mcov.rsquared:.3f}；"
               f"M0 b = {b0:.3f} → 衰减 {atten:.1f}%；折算 {b1/sd_tas:.3f} 个 TAS SD"
               f"（实测 SD {sd_tas:.2f}）")
    return {"m0": m0, "mcov": mcov, "m1": m1, "b1": float(b1), "ci": (float(ci[0]), float(ci[1])),
            "t": float(pr_t), "p": float(m1.pvalues["caffeine_100"]),
            "df": int(m1.df_resid), "beta_std": float(beta_std),
            "partial_r": float(pr_formula), "atten": float(atten),
            "b0": float(b0), "sd_tas": float(sd_tas)}


# ==================================================================
# 步骤六：前提假设诊断（SAP Table 4）与预注册后续处理
# ==================================================================
def diagnostics(df, m1):
    # ------------------------------------------------------------------
    # 【做什么】对 M1 做 Breusch-Pagan（同方差）、Ramsey RESET（设定误差）、
    #          Shapiro-Wilk（残差正态）、VIF 与条件数（共线）、Cook's D（极端值），
    #          并按 SAP Table 4 执行预注册的后续处理（BP 显著→HC3 重报；
    #          Cook's D>4/n→剔除后重拟合作敏感性）。
    # 【为什么】诊断结果决定主分析要不要以 HC3 口径重报、要不要标注非线性，
    #          全部动作预注册，无事后自由度。
    # 【怎么核对】tables/table-S1-diagnostics.csv；Cook's D 阈值 = 4/300 ≈ 0.0133。
    rows = []
    exog = m1.model.exog
    # --- 同方差：Breusch-Pagan
    lm_stat, lm_p, f_stat, f_p = het_breuschpagan(m1.resid, exog)
    rows.append({"诊断": "Breusch-Pagan（同方差，M1）", "统计量": f"LM = {lm_stat:.2f}",
                 "p": f"{lm_p:.3f}", "预注册处理": "p<.05 → HC3 稳健标准误重报 M1",
                 "触发": "是" if lm_p < 0.05 else "否"})
    m1hc3 = None
    if lm_p < 0.05:
        m1hc3 = smf.ols(FORMULA_M1, data=df).fit(cov_type="HC3")
        rows.append({"诊断": "M1hc3（HC3 稳健标准误重报）",
                     "统计量": f"b₁ = {m1hc3.params['caffeine_100']:.3f}",
                     "p": f"{m1hc3.pvalues['caffeine_100']:.3f}",
                     "预注册处理": "替代经典标准误的推断口径", "触发": "—"})
    # --- 设定误差：Ramsey RESET（拟合值 2、3 次幂联合）
    if HAS_RESET:
        try:
            reset = linear_reset(m1, power=[2, 3], test_type="fitted", use_f=True)
            reset_stat, reset_p = float(reset.fvalue), float(reset.pvalue)
            reset_desc = "F(2,291) 联合（拟合值²、³）"
        except Exception:                     # pragma: no cover
            reset = linear_reset(m1, power=2, test_type="fitted", use_f=True)
            reset_stat, reset_p = float(reset.fvalue), float(reset.pvalue)
            reset_desc = "F(1,292)（拟合值²）"
        rows.append({"诊断": "Ramsey RESET（M1 设定误差）", "统计量": f"{reset_desc} = {reset_stat:.2f}",
                     "p": f"{reset_p:.3f}", "预注册处理": "p<.05 → 报告 M2 与非线性注记",
                     "触发": "是" if reset_p < 0.05 else "否"})
    else:
        reset_stat, reset_p = np.nan, np.nan
        rows.append({"诊断": "Ramsey RESET", "统计量": "statsmodels 版本不支持",
                     "p": "—", "预注册处理": "改以残差-拟合图人工判读", "触发": "—"})
    # --- 残差正态：Shapiro-Wilk
    sw_stat, sw_p = stats.shapiro(m1.resid)
    rows.append({"诊断": "Shapiro-Wilk（M1 残差正态）", "统计量": f"W = {sw_stat:.3f}",
                 "p": f"{sw_p:.3f}", "预注册处理": "诊断性报告，n=300 推断稳健不改模型",
                 "触发": "—"})
    for col, lab in [("caffeine_mg", "摄入量"), ("tas_total", "TAS"), ("psqi_total", "PSQI")]:
        rows.append({"诊断": f"边际形态（{lab}）",
                     "统计量": f"偏度 {stats.skew(df[col]):.2f}，超额峰度 {stats.kurtosis(df[col]):.2f}",
                     "p": "—", "预注册处理": "形态稳健性由 Spearman 敏感性承担", "触发": "—"})
    # --- 共线性：VIF 与条件数
    vifs = {exog_names: float(variance_inflation_factor(exog, i))
            for i, exog_names in enumerate(m1.model.exog_names) if exog_names != "Intercept"}
    cond = float(np.linalg.cond(exog))
    # 列标准化条件数（Belsley 式规范口径）：非截距列各自 z 标准化后再算，
    # 剔除“截距列常数 1 vs 未缩放协变量”造成的尺度性膨胀
    Xz = exog.copy().astype(float)
    for j in range(1, Xz.shape[1]):
        Xz[:, j] = (Xz[:, j] - Xz[:, j].mean()) / Xz[:, j].std(ddof=0)
    cond_std = float(np.linalg.cond(Xz))
    rows.append({"诊断": "共线性：VIF（M1 预测变量）",
                 "统计量": "；".join(f"{k.replace('caffeine_100','咖啡因').replace('sex_female','性别').replace('grade_y','年级').replace('psqi_total','PSQI')}={v:.2f}" for k, v in vifs.items()),
                 "p": "—", "预注册处理": "VIF>5 或条件数>30 触发报告；VIF>10 走变更流程",
                 "触发": "是" if (max(vifs.values()) > 5 or cond_std > 30) else "否"})
    rows.append({"诊断": "共线性：条件数（含截距原始尺度）", "统计量": f"κ = {cond:.2f}",
                 "p": "—", "预注册处理": "原始尺度对列量纲敏感，仅作参考口径",
                 "触发": "—"})
    rows.append({"诊断": "共线性：条件数（列标准化，判定口径）", "统计量": f"κ = {cond_std:.2f}",
                 "p": "—", "预注册处理": "同上（双指标互证，阈值 30）",
                 "触发": "是" if cond_std > 30 else "否"})
    # --- 极端值：Cook's D
    infl = m1.get_influence()
    cooks = infl.cooks_distance[0]
    thr = 4.0 / N
    flag = df.loc[cooks > thr, ["sid", "caffeine_mg", "tas_total"]].copy()
    flag["cooks_d"] = cooks[cooks > thr]
    flag.to_csv(f"{HERE}/tables/table-S1b-cooks-distance.csv", index=False, encoding="utf-8-sig")
    m1_trim = None
    if len(flag):
        m1_trim = smf.ols(FORMULA_M1, data=df[cooks <= thr]).fit()
    rows.append({"诊断": "Cook's D > 4/n（≈%.4f）" % thr,
                 "统计量": f"标记 {len(flag)} 条",
                 "p": "—", "预注册处理": "逐一列出并剔除后重拟合（仅敏感性，主分析保留全样本）",
                 "触发": "是" if len(flag) else "否"})
    pd.DataFrame(rows).to_csv(f"{HERE}/tables/table-S1-diagnostics.csv",
                              index=False, encoding="utf-8-sig")
    say("diag", f"诊断（模拟数据）：BP {fmt_p(lm_p)}；RESET {fmt_p(reset_p)}；"
                f"Shapiro-Wilk W={sw_stat:.3f} {fmt_p(sw_p)}；max VIF={max(vifs.values()):.2f}，"
                f"条件数={cond:.2f}（列标准化 {cond_std:.2f}）；Cook's D>阈值 {len(flag)} 条"
                + (f"，剔除后 b₁={m1_trim.params['caffeine_100']:.3f}" if m1_trim else ""))
    return {"bp_p": float(lm_p), "reset_p": float(reset_p), "sw_p": float(sw_p),
            "vifs": vifs, "cond": cond, "cond_std": cond_std,
            "cooks_flag": flag, "m1hc3": m1hc3,
            "m1_trim": m1_trim, "cooks": cooks, "thr": thr}


# ==================================================================
# 步骤七：敏感性与探索分析（SAP §4）
# ==================================================================
def sensitivity(df, diag):
    # ------------------------------------------------------------------
    # 【做什么】依次算：Spearman 秩相关；≥100 mg/d 二分 t 检验（含 Cohen's d）
    #          与二分调整回归；年级连续编码 M1ord；二次项 M2（H2）；性别交互 M3；
    #          Cook's D 剔除重拟合与 HC3 重报（由诊断触发时）。
    # 【为什么】SAP §4 预注册的敏感性/探索集：每个口径回答“结论对方法选择稳不稳”，
    #          其中 H2 与交互只描述（F2 家族），不作确证判定。
    # 【怎么核对】tables/table-R3-sensitivity-exploration.csv 逐行数值。
    out = {}
    rows = []
    # --- Spearman
    rho_s, p_s = stats.spearmanr(df.caffeine_mg, df.tas_total)
    out["spearman"] = {"rho": float(rho_s), "p": float(p_s)}
    rows.append({"条目": "Spearman ρ（形态敏感性，F2）", "估计": f"ρ = {rho_s:.3f}",
                 "95%CI / 细节": "双侧 t 检验", "统计量": f"S = —", "p": f"{p_s:.3f}"})
    # --- 二分口径：t 检验
    hi, lo = df[df.caff_high == 1].tas_total, df[df.caff_high == 0].tas_total
    t_res = stats.ttest_ind(hi, lo, equal_var=True)
    diff = hi.mean() - lo.mean()
    n1, n0 = len(hi), len(lo)
    sp = np.sqrt(((n1 - 1) * hi.var(ddof=1) + (n0 - 1) * lo.var(ddof=1)) / (n1 + n0 - 2))
    d = diff / sp
    se_d = np.sqrt(1 / n1 + 1 / n0 + d ** 2 / (n1 + n0))
    ci_d = (d - 1.959963985 * se_d, d + 1.959963985 * se_d)
    ci_diff = (diff - 1.959963985 * sp * np.sqrt(1 / n1 + 1 / n0),
               diff + 1.959963985 * sp * np.sqrt(1 / n1 + 1 / n0))
    out["dich_t"] = {"diff": float(diff), "d": float(d), "p": float(t_res.pvalue),
                     "ci_d": (float(ci_d[0]), float(ci_d[1]))}
    rows.append({"条目": "二分口径 t 检验（≥100 vs <100 mg/d，F2）",
                 "估计": f"均值差 = {diff:.2f} 分，d = {d:.2f}",
                 "95%CI / 细节": f"差 [{ci_diff[0]:.2f}, {ci_diff[1]:.2f}]；d [{ci_d[0]:.2f}, {ci_d[1]:.2f}]",
                 "统计量": f"t({n1+n0-2}) = {t_res.statistic:.2f}", "p": f"{t_res.pvalue:.3f}"})
    # --- 二分口径：调整回归
    m_bin = smf.ols(FORMULA_M1.replace("caffeine_100", "caff_high"), data=df).fit()
    ci_b = m_bin.conf_int().loc["caff_high"]
    out["dich_adj"] = {"b": float(m_bin.params["caff_high"]), "p": float(m_bin.pvalues["caff_high"])}
    rows.append({"条目": "二分口径调整回归（caff_high 入 M1 结构，F2）",
                 "估计": f"b = {m_bin.params['caff_high']:.2f} 分",
                 "95%CI / 细节": f"[{ci_b[0]:.2f}, {ci_b[1]:.2f}]",
                 "统计量": f"t({int(m_bin.df_resid)}) = {m_bin.tvalues['caff_high']:.2f}",
                 "p": f"{m_bin.pvalues['caff_high']:.3f}"})
    # --- 年级连续编码
    m1ord = smf.ols("tas_total ~ caffeine_100 + sex_female + grade + psqi_total", data=df).fit()
    b_ord = float(m1ord.params["caffeine_100"])
    out["m1ord_b"] = b_ord
    rows.append({"条目": "年级连续编码 M1ord（编码敏感性）",
                 "估计": f"b₁ = {b_ord:.3f}",
                 "95%CI / 细节": f"相对 M1 变化 {abs(b_ord - diag['b1_ref']) / diag['b1_ref'] * 100:.1f}%（<10% 判不敏感）",
                 "统计量": f"t({int(m1ord.df_resid)}) = {m1ord.tvalues['caffeine_100']:.2f}",
                 "p": f"{m1ord.pvalues['caffeine_100']:.3f}"})
    # --- H2 二次项
    m2 = smf.ols(FORMULA_M1 + " + caffeine_100_sq", data=df).fit()
    ci_q = m2.conf_int().loc["caffeine_100_sq"]
    out["h2"] = {"b2": float(m2.params["caffeine_100_sq"]),
                 "p": float(m2.pvalues["caffeine_100_sq"])}
    rows.append({"条目": "H2 二次项 M2（剂量-反应曲率，F2）",
                 "估计": f"β₂ = {m2.params['caffeine_100_sq']:.3f}",
                 "95%CI / 细节": f"[{ci_q[0]:.3f}, {ci_q[1]:.3f}]",
                 "统计量": f"t({int(m2.df_resid)}) = {m2.tvalues['caffeine_100_sq']:.2f}",
                 "p": f"{m2.pvalues['caffeine_100_sq']:.3f}"})
    # --- 性别交互 M3
    m3 = smf.ols(FORMULA_M1 + " + sex_female:caffeine_100", data=df).fit()
    key = [k for k in m3.params.index if "sex_female:caffeine_100" in k or "caffeine_100:sex_female" in k][0]
    ci_i = m3.conf_int().loc[key]
    out["m3"] = {"b": float(m3.params[key]), "p": float(m3.pvalues[key])}
    rows.append({"条目": "性别×摄入交互 M3（探索，F2）",
                 "估计": f"b = {m3.params[key]:.3f}",
                 "95%CI / 细节": f"[{ci_i[0]:.3f}, {ci_i[1]:.3f}]",
                 "统计量": f"t({int(m3.df_resid)}) = {m3.tvalues[key]:.2f}",
                 "p": f"{m3.pvalues[key]:.3f}"})
    # --- 诊断触发的两个敏感性重报
    if diag["m1hc3"] is not None:
        h = diag["m1hc3"]
        rows.append({"条目": "M1hc3（BP 显著触发）",
                     "估计": f"b₁ = {h.params['caffeine_100']:.3f}",
                     "95%CI / 细节": f"HC3 SE = {h.bse['caffeine_100']:.3f}",
                     "统计量": f"z/t = {h.tvalues['caffeine_100']:.2f}",
                     "p": f"{h.pvalues['caffeine_100']:.3f}"})
        out["hc3_p"] = float(h.pvalues["caffeine_100"])
    else:
        rows.append({"条目": "M1hc3（HC3 重报）", "估计": "未触发",
                     "95%CI / 细节": f"BP p = {diag['bp_p']:.3f} ≥ .05",
                     "统计量": "—", "p": "—"})
    if diag["m1_trim"] is not None:
        tr = diag["m1_trim"]
        ci_t = tr.conf_int().loc["caffeine_100"]
        rows.append({"条目": f"剔除 Cook's D>阈值 {len(diag['cooks_flag'])} 条后重拟合（仅敏感性）",
                     "估计": f"b₁ = {tr.params['caffeine_100']:.3f}",
                     "95%CI / 细节": f"[{ci_t[0]:.3f}, {ci_t[1]:.3f}]",
                     "统计量": f"t({int(tr.df_resid)}) = {tr.tvalues['caffeine_100']:.2f}",
                     "p": f"{tr.pvalues['caffeine_100']:.3f}"})
        out["trim_b1"] = float(tr.params["caffeine_100"])
        out["trim_p"] = float(tr.pvalues["caffeine_100"])
    out["rows"] = rows
    say("sens", f"敏感性（模拟数据）：Spearman ρ={rho_s:.3f}（{fmt_p(p_s)}）；"
                f"二分：均值差 {diff:.2f} 分、d={d:.2f}（{fmt_p(t_res.pvalue)}）、调整 b={m_bin.params['caff_high']:.2f}；"
                f"M1ord b₁={b_ord:.3f}（变化 {abs(b_ord - diag['b1_ref']) / diag['b1_ref'] * 100:.1f}%）；"
                f"M2 β₂={m2.params['caffeine_100_sq']:.3f}（{fmt_p(m2.pvalues['caffeine_100_sq'])}）；"
                f"M3 交互 b={m3.params[key]:.3f}（{fmt_p(m3.pvalues[key])}）")
    return out, {"m1ord": m1ord, "m2": m2, "m3": m3, "m_bin": m_bin}


# ==================================================================
# 步骤八：多重比较校正（SAP §4.7：F1 Holm、F2 BH-FDR）
# ==================================================================
def multiplicity(h1a_res, h1b_res, sens):
    # ------------------------------------------------------------------
    # 【做什么】给两个确证 p 值做 Holm 步降校正（FWER=.05），给五个探索
    #          p 值做 BH-FDR（q=.05），并按预注册规则写判定。
    # 【为什么】同时下多个结论时必须收紧标准：确证家族控制“至少一个误报”，
    #          探索家族控制“报出阳性里的假阳性比例”。
    # 【怎么核对】tables/table-S2-multiplicity.csv；Holm 第一步阈值 α′=0.025。
    # Holm（手写，2 个检验）
    raw = {"H1a（Pearson r）": h1a_res["p"], "H1b（M1 β₁）": h1b_res["p"]}
    order = sorted(raw, key=raw.get)
    m = len(raw)
    adj, prev = {}, 0.0
    for i, name in enumerate(order):
        val = min(1.0, (m - i) * raw[name])
        prev = max(prev, val)
        adj[name] = prev
    f1_rows = []
    for name in order:
        f1_rows.append({"家族": "F1 确证（Holm，FWER=.05）", "检验": name,
                        "原始p": f"{raw[name]:.4g}", "校正后p": f"{adj[name]:.4g}",
                        "判定": ("拒绝 H0（确证阳性）" if adj[name] < 0.05
                                 else "不拒绝 H0")})
    # BH-FDR（手写，5 个探索条目）
    f2_raw = {"H2 二次项（M2 β₂）": sens["h2"]["p"],
              "Spearman ρ": sens["spearman"]["p"],
              "二分 t 检验": sens["dich_t"]["p"],
              "二分调整 b": sens["dich_adj"]["p"],
              "性别×摄入交互（M3）": sens["m3"]["p"]}
    order2 = sorted(f2_raw, key=f2_raw.get)
    m2n = len(f2_raw)
    qvals, prev = {}, 1.0
    for i in range(m2n - 1, -1, -1):
        name = order2[i]
        val = min(prev, f2_raw[name] * m2n / (i + 1))
        qvals[name] = val
        prev = val
    f2_rows = [{"家族": "F2 探索（BH-FDR，q=.05，只描述不判定）", "检验": name,
                "原始p": f"{f2_raw[name]:.4g}", "校正后q": f"{qvals[name]:.4g}",
                "判定": "q<.05（描述性标注形态稳健/显著）" if qvals[name] < 0.05 else "q≥.05"}
               for name in order2]
    tbl = pd.DataFrame(f1_rows + f2_rows)
    tbl.to_csv(f"{HERE}/tables/table-S2-multiplicity.csv", index=False, encoding="utf-8-sig")
    say("mult", "Holm：H1a 校正后 p=" + f"{adj['H1a（Pearson r）']:.4g}" +
        "，H1b 校正后 p=" + f"{adj['H1b（M1 β₁）']:.4g}" +
        f"；FDR 最小 q={min(qvals.values()):.4g}（" +
        ("H1a/H1b 均确证阳性" if adj[order[0]] < 0.05 and adj[order[1]] < 0.05 else "存在不拒绝项") + "）")
    return {"holm_adj": adj, "qvals": qvals}


# ==================================================================
# 步骤九：5 折分层交叉验证（SAP §5.5，种子 20261024）
# ==================================================================
def cross_validation(df):
    # ------------------------------------------------------------------
    # 【做什么】按 TAS 五分位分层切 5 折（种子 20261024），对 M0/M1/M2 各做
    #          5 折交叉验证，报告样本外 RMSE 与 R²，并算 M2 相对 M1 的改善。
    # 【为什么】检验“线性主模型是不是够用”：藏起两成数据当考卷，比较三个
    #          模型的样本外误差；M2 改善不足 5% 记“复杂度不划算”。
    # 【怎么核对】tables/table-R3 的 CV 行；改善% =（RMSE_M1−RMSE_M2)/RMSE_M1。
    rng = np.random.default_rng(SEED_CV)
    q = pd.qcut(df.tas_total, 5, labels=False)
    fold = np.full(N, -1, dtype=int)
    for lev in range(5):
        idx = np.where(q == lev)[0]
        perm = rng.permutation(idx)
        for f in range(5):
            fold[perm[f::5]] = f
    assert (fold >= 0).all()
    designs = {
        "M0": ["caffeine_100"],
        "M1": ["caffeine_100", "sex_female", "grade_y2", "grade_y3", "grade_y4", "psqi_total"],
        "M2": ["caffeine_100", "sex_female", "grade_y2", "grade_y3", "grade_y4",
               "psqi_total", "caffeine_100_sq"],
    }
    y_all = df.tas_total.to_numpy(float)
    cv_rows = []
    for name, cols in designs.items():
        X = np.column_stack([np.ones(N)] + [df[c].to_numpy(float) for c in cols])
        sse, preds = 0.0, np.zeros(N)
        for f in range(5):
            te = fold == f
            bhat = np.linalg.lstsq(X[~te], y_all[~te], rcond=None)[0]
            preds[te] = X[te] @ bhat
            sse += float(((y_all[te] - preds[te]) ** 2).sum())
        rmse = float(np.sqrt(sse / N))
        r2 = 1 - sse / float(((y_all - y_all.mean()) ** 2).sum())
        cv_rows.append({"模型": name, "CV-RMSE": round(rmse, 3),
                        "CV-R²": round(r2, 3)})
    imp = (cv_rows[1]["CV-RMSE"] - cv_rows[2]["CV-RMSE"]) / cv_rows[1]["CV-RMSE"] * 100
    verdict = "复杂度不划算（<5%）" if imp < 5 else "改善≥5%"
    cv_tbl = pd.DataFrame(cv_rows)
    say("cv", f"CV（模拟数据）：RMSE M0={cv_rows[0]['CV-RMSE']:.3f}、M1={cv_rows[1]['CV-RMSE']:.3f}、"
             f"M2={cv_rows[2]['CV-RMSE']:.3f}；M2 相对 M1 改善 {imp:.2f}% → {verdict}")
    return cv_tbl, imp, verdict


# ==================================================================
# 步骤十：图表（SAP §6.5 Figure R1/R2 + §6.3 边际形态核查图 S1）
# ==================================================================
WATERMARK = "模拟数据（固定种子演示口径，不可用于真实推断）"


def figures(df, m1, diag, h1a_res):
    # ------------------------------------------------------------------
    # 【做什么】画三张图：R1 散点+OLS 拟合线+95%CI 带+LOWESS 曲线；
    #          R2 回归诊断四联图；S1 三变量边际形态（直方图+理论曲线、Q-Q）。
    # 【为什么】图是给非代码背景研究者核对线性假设、残差形态与边际形态的
    #          最直接材料（SAP Table 4 的图示项与 §6.3 形态核查）。
    # 【怎么核对】打开 figures/*.png；R1 图注的 r 与 table-R2 一致；
    #          R2 的 Cook's D 面板红线=4/300。
    x, y = df.caffeine_mg.to_numpy(float), df.tas_total.to_numpy(float)
    # ---------- Figure R1 ----------
    fig, ax = plt.subplots(figsize=(7.1, 5.2), dpi=300)
    ax.scatter(x, y, s=22, alpha=0.55, color="#1f77b4", edgecolor="none")
    xs = np.linspace(x.min(), x.max(), 200)
    b_slope, b_intercept = np.polyfit(x, y, 1)   # polyfit 返回 [斜率, 截距]，勿颠倒
    n = len(x)
    res = y - (b_intercept + b_slope * x)
    s2 = res @ res / (n - 2)
    sx = ((x - x.mean()) ** 2).sum()
    se_fit = np.sqrt(s2 * (1 / n + (xs - x.mean()) ** 2 / sx))
    yhat = b_intercept + b_slope * xs
    tcrit = stats.t.ppf(0.975, n - 2)
    ax.fill_between(xs, yhat - tcrit * se_fit, yhat + tcrit * se_fit,
                    color="#1f77b4", alpha=0.15, label="OLS 拟合线 95%CI 带")
    ax.plot(xs, yhat, color="#08306b", lw=2,
            label=f"OLS：ŷ = {b_intercept:.2f} + {b_slope*100:.2f}×(mg/d)/100")
    lw = lowess(y, x, frac=2 / 3, it=0)
    ax.plot(lw[:, 0], lw[:, 1], color="#d94801", lw=1.8, ls="--", label="LOWESS（局部加权）")
    ax.set_xlabel("日均咖啡因摄入量 (mg/d)")
    ax.set_ylabel("TAS 考试焦虑总分 (0–37)")
    ax.set_title(f"Figure R1 摄入量与考试焦虑：散点与拟合（n=300）\n"
                 f"Pearson r(298) = {h1a_res['r']:.3f}，95%CI [{h1a_res['ci'][0]:.3f}, {h1a_res['ci'][1]:.3f}]")
    ax.legend(frameon=False, fontsize=8.5, loc="upper left")
    ax.text(0.99, 0.01, WATERMARK, transform=ax.transAxes, ha="right", va="bottom",
            fontsize=7, color="gray")
    fig.tight_layout()
    fig.savefig(f"{HERE}/figures/figure-R1-scatter-ols-ci.png")
    plt.close(fig)
    # ---------- Figure R2 ----------
    fitted, resid = m1.fittedvalues.to_numpy(float) if hasattr(m1.fittedvalues, "to_numpy") \
        else np.asarray(m1.fittedvalues), np.asarray(m1.resid)
    cooks, thr = diag["cooks"], diag["thr"]
    fig, axes = plt.subplots(2, 2, figsize=(9.5, 7.6), dpi=300)
    (ax1, ax2), (ax3, ax4) = axes
    stats.probplot(resid, dist="norm", plot=ax1)
    ax1.get_lines()[0].set(markersize=4, color="#1f77b4")
    ax1.get_lines()[1].set(color="#d94801", lw=1.5)
    ax1.set_title("(a) M1 残差正态 Q-Q", fontsize=10)
    ax1.set_xlabel("理论分位数", fontsize=8.5)
    ax1.set_ylabel("样本分位数", fontsize=8.5)
    ax2.scatter(fitted, resid, s=16, alpha=0.55, color="#1f77b4")
    lwr = lowess(resid, fitted, frac=2 / 3, it=0)
    ax2.plot(lwr[:, 0], lwr[:, 1], color="#d94801", lw=1.5, ls="--")
    ax2.axhline(0, color="gray", lw=0.8)
    ax2.set_title("(b) 残差 − 拟合值（虚线 LOWESS）", fontsize=10)
    ax2.set_xlabel("拟合值", fontsize=8.5)
    ax2.set_ylabel("残差", fontsize=8.5)
    stud = resid / (resid.std(ddof=1))
    ax3.scatter(fitted, np.sqrt(np.abs(stud)), s=16, alpha=0.55, color="#1f77b4")
    lws = lowess(np.sqrt(np.abs(stud)), fitted, frac=2 / 3, it=0)
    ax3.plot(lws[:, 0], lws[:, 1], color="#d94801", lw=1.5, ls="--")
    ax3.set_title("(c) Scale−Location（√|标准化残差|）", fontsize=10)
    ax3.set_xlabel("拟合值", fontsize=8.5)
    ax3.set_ylabel("√|标准化残差|", fontsize=8.5)
    ax4.vlines(df.sid, 0, cooks, color="#1f77b4", lw=1.2, alpha=0.8)
    ax4.axhline(thr, color="#d94801", lw=1.2, ls="--", label=f"阈值 4/n = {thr:.4f}")
    over = cooks > thr
    if over.any():
        ax4.scatter(df.sid[over], cooks[over], color="#d94801", s=26, zorder=3)
    ax4.set_title("(d) Cook's 距离（每条记录）", fontsize=10)
    ax4.set_xlabel("记录序号 sid", fontsize=8.5)
    ax4.set_ylabel("Cook's D", fontsize=8.5)
    ax4.legend(frameon=False, fontsize=8)
    fig.suptitle("Figure R2 主模型 M1 回归诊断四联图（模拟数据，n=300）", fontsize=11)
    fig.text(0.99, 0.005, WATERMARK, ha="right", fontsize=7, color="gray")
    fig.tight_layout(rect=[0, 0.015, 1, 0.97])
    fig.savefig(f"{HERE}/figures/figure-R2-regression-diagnostics.png")
    plt.close(fig)
    # ---------- Figure S1 ----------
    from scipy.stats import lognorm, norm
    fig, axes = plt.subplots(2, 3, figsize=(10.5, 6.6), dpi=300)
    specs = [("caffeine_mg", "摄入量 (mg/d)", lognorm(s=0.62, scale=130)),
             ("tas_total", "TAS 总分", norm(18.4, 8.0)),
             ("psqi_total", "PSQI 总分", norm(6.5, 3.2))]
    for j, (col, lab, dist) in enumerate(specs):
        ax = axes[0, j]
        ax.hist(df[col], bins=24, density=True, color="#1f77b4", alpha=0.55)
        xs = np.linspace(dist.ppf(0.0005), dist.ppf(0.9995), 300)
        ax.plot(xs, dist.pdf(xs), color="#08306b", lw=1.5, label="Table 2 理论密度")
        ax.set_title(f"{'abc'[j]}) {lab} 直方图", fontsize=10)
        ax.legend(frameon=False, fontsize=7.5)
        axq = axes[1, j]
        stats.probplot(df[col], dist=dist, plot=axq)
        axq.get_lines()[0].set(markersize=3.5, color="#1f77b4")
        axq.get_lines()[1].set(color="#d94801", lw=1.4)
        axq.set_title(f"{'def'[j]}) {lab} 理论分布 Q-Q", fontsize=10)
        axq.set_xlabel("理论分位数", fontsize=8)
        axq.set_ylabel("样本分位数", fontsize=8)
    fig.suptitle("Figure S1 边际形态核查：模拟列对照 SAP Table 2 设定（截断致尾部轻微偏离为预期）",
                 fontsize=10.5)
    fig.text(0.99, 0.005, WATERMARK, ha="right", fontsize=7, color="gray")
    fig.tight_layout(rect=[0, 0.015, 1, 0.96])
    fig.savefig(f"{HERE}/figures/figure-S1-marginal-distributions.png")
    plt.close(fig)
    say("fig", "三张图已写出：figure-R1（散点+OLS+LOWESS）、figure-R2（诊断四联）、"
              "figure-S1（边际形态核查）")


# ==================================================================
# 主流程
# ==================================================================
def main():
    params = load_params(f"{HERE}/calibration-params.json")
    heartbeat("03-analyze", "start 冻结→门→分析", LOG)
    df, sha = freeze_data(params)
    r_obs = integrity_gate(df)
    # 等价性验证：fast_beta1_test 与 statsmodels M1 逐位一致（02 脚本蒙特卡洛的前提）
    m1_check = smf.ols(FORMULA_M1, data=df).fit()
    fast = fast_beta1_test(df)
    dmax = max(abs(fast["b1"] - m1_check.params["caffeine_100"]),
               abs(fast["se"] - m1_check.bse["caffeine_100"]),
               abs(fast["t"] - m1_check.tvalues["caffeine_100"]),
               abs(fast["p"] - m1_check.pvalues["caffeine_100"]))
    say("equiv", f"快速检验 vs statsmodels 最大差异 = {dmax:.2e}（阈值 1e-8）→ "
                 f"{'等价性通过' if dmax < 1e-8 else '不一致，须排查'}")
    assert dmax < 1e-8

    descriptives(df)
    a = h1a(df)
    b = h1b(df)
    diag = diagnostics(df, b["m1"])
    diag["b1_ref"] = b["b1"]
    sens, models = sensitivity(df, diag)
    mult = multiplicity(a, b, sens)
    cv_tbl, cv_imp, cv_verdict = cross_validation(df)

    # ---------- Table R2 主结果 ----------
    r2rows = [
        {"条目": "H1a：Pearson r（未调整）", "估计": f"r = {a['r']:.3f}",
         "95%CI": f"[{a['ci'][0]:.3f}, {a['ci'][1]:.3f}]",
         "统计量": f"t({a['df']}) = {a['t']:.2f}", "p": f"{a['p']:.3f}",
         "Holm 校正后": f"{mult['holm_adj']['H1a（Pearson r）']:.4g}",
         "判定": "拒绝 H0" if mult['holm_adj']['H1a（Pearson r）'] < .05 else "不拒绝"},
        {"条目": "M0：未调整斜率", "估计": f"b = {b['b0']:.3f} 分/100mg·d⁻¹",
         "95%CI": "—", "统计量": "—",
         "p": f"{b['m0'].pvalues['caffeine_100']:.3f}", "Holm 校正后": "—", "判定": "参照"},
        {"条目": "H1b：M1 调整斜率 b₁", "估计": f"b = {b['b1']:.3f} 分/100mg·d⁻¹",
         "95%CI": f"[{b['ci'][0]:.3f}, {b['ci'][1]:.3f}]",
         "统计量": f"t({b['df']}) = {b['t']:.2f}", "p": f"{b['p']:.3f}",
         "Holm 校正后": f"{mult['holm_adj']['H1b（M1 β₁）']:.4g}",
         "判定": "拒绝 H0" if mult['holm_adj']['H1b（M1 β₁）'] < .05 else "不拒绝"},
        {"条目": "H1b 辅助：偏相关 / 标准化 β / 折算",
         "估计": f"pr = {b['partial_r']:.3f}；β = {b['beta_std']:.3f}；{b['b1']/b['sd_tas']:.3f} SD",
         "95%CI": "—", "统计量": "—", "p": "—", "Holm 校正后": "—",
         "判定": f"调整R²={b['m1'].rsquared_adj:.3f}，ΔR²={b['m1'].rsquared - b['mcov'].rsquared:.3f}"},
        {"条目": "睡眠混杂衰减 (b_M0−b_M1)/b_M0", "估计": f"{b['atten']:.1f}%",
         "95%CI": "—", "统计量": "—", "p": "—", "Holm 校正后": "—",
         "判定": f"设计真值：未调整≈1.47、调整≈1.25 分/100mg·d⁻¹"},
    ]
    pd.DataFrame(r2rows).to_csv(f"{HERE}/tables/table-R2-primary-results.csv",
                                index=False, encoding="utf-8-sig")

    # ---------- Table R3 敏感性与探索（含 CV 与 AIC/BIC 辅助） ----------
    r3rows = list(sens["rows"])
    r3rows.append({"条目": "CV：M0 / M1 / M2（5 折分层，种子 20261024）",
                   "估计": f"CV-RMSE {' / '.join(str(v) for v in cv_tbl['CV-RMSE'])}",
                   "95%CI / 细节": f"CV-R² {' / '.join(str(v) for v in cv_tbl['CV-R²'])}",
                   "统计量": f"M2 相对 M1 改善 {cv_imp:.2f}%", "p": cv_verdict})
    aic_m1 = b["m1"].aic
    r3rows.append({"条目": "AIC/BIC 辅助描述（Δ 相对 M1，|Δ|≥2 记 noteworthy）",
                   "估计": f"M2 ΔAIC={models['m2'].aic - aic_m1:+.1f}，ΔBIC={models['m2'].bic - b['m1'].bic:+.1f}",
                   "95%CI / 细节": f"M1ord ΔAIC={models['m1ord'].aic - aic_m1:+.1f}，"
                                   f"ΔBIC={models['m1ord'].bic - b['m1'].bic:+.1f}",
                   "统计量": "—", "p": "—"})
    pd.DataFrame(r3rows).to_csv(f"{HERE}/tables/table-R3-sensitivity-exploration.csv",
                                index=False, encoding="utf-8-sig")

    # ---------- Table S5 各模型完整系数 ----------
    full_rows = []
    for name, res in [("M0", b["m0"]), ("Mcov(仅协变量)", b["mcov"]), ("M1", b["m1"]),
                      ("M1ord", models["m1ord"]), ("M2", models["m2"]),
                      ("M3", models["m3"]), ("M1bin", models["m_bin"])]:
        for term in res.params.index:
            ci = res.conf_int().loc[term]
            full_rows.append({"模型": name, "项": term, "b": round(float(res.params[term]), 4),
                              "SE": round(float(res.bse[term]), 4),
                              "CI_low": round(float(ci[0]), 4), "CI_high": round(float(ci[1]), 4),
                              "t": round(float(res.tvalues[term]), 3),
                              "p": float(f"{res.pvalues[term]:.4g}"),
                              "R2": round(float(res.rsquared), 4) if term == res.params.index[0] else ""})
    pd.DataFrame(full_rows).to_csv(f"{HERE}/tables/table-S5-models-full.csv",
                                   index=False, encoding="utf-8-sig")

    figures(df, b["m1"], diag, a)

    with open(f"{HERE}/run-03-summary.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(SUMMARY) + "\n")
    heartbeat("03-analyze", "done 全部分析与表图完成", LOG)
    print("\n===== 关键结果摘要（模拟数据） =====")
    for line in SUMMARY:
        print(line)


if __name__ == "__main__":
    main()

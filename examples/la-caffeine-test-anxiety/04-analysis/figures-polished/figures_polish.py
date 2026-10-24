# -*- coding: utf-8 -*-
"""
figures_polish.py — journal-normalized redraw of figures R1 / R2 / S1
for Psychology Research and Behavior Management (Dove Medical Press).

Rules honored:
- Numbers are NOT touched: same frozen CSV, same models/formulas, same LOWESS
  parameters (frac=2/3, it=0), same histogram bins (24, density=True) as
  03_freeze_analyze.py::figures(). Presentation only.
- All figure text in English, Arial; Okabe-Ito palette; no in-figure captions;
  bold uppercase panel letters (A, B, C, ...) per Dove guidelines;
  flattened RGB PNG @600 dpi + TIFF @600 dpi + vector PDF (archive copy).
"""

from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import lognorm, norm
import statsmodels.formula.api as smf
from statsmodels.nonparametric.smoothers_lowess import lowess
from PIL import Image

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = str(Path(__file__).resolve().parent.parent)  # 入库示例：原为本机绝对路径，改为相对脚本目录（见示例 README）
OUT = f"{HERE}/figures-polished"
FROZEN = f"{HERE}/input/sim_data_frozen.csv"

# ---- Dove Press figure rules (author-guidelines/figures-tables, fetched 2026-10-24):
#   formats: jpeg/png/tiff...; combination art >= 600 dpi; fonts Arial/Symbol Roman;
#   panels labeled A, B, C, D; all text in English; RGB; no transparency.
# Vector PDF is produced as an archival copy only (Dove lists bitmap formats).
BASE_RC = {
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"],
    "font.size": 8,
    "axes.linewidth": 0.8,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "xtick.direction": "out",
    "ytick.direction": "out",
    "xtick.major.size": 3,
    "ytick.major.size": 3,
    "xtick.major.width": 0.8,
    "ytick.major.width": 0.8,
    "legend.frameon": False,
    "pdf.fonttype": 42,      # embed TrueType (Arial) in PDF
    "ps.fonttype": 42,
    "axes.unicode_minus": True,
}
plt.rcParams.update(BASE_RC)

# Okabe-Ito assignments: data = blue, data-driven smooth = vermillion,
# fixed reference = grey; CI band = sky.
BLUE, SKY, VERM, GREY = "#0072B2", "#56B4E9", "#D55E00", "#555555"

FORMULA_M1 = ("tas_total ~ caffeine_100 + sex_female + grade_y2 + grade_y3 "
              "+ grade_y4 + psqi_total")
NOTE = "Simulated data (fixed-seed demonstration run; not for real-world inference)"

df = pd.read_csv(FROZEN)
x, y = df.caffeine_mg.to_numpy(float), df.tas_total.to_numpy(float)


def panel_letter(ax, letter):
    ax.text(0.0, 1.02, letter, transform=ax.transAxes,
            ha="left", va="bottom", fontsize=9, fontweight="bold")


def finalize(fig, stem, note_xy):
    fig.text(note_xy[0], note_xy[1], NOTE, ha="right", va="bottom",
             fontsize=6, color="#666666")
    pdf_path = f"{OUT}/{stem}.pdf"
    png_path = f"{OUT}/{stem}.png"
    tif_path = f"{OUT}/{stem}.tif"
    fig.savefig(pdf_path)                                  # vector archive
    fig.savefig(png_path, dpi=600, facecolor="white")
    plt.close(fig)
    # flatten to RGB (Dove: no transparency), re-emit PNG + LZW TIFF
    im = Image.open(png_path)
    if im.mode != "RGB":
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1] if im.mode in ("RGBA", "LA") else None)
        im = bg
    im.save(png_path, dpi=(600, 600))
    im.save(tif_path, format="TIFF", compression="tiff_lzw", dpi=(600, 600))
    return pdf_path, png_path, tif_path, im.size


# ============================ Figure R1 =================================
r, ci = stats.pearsonr(x, y)
ci_z = np.arctanh(r) + np.array([-1, 1]) * stats.norm.ppf(0.975) / np.sqrt(len(x) - 3)
ci_r = np.tanh(ci_z)   # Fisher z CI — cross-checked against table-R2 below

fig, ax = plt.subplots(figsize=(3.5, 2.8), constrained_layout=True)
ax.scatter(x, y, s=12, alpha=0.55, color=BLUE, edgecolor="none",
           label="Observations (n=300)")
xs = np.linspace(x.min(), x.max(), 200)
b_slope, b_intercept = np.polyfit(x, y, 1)      # identical to M0 in 03 script
n = len(x)
res = y - (b_intercept + b_slope * x)
s2 = res @ res / (n - 2)
sx = ((x - x.mean()) ** 2).sum()
se_fit = np.sqrt(s2 * (1 / n + (xs - x.mean()) ** 2 / sx))
yhat = b_intercept + b_slope * xs
tcrit = stats.t.ppf(0.975, n - 2)
ax.fill_between(xs, yhat - tcrit * se_fit, yhat + tcrit * se_fit,
                color=SKY, alpha=0.40, label="OLS 95% CI band")
ax.plot(xs, yhat, color="#1A1A1A", lw=1.4,
        label=f"OLS fit: \u0177 = {b_intercept:.2f} + {b_slope*100:.2f}\u00d7intake/100")
lw = lowess(y, x, frac=2 / 3, it=0)
ax.plot(lw[:, 0], lw[:, 1], color=VERM, lw=1.4, ls="--", label="LOWESS smoother")
ax.set_xlabel("Daily caffeine intake (mg/day)")
ax.set_ylabel("TAS total score (0\u201337)")
ax.set_xlim(0, 620)
ax.legend(fontsize=6.2, loc="upper left", handlelength=1.6, borderaxespad=0.2)
finalize(fig, "figure-R1-scatter-ols-ci", (0.995, 0.008))
print(f"[R1] r={r:.3f} fisherCI=[{ci_r[0]:.3f},{ci_r[1]:.3f}] "
      f"ols_intercept={b_intercept:.3f} slope_per100={b_slope*100:.3f}")

# ============================ Figure R2 =================================
m1 = smf.ols(FORMULA_M1, data=df).fit()
fitted = np.asarray(m1.fittedvalues, float)
resid = np.asarray(m1.resid, float)
infl = m1.get_influence()
cooks = np.asarray(infl.cooks_distance[0], float)
thr = 4.0 / len(df)

fig, axes = plt.subplots(2, 2, figsize=(7.1, 5.6), constrained_layout=True)
(ax1, ax2), (ax3, ax4) = axes

stats.probplot(resid, dist="norm", plot=ax1)
ax1.get_lines()[0].set(markersize=2.6, color=BLUE, alpha=0.75,
                       markerfacecolor=BLUE, markeredgecolor="none")
ax1.get_lines()[1].set(color=GREY, lw=1.0)
ax1.set_title("Normal Q\u2013Q of M1 residuals", fontsize=8)
ax1.set_xlabel("Theoretical quantiles")
ax1.set_ylabel("Sample quantiles")
panel_letter(ax1, "A")

ax2.scatter(fitted, resid, s=9, alpha=0.55, color=BLUE, edgecolor="none")
lwr = lowess(resid, fitted, frac=2 / 3, it=0)
ax2.plot(lwr[:, 0], lwr[:, 1], color=VERM, lw=1.2, ls="--")
ax2.axhline(0, color=GREY, lw=0.8)
ax2.set_title("Residuals vs fitted", fontsize=8)
ax2.set_xlabel("Fitted values (TAS)")
ax2.set_ylabel("Residuals")
panel_letter(ax2, "B")

stud = resid / (resid.std(ddof=1))
ax3.scatter(fitted, np.sqrt(np.abs(stud)), s=9, alpha=0.55, color=BLUE,
            edgecolor="none")
lws = lowess(np.sqrt(np.abs(stud)), fitted, frac=2 / 3, it=0)
ax3.plot(lws[:, 0], lws[:, 1], color=VERM, lw=1.2, ls="--")
ax3.set_title("Scale\u2013location", fontsize=8)
ax3.set_xlabel("Fitted values (TAS)")
ax3.set_ylabel("\u221a|Standardized residuals|")
panel_letter(ax3, "C")

ax4.vlines(df.sid, 0, cooks, color=BLUE, lw=1.0, alpha=0.8)
ax4.axhline(thr, color=GREY, lw=1.0, ls="--", label=f"Threshold 4/n = {thr:.4f}")
over = cooks > thr
if over.any():
    ax4.scatter(df.sid[over], cooks[over], color=VERM, s=14, zorder=3)
ax4.set_title("Cook's distance", fontsize=8)
ax4.set_xlabel("Record ID (sid)")
ax4.set_ylabel("Cook's D")
ax4.legend(fontsize=6.5, loc="upper right", handlelength=1.6)
panel_letter(ax4, "D")

finalize(fig, "figure-R2-regression-diagnostics", (0.995, 0.006))
print(f"[R2] M1 b1={m1.params['caffeine_100']:.3f} "
      f"CI=[{m1.conf_int().loc['caffeine_100'][0]:.3f},"
      f"{m1.conf_int().loc['caffeine_100'][1]:.3f}] "
      f"cooks>thr n={int(over.sum())} thr={thr:.4f}")

# ============================ Figure S1 =================================
fig, axes = plt.subplots(2, 3, figsize=(7.1, 4.7), constrained_layout=True)
specs = [("caffeine_mg", "Daily caffeine intake (mg/day)",
          lognorm(s=0.62, scale=130), "lognormal"),
         ("tas_total", "TAS total score (0\u201337)", norm(18.4, 8.0), "normal"),
         ("psqi_total", "PSQI total score (0\u201321)", norm(6.5, 3.2), "normal")]
letters = "ABCDEF"
for j, (col, lab, dist, dname) in enumerate(specs):
    ax = axes[0, j]
    ax.hist(df[col], bins=24, density=True, color=BLUE, alpha=0.60,
            label="Observed (density)")
    xs = np.linspace(dist.ppf(0.0005), dist.ppf(0.9995), 300)
    ax.plot(xs, dist.pdf(xs), color=GREY, lw=1.2,
            label="SAP Table 2 theoretical")
    ax.set_title(lab, fontsize=8)
    ax.set_ylabel("Density")
    ax.legend(fontsize=6.0, loc="upper right", handlelength=1.4)
    panel_letter(ax, letters[j])

    axq = axes[1, j]
    stats.probplot(df[col], dist=dist, plot=axq)
    axq.get_lines()[0].set(markersize=2.4, color=BLUE, alpha=0.75,
                           markerfacecolor=BLUE, markeredgecolor="none")
    axq.get_lines()[1].set(color=GREY, lw=1.0)
    axq.set_title(f"Q\u2013Q vs {dname}", fontsize=8)
    axq.set_xlabel("Theoretical quantiles")
    axq.set_ylabel("Sample quantiles")
    panel_letter(axq, letters[3 + j])

finalize(fig, "figure-S1-marginal-distributions", (0.995, 0.006))
print(f"[S1] cols={[s[0] for s in specs]} bins=24 density=True")

# --- verify fonts embedded in PDFs (FontFile2 presence) ------------------
for stem in ("figure-R1-scatter-ols-ci", "figure-R2-regression-diagnostics",
             "figure-S1-marginal-distributions"):
    raw = open(f"{OUT}/{stem}.pdf", "rb").read()
    emb = b"FontFile2" in raw
    arial = b"Arial" in raw
    print(f"[pdf] {stem}: FontFile2={emb} ArialName={arial}")
print("[done] outputs in", OUT)

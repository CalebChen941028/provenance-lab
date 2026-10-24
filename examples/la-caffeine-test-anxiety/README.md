# Example: Caffeine × Test Anxiety (L-A lightweight regression, complete and re-runnable)

L-A regression round 4 (2026-10-24, ZCode, workflow version D32, development rigor, hybrid team, simulated cross-sectional data, n = 300). Unlike `psu-sleep-simulation/`, this example ships **every deliverable**: research question (01), evidence table (02), pre-registered SAP (03), analysis package with scripts, frozen data and tables (04), audit trail (05), citation audit (05a), draft (06), rebuttal (07), paper manifest (08), figure audit (09) and L0 telemetry (99).

**Re-run it yourself** (needs [uv](https://docs.astral.sh/uv/); about 20 seconds):

```bash
cd examples/la-caffeine-test-anxiety/04-analysis
bash run_all.sh
shasum -a 256 input/sim_data_frozen.csv   # must equal the sha256 in input/freeze_manifest.json
```

Verified on a clean copy at a different path on 2026-10-24: exit code 0, frozen-data SHA-256 identical (`46ced49d…`), all nine result tables byte-identical to the shipped ones.

**What differs from the raw run output** (and nothing else):
- The analysis scripts hard-coded the original machine's absolute path (`HERE = "/Users/…"`); four `HERE` lines now resolve relative to the script directory. This defect led to the portability rule and scan added to the workflow after D32.
- `04-analysis/mc-cache/` ships empty (the scripts expect the directory to exist; that defect led to the clean-state rerun rule).
- Not included: the Python virtual environment, Monte-Carlo cache files, and the 16 downloaded open-access PDFs (their licences vary, including CC BY-NC-ND, so they are not redistributed here; `08-papers-manifest.md` lists them with sources).

Simulated-data demonstration: every number is fixed-seed and must not be used for any substantive conclusion. Per-role token profile of this run: `evaluation/results/L-A-baseline-2026-10-22.md` (round 4).

---

**中文说明**：L-A 轻量回归第 4 轮的全套产物（01–09、99），可一键重跑并用 sha256 核验冻结数据。相对原始运行产物只有两处改动：四个脚本的 `HERE` 由本机绝对路径改为相对脚本目录；保留空的 `mc-cache/` 目录。未收录虚拟环境、蒙特卡洛缓存与 16 篇 OA PDF（许可证各异，不再分发，见 08 清单）。模拟数据演示，数值不可外推。

# ProvenanceLab — ZCode / Claude Code 适配层（Bilingual SKILL）

> English section below · 英文版在本文件下半部分

---

[以下保留原中文 SKILL.md 全文，见同目录 SKILL.md——本文件为双语索引]

## English Quick Guide (for Claude Code / ZCode international users)

**ProvenanceLab** — verifiable research pipeline (clinical medicine / epidemiology / psychology / related health sciences): question (PICO/FINER) → multi-database search → PRISMA synthesis with retraction audit → pre-registered SAP (variable dictionary + overfitting controls) → analysis (code-to-data, chunked compute) → statistical review → Nature/Cell-standard figures → IMRaD draft (citation whitelist, AI + ethics disclosures) → simulated peer review → defense grilling → five-dimension citation audit → OA archiving → human-audit package. Slogan: **For truth, not glory. Machines take the toil — every claim stands scrutiny.**

**Full English protocol**: `pipeline.en.md` in this skill directory once installed ([`core/pipeline.en.md`](../../../core/pipeline.en.md) in the repo) — harness-agnostic, authoritative for international use.

**Quick start** (English): say "Follow the ProvenanceLab protocol: <your topic>" — the agent runs the grill interview, then configuration, then the pipeline; deliverables land in `provenance-lab-output/` next to your dataset.

**Standalone services** (no full run): figure-polish · citation-audit · review · cross-validate (independent verification of analyses made elsewhere) · audit-pack.

**Key guarantees**: citation whitelist; retraction-status hard gate; pre-registration-style SAP; participatory checkpoints (variable-dictionary confirmation before analysis when a real dataset is provided); glass-box plain-language layer; deterministic tool layer (`tools/plab.py`: identifier and retraction resolution, whitelist final check, p-value recomputation, legal OA download — tool results override agent self-reports, with graceful fallback); L0 telemetry (`99-metrics.json`); tool-positioning disclaimer — outputs are research assistance requiring human verification, never clinical advice.

**D39 gate discipline**: correct and re-check minor wording/qualifier warnings; retaining a paper does not retain erroneous wording. Material qualifiers unsupported by personally read source text are unsupported. Freeze and deliver design-stage power scripts/seeds/commands/summaries in `03-sap-code/`. statcheck supports Markdown emphasis and intervening CI; zero matches must be disclosed and cannot pass. Disclose unresolved identifiers and unknown PDF licences separately; not downloaded does not mean paywalled.
Disclose recent minor notes without verified closure; figure revisions without another visual check are not accepted, and delivery status reflects failed gates.

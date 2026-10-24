# ProvenanceLab Protocol (English Edition · harness-agnostic)

> Companion to `pipeline.md` (Chinese, authoritative). This file is the full English version for international users. Any LLM agent (ZCode / Claude Code / Codex / opencode / DeepSeek harness / WorkBuddy / any) should be able to execute the complete pipeline from this file alone. Domain: clinical medicine, epidemiology, psychology, and related health sciences (nursing, public health, pharmacy, rehabilitation, nutrition…).

## 0. Execution rules (universal)

1. **Role = fresh context**: each stage runs in a clean context (spawn subagents where available; otherwise switch roles in prompts — gatekeeper roles must judge only from files and command output, never from the builder's claims).
2. **Model tiers (optional)**: gatekeepers (critique, statistics, review, grilling) and core builders (SAP, analysis, writing) use the strongest model; search and summarization may use a light model. **Statistical rigor never downgrades.**
3. **Facts ledger**: after each gate passes, append one established fact; every later role receives the ledger.
4. **Outputs on disk**: with a dataset → `<dataset-folder>/provenance-lab-output/`; else workspace. Fixed names: `00-README.md` (what changed / what didn't / where things are), `01-research-question.md`, `02-evidence-table.md`, `03-sap.md`, `04-analysis/`, `05-audit-trail.md`, `05a-citation-audit.md`, `06-draft.md`, `07-rebuttal.md`, `08-papers-manifest.md`, `papers/`, `99-metrics.json`.
5. **Honesty**: anything unachievable, unfindable, or unanswerable goes into the final "not covered" list. Never fabricate literature, data, or conclusions.
6. **Search tools**: prefer locally installed search skills (e.g. google-deepmind/science-skills); else call official public APIs directly (see Appendix A). Record actual search strings.
7. **Data security (code-to-data)**: real data lives outside the agent workspace; the analyst **never reads raw rows into context** — first print schema only, then do everything as code; de-identify direct identifiers before analysis; raw data read-only.
8. **Language**: deliverables follow the user's language; citations, search strings, and code comments stay in original/English.
9. **Private library (optional)**: user-owned legally purchased PDFs, parsed read-only locally, merged into evidence labeled "private library".
10. **Glass box**: ① three-line plain comments per major code block (what/why/how-to-verify); ② plain-language guide with hands-on verification actions per audit section; ③ participatory checkpoints — pause after pre-registered SAP (default ON when a real dataset is provided; confirm each variable's source column, coding direction, cutoffs, transforms) and optionally after the draft.
11. **Academic presentation**: numbered sections; numbered tables/figures (Table/Figure N) with proper headers and captions; Vancouver references; APA/JARS statistics (p<.001, 95%CI [LL, UL], italic symbols); structured abstract; formal register — findings belong in sections or numbered tables, never scattered lists. Plain language only in comments/guides.
12. **Voice (natural-voice summary)**: no AI-isms (delve/testament to/crucial/It is important to note…), no translationese, no pseudo-academic jargon, no defensive hedging (limitations as scope conditions); evidence-strength verbs; one paragraph one move.
13. **Deterministic tool layer (optional, recommended)**: code settles what code can settle; agents keep the semantic judgement. `tools/plab.py` (Python standard library only) ships with the protocol: `resolve` (PMID/DOI resolution, bibliographic match, retraction/concern/correction status from PubMed publication types and correction links, Crossref `updated-by`, OpenAlex `is_retracted`), `cited`/`whitelist` (reference extraction and the S8 whitelist check with PMID↔DOI mapping), `statcheck` (recompute p from APA-style reports; flag inconsistencies and flipped significance decisions), `oa-fetch` (legal OA PDFs, PMC Open Access dataset first, licence recorded; paywalls and bot walls are never bypassed), `dedup`, `schema` (structure and counts only). **Tool results override agent self-reports**; when a tool is missing or the network fails (result `unknown`/`found: null`, never "fabricated"), fall back to agent checks and say so in the not-covered list.

## 1. Research interview (grill-style, before launch)

One question at a time with recommended answers, covering: ① core intent (prove vs explore); ② causal vs descriptive; ③ population/outcome priorities; ④ data reality (folder-picker popups where supported; simulated-data demo if none — user must consent); ⑤ private PDF library (optional); ⑥ analysis expectations **and inclusion preferences** (study types, year range, language limits, must-include papers as PMID/DOI → `inclusionPrefs`; missing must-includes are flagged loudly, never silently dropped); ⑦ target journals; ⑧ intended use (publication/thesis/internal) → review strictness; ⑨ delivery language (auto-suggested: target-journal language first, session language second; one-click confirm/override); ⑩ first-time users: enable the `sap` checkpoint.

## 2. Pipeline stages

**S1 Question (PI)**: PICO/PECO, testable hypotheses, matched design, reporting guideline (STROBE/CONSORT/PRISMA/APA), FINER + novelty positioning, 2–3 target journals, field determination (clinical/epidemiology/psychology/other-health drives search routing; nursing, public health, pharmacy, rehabilitation, nutrition and other related health sciences map to other-health with the nearest main field noted). Gate: independent methodological critique, one revision round.

**S2 Evidence (searchers ×N → synthesizer)**: base sources PubMed / EuropePMC / OpenAlex + Semantic Scholar (official free API); field-routed extras (clinical→ClinicalTrials.gov, epidemiology→bioRxiv, psychology→arXiv; other-health→no field extra, falls back to the four base sources); user `extraSources` (official APIs only). **Two-stage search (token discipline)**: relevance-ranked title lists first (record database counts; never fetch all abstracts), fetch abstracts for top 40, return ≤20. Legality: no Google Scholar scraping; subscription DBs only with user credentials. Synthesizer: PRISMA dedup/screening, honor `inclusionPrefs`, exclude retracted/expression-of-concern (three-source status audit: OpenAlex `is_retracted`, PubMed publication types, Crossref Retraction Watch), rank by relevance/evidence level/methodological quality **never prestige**, risk-of-bias (NOS/RoB 2/ROBINS-I). Gate: with the tool layer, `plab resolve` first checks every included identifier — non-existent, retracted or concern entries fail outright, independent of sampling; the checker then samples ≥8 for metadata and abstract consistency (abstract-level; full texts belong to S7.5). Entries failing twice are removed from the evidence table and logged.

**S3 Pre-registered SAP**: locked before any results — analyses, effect measures, α + Holm-family corrections, missing data, power, assumptions, **model complexity & overfitting controls** (EPV≥10, pre-registered random-effects structure, VIF, declared AIC/BIC rules, cross-validation where applicable, null-MC type-I calibration for simulations), variable dictionary (name/definition/source column/transform/rationale incl. rejected candidates), method-rationale table, plain-language layer. Notes: pre-registration-style ≠ registry registration (PROSPERO/OSF for formal).

**S4 Analysis & reproducibility**: execute strictly per SAP (deviations logged with reasons); fixed seeds; paths inside scripts relative to the script directory, never hard-coded machine paths (the workflow scans for them and sends them back); R/Python; three-line comments; chunked compute with heartbeat log; every result with effect size + 95% CI; optional deterministic verify command. Gate: statistical review (SAP consistency, corrections, reporting, p-hacking signs, overfitting controls) with bounded revision + stall-triggered root-cause diagnosis.

**S4.5 Figure audit (optional, default on)**: journal-standard redraw (Nature/Cell family defaults or provided guide URL): colorblind-safe, column widths, vector+300dpi, panel letters, no chartjunk — **never change numbers**; originals kept; `09-figure-audit.md`.

**S5 Draft (medical writer)**: outline-driven IMRaD per guideline; citation whitelist only (verified evidence table or own results); retracted/concern papers never cited as evidence; corrected versions annotated; **AI-use disclosure and ethics statement placeholders on the title page (author must fill approval number; not to be deleted)**; simulation-data labeling where applicable.

**S6 Simulated peer review**: development = 1 methodologist; demo = + adversarial challenger; benchmark = 3 reviewers (methods/domain/statistics) + meta-reviewer. Bounded revision with stall diagnosis.

**S7 Defense grilling (grill-me style)**: 6/8/10 reject-level questions (confounding, power, measurement validity, alternative explanations, conflicts with stronger evidence, generalizability, simulation transferability); answer from verified materials; honest "cannot answer" recorded. `07-rebuttal.md` in Reviewer N → Comment N.x → Response format.

**S7.5 Citation deep audit**: every citation, five dimensions — ①locate (PMID/DOI; private-library items to local files); ②primary-source tracing (secondhand→original replaced); ③full-text comparison where OA (else abstract-level, disclosed); ④necessity (necessary/redundant/wrong-context); ⑤retraction status (retracted/concern = problem citations). `05a-citation-audit.md`; problems bounce back to the writer.

**S7.6 Paper archiving**: legally download OA PDFs (with the tool layer `plab oa-fetch` downloads and the librarian only writes the manifest) to `papers/` named `Title_Journal_Year.pdf`; paywalled → Vancouver to-get list with access routes; never bypass paywalls; private-library items listed as "already held".

**S8 Audit pack, metrics, delivery**: `00-README.md` (tree + what changed/didn't/where + disclaimers incl. tool positioning), `05-audit-trail.md` (Mermaid flowchart with what+why per node; variable dictionary; method decision table; citation audit details; gate summary; plain-language guides with verification actions; human-verification guide), `99-metrics.json` (L0 telemetry). **Deterministic final check**: cited references ⊆ evidence ∪ SAP methods references ∪ deep-audit-verified sources, minus S2 exclusions (`plab whitelist`); `plab statcheck` recomputes p for APA-style reports in the draft; one writer fix round (statistics follow the analysis outputs, never adjusted to look consistent), leftovers become findings; references without PMID/DOI cannot be checked and go to not covered. Final report: conclusion / findings (with unresolved items) / verified / not covered.

**Standalone modes**: `figure-polish` · `citation-audit` (needs draft) · `review` (needs draft) · `cross-validate` (independent verification of externally produced analyses: re-run their scripts as-is + recompute key statistics or derivability checks + statistical review) · `audit-pack`.

## 3. Anti-fabrication gates

| Risk | Gate |
|---|---|
| Fabricated literature | Whitelist + code-level identifier resolution (S2) + deep audit (S7.5) + whitelist final check (S8) |
| Retraction/flag cited | Three-source status audit; never as evidence (S2/S7.5) |
| p-hacking | Pre-registered SAP + statistical review (S3/S4) |
| Overfitting | Six pre-registered complexity controls + reviewer checks (S3/S4) |
| Statistics inconsistent with reported values | `plab statcheck` recomputation (S8 final check) |
| Overclaiming | Challenger + defense grilling (S6/S7) |
| Stalled revisions | Reviewers report how many prior major issues persist; all persisting → root-cause diagnosis |
| Irreproducibility | Fixed seeds + rerun gate + heartbeat |
| Wishful reporting | Mandatory not-covered list; tool-positioning disclaimer |

## 4. Disclaimers

**Tool positioning**: research acceleration tool; no guarantee of 100% truth/correctness/completeness; all outputs require human verification and professional judgment; AI cannot replace peer review, ethics review, or authorial responsibility. Not clinical advice. Simulated-data results must not be submitted or used for decisions.

## Appendix A: Search API quick reference (official, key-free)

| Source | Endpoint | Notes |
|---|---|---|
| PubMed | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=...&retmax=20&retmode=json` | publication types flag retractions |
| EuropePMC | `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=...&format=json` | OA full text via `.../rest/{PMCID}/fullTextXML` |
| OpenAlex | `https://api.openalex.org/works?search=...&per-page=20` | `is_retracted` field; add `&mailto=` for polite pool |
| Semantic Scholar | `https://api.semanticscholar.org/graph/v1/paper/search?query=...&fields=title,year,abstract,citationCount,externalIds` | ~100 req/5min unauthenticated |
| Crossref Retraction Watch | `https://api.labs.crossref.org/retractions/search?doi=...` | open retraction lookup |

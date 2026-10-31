# ProvenanceLab — Verifiable Research Pipeline

[**中文**](README.md) | English

[中文](README.md) | **English**

> **For truth, not glory. Machines take the toil — every claim stands scrutiny.**
>
> Research for truth, applied for the people, to move the world forward — not for fame. Hand the tedium to AI, and give researchers back the time to think through a real scientific question. Make research visible: every step traceable, every conclusion defensible.
>
> *(Product tagline: Every claim, traceable.)*

**ProvenanceLab** is a multi-agent research pipeline for **clinical medicine, epidemiology, psychology, and related health sciences (nursing, public health, pharmacy, rehabilitation, nutrition…)** — from question formulation to manuscript draft — built around one obsession: research you can actually verify. It runs across agent harnesses (ZCode / Claude Code / Codex / others), delivers documents in your language, and ships a human-audit package so every decision can be checked by hand.

```
core/pipeline.md  (harness-agnostic protocol: stages × roles × gates × prompts)
        │
        ├── adapters/zcode        skill + dynamic workflow (multi-agent orchestration)
        ├── adapters/claude-code  SKILL.md (open Agent Skills format)
        ├── adapters/codex        /provenance-lab prompt
        └── other harnesses       drop core/pipeline.md into your system prompt
```

```
Question (PICO/FINER) → independent critique → multi-database search ×5 (PubMed/EuropePMC/
OpenAlex/Semantic Scholar + field-routed source) → PRISMA synthesis + citation verification →
pre-registered SAP (variable dictionary + method rationale) → analysis & reproducibility gate
(code-to-data) → statistical review → Nature/Cell-standard figure audit → IMRaD draft
(citation whitelist) → simulated peer review → defense grilling (grill-me style) →
five-dimension citation audit (primary-source tracing / full-text comparison / necessity /
retraction status) → OA PDF archiving → audit package → delivery
```

## What it defends against

The biggest risk of multi-agent research automation is not failure to produce — it is *looking* produced: fabricated citations, p-hacking, result-driven analysis switching, overclaiming. Every stage targets one failure mode:

| Risk | Countermeasure |
|---|---|
| Fabricated literature | Citation whitelist: drafts may only cite entries verified record-by-record (PMID/DOI) or this study's own results; identifier existence and retraction/correction status are resolved by code, and a code-level final check enforces "cited ⊆ whitelist" before delivery (`tools/plab.py`) |
| Citing retracted / flagged papers | Hard gate, always on: three-source retraction audit (OpenAlex `is_retracted`, PubMed publication types, Crossref Retraction Watch); retracted/expressions-of-concern are never cited as evidence |
| p-hacking | Pre-registration-style SAP: the statistician locks the analysis plan **before seeing any result** |
| Sloppy statistics | Statistical reviewer checks assumptions, multiple-comparison corrections, effect sizes + 95% CIs, SAP consistency |
| Statistics that do not match their numbers | Code recomputes p from APA-style reports (t/F/χ²/r/z + df) and flags inconsistencies and flipped significance decisions (statcheck idea, independent implementation) |
| Overclaiming | Adversarial challenger + defense examiner (6/8/10 "reject-level" questions; honest "cannot answer" is recorded, not hidden) |
| Secondhand citations posing as primary | Primary-source tracing: claims sourced from an original study cited via a review are traced back and replaced |
| Stuck revision loops | Stall detection: reviewers report how many prior major issues persist; when all persist, a root-cause diagnostician steps in (Magentic-One style) |
| Irreproducible analysis | Fixed random seeds, one-command rerun, optional deterministic gate |
| Overstated polish | Final report must carry a "not covered / to-verify" list; tool-positioning disclaimer ships with every deliverable |

Citation selection ranks by **relevance, evidence level, and methodological quality — never by journal prestige or citation counts** (avoiding citation bias).

D39: wording and qualifier warnings are corrected and re-checked without discarding correctable negative evidence. Statistical checks support Markdown/CI and disclose zero matches and unresolved identifiers. Design-stage power scripts ship with the frozen SAP; unknown PDF licences and download failure reasons remain explicit. Disclose recent minor notes without verified closure; figure revisions without another visual check are not accepted, and delivery status reflects failed gates.

Targeted citation rechecks preserve the complete ledger by stable claim keys. `plab manifest` verifies frozen hashes and artifact counts; current snapshot checks and independent reruns are reported separately.

D41 gives all correctable round-2 failures a final targeted correction/recheck, including new errors on the same paper. Source snapshots track analysis/SAP scripts and lockfiles; prior reproducibility records cannot certify a changed final version. Figure roles write only to presentation directories, and revisions receive one further independent visual check. Original-analysis bugs require formal rerun/refreeze. Audit packs and summaries distinguish full-text, abstract-only and no-text coverage. Unchanged sources and matching artifact lists do not establish an independent rerun; real regression effects remain unverified.

D42 separates original and newly discovered issues in the final recheck. New issues or invalid rechecks remain pending and denied, without automatic exclusion. Code generates the final evidence table and machine record together. Analysis directories and publication entries are separate; grouped citations follow source identity, and no-text entries cannot authorize new sources. Disclose previously viewed primary-seed results in the SAP and archive old design scripts. Real effects await regression.

D43 matches compound identifiers through verified aliases and leaves ambiguous notes unresolved. Statistical major lists override labels, revised results replace stale summaries, and defense roles share saved full review context. Figure production and review use the same journal target. Real L-A/L1 effects await validation.

D44 exercised analysis-summary correction and bibliography repair requests, but exposed recheck-item shape, initial-label binding and unexecuted original-figure source repairs. D45 accepts flat or wrapped recheck entries under the same key checks, binds embedded/trailing labels and ranges at the initial audit, and requires bounded formal source correction/rerun/refreeze and review; unresolved source defects keep the figure gate from passing. Statistical reviewers must not echo data rows or raw cells; prompts are not technical enforcement. Missing or malformed sourceIssues retain an unconfirmed closure state; they must neither crash the workflow nor count as an empty passing list. The first-draft Writer receives figuresVerified, figureSourceIssues and AnalysisResult.caveats directly. Newly found source errors in the final recheck are also disclosed, and affected figures or results cannot be cited as accepted outputs. Profiles distinguish full wall time, the final segment, the summed intervals from complete run-started/run-settled pairs within one run ID, and gaps between those intervals. Missing, out-of-order or overlapping events do not support inferred active time. Cumulative tokens are still not summed across resumed segments. Real D45 and L1 effects remain unverified.

## Install

```bash
git clone https://github.com/CalebChen941028/provenance-lab.git
cd provenance-lab
bash install.sh     # auto-detects ZCode / Claude Code / Codex / opencode
```

| Harness | Installed | Usage |
|---|---|---|
| ZCode | skill + dynamic workflow (parallel agents, board, hybrid model tiers) + deterministic tool layer | `/provenance-lab <topic>` |
| Claude Code | SKILL.md (+ English guide) + zh/en protocol copies + deterministic tool layer (Agent-tool subagents as roles) | `/provenance-lab <topic>` |
| Codex CLI | `/provenance-lab` prompt; protocol and tool layer in `~/.codex/provenance-lab/` | `/provenance-lab <topic>` |
| opencode | protocol, injector and tool layer in `~/.config/opencode/provenance-lab/`; append the injector to AGENTS.md | "Follow the ProvenanceLab protocol: <topic>" |
| DeepSeek harness / WorkBuddy / others | Put `adapters/universal/system-prompt.en.md` and `core/pipeline.en.md` into your system prompt (optionally attach `tools/plab.py`) | "Follow the ProvenanceLab protocol: <topic>" |

Optional: [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills) (richer scripted search; falls back to direct official APIs when absent — see Appendix A of the protocol for endpoints), [uv](https://docs.astral.sh/uv/) (Python deps). The deterministic tool layer needs only the system `python3`, no packages; set `PLAB_MAILTO` to join the OpenAlex/Crossref polite pools and enable Retraction Watch lookups (no address is sent otherwise).

## Usage

`/provenance-lab problematic smartphone use and sleep quality in adolescents`

1. **Grill-style interview** (one question at a time, recommended answers) — covers intent, causality vs description, data reality (folder picker popups for dataset and your legally-owned private PDF library), target journals, delivery language
2. **Configuration popups** — team tier (hybrid/quality/economy) + review strictness (development/demo/benchmark) + strong/light model pairing (where supported)
3. Automatic execution; deliverables land next to your dataset folder: draft (primary), rebuttal letter, evidence table, SAP, analysis scripts & outputs, PDF library, citation-audit details, audit package

**Standalone modes** (no full run needed): `figure-polish` · `citation-audit` (existing draft) · `review` (peer-review simulation) · `cross-validate` (independent verification of analysis produced elsewhere: re-run their scripts + recompute key statistics + statistical review) · `audit-pack`.

## Repository layout

```
├── LICENSE / NOTICE.md            # Apache-2.0; attribution, copyright boundaries, disclaimers
├── install.sh                     # multi-harness installer (includes the deterministic tool layer)
├── core/pipeline.md · .en.md      # ★ harness-agnostic protocol (Chinese authoritative + English equivalent)
├── tools/plab.py                  # deterministic layer (stdlib only): identifier/retraction resolution, whitelist check, p recomputation, legal OA download, schema
├── adapters/                      # zcode (skill + dynamic workflow) · claude-code · codex · universal
├── evaluation/                    # protocol, L1 seeded set, scoring and per-role token profiling, result summaries
├── ci/                            # workflow type-check, adversarial mock run, cross-carrier sync check
├── examples/                      # psu-sleep-simulation (benchmark run), la-caffeine-test-anxiety (lightweight regression, every deliverable, re-runnable with SHA-256 check)
└── docs/development-log.md        # design & decision log (from D0)
```

Adapter copies of the protocol are kept byte-identical to `core/` by `python3 ci/check_sync.py`; core is the single source.

## Quota resilience & auto-resume

Subscription-plan model quotas (e.g., 5-hour window caps) can interrupt long pipelines. ProvenanceLab's answer:

- **Transient rate limits**: the runtime retries with backoff automatically
- **Deterministic quota stops (with reset time)**: the skill schedules a one-shot automation at the reset time to **auto-resume the run** (finished steps replay at zero cost), or immediately switches the heavy tier to an alternate provider with an independent quota pool
- **Heavy users**: point the heavy tier at a pay-as-you-go (direct API) provider — it only interrupts on insufficient balance
- **Note**: no advance warning exists — quota errors (1308) only fire at exhaustion, and the window is account-shared, so remaining quota cannot be estimated by the agent

## Ethics & compliance

- Input data must be **de-identified**; all analysis runs locally under a code-to-data rule (raw rows never enter model context); nothing is collected or transmitted by this project
- Outputs are research assistance, **not clinical advice**; all citations and statistics require human verification before submission
- AI-assisted writing is disclosed per ICMJE/journal policy — a disclosure draft is auto-generated on the title page
- Reporting guidelines (CONSORT/STROBE/PRISMA…) are referenced by name only; their copyrighted checklists are never bundled (see NOTICE)
- No scraping of Google Scholar; subscription databases only with your institutional credentials

## Evaluation (how it is measured)

The slogan demands every claim stands scrutiny — the evaluation system itself included:

- **L0 telemetry**: code writes `99-metrics.json` on every run (gate pass rates, revision rounds, audit stats, deterministic-layer results) for cross-run baselines; optimizations must not degrade the metrics; `evaluation/run_profile.py` prints per-role token comparisons
- **L1 seeded-error suite**: `evaluation/` ships 11 citations (9 seeded errors: fabricated / retracted / overstated / misattributed / secondhand / wrong-context; 1 corrected publication; 1 clean control), every identifier and status verified against PubMed/Crossref/OpenAlex, with expected verdicts — scored deterministically by `evaluation/score_l1.py` (sensitivity/specificity, mean and range over runs); protocol in [evaluation/PROTOCOL.md](evaluation/PROTOCOL.md)
- **Offline pre-checks & CI**: tool-layer unit tests, workflow type-check, an adversarial mock run (scripted agents + real tools: a checker that misses bad papers, a crashing search source, a non-whitelisted citation and an inconsistent p-value must all be caught by code gates; missing tools must degrade gracefully), and the cross-carrier sync check — run on every push by GitHub Actions at zero token cost

## Roadmap

- **v1.1 Neuroimaging (EEG / fNIRS)**: preprocessing + ERP/spectral + cluster-level correction (EEG); probe geometry / MBLL / GLM (fNIRS) — quality assured by domain gates: modality SAP templates freezing methodological decisions, domain-specific statistical reviewers, high-dimensional multiple comparisons in the pre-registration
- **v1.2 fMRI**: BIDS, pipeline parameters, FWE/FDR correction

See [docs/development-log.md](docs/development-log.md) (decision D14). The current release supports structured tabular data; neurosignals enter via derived feature tables, with raw-signal support arriving with these modules.

## Attribution

Mechanisms inspired by (no code copied): [AI-Scientist](https://github.com/SakanaAI/AI-Scientist) · [Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory) · [PaperQA2](https://github.com/Future-House/paper-qa) · [STORM](https://github.com/stanford-oval/storm) · [AgentReview](https://github.com/ahren09/agentreview) · [Magentic-One](https://github.com/microsoft/autogen) · [claude-flow](https://github.com/ruvnet/ruflo) · [grill-me](https://github.com/mattpocock/skills). Full attribution and legal boundaries in [NOTICE.md](NOTICE.md).

## License

[Apache-2.0](LICENSE) © 2026 provenance-lab contributors


**D46 file and identifier boundaries**: A trailing `〔source note〕` is metadata, not part of a DOI. The tool and workflow use the same boundary and still require canonical identifiers or verified aliases; titles and source labels never authorize a reference, and deny/retraction gates remain. Validate a reported file path first, preserving real filenames with parentheses. Separate a parenthetical note only when it follows the expected path and that exact expected file exists; record the normalization. Reject other missing paths early without guessing or creating replacement files. Validate SAP paths before analysis and whitelist reads, every revised draft path after its response, and publication paths before use. Fresh citation-audit responses require bibliography; legacy omissions remain unknown and never become match by default. Include verified PMID/DOI identifiers in references, including registered SAP methods; keep unavailable identifiers unconfirmed rather than inventing them or bypassing status checks. Count first-round wording repairs when the second check explicitly passes; ambiguity or pending state cannot count as correction merely because an opinion was omitted. Run/event endpoints may differ by at most one second from persistence timing; larger gaps remain disclosed, and cumulative tokens are never summed. Interpolate the actual unknown-license count. Record host Amend argument/cache failures without hardcoding a study into the generic workflow. Some D45 mechanisms were verified in the real run, but the run failed acceptance; real D46 and three L1 runs remain unverified.


**D48 claim-relative source tracing**: primary means the direct source of the current claim, including a review or meta-analysis's own pooled result, method or new analysis. Do not flag these solely because of publication type. A review relaying an original study, or a review misrepresented as an original cohort/trial, still requires secondary-needs-tracing and correction. Check structured fields against the disposition note; a retain suggestion cannot automatically clear problems. Keep the existing citation gates; real adherence to the new prompt remains unverified. Keep seeded-case answers and historical scores out of execution instructions; evaluation results belong in evaluation records.


**D49 review inputs and correction counts**: Before each statistical review, code saves the original SAP/AnalysisResult to tool-records/statistical-review-input-N.json. Statistical repairs and figure-source repairs create a new round without overwriting earlier inputs. Compare the current JSON directly with frozen outputs; never retype an array and treat that reconstruction as the submitted result. A failed input archive remains unconfirmed. In the second citation check, passedIds can explicitly clear individual first-round repairs even while other entries still fail. Omission from failedIds is not a pass; missing, duplicate, conflicting, ambiguous or pending identities cannot count. Count statistical review rounds from the actual history, including the initial review and every rereview. Hard failures, the bounded final recheck and scientific integrity rules remain. Preflight checks do not establish real model adherence.


**D50 bounded archiving and tool exceptions**: OA fetching keeps its 900-second soft budget for starting new downloads. The outer ZCode call explicitly allows 1200 seconds for resolution and in-flight request cleanup instead of the 300-second default. A thrown timeout or other deterministic-tool exception remains failed and unconfirmed; preserve existing files, fall back, and continue the audit package and metrics without claiming tool success. Archive fallback first inventories partial PDFs and checks identity/file type; never clear or overwrite them or infer completion from counts. Disclose unknown provenance and licenses. Scientific gates and lawful-access rules remain unchanged. Virtual-time and exception preflight tests do not establish real host-timeout behavior.

**D51 analysis handoff records**: Code saves the post-review AnalysisResult snapshot. Writing, audit and summary roles read machine records without editing them; corrections belong in their own documents and cannot impersonate an upstream return or independent review. Before the audit package and final delivery, compare parsed JSON content against the snapshot. Record changed, missing or invalid content as a failed check, and execution failures as unconfirmed; preserve the files without silently restoring them. Whitespace and key order alone do not constitute a content change. This check does not replace analysis reruns, scientific judgment or host isolation.

**D52 compound identifier delimiters**: ASCII and fullwidth pipes (`|`, `｜`) separate a DOI from supplemental identifiers and are not part of the DOI. Tools and orchestration use the same boundary. Resolve the DOI itself without treating adjacent text as a verified alias, restoring removed evidence, or clearing pending unapproved ID changes. Whitelist, deny, retraction and genuine not-found rules remain unchanged. Every role receives explicit code-to-data instructions, including for simulated data: use schema for structure checks and never return raw CSV or DataFrame rows through head/cat/tail/grep/sed or tool output. This prompt contract is not host isolation; observed row disclosure remains a violation.

#!/usr/bin/env python3
"""Score L1 seeded-error runs deterministically against expected.json.

Input: one or more 05a-citation-audit.json files written by the citation-audit mode
(entries + the deterministic layer's records). Entries are matched to cases by their
S-label (e.g. "[S4]") in the citation field; an unmatched problem case counts as missed.

    python3 evaluation/score_l1.py run1/05a-citation-audit.json [run2 ... run3]
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
EXPECTED = os.path.join(HERE, "citation-error-cases", "expected.json")
PROBLEM_FIELDS = ("isPrimary", "accuracy", "necessity", "retractionStatus")


def flagged(e: dict) -> bool:
    return (
        e.get("isPrimary") != "primary"
        or e.get("accuracy") != "supported"
        or e.get("necessity") != "necessary"
        or e.get("retractionStatus") in ("retracted", "concern")
    )


def label_of(e: dict) -> str | None:
    m = re.search(r"\bS(\d{1,2})\b", e.get("citation", ""))
    return f"S{int(m.group(1))}" if m else None


def score(run: dict, cases: list[dict]) -> dict:
    by_label: dict[str, dict] = {}
    for e in run.get("entries", []):
        lab = label_of(e)
        if lab and lab not in by_label:
            by_label[lab] = e
    rows, hits, problems, clean_ok, non_problem = [], 0, 0, 0, 0
    for c in cases:
        e = by_label.get(c["id"])
        is_problem = c["error_type"] not in ("clean_control", "corrected_publication")
        if is_problem:
            problems += 1
            ok = e is not None and flagged(e) and all(e.get(k) == v for k, v in c["expected"].items())
            hits += ok
        else:
            non_problem += 1
            ok = e is not None and not flagged(e) and all(e.get(k) == v for k, v in c["expected"].items() if k in PROBLEM_FIELDS)
            clean_ok += ok
        rows.append({
            "case": c["id"], "type": c["error_type"], "pass": ok, "matched": e is not None,
            "got": {k: e.get(k) for k in (*PROBLEM_FIELDS, "textLevel")} if e else None, "expected": c["expected"],
        })
    det = run.get("deterministic") or []
    det_by_id = {r.get("id"): r for r in det}
    det_checks = {
        "S1 PMID:99999999 not found": det_by_id.get("PMID:99999999", {}).get("found") is False,
        "S2 fabricated DOI not found": det_by_id.get("DOI:10.1093/fake/journal-2099", {}).get("found") is False,
        "S3 PMID:9500320 retracted": det_by_id.get("PMID:9500320", {}).get("status") == "retracted",
        "S4 nature12968 retracted": det_by_id.get("DOI:10.1038/nature12968", {}).get("status") == "retracted",
        "S10 PMID:40328832 corrected": det_by_id.get("PMID:40328832", {}).get("status") == "corrected",
    } if det else {}
    return {
        "sensitivity": hits / problems if problems else None,
        "specificity": clean_ok / non_problem if non_problem else None,
        "hits": hits, "problems": problems, "cleanOk": clean_ok, "nonProblem": non_problem,
        "deterministic": det_checks, "rows": rows,
    }


def main(paths: list[str]) -> int:
    if not paths:
        print(__doc__)
        return 2
    with open(EXPECTED, encoding="utf-8") as f:
        cases = json.load(f)["cases"]
    results = []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            r = score(json.load(f), cases)
        results.append(r)
        print(f"## {p}\n")
        print(f"敏感度 {r['hits']}/{r['problems']}　特异度 {r['cleanOk']}/{r['nonProblem']}\n")
        print("| 案例 | 类型 | 通过 | 判定 | textLevel |")
        print("|---|---|---|---|---|")
        for row in r["rows"]:
            got = row["got"]
            verdict = "未匹配" if not got else "/".join(str(got[k]) for k in PROBLEM_FIELDS)
            print(f"| {row['case']} | {row['type']} | {'✅' if row['pass'] else '❌'} | {verdict} | {got['textLevel'] if got else '-'} |")
        if r["deterministic"]:
            print("\n确定性层：" + "；".join(f"{k} {'✅' if v else '❌'}" for k, v in r["deterministic"].items()))
        print()
    if len(results) > 1:
        sens = [r["sensitivity"] for r in results]
        spec = [r["specificity"] for r in results]
        print(f"## {len(results)} 次运行汇总\n")
        print(f"敏感度 均值 {sum(sens) / len(sens):.3f}（范围 {min(sens):.3f}–{max(sens):.3f}）")
        print(f"特异度 均值 {sum(spec) / len(spec):.3f}（范围 {min(spec):.3f}–{max(spec):.3f}）")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

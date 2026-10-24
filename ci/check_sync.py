#!/usr/bin/env python3
"""Mechanical check of the cross-carrier sync discipline (D23).

1. Protocol and companion-skill copies are byte-identical to their source.
2. Key anchors (stages, modes, fields, tool subcommands) appear in both the Chinese
   and the English protocol, and every workflow mode is documented.
3. "§0 第 N 条" / "§0 rule N" cross-references point at an existing rule, and a reference
   made in a voice/tooling context lands on the voice/tooling rule.
4. Relative Markdown links resolve to files in the repository.

Exit 1 with a list of problems; exit 0 when everything is in sync.
"""
from __future__ import annotations

import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
problems: list[str] = []


def read(rel: str) -> str:
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


COPIES = {
    "core/pipeline.md": ["adapters/claude-code/provenance-lab/pipeline.md", "adapters/zcode/skills/provenance-lab/pipeline.md"],
    "core/pipeline.en.md": ["adapters/claude-code/provenance-lab/pipeline.en.md"],
    "adapters/zcode/skills/natural-voice/SKILL.md": ["adapters/claude-code/natural-voice/SKILL.md"],
}
for src, copies in COPIES.items():
    for c in copies:
        if read(src) != read(c):
            problems.append(f"副本不一致：{c} ≠ {src}（运行 cp {src} {c}）")

zh, en = read("core/pipeline.md"), read("core/pipeline.en.md")
ANCHORS = [
    "S1", "S2", "S3", "S4", "S4.5", "S5", "S6", "S7", "S7.5", "S7.6", "S8",
    "other-health", "inclusionPrefs", "figure-polish", "citation-audit", "cross-validate", "audit-pack",
    "is_retracted", "Retraction Watch", "plab", "resolve", "whitelist", "statcheck", "oa-fetch", "schema",
]
for a in ANCHORS:
    for name, text in (("core/pipeline.md", zh), ("core/pipeline.en.md", en)):
        if a not in text:
            problems.append(f"锚点缺失：{name} 不含「{a}」")

wf = read("adapters/zcode/workflows/provenance-lab.dwf.ts")
m = re.search(r"mode:\n\s+type: string\n\s+description: ([^\n]+(?:\n\s{6}[^\n]+)*)", wf)
modes = [x.strip() for x in re.split(r"[/\s]+", m.group(1)) if x.strip()] if m else []
if not modes:
    problems.append("工作流头部未找到 mode 参数说明")
for mode in modes:
    if mode != "pipeline" and (mode not in zh or mode not in en):
        problems.append(f"工作流模式 {mode} 未写进中英协议")
for field in ("clinical", "epidemiology", "psychology", "other-health"):
    if field not in wf:
        problems.append(f"工作流缺少 field 取值 {field}")


def rules(text: str) -> dict[int, str]:
    sec = text.split("\n## 1.", 1)[0]
    return {int(n): line for n, line in re.findall(r"^(\d+)\. (.+)$", sec, re.M)}


zh_rules, en_rules = rules(zh), rules(en)
CONTEXT = {"语态": "语态", "natural-voice": "语态", "确定性工具": "确定性工具", "tools/plab": "确定性工具"}
EN_CONTEXT = {"voice": "Voice", "tool layer": "Deterministic tool", "plab": "Deterministic tool"}
for dirpath, _, files in os.walk(ROOT):
    if any(part in dirpath for part in (".git", "node_modules", "examples")):
        continue
    for fn in files:
        if not fn.endswith((".md", ".ts")):
            continue
        rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
        text = read(rel)
        for mm in re.finditer(r"§0 第 ?(\d+) ?条", text):
            n = int(mm.group(1))
            ctx = text[max(0, mm.start() - 60) : mm.end() + 30]
            if n not in zh_rules:
                problems.append(f"{rel}: §0 第 {n} 条不存在")
                continue
            for key, want in CONTEXT.items():
                if key in ctx and want not in zh_rules[n]:
                    problems.append(f"{rel}: 「{ctx.strip()[:40]}…」引用 §0 第 {n} 条，但该条不是{want}规则")
                    break
        for mm in re.finditer(r"§0 rule (\d+)", text):
            n = int(mm.group(1))
            ctx = text[max(0, mm.start() - 80) : mm.end() + 30].lower()
            if n not in en_rules:
                problems.append(f"{rel}: §0 rule {n} does not exist")
                continue
            for key, want in EN_CONTEXT.items():
                if key in ctx and want not in en_rules[n]:
                    problems.append(f"{rel}: reference to §0 rule {n} in a '{key}' context, but that rule is not the {want} rule")
                    break
        if fn.endswith(".md"):
            for link in re.findall(r"\]\(([^)\s]+)\)", text):
                if re.match(r"^(https?:|mailto:|#)", link):
                    continue
                target = os.path.normpath(os.path.join(dirpath, link.split("#", 1)[0]))
                if not os.path.exists(target):
                    problems.append(f"{rel}: 断链 {link}")

if problems:
    print("\n".join(problems))
    print(f"\n{len(problems)} 处不同步")
    sys.exit(1)
print("sync OK")

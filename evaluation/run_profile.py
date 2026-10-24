#!/usr/bin/env python3
"""Per-role token profile of a ZCode workflow run (regression criterion 2 in PROTOCOL.md).

Reads the local ZCode database read-only; nothing is modified or sent anywhere.

    python3 evaluation/run_profile.py "L-A D32"                 # run name substring or run id
    python3 evaluation/run_profile.py "L-A D33" --baseline "L-A D32"
    python3 evaluation/run_profile.py --list                    # recent runs
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys

DB = os.path.expanduser("~/.zcode/cli/db/db.sqlite")


def connect(path: str) -> sqlite3.Connection:
    if not os.path.exists(path):
        sys.exit(f"ZCode 数据库不存在：{path}")
    return sqlite3.connect(f"file:{path}?mode=ro", uri=True)


def find_run(con: sqlite3.Connection, key: str) -> tuple:
    row = con.execute(
        "select id, name, status, spent_tokens, time_created, time_updated from dwf_run where id = ? or name like ? order by time_created desc limit 1",
        (key, f"%{key}%"),
    ).fetchone()
    if not row:
        sys.exit(f"找不到运行：{key}")
    return row


def profile(con: sqlite3.Connection, run_id: str) -> dict[str, dict]:
    rows = con.execute(
        """select a.name, n.stats_json from dwf_node n
           join dwf_actor a on a.run_id = n.run_id and a.site_id = n.actor_site_id and a.ordinal = n.actor_ordinal
           where n.run_id = ? and n.kind = 'ask'""",
        (run_id,),
    ).fetchall()
    out: dict[str, dict] = {}
    for name, stats in rows:
        s = json.loads(stats or "{}")
        r = out.setdefault(name, {"asks": 0, "tokens": 0, "toolCalls": 0})
        r["asks"] += 1
        r["tokens"] += int(s.get("tokens") or 0)
        r["toolCalls"] += int(s.get("toolCalls") or 0)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("run", nargs="?")
    ap.add_argument("--baseline")
    ap.add_argument("--db", default=DB)
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    con = connect(a.db)
    if a.list or not a.run:
        for rid, name, status, tok, t0, t1 in con.execute(
            "select id, name, status, spent_tokens, time_created, time_updated from dwf_run order by time_created desc limit 20"
        ):
            print(f"{rid}  {status:<10} {tok / 1e6:7.2f}M  {(t1 - t0) / 60000:6.1f} min  {name}")
        return 0
    run = find_run(con, a.run)
    cur = profile(con, run[0])
    base_run = find_run(con, a.baseline) if a.baseline else None
    base = profile(con, base_run[0]) if base_run else {}
    print(f"# {run[1]}（{run[0]}）\n")
    print(f"总量 {run[3] / 1e6:.2f}M tokens / {(run[5] - run[4]) / 60000:.0f} 分钟 / 状态 {run[2]}")
    if base_run:
        print(f"基线 {base_run[1]}：{base_run[3] / 1e6:.2f}M tokens / {(base_run[5] - base_run[4]) / 60000:.0f} 分钟（总量变化 {100 * (run[3] - base_run[3]) / base_run[3]:+.1f}%）")
    print()
    head = "| 角色 | ask 次数 | tokens | 工具调用 |" + (" 基线 tokens | 变化 |" if base else "")
    print(head)
    print("|" + "---|" * (head.count("|") - 1))
    for name in sorted(set(cur) | set(base), key=lambda n: -cur.get(n, {"tokens": 0})["tokens"]):
        c = cur.get(name, {"asks": 0, "tokens": 0, "toolCalls": 0})
        line = f"| {name} | {c['asks']} | {c['tokens'] / 1e6:.2f}M | {c['toolCalls']} |"
        if base:
            b = base.get(name, {"tokens": 0})["tokens"]
            delta = f"{100 * (c['tokens'] - b) / b:+.0f}%" if b else "新增"
            line += f" {b / 1e6:.2f}M | {delta} |"
        print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())

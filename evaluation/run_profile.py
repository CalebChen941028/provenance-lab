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


def event_segments(con: sqlite3.Connection, run: tuple) -> tuple[list[tuple], str | None]:
    """Pair complete events; allow <=1s persistence skew at run boundaries."""
    try:
        rows = con.execute(
            "select type, time_created from dwf_event where run_id = ? "
            "and type in ('run-started', 'run-settled') order by sequence",
            (run[0],),
        ).fetchall()
    except sqlite3.OperationalError:
        return [], f"{run[0]}：起止事件表不可用"
    if not rows or len(rows) % 2 or abs(rows[0][1] - run[4]) > 1000 or abs(rows[-1][1] - run[5]) > 1000:
        return [], f"{run[0]}：起止事件不足以覆盖完整运行"
    segments = []
    for index in range(0, len(rows), 2):
        begin, end = rows[index:index + 2]
        if (begin[0] != "run-started" or end[0] != "run-settled"
                or begin[1] > end[1] or (segments and begin[1] < segments[-1][1])):
            return [], f"{run[0]}：起止事件不成对或时序冲突"
        segments.append((begin[1], end[1]))
    return segments, None


def run_span(con: sqlite3.Connection, run: tuple) -> dict:
    """Trace cached resumes without summing their cumulative token counters.

    An incomplete chain gives only the wall-clock lower bound visible in this
    database. Actor/node profiling intentionally remains scoped to the last run.
    """
    start = run[4]
    current = run[0]
    seen = {current}
    resumes = 0
    issues = []
    chain = [run]
    while True:
        row = con.execute("select resumed_from from dwf_run where id = ?", (current,)).fetchone()
        if not row:
            issues.append(f"缺少运行记录 {current}")
            break
        parent = row[0]
        if not parent:
            break
        if parent in seen:
            issues.append(f"续接链存在循环：{parent}")
            break
        parent_row = con.execute(
            "select id, name, status, spent_tokens, time_created, time_updated from dwf_run where id = ?",
            (parent,),
        ).fetchone()
        if not parent_row:
            issues.append(f"缺少父运行 {parent}")
            break
        start = min(start, parent_row[4])
        chain.append(parent_row)
        seen.add(parent)
        current = parent
        resumes += 1
    event_issues = []
    all_segments = []
    last_segments = []
    same_run_resumes = 0
    for item in chain:
        segments, issue = event_segments(con, item)
        if issue:
            event_issues.append(issue)
        else:
            all_segments.extend(segments)
            same_run_resumes += len(segments) - 1
        if item[0] == run[0]:
            last_segments = segments
    all_segments.sort()
    if any(later[0] < earlier[1] for earlier, later in zip(all_segments, all_segments[1:])):
        event_issues.append("续接链的活动段重叠，不能相加")
    complete_events = not issues and not event_issues
    active = sum(end - begin for begin, end in all_segments) / 60000 if complete_events else None
    minutes = (run[5] - start) / 60000
    return {"minutes": minutes,
            "lastMinutes": ((last_segments[-1][1] - last_segments[-1][0]) / 60000
                            if last_segments else (run[5] - run[4]) / 60000),
            "resumes": resumes, "issues": issues,
            "sameRunResumes": same_run_resumes,
            "lastSource": "events" if last_segments else "run-fields",
            "activeMinutes": active,
            "pausedMinutes": minutes - active if active is not None else None,
            "eventIssues": event_issues}


def span_text(span: dict) -> str:
    label = "可追溯墙钟下界" if span["issues"] else "全程墙钟"
    text = f"{label} {span['minutes']:.2f} 分钟 / 末段 {span['lastMinutes']:.2f} 分钟"
    if span["lastSource"] == "run-fields":
        text += "（按运行字段估算，同ID续跑未确认）"
    text += f" / 已追溯续接 {span['resumes']} 次 / 同ID续接 {span['sameRunResumes']} 次（完整事件范围）"
    if span["activeMinutes"] is not None:
        text += f" / 事件段合计 {span['activeMinutes']:.2f} 分钟 / 段间隔 {span['pausedMinutes']:.2f} 分钟"
    else:
        text += " / 事件段合计与间隔未确认"
    if span["eventIssues"]:
        text += f"；{'；'.join(span['eventIssues'])}"
    return text


def print_attribution(run: tuple, roles: dict[str, dict], label: str = "") -> None:
    attributed = sum(role["tokens"] for role in roles.values())
    difference = run[3] - attributed
    if difference > 0:
        print(f"{label}末次运行 ask 节点可归属 {attributed:,} tokens；累计总量中另有 {difference:,} tokens 未能按当前节点归属，不推断角色。")
    elif difference < 0:
        print(f"{label}末次运行 ask 节点归属 {attributed:,} tokens，超过累计总量 {-difference:,} tokens；两种记录不一致。")


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
            span = run_span(con, (rid, name, status, tok, t0, t1))
            boundary = f"；{'；'.join(span['issues'])}" if span["issues"] else ""
            print(f"{rid}  {status:<10} {tok / 1e6:7.2f}M  {span_text(span)}  {name}{boundary}")
        return 0
    run = find_run(con, a.run)
    cur = profile(con, run[0])
    base_run = find_run(con, a.baseline) if a.baseline else None
    base = profile(con, base_run[0]) if base_run else {}
    span = run_span(con, run)
    print(f"# {run[1]}（{run[0]}）\n")
    print(f"总量 {run[3] / 1e6:.2f}M tokens / {span_text(span)} / 状态 {run[2]}")
    print("累计 tokens 取末次运行记录，不按续接链相加；角色表只统计末次运行节点。")
    for issue in span["issues"]:
        print(f"运行链边界：{issue}；无法确认完整起点。")
    print_attribution(run, cur)
    if base_run:
        base_span = run_span(con, base_run)
        delta = f"{100 * (run[3] - base_run[3]) / base_run[3]:+.1f}%" if base_run[3] else "基线为0，无法计算"
        print(f"基线 {base_run[1]}：{base_run[3] / 1e6:.2f}M tokens / {span_text(base_span)}（总量变化 {delta}）")
        for issue in base_span["issues"]:
            print(f"基线运行链边界：{issue}；无法确认完整起点。")
        print_attribution(base_run, base, "基线")
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

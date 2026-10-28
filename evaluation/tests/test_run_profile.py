"""Offline coverage of cached-run wall clocks and cumulative-token accounting."""
from __future__ import annotations

import contextlib
import io
import os
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_profile


class RunProfile(unittest.TestCase):
    def setUp(self):
        self.con = sqlite3.connect(":memory:")
        self.con.executescript("""
            create table dwf_run (id text primary key, name text, status text,
                spent_tokens integer, time_created integer, time_updated integer, resumed_from text);
            create table dwf_actor (run_id text, site_id text, ordinal integer, name text);
            create table dwf_node (run_id text, actor_site_id text, actor_ordinal integer,
                kind text, stats_json text);
        """)
        self.addCleanup(self.con.close)

    def add_run(self, rid, start, end, tokens=100000, parent=None):
        self.con.execute("insert into dwf_run values (?, ?, 'completed', ?, ?, ?, ?)",
                         (rid, rid, tokens, start * 60000, end * 60000, parent))
        return run_profile.find_run(self.con, rid)

    def add_events(self, rid, events):
        self.con.execute("""create table if not exists dwf_event
            (run_id text, sequence integer, type text, time_created integer)""")
        self.con.executemany("insert into dwf_event values (?, ?, ?, ?)",
                             [(rid, i, kind, minute * 60000)
                              for i, (kind, minute) in enumerate(events)])

    def test_single_run_and_find_run_tuple_contract(self):
        run = self.add_run("single", 10, 40)
        self.assertIsInstance(run, tuple)
        self.assertEqual(len(run), 6)
        span = run_profile.run_span(self.con, run)
        self.assertEqual({k: span[k] for k in ("minutes", "lastMinutes", "resumes", "issues")},
                         {"minutes": 30, "lastMinutes": 30, "resumes": 0, "issues": []})
        self.assertIsNone(span["activeMinutes"])
        self.assertEqual(span["lastSource"], "run-fields")

    def test_resumed_chain_uses_first_start_and_last_end(self):
        self.add_run("first", 10, 20, 100000)
        self.add_run("middle", 25, 40, 200000, "first")
        run = self.add_run("last", 45, 60, 300000, "middle")
        span = run_profile.run_span(self.con, run)
        self.assertEqual({k: span[k] for k in ("minutes", "lastMinutes", "resumes", "issues")},
                         {"minutes": 50, "lastMinutes": 15, "resumes": 2, "issues": []})
        self.assertEqual(run[3], 300000)  # The counters are cumulative, not 600000.

    def test_same_run_stop_resume_uses_last_segment_and_excludes_pause(self):
        run = self.add_run("same-id", 10, 70, 300000)
        self.add_events("same-id", [("run-started", 10), ("run-settled", 30),
                                    ("run-started", 45), ("run-settled", 70)])
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["lastMinutes"], span["activeMinutes"], span["pausedMinutes"]),
                         (60, 25, 45, 15))
        self.assertEqual((span["resumes"], span["sameRunResumes"], span["lastSource"]), (0, 1, "events"))
        self.assertEqual(span["eventIssues"], [])
        text = run_profile.span_text(span)
        self.assertIn("末段 25.00 分钟", text)
        self.assertIn("事件段合计 45.00 分钟 / 段间隔 15.00 分钟", text)
        self.assertEqual(run[3], 300000)

    def test_event_persistence_millisecond_skew_is_not_a_missing_history(self):
        run = self.add_run("skew", 10, 40)
        self.add_events("skew", [("run-started", 10), ("run-settled", 40)])
        self.con.execute("update dwf_event set time_created=time_created+1")
        span = run_profile.run_span(self.con, run)
        self.assertEqual(span["lastSource"], "events")
        self.assertEqual(span["activeMinutes"], 30)
        self.con.execute("update dwf_event set time_created=time_created+2000")
        span = run_profile.run_span(self.con, run)
        self.assertIsNone(span["activeMinutes"])
        self.assertEqual(span["lastSource"], "run-fields")

    def test_event_segments_cover_cached_chain_without_double_counting(self):
        self.add_run("first", 10, 30, 100000)
        run = self.add_run("last", 45, 70, 300000, "first")
        self.add_events("first", [("run-started", 10), ("run-settled", 20),
                                  ("run-started", 25), ("run-settled", 30)])
        self.add_events("last", [("run-started", 45), ("run-settled", 70)])
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["lastMinutes"], span["activeMinutes"], span["pausedMinutes"]),
                         (60, 25, 40, 20))
        self.assertEqual((span["resumes"], span["sameRunResumes"]), (1, 1))
        self.assertEqual(span["issues"], [])
        self.assertEqual(span["eventIssues"], [])

    def test_missing_event_table_keeps_fields_and_discloses_unknown_activity(self):
        run = self.add_run("legacy", 10, 70)
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["lastMinutes"]), (60, 60))
        self.assertIsNone(span["activeMinutes"])
        self.assertIsNone(span["pausedMinutes"])
        self.assertEqual(span["issues"], [])  # Complete run chain, unlike missing event history.
        self.assertIn("起止事件表不可用", span["eventIssues"][0])
        self.assertIn("按运行字段估算", run_profile.span_text(span))
        self.assertIn("事件段合计与间隔未确认", run_profile.span_text(span))

    def test_partial_event_history_does_not_invent_activity_or_last_segment(self):
        run = self.add_run("partial", 10, 70)
        self.add_events("partial", [("run-started", 45), ("run-settled", 70)])
        span = run_profile.run_span(self.con, run)
        self.assertEqual(span["lastMinutes"], 60)
        self.assertEqual(span["lastSource"], "run-fields")
        self.assertIsNone(span["activeMinutes"])
        self.assertIn("不足以覆盖完整运行", span["eventIssues"][0])

    def test_invalid_event_order_and_missing_settle_fail_closed(self):
        run = self.add_run("bad", 10, 70)
        for events in [[("run-started", 10), ("run-started", 20),
                        ("run-settled", 60), ("run-settled", 70)],
                       [("run-started", 10), ("run-settled", 30), ("run-started", 45)]]:
            self.add_events("bad", events)
            span = run_profile.run_span(self.con, run)
            self.assertEqual(span["lastMinutes"], 60)
            self.assertIsNone(span["activeMinutes"])
            self.assertTrue(span["eventIssues"])
            self.con.execute("delete from dwf_event")

    def test_overlapping_cached_segments_do_not_report_aggregate_activity(self):
        self.add_run("first", 10, 50)
        run = self.add_run("last", 45, 70, parent="first")
        self.add_events("first", [("run-started", 10), ("run-settled", 50)])
        self.add_events("last", [("run-started", 45), ("run-settled", 70)])
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["lastMinutes"]), (60, 25))
        self.assertIsNone(span["activeMinutes"])
        self.assertIn("活动段重叠", span["eventIssues"][0])

    def test_missing_parent_exposes_lower_bound(self):
        run = self.add_run("last", 45, 60, parent="missing")
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["resumes"]), (15, 0))
        self.assertEqual(span["issues"], ["缺少父运行 missing"])
        self.assertIn("下界", run_profile.span_text(span))

    def test_cycle_stops_and_exposes_lower_bound(self):
        self.add_run("first", 10, 20, parent="last")
        run = self.add_run("last", 45, 60, parent="first")
        span = run_profile.run_span(self.con, run)
        self.assertEqual((span["minutes"], span["resumes"]), (50, 1))
        self.assertEqual(span["issues"], ["续接链存在循环：last"])
        self.assertIn("下界", run_profile.span_text(span))

    def test_cli_uses_chain_for_baseline_and_discloses_unattributed_tokens(self):
        self.add_run("first", 10, 20, 100000)
        self.add_run("last", 45, 60, 300000, "first")
        self.add_run("base-first", 0, 5, 50000)
        self.add_run("base-last", 10, 20, 150000, "base-first")
        self.con.execute("insert into dwf_actor values ('last', 'writer', 1, 'Writer')")
        self.con.execute("insert into dwf_node values ('last', 'writer', 1, 'ask', ?)",
                         ('{"tokens": 250000, "toolCalls": 1}',))
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "db.sqlite")
            disk = sqlite3.connect(path)
            self.con.commit()
            self.con.backup(disk)
            disk.close()
            with patch.object(sys, "argv", ["run_profile.py", "last", "--baseline", "base-last", "--db", path]):
                with contextlib.redirect_stdout(io.StringIO()) as stdout:
                    self.assertEqual(run_profile.main(), 0)
            text = stdout.getvalue()
            self.assertIn("总量 0.30M tokens / 全程墙钟 50.00 分钟 / 末段 15.00 分钟", text)
            self.assertIn("基线 base-last：0.15M tokens / 全程墙钟 20.00 分钟", text)
            self.assertIn("另有 50,000 tokens 未能按当前节点归属", text)
            self.assertIn("不按续接链相加", text)
            self.assertIn("| Writer | 1 | 0.25M | 1 |", text)

    def test_database_connection_remains_read_only(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "db.sqlite")
            disk = sqlite3.connect(path)
            disk.execute("create table example (id text)")
            disk.close()
            con = run_profile.connect(path)
            try:
                with self.assertRaises(sqlite3.OperationalError):
                    con.execute("insert into example values ('must not write')")
            finally:
                con.close()


if __name__ == "__main__":
    unittest.main()

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

    def test_single_run_and_find_run_tuple_contract(self):
        run = self.add_run("single", 10, 40)
        self.assertIsInstance(run, tuple)
        self.assertEqual(len(run), 6)
        self.assertEqual(run_profile.run_span(self.con, run),
                         {"minutes": 30, "lastMinutes": 30, "resumes": 0, "issues": []})

    def test_resumed_chain_uses_first_start_and_last_end(self):
        self.add_run("first", 10, 20, 100000)
        self.add_run("middle", 25, 40, 200000, "first")
        run = self.add_run("last", 45, 60, 300000, "middle")
        self.assertEqual(run_profile.run_span(self.con, run),
                         {"minutes": 50, "lastMinutes": 15, "resumes": 2, "issues": []})
        self.assertEqual(run[3], 300000)  # The counters are cumulative, not 600000.

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

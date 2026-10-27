"""Bibliography errors count as false positives without replacing case dimensions."""
from __future__ import annotations

import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import score_l1


class ScoreL1(unittest.TestCase):
    def setUp(self):
        with open(score_l1.EXPECTED, encoding="utf-8") as f:
            self.cases = json.load(f)["cases"]
        self.entries = []
        for case in self.cases:
            entry = {"citation": "[" + case["id"] + "]", "isPrimary": "primary",
                     "accuracy": "supported", "necessity": "necessary",
                     "retractionStatus": "clean", "textLevel": "abstract"}
            entry.update(case["expected"])
            self.entries.append(entry)

    def result(self):
        return score_l1.score({"entries": self.entries}, self.cases)

    def test_clean_control_bibliography_only_error_reduces_specificity(self):
        self.entries[10]["bibliography"] = "mismatch"
        result = self.result()
        self.assertEqual((result["hits"], result["cleanOk"], result["specificity"]), (9, 1, 0.5))
        self.assertFalse(result["rows"][10]["pass"])
        self.assertEqual(result["rows"][10]["got"]["bibliography"], "mismatch")

    def test_corrected_control_bibliography_only_error_reduces_specificity(self):
        self.entries[9]["bibliography"] = "mismatch"
        result = self.result()
        self.assertEqual((result["hits"], result["cleanOk"], result["specificity"]), (9, 1, 0.5))
        self.assertFalse(result["rows"][9]["pass"])
        self.assertEqual(result["rows"][9]["got"]["retractionStatus"], "corrected")

    def test_old_ledgers_without_bibliography_keep_scores_and_report_unknown(self):
        result = self.result()
        self.assertEqual((result["hits"], result["cleanOk"], result["sensitivity"], result["specificity"]),
                         (9, 2, 1.0, 1.0))
        self.assertTrue(all(row["got"]["bibliography"] == "unknown" for row in result["rows"]))

    def test_bibliography_error_does_not_substitute_for_expected_overstatement(self):
        self.entries[4].update({"accuracy": "supported", "bibliography": "mismatch"})
        self.assertTrue(score_l1.flagged(self.entries[4]))
        result = self.result()
        self.assertEqual((result["hits"], result["problems"]), (8, 9))
        self.assertFalse(result["rows"][4]["pass"])
        self.entries[4]["accuracy"] = "overstated"
        self.assertTrue(self.result()["rows"][4]["pass"])

    def test_cli_verdict_displays_bibliography_with_legacy_default(self):
        self.entries[10]["bibliography"] = "mismatch"
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "audit.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"entries": self.entries}, f)
            with contextlib.redirect_stdout(io.StringIO()) as stdout:
                self.assertEqual(score_l1.main([path]), 0)
            text = stdout.getvalue()
            self.assertIn("primary/supported/necessary/clean/mismatch", text)
            self.assertIn("primary/supported/necessary/corrected/unknown", text)
            self.assertIn("特异度 1/2", text)


if __name__ == "__main__":
    unittest.main()

"""Reproduce the local prototype checks without starting any model."""
from __future__ import annotations

import argparse
import csv
import io
import json
import platform
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from channel import Channel, digest
from test_channel import ChannelTests


def d52_case(evidence):
    data = evidence / "clean-repro/data/sim_caffeine_tai.csv"
    repaired = evidence / "next-step-validation/appendix-repaired/06-appendix-tableS2-cooks-influential.csv"
    old = evidence / "appendix-clean/06-appendix-tableS2-cooks-influential.csv"
    original = Path("/Users/chenliangliang/Desktop/research-runs/L-A-d52-1")
    manifest = json.loads((evidence / "input-manifest.json").read_text())
    changed = [entry["path"] for entry in manifest
               if not Path(entry["path"]).is_file()
               or digest(Path(entry["path"]).read_bytes()) != entry["sha256"]]
    if changed:
        raise ValueError("original fingerprints changed")

    def selected(path):
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["source_row", "x", "y"])
        with path.open(encoding="utf-8-sig", newline="") as stream:
            for row in csv.DictReader(stream):
                writer.writerow([row["CSV行号(1基)"], row["caffeine_mg"], row["tai_total"]])
        return buffer.getvalue().encode()

    config = {"x": "caffeine_mg", "y": "tai_total", "x_round": 1,
              "required": ["tai_total", "caffeine_mg", "sex", "grade", "bmi", "psqi", "stai_t", "pa_met"]}
    with tempfile.TemporaryDirectory(prefix="plab-d52-protected-") as directory:
        channel = Channel(Path(directory) / "channel", data.read_bytes(), selected(repaired), config,
                          source_domains=[evidence, original])
        correct = channel.request({"task": "row_keys", "dataset": "active"})
        if not correct["ok"] or correct["result"]["matching_source_rows"] != 15:
            raise ValueError("repaired row key case failed")
        summary = channel.request({"task": "summary", "dataset": "active"})
        if not summary["ok"] or summary["result"]["n_complete"] != 264:
            raise ValueError("normal summary failed")
        attempts = [channel.private / "data.csv", data,
                    original / "provenance-lab-output/04-analysis/data/sim_caffeine_tai.csv"]
        denials = [channel.reader(["/bin/cat", str(path)]).returncode != 0 for path in attempts]
        if not all(denials):
            raise ValueError("known source read bypass")
        # A trusted harness installs the old wrong keys; this is not a public API.
        wrong = selected(old)
        (channel.private / "selection.csv").write_bytes(wrong)
        channel.input_hashes["selection.csv"] = digest(wrong)
        old_result = channel.request({"task": "row_keys", "dataset": "active"})
        if old_result["ok"]:
            raise ValueError("old wrong keys were accepted")
        # This control is intentionally unsandboxed: same-UID host access remains.
        control = subprocess.run(["/bin/cat", str(channel.private / "data.csv")], capture_output=True)
        source_unchanged = data.read_bytes() == control.stdout and control.returncode == 0
        return {"originalFilesUnchanged": len(manifest), "sourceDataSha256": digest(data.read_bytes()),
                "correctRowMappings": correct["result"]["matching_source_rows"],
                "oldWrongMappingsRejected": not old_result["ok"],
                "normalCompleteCases": summary["result"]["n_complete"],
                "knownSourceReadAttempts": len(denials), "knownSourceReadDenials": sum(denials),
                "unsandboxedHostCanStillRead": source_unchanged}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--d52-evidence", type=Path)
    options = parser.parse_args()
    options.out.mkdir(parents=True, exist_ok=True)
    log = io.StringIO()
    result = unittest.TextTestRunner(stream=log, verbosity=2).run(
        unittest.defaultTestLoader.loadTestsFromTestCase(ChannelTests))
    (options.out / "tests.log").write_text(log.getvalue())
    report = {"scope": "isolated local prototype, not a ZCode deployment",
              "testsRun": result.testsRun, "testsFailed": len(result.failures),
              "testsErrored": len(result.errors), "testsSkipped": len(result.skipped),
              "componentChecksPassed": result.wasSuccessful(), "platform": platform.platform(),
              "python": platform.python_version(), "zcodeLiveIntegrationVerified": False,
              "modelRunsStarted": 0, "zcodeConfigChanged": False,
              "scopeLimit": "Only sandboxed readers and explicitly registered protected domains; "
                            "unsandboxed same-UID sessions retain host access. Approved aggregates "
                            "are intentional releases, not differential privacy."}
    failed = not result.wasSuccessful()
    if options.d52_evidence:
        try:
            report["d52"] = d52_case(options.d52_evidence.resolve())
        except Exception as error:
            report["d52"] = {"passed": False, "errorType": type(error).__name__}
            failed = True
    report["localPrototypePassed"] = not failed
    report["sourceHashes"] = {path.name: digest(path.read_bytes())
                              for path in Path(__file__).parent.glob("*.py")}
    (options.out / "result.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())

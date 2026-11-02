"""Fixed, reviewed jobs. Not an arbitrary Python execution endpoint."""
from __future__ import annotations

import bisect
import csv
import json
import math
import sys
from pathlib import Path


def read_rows(root):
    config = json.loads((root / "dataset.json").read_text())
    with (root / "data.csv").open(newline="", encoding="utf-8-sig") as stream:
        rows = list(csv.DictReader(stream))
    complete = []
    # Attach the source key before any filtering or reordering.
    for source_row, row in enumerate(rows, 1):
        if any(row.get(key, "") in ("", "NA", "NaN", "nan") for key in config["required"]):
            continue
        x, y = float(row[config["x"]]), float(row[config["y"]])
        if not (math.isfinite(x) and math.isfinite(y)):
            raise ValueError("non-finite input")
        complete.append((source_row, x, y))
    return config, rows, complete


def calculate(root, task):
    config, rows, complete = read_rows(root)
    if len(complete) < 5:
        raise ValueError("insufficient complete cases")
    if task == "summary":
        xs = [row[1] for row in complete]
        ys = [row[2] for row in complete]
        mx, my = math.fsum(xs) / len(xs), math.fsum(ys) / len(ys)
        variance = math.fsum((x - mx) ** 2 for x in xs)
        if variance <= 0:
            raise ValueError("constant exposure")
        slope = math.fsum((x - mx) * (y - my) for x, y in zip(xs, ys)) / variance
        bins = [0] * 5
        for x in xs:
            if not 0 <= x <= 1_000_000:
                raise ValueError("exposure outside fixed histogram domain")
            bins[bisect.bisect_right([10, 20, 30, 40], x)] += 1
        return {"n_rows": len(rows), "n_complete": len(complete),
                "mean_x": round(mx, 6), "mean_y": round(my, 6),
                "slope": round(slope, 6), "histogram": bins}
    if task == "row_keys":
        with (root / "selection.csv").open(newline="", encoding="utf-8-sig") as stream:
            selection = list(csv.DictReader(stream))
        # Deliberately reorder after filtering; retained source keys must survive.
        reordered = sorted(complete, key=lambda item: item[1], reverse=True)
        by_key = {row[0]: row for row in reordered}
        seen, matches = set(), 0
        for selected in selection:
            key = int(selected["source_row"])
            if key in seen:
                raise ValueError("duplicate selection key")
            seen.add(key)
            actual = by_key.get(key)
            if actual and (round(actual[1], config["x_round"]) == float(selected["x"])
                           and actual[2] == float(selected["y"])):
                matches += 1
        return {"selected_count": len(selection), "matching_source_rows": matches,
                "all_match": bool(selection) and matches == len(selection)}
    raise ValueError("unregistered task")


if __name__ == "__main__":
    root, task, output = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
    output.write_text(json.dumps(calculate(root, task), allow_nan=False))

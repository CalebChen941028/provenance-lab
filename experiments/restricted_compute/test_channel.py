"""Real processes and OS denials; no model sessions or network calls."""
from __future__ import annotations

import csv
import io
import json
import math
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from unittest import mock
import xml.etree.ElementTree as ET
from fractions import Fraction
from pathlib import Path

from channel import Channel, digest, strict_json


def fixture():
    rows = ["x,y,z"]
    for x in range(1, 41):
        rows.append("%s,%s,%s" % (x, 2 * x + 7, "" if x in (2, 11, 23) else "1"))
    selection = "source_row,x,y\n1,1,9\n12,12,31\n39,39,85\n"
    return ("\n".join(rows) + "\n").encode(), selection.encode()


def create(root):
    data, selection = fixture()
    return Channel(root, data, selection,
                   {"x": "x", "y": "y", "required": ["x", "y", "z"], "x_round": 6})


class ChannelTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="plab-restricted-test-")
        self.addCleanup(self.temp.cleanup)
        self.channel = create(Path(self.temp.name) / "channel")

    def python(self, code):
        return self.channel.reader([sys.executable, "-I", "-B", "-c", code])

    def test_normal_statistics_and_public_figure(self):
        result = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertTrue(result["ok"])
        values = result["result"]
        xs = [Fraction(x) for x in range(1, 41) if x not in (2, 11, 23)]
        self.assertEqual(values["n_rows"], 40)
        self.assertEqual(values["n_complete"], 37)
        self.assertAlmostEqual(values["mean_x"], float(sum(xs) / len(xs)), places=5)
        self.assertAlmostEqual(values["mean_y"], float(2 * sum(xs) / len(xs) + 7), places=5)
        self.assertEqual(values["slope"], 2.0)
        self.assertEqual(values["histogram"], [8, 9, 9, 10, 1])
        artifact = self.channel.public / result["artifact"]["name"]
        self.assertEqual(digest(artifact.read_bytes()), result["artifact"]["sha256"])
        rectangles = ET.parse(artifact).getroot().findall(".//{http://www.w3.org/2000/svg}rect")
        self.assertEqual([int(rect.attrib["height"]) for rect in rectangles], [80, 90, 90, 100, 10])
        self.assertEqual(self.channel.reader(["/bin/cat", str(artifact)]).returncode, 0)

    def test_source_keys_survive_filter_and_sort(self):
        response = self.channel.request({"task": "row_keys", "dataset": "active"})
        self.assertTrue(response["ok"])
        self.assertEqual(response["result"], {"selected_count": 3,
                         "matching_source_rows": 3, "all_match": True})

    def test_wrong_subset_positions_fail_semantic_validation(self):
        self.channel.input_hashes["selection.csv"] = digest(b"source_row,x,y\n11,12,31\n")
        (self.channel.private / "selection.csv").write_bytes(b"source_row,x,y\n11,12,31\n")
        # This trusted test fixture intentionally installs the old wrong key.
        response = self.channel.request({"task": "row_keys", "dataset": "active"})
        self.assertFalse(response["ok"])
        self.assertNotIn("result", response)

    def test_unprotected_control_and_protected_read(self):
        path = self.channel.private / "data.csv"
        unprotected = subprocess.run(["/bin/cat", str(path)], capture_output=True, check=False)
        self.assertEqual(unprotected.returncode, 0)
        self.assertEqual(unprotected.stdout, path.read_bytes())
        for command in (["/bin/cat", str(path)], ["/usr/bin/head", "-3", str(path)]):
            with self.subTest(command=command[0]):
                protected = self.channel.reader(command)
                self.assertNotEqual(protected.returncode, 0)
                self.assertEqual(protected.stdout, b"")

    def test_indirect_subset_cell_encoding_and_stderr(self):
        path = repr(str(self.channel.private / "data.csv"))
        operations = [
            "print(open(%s).readlines()[1])" % path,
            "import csv; print(next(csv.DictReader(open(%s)))['x'])" % path,
            "import base64; print(base64.b64encode(open(%s,'rb').read()))" % path,
            "import sys; sys.stderr.write(open(%s).read())" % path,
            "raise RuntimeError(open(%s).read())" % path,
        ]
        for code in operations:
            with self.subTest(code=operations.index(code)):
                result = self.python(code)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(result.stdout, b"")
                self.assertNotIn(b"1,9,1", result.stderr)

    def test_copy_to_public_and_path_traversal(self):
        destination = self.channel.public / "renamed.txt"
        path = self.channel.public / ".." / "private" / "data.csv"
        result = self.python("import shutil; shutil.copyfile(%r,%r)" % (str(path), str(destination)))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(destination.exists())

    def test_symlink_and_hardlink_aliases(self):
        link = self.channel.public / "alias.txt"
        link.symlink_to(self.channel.private / "data.csv")
        self.assertNotEqual(self.channel.reader(["/bin/cat", str(link)]).returncode, 0)
        hard = self.channel.public / "hard.txt"
        result = self.python("import os; os.link(%r,%r)" %
                             (str(self.channel.private / "data.csv"), str(hard)))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(hard.exists())

    def test_child_and_nested_sandbox_cannot_relax_parent(self):
        path = str(self.channel.private / "data.csv")
        result = self.python("import subprocess; raise SystemExit(subprocess.run(['/bin/cat',%r]).returncode)" % path)
        self.assertNotEqual(result.returncode, 0)
        result = self.channel.reader(["/usr/bin/sandbox-exec", "-p", "(version 1)(allow default)",
                                      "/bin/cat", path])
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, b"")

    def test_private_config_registry_and_log_reads_denied(self):
        result = self.channel.request({"task": "summary", "dataset": "active"})
        record = self.channel.private / "records" / result["record_id"]
        for name in ("data.csv", "selection.csv", "dataset.json", "trusted_job.py", "reader.sb",
                     "records/%s/stdout.log" % result["record_id"],
                     "records/%s/result.json" % result["record_id"]):
            with self.subTest(name=name):
                response = self.channel.reader(["/bin/cat", str(self.channel.private / name)])
                self.assertNotEqual(response.returncode, 0)
                self.assertEqual(response.stdout, b"")
        self.assertTrue(record.is_dir())

    def test_reader_cannot_modify_private_program_or_repo_registry(self):
        for path in (self.channel.program, Path(__file__).with_name("registry.json")):
            before = path.read_bytes()
            result = self.python("open(%r,'w').write('tampered')" % str(path))
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(path.read_bytes(), before)

    def test_network_connection_is_denied(self):
        with socket.socket() as server:
            server.bind(("127.0.0.1", 0))
            server.listen(1)
            port = server.getsockname()[1]
            result = self.python("import socket; socket.create_connection(('127.0.0.1',%d),1)" % port)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(result.stdout, b"")

    def test_invalid_requests_never_start_compute(self):
        requests = [None, [], {}, {"task": "arbitrary", "dataset": "active"},
                    {"task": "summary", "dataset": "../../private/data.csv"},
                    {"task": "summary", "dataset": "active", "command": "cat data.csv"},
                    {"task": ["summary"], "dataset": "active"},
                    {"task": "summary", "dataset": True}]
        for request in requests:
            with self.subTest(index=requests.index(request)):
                result = self.channel.request(request)
                self.assertFalse(result["ok"])
                self.assertEqual(result["error"]["code"], "INVALID_REQUEST")
                self.assertNotIn("result", result)
                self.assertFalse((self.channel.private / "records" / result["record_id"] / "stdout.log").exists())

    def test_program_and_input_changes_fail_closed(self):
        self.channel.program.write_text("print('unreviewed')")
        result = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertEqual(result["error"]["code"], "PROGRAM_INTEGRITY")
        self.assertFalse((self.channel.private / "records" / result["record_id"] / "stdout.log").exists())
        self.channel.program.write_bytes(Path(__file__).with_name("trusted_job.py").read_bytes())
        (self.channel.private / "data.csv").write_text("changed")
        result = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertEqual(result["error"]["code"], "DATA_INTEGRITY")
        self.assertFalse((self.channel.private / "records" / result["record_id"] / "stdout.log").exists())

    def install_test_program(self, program):
        # Trusted harness injection tests output containment even if an explicitly
        # approved worker misbehaves. This is not a public request capability.
        self.channel.program.write_text(program)
        self.channel.program_hash = digest(program.encode())

    def test_worker_raw_stdout_stderr_never_published(self):
        valid = self.channel.request({"task": "summary", "dataset": "active"})["result"]
        code = ("import pathlib,sys,json,base64\nroot=pathlib.Path(sys.argv[1])\n"
                "raw=(root/'data.csv').read_text()\nprint(raw)\nsys.stderr.write(raw)\n"
                "print(base64.b64encode(raw.encode()).decode())\n"
                "pathlib.Path(sys.argv[3]).write_text(%r)\n" % json.dumps(valid))
        self.install_test_program(code)
        response = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertTrue(response["ok"])
        record = self.channel.private / "records" / response["record_id"]
        self.assertIn(b"1,9,1", (record / "stdout.log").read_bytes())
        self.assertIn(b"1,9,1", (record / "stderr.log").read_bytes())
        self.assertNotIn("1,9,1", json.dumps(response))
        for name in ("stdout.log", "stderr.log"):
            self.assertNotEqual(self.channel.reader(["/bin/cat", str(record / name)]).returncode, 0)

    def test_exception_and_malformed_result_never_leak(self):
        programs = [
            "import pathlib,sys; raise RuntimeError((pathlib.Path(sys.argv[1])/'data.csv').read_text())",
            "import pathlib,sys; pathlib.Path(sys.argv[3]).write_text('{not-json')",
            "import pathlib,sys; pathlib.Path(sys.argv[3]).write_text('{\"x\":NaN}')",
        ]
        for code in programs:
            self.install_test_program(code)
            response = self.channel.request({"task": "summary", "dataset": "active"})
            self.assertFalse(response["ok"])
            self.assertNotIn("result", response)
            self.assertNotIn("1,9,1", json.dumps(response))
            self.assertNotIn(str(self.channel.private), json.dumps(response))

    def test_worker_cannot_write_public_raw_copy(self):
        target = self.channel.public / "copy.txt"
        code = "import pathlib,sys; pathlib.Path(%r).write_bytes((pathlib.Path(sys.argv[1])/'data.csv').read_bytes())" % str(target)
        self.install_test_program(code)
        result = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertFalse(result["ok"])
        self.assertFalse(target.exists())

    def test_result_schema_and_semantic_failures(self):
        valid = self.channel.request({"task": "summary", "dataset": "active"})["result"]
        cases = [dict(valid, raw_rows=[[1, 2]]), dict(valid, n_rows=True),
                 dict(valid, n_complete=0), dict(valid, slope=math.inf),
                 dict(valid, histogram=[37]), dict(valid, histogram=[0] * 5)]
        for bad in cases:
            with self.assertRaises(ValueError):
                self.channel.validate("summary", bad)
        with self.assertRaises(ValueError):
            strict_json('{"n":1,"n":2}')

    def test_reader_output_limit_and_timeout(self):
        result = self.python("import sys; sys.stdout.write('x'*200000)")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, b"")
        self.assertEqual(result.stderr, b"READER_OUTPUT_LIMIT")
        with self.assertRaises(subprocess.TimeoutExpired):
            self.channel.reader([sys.executable, "-I", "-B", "-c", "import time; time.sleep(4)"], timeout=0.1)
        started = time.monotonic()
        with self.assertRaises(subprocess.TimeoutExpired):
            self.channel.reader([sys.executable, "-I", "-B", "-c",
                                 "import os,time; os.close(1); os.close(2); time.sleep(4)"], timeout=0.1)
        self.assertLess(time.monotonic() - started, 1.0)

    def test_duplicate_and_extra_fields_in_worker_result_fail_closed(self):
        invalid = ['{"n_rows":40,"n_rows":40}', '{"raw":"1,9,1"}']
        for text in invalid:
            code = "import pathlib,sys; pathlib.Path(sys.argv[3]).write_text(%r)" % text
            self.install_test_program(code)
            response = self.channel.request({"task": "summary", "dataset": "active"})
            self.assertFalse(response["ok"])
            self.assertNotIn("result", response)

    def test_missing_or_oversized_output_fails_closed(self):
        for code in ["pass", "import pathlib,sys; pathlib.Path(sys.argv[3]).write_text('x'*17000)"]:
            self.install_test_program(code)
            response = self.channel.request({"task": "summary", "dataset": "active"})
            self.assertFalse(response["ok"])
            self.assertEqual(response["error"]["code"], "INVALID_RESULT")

    def test_worker_resource_limits_fail_closed(self):
        for descriptor, filename in [(1, "stdout.log"), (2, "stderr.log")]:
            code = "import os\nwhile True:\n os.write(%d,b'x'*16384)\n" % descriptor
            self.install_test_program(code)
            response = self.channel.request({"task": "summary", "dataset": "active"})
            self.assertFalse(response["ok"])
            self.assertNotIn("result", response)
            record = self.channel.private / "records" / response["record_id"]
            self.assertLessEqual((record / filename).stat().st_size, 131072)
        self.install_test_program("import time; time.sleep(60)")
        started = time.monotonic()
        response = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertFalse(response["ok"])
        self.assertEqual(response["error"]["code"], "CHANNEL_FAILED")
        self.assertLess(time.monotonic() - started, 10.0)

    def test_result_symlink_is_not_published(self):
        self.install_test_program("import os,sys; os.symlink(sys.argv[1]+'/data.csv',sys.argv[3])")
        response = self.channel.request({"task": "summary", "dataset": "active"})
        self.assertFalse(response["ok"])
        self.assertEqual(response["error"]["code"], "INVALID_RESULT")

    def test_missing_backend_has_no_unprotected_fallback(self):
        with mock.patch("channel.SANDBOX", Path(self.temp.name) / "missing-sandbox"):
            with self.assertRaises(RuntimeError):
                create(Path(self.temp.name) / "unsupported")
        self.assertFalse((Path(self.temp.name) / "unsupported").exists())


if __name__ == "__main__":
    unittest.main()

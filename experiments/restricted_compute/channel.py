"""Local macOS boundary prototype; deliberately not wired into ZCode."""
from __future__ import annotations

import hashlib
import json
import math
import os
import resource
import selectors
import signal
import subprocess
import sys
import time
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
SANDBOX = Path("/usr/bin/sandbox-exec")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def strict_json(text):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("duplicate key")
            result[key] = value
        return result
    def invalid_constant(value):
        raise ValueError("non-finite JSON constant")
    return json.loads(text, object_pairs_hook=unique, parse_constant=invalid_constant)


def profile(writable, protected):
    # Read access to runtime libraries is retained. Only the registered protected
    # domains are confidential; this is not a whole-machine filesystem inventory.
    filters = " ".join("(subpath %s)" % json.dumps(str(path.resolve())) for path in protected)
    return ("(version 1)\n(deny default)\n(allow file-read*)\n"
            "(deny file-read* file-write* %s)\n"
            "(allow file-write* (subpath %s))\n"
            "(allow process-exec process-fork)\n(allow sysctl-read)\n"
            % (filters, json.dumps(str(writable.resolve()))))


def run_process(argv, cwd, stdout, stderr, timeout=8):
    def limits():
        resource.setrlimit(resource.RLIMIT_FSIZE, (131072, 131072))
        resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
    env = {"PATH": "/usr/bin:/bin", "HOME": str(cwd), "TMPDIR": str(cwd),
           "LANG": "en_US.UTF-8", "PYTHONDONTWRITEBYTECODE": "1"}
    process = subprocess.Popen(argv, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                               stdout=stdout, stderr=stderr, close_fds=True,
                               start_new_session=True, preexec_fn=limits)
    try:
        return process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        process.wait()
        raise


class Channel:
    """Constructed by the trusted host, never from a model's request fields.

    The host owns this object and private root. A reader is an OS-sandboxed child.
    Existing ZCode sessions are NOT children of this harness and remain unchanged.
    """

    def __init__(self, root, data, selection, config, source_domains=()):
        if sys.platform != "darwin" or not SANDBOX.is_file():
            raise RuntimeError("macOS sandbox unavailable; no unprotected fallback")
        self.root = Path(root).resolve()
        self.root.mkdir(mode=0o700, parents=True, exist_ok=False)
        self.private = self.root / "private"
        self.public = self.root / "public"
        self.private.mkdir(mode=0o700)
        self.public.mkdir()
        (self.private / "records").mkdir()
        (self.private / "data.csv").write_bytes(data)
        (self.private / "selection.csv").write_bytes(selection)
        (self.private / "dataset.json").write_text(json.dumps(config))
        registry = strict_json((HERE / "registry.json").read_text())
        program = (HERE / "trusted_job.py").read_bytes()
        if digest(program) != registry["program_sha256"]:
            raise RuntimeError("reviewed program fingerprint mismatch")
        self.program_hash = registry["program_sha256"]
        self.tasks = frozenset(registry["tasks"])
        self.program = self.private / "trusted_job.py"
        self.program.write_bytes(program)
        self.input_hashes = {name: digest((self.private / name).read_bytes())
                             for name in ("data.csv", "selection.csv", "dataset.json")}
        protected = [self.private, *map(Path, source_domains)]
        self.reader_profile = self.private / "reader.sb"
        self.reader_profile.write_text(profile(self.public, protected))
        # The profile text contains no data. Give sandbox-exec its text directly;
        # a sandboxed child cannot read private files to start a new broker.
        self.reader_policy = self.reader_profile.read_text()
        self.compute_profile = self.private / "compute.sb"
        self.compute_profile.write_text(profile(self.private, [self.public]))

    def reader(self, argv, timeout=8):
        """Actual permission boundary for Read/Bash-equivalent test processes.

        Raw test results stay in the verifier; never print their payloads.
        """
        with subprocess.Popen([str(SANDBOX), "-p", self.reader_policy, *argv],
                              cwd=self.public, env={"PATH": "/usr/bin:/bin", "HOME": str(self.public)},
                              stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, close_fds=True,
                              start_new_session=True) as child:
            streams = {"stdout": bytearray(), "stderr": bytearray()}
            deadline = time.monotonic() + timeout
            with selectors.DefaultSelector() as selector:
                selector.register(child.stdout, selectors.EVENT_READ, "stdout")
                selector.register(child.stderr, selectors.EVENT_READ, "stderr")
                while selector.get_map():
                    remaining = deadline - time.monotonic()
                    if remaining <= 0:
                        os.killpg(child.pid, signal.SIGKILL)
                        child.wait()
                        raise subprocess.TimeoutExpired(argv, timeout)
                    for key, _ in selector.select(remaining):
                        block = os.read(key.fileobj.fileno(), 4096)
                        if not block:
                            selector.unregister(key.fileobj)
                            continue
                        streams[key.data].extend(block)
                        if sum(map(len, streams.values())) > 131072:
                            os.killpg(child.pid, signal.SIGKILL)
                            child.wait()
                            return subprocess.CompletedProcess(argv, -9, b"", b"READER_OUTPUT_LIMIT")
                try:
                    child.wait(timeout=max(0.01, deadline - time.monotonic()))
                except subprocess.TimeoutExpired:
                    os.killpg(child.pid, signal.SIGKILL)
                    child.wait()
                    raise
            try:
                os.killpg(child.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            return subprocess.CompletedProcess(argv, child.returncode,
                                                bytes(streams["stdout"]), bytes(streams["stderr"]))

    def validate(self, task, result):
        if type(result) is not dict:
            raise ValueError("object required")
        if task == "row_keys":
            if set(result) != {"selected_count", "matching_source_rows", "all_match"}:
                raise ValueError("unexpected result fields")
            if (type(result["selected_count"]) is not int or result["selected_count"] < 1
                    or type(result["matching_source_rows"]) is not int
                    or result["matching_source_rows"] != result["selected_count"]
                    or result["all_match"] is not True):
                raise ValueError("source key mismatch")
            return
        keys = {"n_rows", "n_complete", "mean_x", "mean_y", "slope", "histogram"}
        if set(result) != keys:
            raise ValueError("unexpected result fields")
        if (type(result["n_rows"]) is not int or type(result["n_complete"]) is not int
                or not 5 <= result["n_complete"] <= result["n_rows"] <= 100000):
            raise ValueError("invalid sample size")
        for key in ("mean_x", "mean_y", "slope"):
            value = result[key]
            if type(value) not in (int, float) or not math.isfinite(value) or abs(value) > 1_000_000:
                raise ValueError("invalid statistic")
        bins = result["histogram"]
        if (type(bins) is not list or len(bins) != 5
                or any(type(n) is not int or n < 0 for n in bins)
                or sum(bins) != result["n_complete"]):
            raise ValueError("histogram count mismatch")

    def request(self, request):
        record_id = uuid.uuid4().hex
        record = self.private / "records" / record_id
        record.mkdir(mode=0o700)
        def reject(code):
            (record / "status.json").write_text(json.dumps({"ok": False, "code": code}))
            return {"ok": False, "error": {"code": code}, "record_id": record_id}
        if (type(request) is not dict or set(request) != {"task", "dataset"}
                or type(request["task"]) is not str or request["task"] not in self.tasks
                or request["dataset"] != "active" or type(request["dataset"]) is not str):
            return reject("INVALID_REQUEST")
        task = request["task"]
        try:
            if digest(self.program.read_bytes()) != self.program_hash:
                return reject("PROGRAM_INTEGRITY")
            if any(digest((self.private / name).read_bytes()) != expected
                   for name, expected in self.input_hashes.items()):
                return reject("DATA_INTEGRITY")
            output = record / "result.json"
            with (record / "stdout.log").open("wb") as stdout, (record / "stderr.log").open("wb") as stderr:
                code = run_process([str(SANDBOX), "-f", str(self.compute_profile),
                                    sys.executable, "-I", "-B", str(self.program),
                                    str(self.private), task, str(output)],
                                   self.private, stdout, stderr)
            if code != 0:
                return reject("COMPUTE_FAILED")
            if output.is_symlink() or not output.is_file() or output.stat().st_size > 16384:
                return reject("INVALID_RESULT")
            result = strict_json(output.read_text())
            self.validate(task, result)
            response = {"ok": True, "task": task, "result": result, "record_id": record_id}
            if task == "summary":
                # Only the trusted host constructs a public artifact, from validated
                # aggregate counts. A worker-supplied file is never published.
                scale = max(1, max(result["histogram"]))
                bars = "".join('<rect x="%d" y="%d" width="30" height="%d"/>' %
                               (10 + i * 40, 120 - round(100 * n / scale), round(100 * n / scale))
                               for i, n in enumerate(result["histogram"]))
                svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 140">'
                       '<title>Fixed-bin complete-case counts</title><g fill="#315b8a">'
                       + bars + '</g></svg>')
                name = "histogram-%s.svg" % record_id
                (self.public / name).write_text(svg)
                response["artifact"] = {"name": name, "sha256": digest(svg.encode())}
            (record / "status.json").write_text(json.dumps(response, allow_nan=False))
            return response
        except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError):
            return reject("CHANNEL_FAILED")

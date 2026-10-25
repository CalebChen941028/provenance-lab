"""Tests for tools/plab.py.

Offline tests run by default. Online tests hit PubMed/Crossref/OpenAlex against the
API-verified L1 cases and run only with PLAB_ONLINE=1:

    python3 -m unittest discover -s tools/tests -v
    PLAB_ONLINE=1 python3 -m unittest discover -s tools/tests -v
"""
import json
import contextlib
import hashlib
import io
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import plab  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# reference values computed with scipy.stats (two-sided for t/r/z, upper tail for F/chi2)
SCIPY_P = [
    ("t", 3.53, 298, None, 0.00048123193000359257),
    ("t", 2.91, 293, None, 0.0038913355675178713),
    ("t", 1.2, 10, None, 0.25779630072430565),
    ("F", 0.17, 2, 291, 0.8437485421876564),
    ("F", 4.5, 3, 120, 0.004982184997178946),
    ("chi2", 5.1, 2, None, 0.07808166600115318),
    ("chi2", 12.3, 4, None, 0.015254394655769615),
    ("r", 0.2, 298, None, 0.0004922940868811219),
    ("r", -0.11, 50, None, 0.43757249477853527),
    ("z", 1.96, None, None, 0.04999579029644087),
    ("t", 0.5, 1.5, None, 0.6805671106699402),
]


class Identifiers(unittest.TestCase):
    def test_norm_id(self):
        self.assertEqual(plab.norm_id("PMID: 9500320"), ("pmid", "9500320"))
        self.assertEqual(plab.norm_id("9500320"), ("pmid", "9500320"))
        self.assertEqual(plab.norm_id("https://doi.org/10.1038/NATURE12968"), ("doi", "10.1038/nature12968"))
        self.assertEqual(plab.norm_id("doi:10.1016/S0140-6736(97)11096-0."), ("doi", "10.1016/s0140-6736(97)11096-0"))
        self.assertEqual(plab.norm_id("私有库:paper.pdf"), ("other", "私有库:paper.pdf"))

    def test_extract_ids_keeps_balanced_parenthesis_and_drops_trailing_punctuation(self):
        text = "Lancet (doi:10.1016/S0140-6736(97)11096-0). PMID 9500320；另见 10.1001/jamapediatrics.2016.2341，"
        self.assertEqual(
            plab.extract_ids(text),
            ["PMID:9500320", "DOI:10.1016/s0140-6736(97)11096-0", "DOI:10.1001/jamapediatrics.2016.2341"],
        )

    def test_title_similarity_ignores_retraction_prefix(self):
        a = "Stimulus-triggered fate conversion of somatic cells into pluripotency"
        self.assertEqual(plab.title_similarity("RETRACTED ARTICLE: " + a, a), 1.0)


class Cited(unittest.TestCase):
    def test_seeded_draft_references(self):
        with open(os.path.join(ROOT, "evaluation/citation-error-cases/seeded-draft.md"), encoding="utf-8") as f:
            md = f.read()
        refs = plab.cited_references(md)
        self.assertTrue(refs["sectionFound"])
        self.assertEqual([r["label"] for r in refs["references"]], [f"S{i}" for i in range(1, 12)])
        self.assertEqual(refs["references"][3]["ids"], ["DOI:10.1038/nature12968"])
        self.assertEqual(refs["references"][9]["ids"], ["PMID:40328832", "PMID:40506455"])

    def test_prose_inside_reference_section_is_not_a_reference(self):
        md = "# Draft\n\n## References\n\nGroup A notes, see PMID 1 for context.\n\n1. Foo. PMID: 123\n2. Bar book.\n\n## Appendix\n- x PMID: 999\n"
        refs = plab.cited_references(md)["references"]
        self.assertEqual([r["label"] for r in refs], ["1", "2"])
        self.assertEqual(refs[1]["ids"], [])


class Whitelist(unittest.TestCase):
    def test_outside_and_unidentified(self):
        md = "## References\n1. A. PMID: 111\n2. B. doi:10.1000/xyz\n3. Cohen J. Statistical power analysis. 1988.\n"
        r = plab.whitelist_check(md, ["PMID:111"], expand=False)
        self.assertFalse(r["ok"])
        self.assertEqual([x["label"] for x in r["outside"]], ["2"])
        self.assertEqual(len(r["unidentified"]), 1)
        self.assertEqual(r["identified"], 2)

    def test_deny_overrides_allowed(self):
        md = "## References\n1. A. PMID: 111\n2. B. PMID: 222\n"
        r = plab.whitelist_check(md, ["PMID:111", "PMID:222"], expand=False, deny=["222"])
        self.assertEqual([x["label"] for x in r["outside"]], ["2"])


class Dedup(unittest.TestCase):
    def test_merges_by_id_and_by_title_year(self):
        recs = [
            {"id": "PMID:1", "title": "Sleep and phones", "year": 2020, "source": "PubMed"},
            {"id": "pmid:1", "title": "Sleep and phones", "year": 2020, "source": "EuropePMC"},
            {"id": "10.1/abc", "title": "Sleep and Phones.", "year": 2020, "source": "OpenAlex"},
            {"id": "PMID:2", "title": "Other", "year": 2021, "source": "PubMed"},
        ]
        d = plab.dedup_records(recs)
        self.assertEqual(d["unique"], 2)
        self.assertEqual(d["records"][0]["sources"], ["PubMed", "EuropePMC", "OpenAlex"])


class Filenames(unittest.TestCase):
    def test_title_is_shortened_before_journal_and_year(self):
        name = plab.safe_filename("T" * 300, "Int J Environ Res Public Health", "2021")
        self.assertLessEqual(len(name), 120)
        self.assertTrue(name.endswith("_Int J Environ Res Public Health_2021.pdf"))

    def test_illegal_characters_removed(self):
        self.assertEqual(plab.safe_filename("A/B: test?", "J", "2020", "27802500"), "A B test_J_2020_27802500.pdf")


class Schema(unittest.TestCase):
    def test_csv_schema_prints_no_values_and_flags_identifiers(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "d.csv")
            with open(p, "w", encoding="utf-8") as f:
                f.write("姓名,age,score,group\n")
                for i in range(30):
                    f.write(f"person{i},{20 + i % 5},{i * 1.5},{'a' if i % 2 else 'b'}\n")
                f.write(",NA,,a\n")
            s = plab.schema_of(p)
            self.assertEqual(s["rows"], 31)
            cols = {c["name"]: c for c in s["columns"]}
            self.assertTrue(cols["姓名"]["potentialIdentifier"])
            self.assertEqual(cols["age"]["type"], "int")
            self.assertEqual(cols["score"]["type"], "float")
            self.assertEqual(cols["age"]["missing"], 1)
            self.assertFalse(cols["group"]["potentialIdentifier"])
            self.assertNotIn("person1", json.dumps(s, ensure_ascii=False))


class Manifest(unittest.TestCase):
    def test_counts_only_listed_verified_artifacts_not_claimed_or_present_files(self):
        with tempfile.TemporaryDirectory() as td:
            entries = []
            for i in range(26):
                name = f"artifact {i}.csv"
                data = f"private-row-{i}\n".encode()
                with open(os.path.join(td, name), "wb") as f:
                    f.write(data)
                if i < 20:
                    # Both shasum's text and binary markers are accepted, as is uppercase hex.
                    marker = " *" if i % 2 else "  "
                    entries.append(hashlib.sha256(data).hexdigest().upper() + marker + name)
            manifest = os.path.join(td, "CHECKSUMS.sha256")
            with open(manifest, "w") as f:
                f.write("\n".join(entries) + "\n")
            result = plab.verify_manifest(manifest, td)
            self.assertEqual(result, {"available": True, "listed": 20, "verified": 20,
                                      "missing": [], "mismatched": [], "invalid": [], "ok": True})
            self.assertNotIn("private-row", json.dumps(result))

    def test_missing_and_changed_files_are_not_verified(self):
        with tempfile.TemporaryDirectory() as td:
            manifest = os.path.join(td, "CHECKSUMS.sha256")
            with open(manifest, "w") as f:
                f.write(hashlib.sha256(b"expected").hexdigest() + "  changed.txt\n" + "0" * 64 + "  missing.txt\n")
            with open(os.path.join(td, "changed.txt"), "wb") as f:
                f.write(b"changed")
            result = plab.verify_manifest(manifest, td)
            self.assertTrue(result["available"])
            self.assertEqual((result["listed"], result["verified"]), (2, 0))
            self.assertEqual(result["missing"], ["missing.txt"])
            self.assertEqual(result["mismatched"], ["changed.txt"])
            self.assertFalse(result["ok"])

    def test_missing_empty_invalid_and_duplicate_lists_fail_closed(self):
        with tempfile.TemporaryDirectory() as td:
            manifest = os.path.join(td, "CHECKSUMS.sha256")
            self.assertEqual(plab.verify_manifest(manifest, td),
                             {"available": False, "listed": 0, "verified": 0,
                              "missing": [], "mismatched": [], "invalid": [], "ok": False})
            with open(manifest, "w") as f:
                f.write("\n  \n")
            empty = plab.verify_manifest(manifest, td)
            self.assertTrue(empty["available"])
            self.assertFalse(empty["ok"])
            self.assertTrue(empty["invalid"])
            with open(os.path.join(td, "good.txt"), "wb") as f:
                f.write(b"ok")
            line = hashlib.sha256(b"ok").hexdigest() + "  "
            with open(manifest, "w") as f:
                f.write(line + "good.txt\n" + line + "./good.txt\nnot a SHA-256 line\n")
            bad = plab.verify_manifest(manifest, td)
            self.assertEqual((bad["listed"], bad["verified"]), (1, 1))
            self.assertEqual(len(bad["invalid"]), 2)
            self.assertFalse(bad["ok"])

    def test_unsafe_paths_and_symlink_escape_are_rejected_without_reading_outside(self):
        with tempfile.TemporaryDirectory() as td, tempfile.TemporaryDirectory() as external:
            secret = os.path.join(external, "secret.csv")
            with open(secret, "wb") as f:
                f.write(b"private rows")
            os.symlink(external, os.path.join(td, "escape"))
            manifest = os.path.join(td, "CHECKSUMS.sha256")
            paths = [secret, "../secret.csv", "escape/secret.csv", "C:\\secret.csv", "bad\x00name"]
            with open(manifest, "w") as f:
                f.write("\n".join("0" * 64 + "  " + p for p in paths))
            with patch("builtins.open", wraps=open) as opened:
                result = plab.verify_manifest(manifest, td)
            self.assertEqual([os.fspath(call.args[0]) for call in opened.call_args_list], [os.path.realpath(manifest)])
            self.assertEqual(len(result["invalid"]), 5)
            self.assertEqual((result["listed"], result["verified"]), (0, 0))
            self.assertFalse(result["ok"])
            with patch("builtins.open", wraps=open) as opened:
                outside_manifest = plab.verify_manifest(secret, td)
            opened.assert_not_called()
            self.assertFalse(outside_manifest["available"])
            self.assertTrue(outside_manifest["invalid"])

    def test_invalid_root_and_cli_missing_manifest_produce_json(self):
        with tempfile.TemporaryDirectory() as td:
            bad_root = plab.verify_manifest(os.path.join(td, "CHECKSUMS"), os.path.join(td, "absent"))
            self.assertFalse(bad_root["available"])
            self.assertTrue(bad_root["invalid"])
            out = os.path.join(td, "result.json")
            stdout = io.StringIO()
            with contextlib.redirect_stdout(stdout):
                code = plab.main(["manifest", os.path.join(td, "CHECKSUMS"), "--root", td, "--out", out])
            self.assertEqual(code, 0)
            with open(out) as f:
                self.assertEqual(json.loads(stdout.getvalue()), json.load(f))
            self.assertFalse(json.loads(stdout.getvalue())["available"])


class OpenAccess(unittest.TestCase):
    def test_openalex_license_survives_resolution_and_download(self):
        doi = "10.1234/example"
        for license_code in ("cc-by", None):
            with self.subTest(license=license_code), tempfile.TemporaryDirectory() as td:
                work = {"title": "Example", "doi": doi, "publication_year": 2024,
                        "open_access": {"is_oa": True},
                        "best_oa_location": {"pdf_url": "https://example.org/paper.pdf", "license": license_code}}
                with patch.object(plab, "_openalex", return_value=({doi: work}, True)):
                    records = plab.resolve_records([{"id": doi}], full=False)

                def download(http, url, dest, md5=""):
                    with open(dest, "wb") as f:
                        f.write(b"%PDF-test")
                    return True, ""

                with patch.object(plab, "resolve_records", return_value=records), patch.object(plab, "_download_pdf", side_effect=download):
                    result = plab.oa_fetch([doi], td)
                self.assertEqual(result["downloaded"][0]["license"], license_code or "")


class Statcheck(unittest.TestCase):
    def test_p_values_match_scipy(self):
        for test, stat, d1, d2, expected in SCIPY_P:
            with self.subTest(test=test, stat=stat):
                self.assertAlmostEqual(plab.p_value(test, abs(stat), d1, d2), expected, delta=max(1e-9, expected * 1e-6))

    def test_consistency_and_decision_errors(self):
        text = (
            "Effect t(298) = 3.53, p < .001. Null F(2, 291) = 0.17, p = .845. "
            "Wrong t(30) = 1.20, p = .03. Rounded r(298) = .20, p < .001. "
            "Chinese 标点 t(293) = 2.91，p = .004。 χ²(2, N = 300) = 5.10, p = .078. "
            "Trend z = 1.50, p < .05."
        )
        r = plab.statcheck_text(text)
        by = {x["text"].split()[0] if x["text"][0] != "χ" else "chi": x for x in r["results"]}
        self.assertEqual(r["checked"], 7)
        self.assertTrue(by["t(298)"]["consistent"])
        self.assertTrue(by["F(2,"]["consistent"])
        self.assertFalse(by["t(30)"]["consistent"])
        self.assertTrue(by["t(30)"]["decisionError"])
        self.assertTrue(by["r(298)"]["consistent"])
        self.assertTrue(by["t(293)"]["consistent"])
        self.assertTrue(by["chi"]["consistent"])
        self.assertFalse(by["z"]["consistent"])
        self.assertTrue(by["z"]["decisionError"])
        self.assertEqual(r["decisionErrors"], 2)

    def test_rounding_tolerance(self):
        # t(20) = 2.09 → p ≈ .0496; reported p = .05 is a rounding of the admissible range, not an error
        self.assertTrue(plab.statcheck_text("t(20) = 2.09, p = .05")["results"][0]["consistent"])

    def test_markdown_symbols_and_intervening_ci(self):
        text = (
            "Pearson *r*(298) = .223，95% CI [.112, .328]，*p* < .001。 "
            "Wrong **t**(30) = 1.20, 95% CI [-.1, .3], **p** = .03. "
            "_F_(2, 291) = 0.17, _p_ = .845."
        )
        r = plab.statcheck_text(text)
        self.assertEqual(r["checked"], 3)
        self.assertEqual(r["inconsistent"], 1)
        self.assertEqual(r["decisionErrors"], 1)

    def test_never_borrows_p_or_df_from_another_report(self):
        text = (
            "*t*(30) = 1.20。另一检验 *p* = .03。\n"
            "*r*(298) = .223，95% CI [.112, .328]。另一检验 p < .001。\n"
            "χ² = 4.639, p = .200。β = .132, p = .019。\n"
            "| *r*(295) = .184 | [.071, .291] | .001 |"
        )
        self.assertEqual(plab.statcheck_text(text)["checked"], 0)

    def test_numerical_mismatch_does_not_imply_decision_flip(self):
        r = plab.statcheck_text("Wald χ²(1) = 3.06, p = .081")
        self.assertEqual(r["inconsistent"], 1)
        self.assertEqual(r["decisionErrors"], 0)


@unittest.skipUnless(os.environ.get("PLAB_ONLINE") == "1", "set PLAB_ONLINE=1 to query PubMed/Crossref/OpenAlex")
class OnlineL1(unittest.TestCase):
    """Deterministic layer on the API-verified L1 cases S1-S4, S8, S10."""

    @classmethod
    def setUpClass(cls):
        ids = ["PMID:99999999", "DOI:10.1093/fake/journal-2099", "PMID:9500320", "DOI:10.1038/nature12968",
               "DOI:10.1001/jamapediatrics.2016.2341", "PMID:40328832", "PMID:35149136"]
        cls.recs = {r["id"]: r for r in plab.resolve_records([{"id": i} for i in ids])}

    def test_fabricated_identifiers_do_not_resolve(self):
        self.assertIs(self.recs["PMID:99999999"]["found"], False)
        self.assertIs(self.recs["DOI:10.1093/fake/journal-2099"]["found"], False)

    def test_retractions(self):
        self.assertEqual(self.recs["PMID:9500320"]["status"], "retracted")
        self.assertEqual(self.recs["DOI:10.1038/nature12968"]["status"], "retracted")

    def test_correction_and_clean(self):
        self.assertEqual(self.recs["PMID:40328832"]["status"], "corrected")
        self.assertEqual(self.recs["PMID:35149136"]["status"], "clean")
        self.assertIn("Meta-Analysis", self.recs["PMID:35149136"]["publicationTypes"])
        self.assertEqual(self.recs["DOI:10.1001/jamapediatrics.2016.2341"]["pmid"], "27802500")

    def test_bib_match(self):
        r = plab.resolve_records([{"id": "PMID:34299887", "title": "Reciprocal Relationships between Sleep Problems and Problematic Smartphone Use in Taiwan", "year": 2021}])[0]
        self.assertGreater(r["bibMatch"]["titleSimilarity"], 0.6)
        self.assertTrue(r["bibMatch"]["yearMatch"])


if __name__ == "__main__":
    unittest.main()

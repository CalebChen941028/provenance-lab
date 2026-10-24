#!/usr/bin/env python3
"""ProvenanceLab deterministic tools — the mechanical checks behind the gates.

Agents judge meaning (does a claim match its source?); this script settles facts
that code can settle: does an identifier resolve, is the paper retracted, is every
cited reference on the whitelist, is a reported p consistent with its statistic.
Standard library only, so every harness can run it with a plain `python3`.

Subcommands (all print JSON to stdout; exit 0 even when problems are found,
exit 2 on bad usage):
  resolve    resolve PMIDs/DOIs, bibliographic match, retraction/correction status
  cited      extract the reference list (with PMIDs/DOIs) from a Markdown draft
  whitelist  check every cited reference against an allowed set of identifiers
  oa-fetch   download legally open-access PDFs (PMC Open Access dataset, then
             the OA location OpenAlex reports); paywalled items are listed, never fetched
  dedup      merge duplicate candidate records across sources
  schema     print a data file's schema without printing any row values
  statcheck  recompute p from APA-style test statistics and flag inconsistencies

Network etiquette: requests carry a tool User-Agent; set PLAB_MAILTO to join the
OpenAlex/Crossref polite pools and enable the Crossref Retraction Watch lookup, and
NCBI_API_KEY to raise the NCBI rate limit. No address is sent unless you set one.

Mechanism credits (ideas, not code): statcheck (Nuijten et al., 2016) for the
p-value consistency check; PMC Open Access dataset on AWS (NCBI) for legal bulk PDF access.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import re
import ssl
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import Any, Iterable

UA = "provenance-lab-tools/1.0 (+https://github.com/CalebChen941028/provenance-lab)"
MAILTO = os.environ.get("PLAB_MAILTO", "").strip()
NCBI_KEY = os.environ.get("NCBI_API_KEY", "").strip()
TIMEOUT = 30

# ── identifiers ──────────────────────────────────────────────────────────────

_DOI_RE = re.compile(r"\b(10\.\d{4,9}/[^\s\"<>，。；：、（）【】《》「」]+)", re.I)
_PMID_RE = re.compile(r"(?:\bPMID\s*[:：]?\s*|pubmed\.ncbi\.nlm\.nih\.gov/)(\d{1,9})\b", re.I)
_PMCID_RE = re.compile(r"\b(PMC\d{4,9})\b", re.I)
_TRAIL = ".,;:)]}>'\""


def clean_doi(doi: str) -> str:
    doi = doi.strip()
    doi = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi\s*[:：]\s*)", "", doi, flags=re.I)
    while doi and doi[-1] in _TRAIL:
        # keep a closing parenthesis that balances one inside the DOI, e.g. 10.1016/s0140-6736(97)11096-0
        if doi[-1] == ")" and doi.count("(") >= doi.count(")"):
            break
        doi = doi[:-1]
    return doi.lower()


def norm_id(raw: str) -> tuple[str, str]:
    """Return (kind, value): kind is pmid / doi / pmcid / other."""
    s = str(raw).strip()
    m = re.match(r"^(?:PMID\s*[:：]?\s*)?(\d{1,9})$", s, re.I)
    if m:
        return "pmid", m.group(1)
    m = _PMID_RE.search(s)
    if m and not _DOI_RE.search(s):
        return "pmid", m.group(1)
    m = _DOI_RE.search(s)
    if m:
        return "doi", clean_doi(m.group(1))
    m = _PMCID_RE.search(s)
    if m:
        return "pmcid", m.group(1).upper()
    return "other", s


def canon(kind: str, value: str) -> str:
    return {"pmid": f"PMID:{value}", "doi": f"DOI:{value}", "pmcid": value}.get(kind, value)


def extract_ids(text: str) -> list[str]:
    """All PMIDs, DOIs and PMCIDs in a piece of text, canonical form, in order."""
    found: list[str] = []
    for m in _PMID_RE.finditer(text):
        found.append(f"PMID:{m.group(1)}")
    for m in _DOI_RE.finditer(text):
        found.append(f"DOI:{clean_doi(m.group(1))}")
    for m in _PMCID_RE.finditer(text):
        found.append(m.group(1).upper())
    seen: set[str] = set()
    return [x for x in found if not (x in seen or seen.add(x))]


def norm_title(t: str) -> str:
    t = unicodedata.normalize("NFKD", t or "").lower()
    t = re.sub(r"^retracted( article)?\s*:\s*", "", t)
    return re.sub(r"[^a-z0-9一-鿿]+", " ", t).strip()


def title_similarity(a: str, b: str) -> float:
    ta, tb = set(norm_title(a).split()), set(norm_title(b).split())
    if not ta or not tb:
        return 0.0
    return round(len(ta & tb) / len(ta | tb), 3)


# ── HTTP ─────────────────────────────────────────────────────────────────────


def _ssl_context() -> ssl.SSLContext:
    """Verified TLS context; falls back to system CA bundles when Python ships without one
    (common with python.org macOS builds). Certificate verification is never disabled."""
    ctx = ssl.create_default_context()
    if ctx.cert_store_stats().get("x509_ca", 0) > 0:
        return ctx
    try:
        import certifi  # type: ignore

        ctx.load_verify_locations(certifi.where())
        return ctx
    except (ImportError, OSError):
        pass
    for bundle in ("/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt", "/etc/pki/tls/certs/ca-bundle.crt"):
        if os.path.exists(bundle):
            ctx.load_verify_locations(bundle)
            break
    return ctx


class Http:
    def __init__(self, delay: float = 0.34):
        self.delay = delay
        self._last = 0.0
        self._ctx = _ssl_context()

    def get(self, url: str, accept: str = "application/json", retries: int = 3) -> tuple[int, bytes]:
        """GET with retry on 429/5xx; returns (status, body); status 0 = network failure."""
        for attempt in range(retries):
            wait = self.delay - (time.time() - self._last)
            if wait > 0:
                time.sleep(wait)
            self._last = time.time()
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
            try:
                with urllib.request.urlopen(req, timeout=TIMEOUT, context=self._ctx) as r:
                    return r.status, r.read()
            except urllib.error.HTTPError as e:
                if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return e.code, e.read() if hasattr(e, "read") else b""
            except (urllib.error.URLError, TimeoutError, OSError):
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return 0, b""
        return 0, b""


def _ncbi(params: dict[str, str]) -> dict[str, str]:
    params = {**params, "tool": "provenance-lab"}
    if MAILTO:
        params["email"] = MAILTO
    if NCBI_KEY:
        params["api_key"] = NCBI_KEY
    return params


def _chunks(xs: list[str], n: int) -> Iterable[list[str]]:
    for i in range(0, len(xs), n):
        yield xs[i : i + n]


# ── resolve ──────────────────────────────────────────────────────────────────

_STATUS_RANK = {"retracted": 4, "concern": 3, "corrected": 2, "clean": 1, "unknown": 0}


def _pubmed_fetch(http: Http, pmids: list[str]) -> tuple[dict[str, dict], bool]:
    """efetch XML in batches; returns ({pmid: record}, ok)."""
    out: dict[str, dict] = {}
    ok = True
    for batch in _chunks(pmids, 200):
        q = urllib.parse.urlencode(_ncbi({"db": "pubmed", "id": ",".join(batch), "retmode": "xml"}))
        status, body = http.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?{q}", "application/xml")
        if status != 200:
            ok = False
            continue
        try:
            root = ET.fromstring(body)
        except ET.ParseError:
            ok = False
            continue
        for art in root.findall("PubmedArticle"):
            mc = art.find("MedlineCitation")
            if mc is None:
                continue
            pmid = (mc.findtext("PMID") or "").strip()
            a = mc.find("Article")
            title = "".join(a.find("ArticleTitle").itertext()).strip() if a is not None and a.find("ArticleTitle") is not None else ""
            journal = (a.findtext("Journal/ISOAbbreviation") or a.findtext("Journal/Title") or "").strip() if a is not None else ""
            year = ""
            if a is not None:
                year = (a.findtext("Journal/JournalIssue/PubDate/Year") or (a.findtext("Journal/JournalIssue/PubDate/MedlineDate") or "")[:4]).strip()
            ptypes = [p.text.strip() for p in mc.findall("Article/PublicationTypeList/PublicationType") if p.text]
            corrections = [c.get("RefType", "") for c in mc.findall("CommentsCorrectionsList/CommentsCorrections")]
            ids = {i.get("IdType"): (i.text or "").strip() for i in art.findall("PubmedData/ArticleIdList/ArticleId")}
            out[pmid] = {
                "title": title, "journal": journal, "year": year, "publicationTypes": ptypes,
                "corrections": corrections, "doi": clean_doi(ids["doi"]) if ids.get("doi") else "",
                "pmcid": ids.get("pmc", ""),
            }
    return out, ok


def _openalex(http: Http, kind: str, values: list[str]) -> tuple[dict[str, dict], bool]:
    """Batch OpenAlex lookup by pmid or doi; returns ({value: work}, ok)."""
    out: dict[str, dict] = {}
    ok = True
    sel = "id,doi,ids,title,publication_year,is_retracted,open_access,best_oa_location,type"
    for batch in _chunks(values, 50):
        flt = f"{kind}:" + "|".join(batch)
        params = {"filter": flt, "per-page": "50", "select": sel}
        if MAILTO:
            params["mailto"] = MAILTO
        status, body = http.get("https://api.openalex.org/works?" + urllib.parse.urlencode(params))
        if status != 200:
            ok = False
            continue
        for w in json.loads(body).get("results", []):
            ids = w.get("ids") or {}
            if kind == "pmid" and ids.get("pmid"):
                out[ids["pmid"].rstrip("/").rsplit("/", 1)[-1]] = w
            elif kind == "doi" and w.get("doi"):
                out[clean_doi(w["doi"])] = w
    return out, ok


def _crossref(http: Http, doi: str) -> tuple[str, dict]:
    """('ok'|'not-found'|'error', message)."""
    url = "https://api.crossref.org/works/" + urllib.parse.quote(doi, safe="/()")
    if MAILTO:
        url += "?mailto=" + urllib.parse.quote(MAILTO)
    status, body = http.get(url)
    if status == 200:
        return "ok", json.loads(body).get("message", {})
    if status == 404:
        return "not-found", {}
    return "error", {}


def _retraction_watch(http: Http, doi: str) -> bool | None:
    """Crossref Retraction Watch lookup; requires PLAB_MAILTO (the API refuses anonymous calls)."""
    if not MAILTO:
        return None
    q = urllib.parse.urlencode({"doi": doi, "mailto": MAILTO})
    status, body = http.get(f"https://api.labs.crossref.org/retractions/search?{q}")
    if status != 200:
        return None
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return None
    items = data.get("message", {}).get("items") if isinstance(data, dict) else None
    return bool(items) if items is not None else None


def resolve_records(items: list[dict], http: Http | None = None, full: bool = True) -> list[dict]:
    """items: [{id, title?, year?}] → resolution records (order preserved).

    full=False skips the per-DOI Crossref and Retraction Watch calls: enough for PMID↔DOI
    mapping and existence, not for a status audit of DOI-only records."""
    http = http or Http()
    parsed = [(it, *norm_id(it.get("id", ""))) for it in items]
    pmids = sorted({v for _, k, v in parsed if k == "pmid"})
    dois = sorted({v for _, k, v in parsed if k == "doi"})
    pm, pm_ok = _pubmed_fetch(http, pmids) if pmids else ({}, True)
    oa_p, oap_ok = _openalex(http, "pmid", pmids) if pmids else ({}, True)
    oa_d, oad_ok = _openalex(http, "doi", dois) if dois else ({}, True)
    cr: dict[str, tuple[str, dict]] = {d: _crossref(http, d) for d in dois} if full else {}

    out = []
    for it, kind, value in parsed:
        rec: dict[str, Any] = {
            "input": it.get("id", ""), "id": canon(kind, value), "kind": kind, "found": None,
            "title": "", "year": "", "journal": "", "pmid": "", "doi": "", "pmcid": "",
            "publicationTypes": [], "status": "unknown", "statusEvidence": [],
            "oa": {"isOa": None, "pdfUrl": "", "pmcid": ""}, "sources": {},
        }
        status_hits: list[tuple[str, str]] = []
        w: dict | None = None
        if kind == "pmid":
            p = pm.get(value)
            rec["sources"]["pubmed"] = "ok" if p else ("not-found" if pm_ok else "error")
            w = oa_p.get(value)
            rec["sources"]["openalex"] = "ok" if w else ("not-found" if oap_ok else "error")
            if p:
                rec.update({k: p[k] for k in ("title", "year", "journal", "doi", "pmcid", "publicationTypes")})
                rec["pmid"] = value
                pts = set(p["publicationTypes"])
                if "Retracted Publication" in pts or "RetractionIn" in p["corrections"]:
                    status_hits.append(("retracted", "PubMed: Retracted Publication / RetractionIn"))
                if "ExpressionOfConcernIn" in p["corrections"]:
                    status_hits.append(("concern", "PubMed: ExpressionOfConcernIn"))
                if "ErratumIn" in p["corrections"]:
                    status_hits.append(("corrected", "PubMed: ErratumIn"))
        elif kind == "doi":
            cstat, msg = cr.get(value, ("skipped", {}))
            if full:
                rec["sources"]["crossref"] = cstat
            w = oa_d.get(value)
            rec["sources"]["openalex"] = "ok" if w else ("not-found" if oad_ok else "error")
            rec["doi"] = value
            if cstat == "ok":
                rec["title"] = (msg.get("title") or [""])[0]
                rec["journal"] = (msg.get("container-title") or [""])[0]
                parts = (msg.get("issued") or {}).get("date-parts") or [[None]]
                rec["year"] = str(parts[0][0] or "")
                for u in msg.get("updated-by") or []:
                    t = (u.get("type") or "").lower()
                    if "retraction" in t or "withdrawal" in t:
                        status_hits.append(("retracted", f"Crossref: updated-by {t} {u.get('DOI', '')}".strip()))
                    elif "concern" in t:
                        status_hits.append(("concern", f"Crossref: updated-by {t} {u.get('DOI', '')}".strip()))
                    elif t in ("correction", "erratum", "corrigendum"):
                        status_hits.append(("corrected", f"Crossref: updated-by {t} {u.get('DOI', '')}".strip()))
            rw = _retraction_watch(http, value) if full else None
            if rw is not None:
                rec["sources"]["retractionWatch"] = "hit" if rw else "no-hit"
                if rw:
                    status_hits.append(("retracted", "Crossref Retraction Watch: listed"))
        if w:
            ids = w.get("ids") or {}
            rec["title"] = rec["title"] or (w.get("title") or "")
            rec["year"] = rec["year"] or str(w.get("publication_year") or "")
            if not rec["pmid"] and ids.get("pmid"):
                rec["pmid"] = ids["pmid"].rstrip("/").rsplit("/", 1)[-1]
            if not rec["doi"] and w.get("doi"):
                rec["doi"] = clean_doi(w["doi"])
            if w.get("is_retracted"):
                status_hits.append(("retracted", "OpenAlex: is_retracted"))
            oa = w.get("open_access") or {}
            best = w.get("best_oa_location") or {}
            rec["oa"] = {"isOa": oa.get("is_oa"), "pdfUrl": best.get("pdf_url") or "", "pmcid": rec["pmcid"], "license": best.get("license") or ""}
        elif rec["pmcid"]:
            rec["oa"]["pmcid"] = rec["pmcid"]

        src = rec["sources"].values()
        if any(s == "ok" for s in src):
            rec["found"] = True
        elif kind in ("pmid", "doi") and src and all(s in ("not-found", "no-hit") for s in src):
            rec["found"] = False
        if kind == "other":
            rec["statusEvidence"].append("非 PMID/DOI 标识（如私有库条目），未做在线解析")
        if rec["found"]:
            best_status = max((s for s, _ in status_hits), key=_STATUS_RANK.get, default="clean")
            rec["status"] = best_status
            rec["statusEvidence"] += [e for _, e in status_hits]
        if rec["found"] and (it.get("title") or it.get("year")):
            rec["bibMatch"] = {
                "titleSimilarity": title_similarity(it.get("title", ""), rec["title"]) if it.get("title") else None,
                "yearMatch": (str(it.get("year")) == rec["year"]) if it.get("year") and rec["year"] else None,
            }
        out.append(rec)
    return out


# ── cited / whitelist ────────────────────────────────────────────────────────

_REF_HEAD = re.compile(r"^(#{1,6})\s*(?:\d+(?:\.\d+)*\s*)?(references?|reference list|bibliography|参考文献|引用文献)\b", re.I)
_ITEM = re.compile(r"^\s*(?:[-*+]\s+|\d+[.)]\s+|\[\d+\]\s*|[A-Z]?\d+\.\s+)")


def cited_references(md: str) -> dict:
    lines = md.splitlines()
    start, level = None, 0
    for i, ln in enumerate(lines):
        m = _REF_HEAD.match(ln.strip())
        if m:
            start, level = i + 1, len(m.group(1))
    section_found = start is not None
    body = lines[start:] if section_found else lines
    if section_found:
        for j, ln in enumerate(body):
            h = re.match(r"^(#{1,6})\s", ln)
            if h and len(h.group(1)) <= level:
                body = body[:j]
                break
    entries: list[tuple[bool, str]] = []
    for ln in body:
        if not ln.strip():
            continue
        if _ITEM.match(ln) or not entries:
            entries.append((bool(_ITEM.match(ln)), ln.strip()))
        else:
            entries[-1] = (entries[-1][0], entries[-1][1] + " " + ln.strip())
    if any(is_item for is_item, _ in entries):
        # a list exists: prose paragraphs inside the section (group notes, preambles) are not references
        entries = [x for x in entries if x[0]]
    refs = []
    for _, e in entries:
        lab = re.match(r"^\s*(?:[-*+]\s+)?(\[?[A-Z]?\d+\]?)[.)]?\s", e)
        refs.append({"label": lab.group(1).strip("[]") if lab else "", "text": e[:400], "ids": extract_ids(e)})
    if not section_found:
        refs = [r for r in refs if r["ids"]]
    return {"sectionFound": section_found, "references": refs}


def _keys(rec_or_ids: Iterable[str]) -> set[str]:
    return {x.lower() for x in rec_or_ids}


def whitelist_check(md: str, allowed: list[str], expand: bool = True, http: Http | None = None, deny: list[str] | None = None) -> dict:
    """deny: identifiers that must not count as allowed even if they appear in an allowed source
    (e.g. entries the citation gate removed, which an exclusion log may still mention)."""
    refs = cited_references(md)["references"]
    allowed_canon = {canon(*norm_id(a)) for a in allowed}
    allowed_canon.discard("")
    groups: dict[str, set[str]] = {a: {a} for a in allowed_canon}
    cited_ids = sorted({i for r in refs for i in r["ids"]})
    if expand:
        # map PMID↔DOI so that a draft citing the DOI of a whitelisted PMID still matches
        recs = resolve_records([{"id": x} for x in sorted(allowed_canon | set(cited_ids)) if norm_id(x)[0] in ("pmid", "doi")], http, full=False)
        for r in recs:
            alias = {r["id"]} | ({f"PMID:{r['pmid']}"} if r["pmid"] else set()) | ({f"DOI:{r['doi']}"} if r["doi"] else set())
            groups[r["id"]] = alias
    allowed_keys: set[str] = set()
    for a in allowed_canon:
        allowed_keys |= _keys(groups.get(a, {a}))
    for d in deny or []:
        dc = canon(*norm_id(d))
        allowed_keys -= _keys(groups.get(dc, {dc}))
    outside, unidentified = [], []
    for r in refs:
        if not r["ids"]:
            unidentified.append({"label": r["label"], "text": r["text"]})
            continue
        keys: set[str] = set()
        for i in r["ids"]:
            keys |= _keys(groups.get(i, {i}))
        if not keys & allowed_keys:
            outside.append(r)
    return {
        "references": len(refs), "identified": len(refs) - len(unidentified),
        "outside": outside, "unidentified": unidentified, "ok": not outside,
    }


# ── oa-fetch ─────────────────────────────────────────────────────────────────

_PMC_S3 = "https://pmc-oa-opendata.s3.amazonaws.com"


def _clean_part(x: str) -> str:
    x = unicodedata.normalize("NFKC", x or "")
    x = re.sub(r'[\\/:*?"<>|\x00-\x1f]+', " ", x)
    return re.sub(r"\s+", " ", x).strip(" ._")


def safe_filename(title: str, journal: str, year: str, tag: str = "") -> str:
    """标题_期刊_年份.pdf, at most 120 characters; the title is shortened first so journal and year survive."""
    tail = "".join(f"_{p}" for p in (_clean_part(journal)[:40], _clean_part(year), _clean_part(tag)) if p)
    head = _clean_part(title)[: max(20, 120 - len(tail) - 4)].rstrip(" ._") or "paper"
    return (head + tail)[:116] + ".pdf"


def _pmc_latest_meta(http: Http, pmcid: str) -> dict | None:
    status, body = http.get(f"{_PMC_S3}/?list-type=2&prefix=metadata/{pmcid}.", "application/xml")
    if status != 200:
        return None
    keys = re.findall(r"<Key>(metadata/%s\.(\d+)\.json)</Key>" % re.escape(pmcid), body.decode("utf-8", "replace"))
    if not keys:
        return None
    key = max(keys, key=lambda k: int(k[1]))[0]
    status, body = http.get(f"{_PMC_S3}/{key}")
    return json.loads(body) if status == 200 else None


def _download_pdf(http: Http, url: str, dest: str, md5: str = "") -> tuple[bool, str]:
    status, body = http.get(url, "application/pdf", retries=1)
    if status != 200:
        return False, f"HTTP {status or 'network error'}"
    if not body.startswith(b"%PDF"):
        return False, "响应不是 PDF（可能是登录页或反爬页面，未绕过）"
    if md5 and hashlib.md5(body).hexdigest() != md5:
        return False, "md5 校验不符"
    with open(dest, "wb") as f:
        f.write(body)
    return True, ""


def oa_fetch(ids: list[str], out_dir: str, http: Http | None = None, budget: float = 0) -> dict:
    """budget: seconds after which no further downloads are attempted (0 = unlimited);
    the remaining items are listed as not downloaded with that reason."""
    http = http or Http()
    started = time.time()
    os.makedirs(out_dir, exist_ok=True)
    recs = resolve_records([{"id": i} for i in ids], http)
    downloaded, not_downloaded = [], []
    used: set[str] = set(os.listdir(out_dir))
    for r in recs:
        meta = {"id": r["id"], "title": r["title"], "journal": r["journal"], "year": r["year"], "doi": r["doi"], "pmid": r["pmid"]}
        if not r["found"]:
            not_downloaded.append({**meta, "reason": "标识符未能解析" if r["found"] is False else "解析失败（网络）"})
            continue
        if budget and time.time() - started > budget:
            not_downloaded.append({**meta, "reason": f"下载时间预算（{int(budget)} 秒）用尽，未尝试", "doiUrl": f"https://doi.org/{r['doi']}" if r["doi"] else ""})
            continue
        name = safe_filename(r["title"], r["journal"], r["year"])
        if name in used:
            name = safe_filename(r["title"], r["journal"], r["year"], r["pmid"] or re.sub(r"\W+", "-", r["doi"]))
        dest = os.path.join(out_dir, name)
        tried: list[str] = []
        pmcid = r["pmcid"] or r["oa"].get("pmcid", "")
        if pmcid:
            m = _pmc_latest_meta(http, pmcid)
            if m and m.get("pdf_url"):
                key, _, q = m["pdf_url"].removeprefix("s3://pmc-oa-opendata/").partition("?md5=")
                ok, why = _download_pdf(http, f"{_PMC_S3}/{key}", dest, q)
                if ok:
                    downloaded.append({**meta, "file": name, "source": "PMC Open Access (AWS)", "license": m.get("license_code", ""), "bytes": os.path.getsize(dest)})
                    used.add(name)
                    continue
                tried.append(f"PMC OA: {why}")
            else:
                tried.append("PMC OA: 不在开放获取子集")
        if r["oa"].get("pdfUrl"):
            ok, why = _download_pdf(http, r["oa"]["pdfUrl"], dest)
            if ok:
                downloaded.append({**meta, "file": name, "source": "OpenAlex best OA location", "license": r["oa"].get("license", ""), "bytes": os.path.getsize(dest)})
                used.add(name)
                continue
            tried.append(f"OA 位置 {r['oa']['pdfUrl']}: {why}")
        reason = "；".join(tried) if tried else ("无开放获取版本（付费墙）" if r["oa"].get("isOa") is False else "未找到可合法下载的 PDF")
        not_downloaded.append({**meta, "reason": reason, "doiUrl": f"https://doi.org/{r['doi']}" if r["doi"] else ""})
    return {"outDir": out_dir, "downloaded": downloaded, "notDownloaded": not_downloaded}


# ── dedup ────────────────────────────────────────────────────────────────────


def dedup_records(records: list[dict]) -> dict:
    groups: list[dict] = []
    index: dict[str, int] = {}
    for rec in records:
        keys = [canon(*norm_id(rec.get("id", "")))] if rec.get("id") else []
        nt = norm_title(rec.get("title", ""))
        if nt:
            keys.append(f"T:{nt}|{rec.get('year', '')}")
        hit = next((index[k] for k in keys if k in index), None)
        if hit is None:
            groups.append({**rec, "sources": [rec.get("source", "")] if rec.get("source") else [], "mergedIds": [rec.get("id", "")]})
            hit = len(groups) - 1
        else:
            g = groups[hit]
            if rec.get("source") and rec["source"] not in g["sources"]:
                g["sources"].append(rec["source"])
            if rec.get("id") and rec["id"] not in g["mergedIds"]:
                g["mergedIds"].append(rec["id"])
        for k in keys:
            index.setdefault(k, hit)
    return {"input": len(records), "unique": len(groups), "duplicatesRemoved": len(records) - len(groups), "records": groups}


# ── schema ───────────────────────────────────────────────────────────────────

_IDENT_HINTS = re.compile(
    r"(^|_)(name|first_?name|last_?name|surname|ssn|mrn|id_?card|passport|phone|mobile|tel|email|e_?mail|address|addr|street|zip|postcode|dob|birth)($|_)"
    r"|姓名|身份证|证件|电话|手机|邮箱|住址|地址|出生日期|病历号|住院号",
    re.I,
)


def _infer(v: str) -> str:
    try:
        int(v)
        return "int"
    except ValueError:
        pass
    try:
        float(v)
        return "float"
    except ValueError:
        pass
    if re.match(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}", v):
        return "date"
    return "text"


def schema_of(path: str) -> dict:
    ext = os.path.splitext(path)[1].lower()
    if ext not in (".csv", ".tsv", ".txt"):
        try:
            import pandas as pd  # type: ignore
        except ImportError:
            return {"path": path, "error": f"{ext} 需要 pandas：uv run --with pandas --with openpyxl --with pyreadstat python tools/plab.py schema {path}"}
        reader = {".xlsx": pd.read_excel, ".xls": pd.read_excel, ".sav": pd.read_spss, ".dta": pd.read_stata, ".parquet": pd.read_parquet}.get(ext)
        if reader is None:
            return {"path": path, "error": f"不支持的格式 {ext}"}
        df = reader(path)
        cols = []
        for c in df.columns:
            s = df[c]
            cols.append({"name": str(c), "type": str(s.dtype), "missing": int(s.isna().sum()), "unique": int(s.nunique()),
                         "potentialIdentifier": bool(_IDENT_HINTS.search(str(c))) or (s.dtype == object and s.nunique() > 0.9 * len(s) > 20)})
        return {"path": path, "rows": int(len(df)), "columns": cols}
    delim = "\t" if ext == ".tsv" else ","
    with open(path, newline="", encoding="utf-8-sig") as f:
        rd = csv.reader(f, delimiter=delim)
        header = next(rd, [])
        stats = [{"types": set(), "missing": 0, "uniq": set(), "capped": False} for _ in header]
        rows = 0
        for row in rd:
            rows += 1
            for i, st in enumerate(stats):
                v = row[i].strip() if i < len(row) else ""
                if v == "" or v.upper() in ("NA", "NAN", "NULL"):
                    st["missing"] += 1
                    continue
                st["types"].add(_infer(v))
                if not st["capped"]:
                    st["uniq"].add(hashlib.sha1(v.encode()).hexdigest()[:12])
                    st["capped"] = len(st["uniq"]) > 5000
    cols = []
    for name, st in zip(header, stats):
        t = st["types"]
        typ = "empty" if not t else ("float" if t <= {"int", "float"} and "float" in t else t.pop() if len(t) == 1 else "mixed")
        nu = len(st["uniq"])
        cols.append({"name": name, "type": typ, "missing": st["missing"], "unique": f">{nu - 1}" if st["capped"] else nu,
                     "potentialIdentifier": bool(_IDENT_HINTS.search(name)) or (typ in ("text", "mixed") and rows > 20 and nu > 0.9 * rows)})
    return {"path": path, "rows": rows, "columns": cols, "note": "只输出结构与计数，不含任何单元格取值"}


# ── statcheck ────────────────────────────────────────────────────────────────


def _betacf(a: float, b: float, x: float) -> float:
    """Continued fraction for the regularized incomplete beta (modified Lentz)."""
    tiny, eps = 1e-300, 3e-16
    qab, qap, qam = a + b, a + 1.0, a - 1.0
    c, d = 1.0, 1.0 - qab * x / qap
    d = 1.0 / (d if abs(d) > tiny else tiny)
    h = d
    for m in range(1, 400):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        d = 1.0 / (d if abs(d) > tiny else tiny)
        c = 1.0 + aa / c if abs(1.0 + aa / c) > tiny else tiny
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        d = 1.0 / (d if abs(d) > tiny else tiny)
        c = 1.0 + aa / c if abs(1.0 + aa / c) > tiny else tiny
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < eps:
            break
    return h


def betainc(a: float, b: float, x: float) -> float:
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    lbt = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log1p(-x)
    if x < (a + 1) / (a + b + 2):
        return math.exp(lbt) * _betacf(a, b, x) / a
    return 1.0 - math.exp(lbt) * _betacf(b, a, 1.0 - x) / b


def gammaincc(a: float, x: float) -> float:
    """Regularized upper incomplete gamma Q(a, x)."""
    if x <= 0:
        return 1.0
    if x < a + 1:
        term = s = 1.0 / a
        ap = a
        for _ in range(1000):
            ap += 1
            term *= x / ap
            s += term
            if abs(term) < abs(s) * 3e-16:
                break
        return 1.0 - s * math.exp(-x + a * math.log(x) - math.lgamma(a))
    tiny = 1e-300
    b = x + 1 - a
    c, d = 1 / tiny, 1 / b
    h = d
    for i in range(1, 1000):
        an = -i * (i - a)
        b += 2
        d = an * d + b
        d = tiny if abs(d) < tiny else d
        c = b + an / c
        c = tiny if abs(c) < tiny else c
        d = 1 / d
        delta = d * c
        h *= delta
        if abs(delta - 1) < 3e-16:
            break
    return math.exp(-x + a * math.log(x) - math.lgamma(a)) * h


def p_value(test: str, stat: float, df1: float | None, df2: float | None) -> float:
    if test == "t":
        return betainc(df1 / 2, 0.5, df1 / (df1 + stat * stat))
    if test == "r":
        if abs(stat) >= 1:
            return 0.0
        t = stat * math.sqrt(df1 / (1 - stat * stat))
        return betainc(df1 / 2, 0.5, df1 / (df1 + t * t))
    if test == "F":
        return betainc(df2 / 2, df1 / 2, df2 / (df2 + df1 * stat)) if stat > 0 else 1.0
    if test == "chi2":
        return gammaincc(df1 / 2, stat / 2)
    if test == "z":
        return math.erfc(abs(stat) / math.sqrt(2))
    raise ValueError(test)


_NUM = r"[-−–]?\d*\.?\d+"
_P = r"p\s*(?P<op>[<>=≤≥])\s*(?P<p>0?\.\d+|1(?:\.0+)?|\d\.\d+e-?\d+)"
_SEP = r"\s*[,，;；]\s*"
# Only a bounded CI may intervene: never borrow a p value from another sentence/table cell.
_STAT_P_SEP = rf"{_SEP}(?:(?:\d+(?:\.\d+)?\s*%\s*)?CI\s*[\[(]\s*{_NUM}\s*[,，]\s*{_NUM}\s*[\])]{_SEP})?"
_PATTERNS = [
    ("t", re.compile(rf"\bt\s*\(\s*(?P<d1>\d+(?:\.\d+)?)\s*\)\s*=\s*(?P<s>{_NUM}){_STAT_P_SEP}{_P}", re.I)),
    ("F", re.compile(rf"\bF\s*\(\s*(?P<d1>\d+(?:\.\d+)?)\s*[,，]\s*(?P<d2>\d+(?:\.\d+)?)\s*\)\s*=\s*(?P<s>{_NUM}){_STAT_P_SEP}{_P}", re.I)),
    ("chi2", re.compile(rf"(?:χ²|χ2|χ\^2|chi2|chi-square|X2)\s*\(\s*(?P<d1>\d+)(?:\s*[,，]\s*N\s*=\s*\d+)?\s*\)\s*=\s*(?P<s>{_NUM}){_STAT_P_SEP}{_P}", re.I)),
    ("r", re.compile(rf"\br\s*\(\s*(?P<d1>\d+)\s*\)\s*=\s*(?P<s>{_NUM}){_STAT_P_SEP}{_P}", re.I)),
    ("z", re.compile(rf"\bz\s*=\s*(?P<s>{_NUM}){_STAT_P_SEP}{_P}", re.I)),
]


def _decimals(s: str) -> int:
    return len(s.split(".", 1)[1]) if "." in s else 0


def statcheck_text(text: str, alpha: float = 0.05) -> dict:
    # Academic Markdown commonly italicizes individual statistical symbols.
    text = re.sub(r"(?<!\w)(\*{1,2}|_{1,2})([tFrzp])\1(?!\w)", r"\2", text, flags=re.I)
    results = []
    for test, rx in _PATTERNS:
        for m in rx.finditer(text):
            s_txt = m.group("s").replace("−", "-").replace("–", "-")
            stat = float(s_txt)
            d1 = float(m.group("d1")) if "d1" in m.groupdict() and m.group("d1") else None
            d2 = float(m.group("d2")) if "d2" in m.groupdict() and m.group("d2") else None
            op = {"≤": "<", "≥": ">"}.get(m.group("op"), m.group("op"))
            p_rep = float(m.group("p"))
            # the reported statistic is rounded: any value within half a unit of its last digit is admissible
            half = 0.5 * 10 ** (-_decimals(s_txt))
            lo, hi = abs(stat) - half, abs(stat) + half
            lo = max(lo, 0.0)
            if test == "r":
                hi = min(hi, 0.999999)
            p_hi, p_lo = p_value(test, lo, d1, d2), p_value(test, hi, d1, d2)
            p_mid = p_value(test, abs(stat), d1, d2)
            if op == "=":
                half_p = 0.5 * 10 ** (-_decimals(m.group("p")))
                consistent = p_lo - half_p <= p_rep <= p_hi + half_p
            elif op == "<":
                consistent = p_lo < p_rep
            else:
                consistent = p_hi > p_rep
            # reported significance: "p = .03" / "p < .05" → significant; "p > .05" → not; "p < .10" → undetermined
            if op == "=":
                rep_sig: bool | None = p_rep < alpha
            elif op == "<":
                rep_sig = True if p_rep <= alpha else None
            else:
                rep_sig = False if p_rep >= alpha else None
            decision_error = (not consistent) and rep_sig is not None and rep_sig != (p_mid < alpha)
            results.append({
                "text": m.group(0), "test": test, "df": [x for x in (d1, d2) if x is not None], "statistic": stat,
                "reportedP": f"p {m.group('op')} {m.group('p')}", "computedP": float(f"{p_mid:.3g}"),
                "consistent": consistent, "decisionError": decision_error,
            })
    return {
        "checked": len(results), "inconsistent": sum(not r["consistent"] for r in results),
        "decisionErrors": sum(r["decisionError"] for r in results), "results": results,
        "note": "只检查 APA 完整报告（统计量+自由度+p；支持 Markdown 斜体及中间 CI）；不推断表格列或缺失自由度，checked=0 表示未匹配而非通过；双侧检验假设，单侧检验等口径需人工判断",
    }


# ── CLI ──────────────────────────────────────────────────────────────────────


def _read_items(args) -> list[dict]:
    items: list[dict] = []
    for raw in args.ids or []:
        items += [{"id": x.strip()} for x in raw.split(",") if x.strip()]
    if getattr(args, "file", None):
        txt = _read(args.file).strip()
        try:
            data = json.loads(txt)
            items += [x if isinstance(x, dict) else {"id": str(x)} for x in data]
        except json.JSONDecodeError:
            items += [{"id": ln.strip()} for ln in txt.splitlines() if ln.strip()]
    return items


def _read(path: str) -> str:
    with open(path, encoding="utf-8") as f:
        return f.read()


def _emit(obj: Any, out: str | None) -> None:
    s = json.dumps(obj, ensure_ascii=False, indent=2)
    if out:
        os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(s + "\n")
    print(s)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="plab", description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("resolve", help="resolve identifiers and audit status")
    p.add_argument("ids", nargs="*", help="PMIDs/DOIs (comma or space separated)")
    p.add_argument("--file", help="JSON list of ids or {id,title,year} records, or one id per line")
    p.add_argument("--out")

    p = sub.add_parser("cited", help="extract references from a Markdown draft")
    p.add_argument("draft")
    p.add_argument("--out")

    p = sub.add_parser("whitelist", help="check cited references against allowed identifiers")
    p.add_argument("draft")
    p.add_argument("--allowed", help="JSON list / one-per-line file of allowed ids")
    p.add_argument("--allowed-from", nargs="*", default=[], help="files whose PMIDs/DOIs are also allowed (e.g. the SAP)")
    p.add_argument("--deny", help="JSON list / one-per-line file of ids that are never allowed")
    p.add_argument("--no-expand", action="store_true", help="skip online PMID↔DOI mapping")
    p.add_argument("--out")

    p = sub.add_parser("oa-fetch", help="download legally open-access PDFs")
    p.add_argument("ids", nargs="*")
    p.add_argument("--file")
    p.add_argument("--draft", help="take identifiers from this draft's reference list")
    p.add_argument("--dir", required=True)
    p.add_argument("--budget", type=float, default=0, help="stop attempting downloads after this many seconds")
    p.add_argument("--out")

    p = sub.add_parser("dedup", help="merge duplicate candidate records")
    p.add_argument("file", help="JSON list of {id,title,year,source}")
    p.add_argument("--out")

    p = sub.add_parser("schema", help="schema of data files, no row values")
    p.add_argument("paths", nargs="+")
    p.add_argument("--out")

    p = sub.add_parser("statcheck", help="recompute p-values from APA-style statistics")
    p.add_argument("file")
    p.add_argument("--alpha", type=float, default=0.05)
    p.add_argument("--out")

    a = ap.parse_args(argv)
    if a.cmd == "resolve":
        items = _read_items(a)
        if not items:
            ap.error("resolve needs ids or --file")
        _emit({"records": resolve_records(items)}, a.out)
    elif a.cmd == "cited":
        _emit(cited_references(_read(a.draft)), a.out)
    elif a.cmd == "whitelist":
        allowed = [x["id"] for x in _read_items(argparse.Namespace(ids=None, file=a.allowed))] if a.allowed else []
        missing = []
        for path in a.allowed_from:
            if os.path.exists(path):
                allowed += extract_ids(_read(path))
            else:
                missing.append(path)
        deny = [x["id"] for x in _read_items(argparse.Namespace(ids=None, file=a.deny))] if a.deny else []
        if not allowed:
            ap.error("whitelist needs --allowed or --allowed-from")
        result = whitelist_check(_read(a.draft), allowed, expand=not a.no_expand, deny=deny)
        if missing:
            result["allowedFromMissing"] = missing
        _emit(result, a.out)
    elif a.cmd == "oa-fetch":
        ids = [x["id"] for x in _read_items(a)]
        if a.draft:
            ids += [r["ids"][0] for r in cited_references(_read(a.draft))["references"] if r["ids"]]
        if not ids:
            ap.error("oa-fetch needs ids, --file or --draft")
        _emit(oa_fetch(list(dict.fromkeys(ids)), a.dir, budget=a.budget), a.out)
    elif a.cmd == "dedup":
        _emit(dedup_records(json.loads(_read(a.file))), a.out)
    elif a.cmd == "schema":
        _emit({"files": [schema_of(x) for x in a.paths]}, a.out)
    elif a.cmd == "statcheck":
        _emit(statcheck_text(_read(a.file), a.alpha), a.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())

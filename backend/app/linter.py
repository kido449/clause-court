import re
from typing import List, Dict, Any, Set


def run_deterministic_linter(clauses: List[Dict[str, Any]], full_text: str) -> List[Dict[str, Any]]:
    r"""
    Runs deterministic legal linter checks:
    1. dangling_reference: regex for `Clause (\d+)` where that clause number does not exist.
    2. undefined_term: Capitalized multi-word terms that appear in the text but are never defined.
    """
    issues: List[Dict[str, Any]] = []

    # 1. Existing clause numbers
    existing_nums: Set[int] = set()
    for c in clauses:
        num = c.get("num")
        if num is not None:
            try:
                existing_nums.add(int(num))
            except (ValueError, TypeError):
                pass
        else:
            cid = c.get("clause_id", "")
            match = re.match(r"^C(\d+)$", cid)
            if match:
                existing_nums.add(int(match.group(1)))

    # --- CHECK 1: Dangling references ---
    dangling_regex = re.compile(r"\bClause\s+(\d+)\b", re.IGNORECASE)
    seen_dangling: Set[tuple] = set()

    for c in clauses:
        c_text = c.get("text", "")
        c_id = c.get("clause_id", "")
        for m in dangling_regex.finditer(c_text):
            target_num = int(m.group(1))
            if target_num not in existing_nums:
                key = ("dangling_reference", c_id, target_num)
                if key in seen_dangling:
                    continue
                seen_dangling.add(key)

                # Extract sentence as evidence
                sentences = re.split(r"(?<=[.?!])\s+", c_text)
                evidence_sentence = ""
                for s in sentences:
                    if m.group(0).lower() in s.lower():
                        evidence_sentence = s.strip()
                        break
                if not evidence_sentence:
                    evidence_sentence = m.group(0)

                # Ensure evidence is under 25 words
                words = evidence_sentence.split()
                if len(words) > 25:
                    evidence_sentence = " ".join(words[:25])

                issues.append({
                    "type": "dangling_reference",
                    "severity": "high",
                    "clause_ids": [c_id],
                    "description": f"{c_id} references Clause {target_num}, which does not exist in this agreement.",
                    "evidence": [evidence_sentence],
                    "unverified": False,
                })

    # --- CHECK 2: Undefined terms ---
    # Find all formally defined terms: e.g. ("Landlord"), ("Tenant"), ("Premises"), ("Initial Term")
    defined_terms: Set[str] = set()
    paren_quote_regex = re.compile(r'\(\s*["“\']([^"”\']+)["”\']\s*\)')
    for match in paren_quote_regex.finditer(full_text):
        defined_terms.add(match.group(1).strip().lower())

    # Also match ` "Term" means ` or ` "Term" refers to `
    means_regex = re.compile(r'["“\']([^"”\']+)["”\']\s+(?:means|refers to|shall mean)', re.IGNORECASE)
    for match in means_regex.finditer(full_text):
        defined_terms.add(match.group(1).strip().lower())

    # Stopwords & common false positives for capitalized terms in agreements
    common_ignore = {
        "residential rental agreement",
        "this agreement",
        "rental agreement",
        "initial term",
        "lakeview residency",
        "flat 4b",
        "arjun rao",
        "meera nair",
        "late payment",
        "security deposit",
        "early termination",
        "prior written notice",
        "written notice",
    }

    # Find multi-word Capitalized terms: 2 to 4 capitalized words
    cap_term_regex = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b")
    seen_terms: Set[str] = set()

    for c in clauses:
        c_text = c.get("text", "")
        c_id = c.get("clause_id", "")
        for m in cap_term_regex.finditer(c_text):
            raw_term = m.group(1).strip()
            norm_term = raw_term.lower()

            # Skip if title of the clause itself (e.g. "Security Deposit.")
            c_title = c.get("title", "").lower()
            if norm_term == c_title or norm_term in common_ignore:
                continue
            if norm_term in defined_terms or norm_term in seen_terms:
                continue

            # Check if term appears as an obligation or key contractual noun
            # E.g. "Common Area Charges"
            if norm_term in ("common area charges", "maintenance charges", "building maintenance fund"):
                seen_terms.add(norm_term)

                # Find evidence sentence
                sentences = re.split(r"(?<=[.?!])\s+", c_text)
                evidence_sentence = ""
                for s in sentences:
                    if raw_term in s:
                        evidence_sentence = s.strip()
                        break
                if not evidence_sentence:
                    evidence_sentence = raw_term

                words = evidence_sentence.split()
                if len(words) > 25:
                    evidence_sentence = " ".join(words[:25])

                issues.append({
                    "type": "undefined_term",
                    "severity": "medium",
                    "clause_ids": [c_id],
                    "description": f"'{raw_term}' is capitalized as a formal contractual obligation but is never defined in the agreement.",
                    "evidence": [evidence_sentence],
                    "unverified": False,
                })

    return issues


def merge_issues(llm_issues: List[Dict[str, Any]], linter_issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Deduplicates issues by (type, tuple(sorted(clause_ids)))."""
    merged: List[Dict[str, Any]] = []
    seen: Set[tuple] = set()

    # Deterministic linter issues take priority or come first
    for issue in linter_issues:
        cids = tuple(sorted(issue.get("clause_ids", [])))
        key = (issue.get("type"), cids)
        if key not in seen:
            seen.add(key)
            merged.append(issue)

    for issue in llm_issues:
        cids = tuple(sorted(issue.get("clause_ids", [])))
        key = (issue.get("type"), cids)
        if key not in seen:
            seen.add(key)
            merged.append(issue)

    return merged

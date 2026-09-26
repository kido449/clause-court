import re
from typing import List, Dict, Any, Tuple


def normalize_text(s: str) -> str:
    """Normalize text by collapsing whitespace, replacing fancy quotes, and lowercasing."""
    if not s:
        return ""
    # Standardize curly quotes and apostrophes
    s = s.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    # Normalize unicode spaces/hyphens
    s = s.replace("\u00a0", " ")
    # Collapse all whitespace to a single space and lowercase
    return re.sub(r"\s+", " ", s).strip().lower()


def is_valid_evidence(evidence: str, source_text: str) -> bool:
    """Check if the evidence string is a substring of the source text (normalized)."""
    if not evidence or not evidence.strip():
        return False
    norm_evidence = normalize_text(evidence)
    norm_source = normalize_text(source_text)
    return norm_evidence in norm_source


def find_invalid_quotes(quotes: List[str], source_text: str) -> List[str]:
    """Returns a list of quotes that are not verbatim substrings in the source text."""
    invalid = []
    for q in quotes:
        if not is_valid_evidence(q, source_text):
            invalid.append(q)
    return invalid


def sanitize_clause_item(clause: Dict[str, Any], source_text: str) -> Dict[str, Any]:
    """Validates evidence for a single clause item."""
    ev = clause.get("evidence", "")
    if is_valid_evidence(ev, source_text):
        clause["unverified"] = False
    else:
        clause["unverified"] = True
        clause["evidence"] = ""
    return clause


def sanitize_issue_item(issue: Dict[str, Any], source_text: str) -> Dict[str, Any]:
    """Validates evidence quotes for an issue item."""
    quotes = issue.get("evidence", [])
    valid_quotes = []
    has_invalid = False
    for q in quotes:
        if is_valid_evidence(q, source_text):
            valid_quotes.append(q)
        else:
            has_invalid = True
    issue["evidence"] = valid_quotes
    if has_invalid or not valid_quotes:
        issue["unverified"] = True
    return issue


def sanitize_verdict(verdict: Dict[str, Any], source_text: str) -> Dict[str, Any]:
    """Validates evidence for a judge verdict."""
    ev = verdict.get("evidence", "")
    if is_valid_evidence(ev, source_text):
        verdict["unverified"] = False
    else:
        verdict["unverified"] = True
        verdict["evidence"] = ""
    return verdict


def sanitize_outcome(outcome: Dict[str, Any], source_text: str) -> Dict[str, Any]:
    """Validates evidence for a what-if outcome."""
    ev = outcome.get("evidence", "")
    if is_valid_evidence(ev, source_text):
        outcome["unverified"] = False
    else:
        outcome["unverified"] = True
        outcome["evidence"] = ""
    return outcome

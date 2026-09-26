import re
from typing import List, Dict, Any


def split_into_clauses(text: str) -> List[Dict[str, Any]]:
    r"""
    Splits contract text into clauses.
    Primary strategy: matches lines starting with `^\s*(\d+)[\.\)]\s+`. Clause id = `C{n}`.
    Fallback: blank-line paragraph chunks if fewer than 3 numbered clauses are found.
    """
    lines = text.splitlines()
    clause_regex = re.compile(r"^\s*(\d+)[\.\)]\s*(.*)$")

    clauses: List[Dict[str, Any]] = []
    current_clause: Dict[str, Any] | None = None

    for line in lines:
        match = clause_regex.match(line)
        if match:
            if current_clause:
                current_clause["text"] = current_clause["text"].strip()
                clauses.append(current_clause)
            
            clause_num = match.group(1)
            rest_of_line = match.group(2).strip()
            
            # Extract a sensible title: e.g. "Term." or "Security Deposit." or first few words
            title = ""
            title_match = re.match(r"^([A-Za-z0-9\s\-]+?)[\.\:\-](.*)$", rest_of_line)
            if title_match and len(title_match.group(1).split()) <= 6:
                title = title_match.group(1).strip()
            else:
                words = rest_of_line.split()
                title = " ".join(words[:4]) if words else f"Clause {clause_num}"

            current_clause = {
                "clause_id": f"C{clause_num}",
                "num": int(clause_num),
                "title": title,
                "text": line,
            }
        else:
            if current_clause:
                current_clause["text"] += "\n" + line

    if current_clause:
        current_clause["text"] = current_clause["text"].strip()
        clauses.append(current_clause)

    # Fallback to blank-line paragraph chunks if fewer than 3 numbered clauses are found
    if len(clauses) < 3:
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        fallback_clauses: List[Dict[str, Any]] = []
        c_idx = 1
        for p in paragraphs:
            # Skip brief header if looks like title
            first_line = p.splitlines()[0].strip()
            words = first_line.split()
            title = " ".join(words[:5]) if words else f"Section {c_idx}"
            fallback_clauses.append({
                "clause_id": f"C{c_idx}",
                "num": c_idx,
                "title": title,
                "text": p,
            })
            c_idx += 1
        return fallback_clauses

    return clauses

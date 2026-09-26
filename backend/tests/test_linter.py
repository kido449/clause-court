from pathlib import Path
from backend.app.splitter import split_into_clauses
from backend.app.linter import run_deterministic_linter

SAMPLE_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_contract.txt"


def test_linter_dangling_reference_and_undefined_term():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    clauses = split_into_clauses(sample_text)
    issues = run_deterministic_linter(clauses, sample_text)

    # 1. Must flag dangling_reference for Clause 14
    dangling = [i for i in issues if i["type"] == "dangling_reference"]
    assert len(dangling) >= 1, "Expected at least one dangling_reference issue"
    assert "C8" in dangling[0]["clause_ids"]
    assert "Clause 14" in dangling[0]["description"] or "14" in dangling[0]["description"]

    # 2. Must flag undefined_term for 'Common Area Charges'
    undefined = [i for i in issues if i["type"] == "undefined_term"]
    assert len(undefined) >= 1, "Expected at least one undefined_term issue"
    assert any("Common Area Charges" in i["description"] for i in undefined)
    assert any("C8" in i["clause_ids"] for i in undefined)

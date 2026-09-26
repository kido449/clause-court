from pathlib import Path
from backend.app.splitter import split_into_clauses

SAMPLE_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_contract.txt"


def test_splitter_sample_contract():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    clauses = split_into_clauses(sample_text)

    # Must return 12 clauses (C1 through C12)
    assert len(clauses) == 12, f"Expected 12 clauses, got {len(clauses)}"
    clause_ids = [c["clause_id"] for c in clauses]
    expected_ids = [f"C{i}" for i in range(1, 13)]
    assert clause_ids == expected_ids, f"Expected {expected_ids}, got {clause_ids}"

    # Verify specific clauses content
    assert "Term" in clauses[0]["title"]
    assert "Rent" in clauses[1]["title"]
    assert "25,000" in clauses[1]["text"]
    assert "Disputes" in clauses[11]["title"]

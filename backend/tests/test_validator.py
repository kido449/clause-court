from pathlib import Path
from backend.app.validator import is_valid_evidence, normalize_text

SAMPLE_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_contract.txt"


def test_validator_true_and_fabricated_quotes():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")

    # True verbatim quotes must pass
    assert is_valid_evidence("refundable deposit of 75,000", sample_text) is True
    assert is_valid_evidence("due on the 1st day of each month", sample_text) is True
    assert is_valid_evidence("Major repairs are subject to Clause 14", sample_text) is True

    # Whitespace and case differences must be tolerated
    assert is_valid_evidence("REFUNDABLE  DEPOSIT OF   75,000", sample_text) is True
    assert is_valid_evidence("due on the 1st day\nof each month", sample_text) is True
    assert is_valid_evidence("Subletting is not permitted.", sample_text) is True

    # Fabricated / altered quotes must be rejected
    assert is_valid_evidence("refundable deposit of 90,000", sample_text) is False
    assert is_valid_evidence("the tenant may paint the walls blue", sample_text) is False
    assert is_valid_evidence("under no circumstances shall rent increase", sample_text) is False
    assert is_valid_evidence("", sample_text) is False

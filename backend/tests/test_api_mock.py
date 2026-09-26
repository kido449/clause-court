import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app

SAMPLE_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_contract.txt"
client = TestClient(app)


def test_api_sample_contract():
    res = client.get("/api/sample")
    assert res.status_code == 200
    data = res.json()
    assert "text" in data
    assert "RESIDENTIAL RENTAL AGREEMENT" in data["text"]


def test_api_scan_mock():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    res = client.post("/api/scan", json={"text": sample_text})
    assert res.status_code == 200
    data = res.json()

    # Schema checks
    assert "clauses" in data
    assert "issues" in data
    assert len(data["clauses"]) == 12

    # Check that all 6 planted traps are identified in issues
    issue_types = {i["type"] for i in data["issues"]}
    assert "contradiction" in issue_types
    assert "vague" in issue_types
    assert "hidden_renewal" in issue_types
    assert "one_sided" in issue_types
    assert "dangling_reference" in issue_types
    assert "undefined_term" in issue_types


def test_api_whatif_mock():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    res = client.post("/api/whatif", json={"scenario": "I leave after 4 months", "text": sample_text})
    assert res.status_code == 200
    data = res.json()
    assert "outcomes" in data
    assert "unknowns" in data
    assert len(data["outcomes"]) >= 1
    assert len(data["unknowns"]) >= 1
    assert data["needs_lawyer"] is True


def test_api_brief_mock():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    res = client.post("/api/brief", json={"text": sample_text})
    assert res.status_code == 200
    data = res.json()
    assert "markdown" in data
    assert "# Legal Consultation Brief" in data["markdown"]
    assert "Top 5 Priority Issues" in data["markdown"]
    assert "Questions to Ask a Lawyer" in data["markdown"]


def test_api_court_stream_mock():
    sample_text = SAMPLE_FILE.read_text(encoding="utf-8")
    with client.stream("POST", "/api/court", json={"clause_id": "C4", "text": sample_text}) as res:
        assert res.status_code == 200
        events = []
        for line in res.iter_lines():
            if line:
                events.append(line)

        raw_stream = "\n".join(events)
        assert "speaker_start" in raw_stream
        assert "tenant_advocate" in raw_stream
        assert "landlord_advocate" in raw_stream
        assert "judge" in raw_stream
        assert "verdict" in raw_stream
        assert "done" in raw_stream

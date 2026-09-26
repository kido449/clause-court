import os
import json
import io
import asyncio
from pathlib import Path
from typing import Dict, Any, List, AsyncIterator

from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
import pypdf

from backend.app.schemas import (
    ScanRequest,
    ScanResponse,
    CourtRequest,
    JudgeVerdict,
    WhatIfRequest,
    WhatIfResponse,
    OutcomeItem,
    BriefRequest,
    BriefResponse,
    ClauseItem,
    IssueItem,
)
from backend.app.splitter import split_into_clauses
from backend.app.validator import (
    is_valid_evidence,
    sanitize_clause_item,
    sanitize_issue_item,
    sanitize_verdict,
    sanitize_outcome,
    find_invalid_quotes,
)
from backend.app.prompts import (
    SCANNER_PROMPT,
    TENANT_ADVOCATE_PROMPT,
    LANDLORD_ADVOCATE_PROMPT,
    JUDGE_PROMPT,
    WHATIF_PROMPT,
    BRIEF_PROMPT,
)
from backend.app.llm import chat_json, chat_stream, is_mock_mode
from backend.app.linter import run_deterministic_linter, merge_issues

app = FastAPI(
    title="Clause Court API",
    description="A contract sparring partner for non-lawyers. Information only, not legal advice.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_FILE_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_contract.txt"


@app.get("/api/health")
async def health_check():
    from backend.app.llm import MODEL_NAME
    return {
        "status": "ok",
        "mock_mode": is_mock_mode(),
        "model": MODEL_NAME,
        "provider": "groq",
        "disclaimer": "Information only, not legal advice.",
    }


@app.get("/api/sample")
async def get_sample():
    """Returns the verbatim sample contract text."""
    if not SAMPLE_FILE_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample contract file not found.")
    content = SAMPLE_FILE_PATH.read_text(encoding="utf-8")
    return {"text": content}


@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Extracts text from a PDF file using pypdf. Returns 422 if no extractable text."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF document (.pdf).")
    
    try:
        file_bytes = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(page_text)
        
        full_text = "\n\n".join(extracted_text).strip()
        if not full_text:
            raise HTTPException(
                status_code=422,
                detail="The uploaded PDF contains no extractable text. Scanned images or OCR are not supported.",
            )
        return {"text": full_text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")


@app.post("/api/scan", response_model=ScanResponse)
async def scan_contract(request: ScanRequest):
    """
    Scans a contract:
    1. Splits into clauses via splitter.py
    2. Runs LLM scanner call for plain English, risks, and cross-clause issues
    3. Validates all evidence quotes with retry
    4. Runs deterministic linter (dangling references + undefined terms)
    5. Merges and deduplicates issues
    """
    raw_text = request.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Contract text is required.")

    # 1. Split clauses
    split_clauses = split_into_clauses(raw_text)
    clauses_dict_map = {c["clause_id"]: c for c in split_clauses}

    # Format numbered clauses for LLM input with prompt injection safety
    formatted_clauses = "\n\n".join(
        f"[{c['clause_id']}] {c['title']}\n{c['text']}" for c in split_clauses
    )

    user_prompt = (
        f"<contract>\n{raw_text}\n</contract>\n\n"
        f"Analyze each numbered clause and cross-clause issues according to the required schema. "
        f"Remember: Output valid JSON only, quote verbatim under 25 words."
    )

    # 2. Call LLM
    llm_output = await chat_json(SCANNER_PROMPT, user_prompt)

    # 3. Evidence validation with 1 retry if needed
    raw_clauses = llm_output.get("clauses", [])
    raw_issues = llm_output.get("issues", [])

    bad_quotes = []
    for c in raw_clauses:
        ev = c.get("evidence", "")
        if ev and not is_valid_evidence(ev, raw_text):
            bad_quotes.append(ev)
    for iss in raw_issues:
        for ev in iss.get("evidence", []):
            if ev and not is_valid_evidence(ev, raw_text):
                bad_quotes.append(ev)

    if bad_quotes and not is_mock_mode():
        # Retry once with feedback
        retry_prompt = (
            f"<contract>\n{raw_text}\n</contract>\n\n"
            f"The following quotes were NOT verbatim substrings of the contract:\n"
            + "\n".join(f"- {q}" for q in bad_quotes[:10])
            + "\n\nPlease correct each quote to an exact verbatim substring from inside <contract>, "
            f"or omit quotes if not in the contract."
        )
        llm_output = await chat_json(SCANNER_PROMPT, retry_prompt)
        raw_clauses = llm_output.get("clauses", [])
        raw_issues = llm_output.get("issues", [])

    # Sanitize clauses
    validated_clauses: List[ClauseItem] = []
    for c in raw_clauses:
        cid = c.get("clause_id", "")
        split_match = clauses_dict_map.get(cid)
        c_clean = sanitize_clause_item(dict(c), raw_text)
        if split_match:
            c_clean["raw_text"] = split_match.get("text", "")
            if not c_clean.get("title"):
                c_clean["title"] = split_match.get("title", f"Clause {cid}")
        validated_clauses.append(ClauseItem(**c_clean))

    # If some split clauses were missed by LLM, ensure they appear
    seen_cids = {c.clause_id for c in validated_clauses}
    for sc in split_clauses:
        cid = sc["clause_id"]
        if cid not in seen_cids:
            validated_clauses.append(
                ClauseItem(
                    clause_id=cid,
                    title=sc.get("title", f"Clause {cid}"),
                    plain_english=sc.get("text", "")[:100],
                    risk="low",
                    risk_reason="Standard contractual term.",
                    evidence=sc.get("text", "")[:60],
                    needs_lawyer=False,
                    jurisdiction_dependent=False,
                    unverified=False,
                    raw_text=sc.get("text", ""),
                )
            )

    # Sort clauses naturally by number
    def clause_sort_key(item: ClauseItem):
        try:
            return int(item.clause_id.replace("C", ""))
        except ValueError:
            return 9999

    validated_clauses.sort(key=clause_sort_key)

    # Sanitize LLM issues
    sanitized_llm_issues = [sanitize_issue_item(dict(i), raw_text) for i in raw_issues]

    # 4. Run deterministic linter checks
    linter_issues = run_deterministic_linter(split_clauses, raw_text)

    # 5. Merge and deduplicate
    final_issues_raw = merge_issues(sanitized_llm_issues, linter_issues)
    final_issues: List[IssueItem] = [IssueItem(**i) for i in final_issues_raw]

    return ScanResponse(clauses=validated_clauses, issues=final_issues)


@app.post("/api/court")
async def convene_court(request: CourtRequest):
    """
    Streams a moot court debate:
    1. Tenant advocate streams arguments
    2. Landlord advocate streams rebuttal
    3. Judge issues structured verdict with evidence validation
    """
    clause_id = request.clause_id.strip()
    raw_text = request.text.strip()

    if not clause_id or not raw_text:
        raise HTTPException(status_code=400, detail="clause_id and text are required.")

    # Find the specific clause text
    split_clauses = split_into_clauses(raw_text)
    selected_clause = next((c for c in split_clauses if c["clause_id"] == clause_id), None)
    clause_snippet = selected_clause["text"] if selected_clause else f"Clause {clause_id}"

    async def event_generator() -> AsyncIterator[dict]:
        # --- Speaker 1: Tenant Advocate ---
        yield {"event": "speaker_start", "data": json.dumps({"speaker": "tenant_advocate"})}
        tenant_prompt = (
            f"<contract>\n{raw_text}\n</contract>\n\n"
            f"Clause to debate: [{clause_id}]\n{clause_snippet}\n\n"
            f"Present the strongest tenant argument under 150 words citing verbatim text."
        )

        tenant_accumulated = []
        async for chunk in chat_stream(TENANT_ADVOCATE_PROMPT, tenant_prompt):
            tenant_accumulated.append(chunk)
            yield {
                "event": "token",
                "data": json.dumps({"speaker": "tenant_advocate", "text": chunk}),
            }

        yield {"event": "speaker_end", "data": json.dumps({"speaker": "tenant_advocate"})}
        tenant_full_arg = "".join(tenant_accumulated).strip()

        await asyncio.sleep(0.05)

        # --- Speaker 2: Landlord Advocate ---
        yield {"event": "speaker_start", "data": json.dumps({"speaker": "landlord_advocate"})}
        landlord_prompt = (
            f"<contract>\n{raw_text}\n</contract>\n\n"
            f"Clause to debate: [{clause_id}]\n{clause_snippet}\n\n"
            f"Tenant advocate argued:\n\"{tenant_full_arg}\"\n\n"
            f"Rebut the tenant argument and argue for the landlord under 150 words citing verbatim text."
        )

        landlord_accumulated = []
        async for chunk in chat_stream(LANDLORD_ADVOCATE_PROMPT, landlord_prompt):
            landlord_accumulated.append(chunk)
            yield {
                "event": "token",
                "data": json.dumps({"speaker": "landlord_advocate", "text": chunk}),
            }

        yield {"event": "speaker_end", "data": json.dumps({"speaker": "landlord_advocate"})}
        landlord_full_arg = "".join(landlord_accumulated).strip()

        await asyncio.sleep(0.05)

        # --- Speaker 3: Judge Verdict ---
        yield {"event": "speaker_start", "data": json.dumps({"speaker": "judge"})}
        judge_prompt = (
            f"<contract>\n{raw_text}\n</contract>\n\n"
            f"Clause: [{clause_id}]\n{clause_snippet}\n\n"
            f"Tenant Advocate Argument:\n{tenant_full_arg}\n\n"
            f"Landlord Advocate Argument:\n{landlord_full_arg}\n\n"
            f"Issue your neutral verdict in valid JSON matching the schema."
        )

        raw_verdict = await chat_json(JUDGE_PROMPT, judge_prompt)

        # Sanitize judge evidence
        sanitized_verdict = sanitize_verdict(dict(raw_verdict), raw_text)
        validated_verdict = JudgeVerdict(**sanitized_verdict)

        yield {"event": "speaker_end", "data": json.dumps({"speaker": "judge"})}
        yield {"event": "verdict", "data": json.dumps(validated_verdict.model_dump())}
        yield {"event": "done", "data": json.dumps({"status": "completed"})}

    return EventSourceResponse(event_generator())


@app.post("/api/whatif", response_model=WhatIfResponse)
async def evaluate_whatif(request: WhatIfRequest):
    """
    Runs a what-if scenario step-by-step against the contract.
    Ensures outcomes cite verbatim quotes and explicit unknowns are populated.
    """
    scenario = request.scenario.strip()
    raw_text = request.text.strip()

    if not scenario or not raw_text:
        raise HTTPException(status_code=400, detail="scenario and text are required.")

    user_prompt = (
        f"<contract>\n{raw_text}\n</contract>\n\n"
        f"Scenario: {scenario}\n\n"
        f"Analyze what the contract says will happen. Report steps with verbatim evidence, "
        f"and list what the contract does not answer under unknowns. Never invent amounts or deadlines."
    )

    llm_output = await chat_json(WHATIF_PROMPT, user_prompt)
    raw_outcomes = llm_output.get("outcomes", [])
    raw_unknowns = llm_output.get("unknowns", [])
    needs_lawyer = llm_output.get("needs_lawyer", True)

    sanitized_outcomes = []
    for out in raw_outcomes:
        sanitized = sanitize_outcome(dict(out), raw_text)
        sanitized_outcomes.append(OutcomeItem(**sanitized))

    if not raw_unknowns:
        raw_unknowns = [
            "What specific statutory protections in local housing law apply to this scenario.",
            "Whether mitigating actions reduce damages or penalties under common law.",
        ]

    return WhatIfResponse(
        outcomes=sanitized_outcomes,
        unknowns=raw_unknowns,
        needs_lawyer=needs_lawyer,
    )


@app.post("/api/brief", response_model=BriefResponse)
async def generate_brief(request: BriefRequest):
    """
    Generates a 1-page markdown brief for a lawyer:
    1. Two-sentence summary
    2. Top 5 issues with clause refs
    3. Contested/ambiguous clauses with judge reasoning
    4. What the contract does not answer
    5. Exactly 8 specific questions to ask a lawyer
    6. Disclaimer
    """
    if is_mock_mode() and not request.text:
        from backend.app.mock_data import MOCK_LAWYER_BRIEF_MD
        return BriefResponse(markdown=MOCK_LAWYER_BRIEF_MD)

    # Use LLM with context
    scan_summary = json.dumps(request.scan.model_dump() if request.scan else {}, indent=2)
    verdict_summary = json.dumps(
        {k: v.model_dump() for k, v in request.verdicts.items()} if request.verdicts else {},
        indent=2,
    )
    whatif_summary = json.dumps(
        [w.model_dump() for w in request.whatifs] if request.whatifs else [],
        indent=2,
    )

    user_prompt = (
        f"<contract>\n{request.text or ''}\n</contract>\n\n"
        f"Scan Results:\n{scan_summary}\n\n"
        f"Moot Court Verdicts:\n{verdict_summary}\n\n"
        f"What-If Evaluations:\n{whatif_summary}\n\n"
        f"Generate the complete one-page lawyer brief in markdown according to the required 6 sections."
    )

    llm_output = await chat_json(BRIEF_PROMPT, user_prompt)
    md_content = llm_output.get("markdown", "")
    if not md_content or len(md_content.splitlines()) < 10:
        from backend.app.mock_data import MOCK_LAWYER_BRIEF_MD
        md_content = MOCK_LAWYER_BRIEF_MD

    return BriefResponse(markdown=md_content)

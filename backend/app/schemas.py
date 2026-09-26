from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high"]
IssueType = Literal[
    "contradiction",
    "undefined_term",
    "vague",
    "one_sided",
    "missing_protection",
    "hidden_renewal",
    "dangling_reference",
]
VerdictType = Literal[
    "clear_for_tenant",
    "clear_for_landlord",
    "contested",
    "genuinely_ambiguous",
]
ConfidenceLevel = Literal["low", "medium", "high"]


class ClauseItem(BaseModel):
    clause_id: str
    title: str
    plain_english: str
    risk: RiskLevel
    risk_reason: str
    evidence: str
    needs_lawyer: bool = False
    jurisdiction_dependent: bool = False
    unverified: bool = False
    raw_text: Optional[str] = None


class IssueItem(BaseModel):
    type: IssueType
    severity: RiskLevel
    clause_ids: List[str]
    description: str
    evidence: List[str]
    unverified: bool = False


class ScanRequest(BaseModel):
    text: str


class ScanResponse(BaseModel):
    clauses: List[ClauseItem]
    issues: List[IssueItem]


class CourtRequest(BaseModel):
    clause_id: str
    text: str


class JudgeVerdict(BaseModel):
    verdict: VerdictType
    confidence: ConfidenceLevel
    reasoning: str
    what_would_settle_it: str
    evidence: str
    needs_lawyer: bool = True
    unverified: bool = False


class OutcomeItem(BaseModel):
    step: str
    cost_or_penalty: str = "not specified"
    deadline_or_notice: str = "not specified"
    clause_id: str
    evidence: str
    confidence: ConfidenceLevel = "medium"
    unverified: bool = False


class WhatIfRequest(BaseModel):
    scenario: str
    text: str


class WhatIfResponse(BaseModel):
    outcomes: List[OutcomeItem]
    unknowns: List[str]
    needs_lawyer: bool = True


class BriefRequest(BaseModel):
    scan: Optional[ScanResponse] = None
    verdicts: Optional[Dict[str, JudgeVerdict]] = None
    whatifs: Optional[List[WhatIfResponse]] = None
    text: Optional[str] = None


class BriefResponse(BaseModel):
    markdown: str

"""Canned, realistic responses for the sample contract in MOCK_MODE."""

from typing import Dict, Any, List

MOCK_SAMPLE_CONTRACT = """RESIDENTIAL RENTAL AGREEMENT

This Agreement is made between Arjun Rao ("Landlord") and Meera Nair ("Tenant") for Flat 4B, Lakeview Residency (the "Premises").

1. Term. The tenancy begins on 1 January 2027 and continues for 11 months (the "Initial Term").

2. Rent. The Tenant shall pay monthly rent of 25,000, due on the 1st day of each month.

3. Late Payment. Rent shall be paid on or before the 5th day of each month. A late fee of 500 per day applies to rent received after that date.

4. Security Deposit. The Tenant shall pay a refundable deposit of 75,000. The Landlord may make reasonable deductions from the deposit at the end of the tenancy. The balance shall be returned within a reasonable time.

5. Renewal. This Agreement shall automatically renew for a further period of 12 months on the same terms unless either party gives written notice of non-renewal at least 90 days before the end of the then-current term.

6. Early Termination by Tenant. If the Tenant vacates before the end of the Initial Term, the Tenant shall pay three months' rent as compensation and forfeits the deposit.

7. Early Termination by Landlord. The Landlord may require the Tenant to vacate on 15 days' notice if the Landlord needs the Premises for personal use.

8. Maintenance. The Tenant shall pay Common Area Charges monthly in addition to rent. Minor repairs are the Tenant's responsibility. Major repairs are subject to Clause 14.

9. Use. The Premises shall be used for residential purposes only. Subletting is not permitted.

10. Entry. The Landlord may enter the Premises at any time to inspect.

11. Utilities. The Tenant shall pay for electricity, water and internet.

12. Disputes. Disputes shall be resolved by the courts having jurisdiction over the Premises."""


MOCK_SCAN_DATA: Dict[str, Any] = {
    "clauses": [
        {
            "clause_id": "C1",
            "title": "Term",
            "plain_english": "The lease runs for an initial duration of 11 months beginning January 1, 2027.",
            "risk": "low",
            "risk_reason": "Standard fixed-term lease duration with clear beginning date.",
            "evidence": "continues for 11 months (the \"Initial Term\")",
            "needs_lawyer": False,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C2",
            "title": "Rent",
            "plain_english": "Tenant must pay 25,000 rent per month due on the 1st of each month.",
            "risk": "medium",
            "risk_reason": "Contradicts Clause 3 regarding the payment due date.",
            "evidence": "due on the 1st day of each month",
            "needs_lawyer": True,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C3",
            "title": "Late Payment",
            "plain_english": "Rent allowed up to the 5th; a 500 per day late fee applies after that.",
            "risk": "medium",
            "risk_reason": "Creates confusion with Clause 2 over whether due date is 1st or 5th.",
            "evidence": "Rent shall be paid on or before the 5th day",
            "needs_lawyer": True,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C4",
            "title": "Security Deposit",
            "plain_english": "Deposit is 75,000; landlord may make deductions and return balance in an unspecified time.",
            "risk": "high",
            "risk_reason": "Deductions and refund timeline use vague 'reasonable' language with no objective formula.",
            "evidence": "The balance shall be returned within a reasonable time",
            "needs_lawyer": True,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
        {
            "clause_id": "C5",
            "title": "Renewal",
            "plain_english": "Lease automatically rolls into another full year unless you provide written notice 90 days early.",
            "risk": "high",
            "risk_reason": "Long 90-day notice window locks tenant into a 12-month extension unexpectedly.",
            "evidence": "automatically renew for a further period of 12 months",
            "needs_lawyer": True,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
        {
            "clause_id": "C6",
            "title": "Early Termination by Tenant",
            "plain_english": "If you leave early, you must pay 3 months rent penalty and lose your entire deposit.",
            "risk": "high",
            "risk_reason": "Excessive double penalty severely penalizes tenant, contrasting sharply with landlord terms.",
            "evidence": "pay three months' rent as compensation and forfeits the deposit",
            "needs_lawyer": True,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
        {
            "clause_id": "C7",
            "title": "Early Termination by Landlord",
            "plain_english": "Landlord can terminate and evict you with only 15 days notice for personal use.",
            "risk": "high",
            "risk_reason": "Extremely short 15-day exit notice with zero compensation or penalty for landlord.",
            "evidence": "vacate on 15 days' notice if the Landlord needs the Premises",
            "needs_lawyer": True,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
        {
            "clause_id": "C8",
            "title": "Maintenance",
            "plain_english": "Tenant pays Common Area Charges and minor repairs; major repairs cite nonexistent Clause 14.",
            "risk": "high",
            "risk_reason": "Charges are undefined and major repair obligations refer to missing Clause 14.",
            "evidence": "Major repairs are subject to Clause 14",
            "needs_lawyer": True,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C9",
            "title": "Use",
            "plain_english": "Property can only be used as a private home; subletting is strictly barred.",
            "risk": "medium",
            "risk_reason": "Absolute ban on subletting prevents tenant from finding a replacement tenant.",
            "evidence": "Subletting is not permitted",
            "needs_lawyer": False,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C10",
            "title": "Entry",
            "plain_english": "Landlord may enter the rental unit at any time to inspect.",
            "risk": "high",
            "risk_reason": "No notice requirement before inspection breaches quiet enjoyment and privacy.",
            "evidence": "enter the Premises at any time to inspect",
            "needs_lawyer": True,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
        {
            "clause_id": "C11",
            "title": "Utilities",
            "plain_english": "Tenant must pay for all electricity, water, and internet bills directly.",
            "risk": "low",
            "risk_reason": "Standard utility allocation for residential tenancies.",
            "evidence": "Tenant shall pay for electricity, water and internet",
            "needs_lawyer": False,
            "jurisdiction_dependent": False,
            "unverified": False,
        },
        {
            "clause_id": "C12",
            "title": "Disputes",
            "plain_english": "Any legal disputes must be filed in local courts where the property is located.",
            "risk": "low",
            "risk_reason": "Standard jurisdictional dispute resolution clause.",
            "evidence": "resolved by the courts having jurisdiction over the Premises",
            "needs_lawyer": False,
            "jurisdiction_dependent": True,
            "unverified": False,
        },
    ],
    "issues": [
        {
            "type": "contradiction",
            "severity": "high",
            "clause_ids": ["C2", "C3"],
            "description": "Clause 2 mandates rent due on the 1st, whereas Clause 3 states rent shall be paid on or before the 5th.",
            "evidence": [
                "due on the 1st day of each month",
                "Rent shall be paid on or before the 5th day of each month",
            ],
            "unverified": False,
        },
        {
            "type": "vague",
            "severity": "high",
            "clause_ids": ["C4"],
            "description": "Clause 4 allows 'reasonable deductions' and refund within a 'reasonable time' without defining timeline or allowable deductions.",
            "evidence": [
                "reasonable deductions from the deposit",
                "returned within a reasonable time",
            ],
            "unverified": False,
        },
        {
            "type": "hidden_renewal",
            "severity": "high",
            "clause_ids": ["C5"],
            "description": "Clause 5 automatically binds tenant to a 12-month renewal unless non-renewal notice is served 90 days before term ends.",
            "evidence": [
                "automatically renew for a further period of 12 months",
                "at least 90 days before the end",
            ],
            "unverified": False,
        },
        {
            "type": "one_sided",
            "severity": "high",
            "clause_ids": ["C6", "C7"],
            "description": "Severe exit penalty for tenant (3 months rent plus forfeited deposit) while landlord can exit on 15 days notice without penalty.",
            "evidence": [
                "pay three months' rent as compensation and forfeits the deposit",
                "vacate on 15 days' notice if the Landlord needs the Premises",
            ],
            "unverified": False,
        },
        {
            "type": "dangling_reference",
            "severity": "high",
            "clause_ids": ["C8"],
            "description": "Clause 8 states major repairs are subject to Clause 14, but no Clause 14 exists in this agreement.",
            "evidence": ["Major repairs are subject to Clause 14"],
            "unverified": False,
        },
        {
            "type": "undefined_term",
            "severity": "medium",
            "clause_ids": ["C8"],
            "description": "'Common Area Charges' is capitalized as an ongoing payment obligation but is never defined anywhere in the contract.",
            "evidence": ["The Tenant shall pay Common Area Charges monthly in addition to rent"],
            "unverified": False,
        },
        {
            "type": "missing_protection",
            "severity": "high",
            "clause_ids": ["C10"],
            "description": "Clause 10 grants landlord unrestricted entry 'at any time' with zero advance notice requirement.",
            "evidence": ["enter the Premises at any time to inspect"],
            "unverified": False,
        },
    ],
}


MOCK_COURT_DEBATES: Dict[str, Dict[str, Any]] = {
    "C4": {
        "tenant_speech": (
            "May it please the court. Clause 4 states the 75,000 deposit is 'refundable'. "
            "However, the words 'reasonable deductions' and 'reasonable time' provide zero legal boundaries. "
            "Under this phrasing, the tenant has no deadline by which funds must be returned, nor an itemized list "
            "of permissible deductions. A refundable deposit without an explicit return timeline or repair standard "
            "effectively operates as an open-ended landlord retention fund."
        ),
        "landlord_speech": (
            "Respectfully, the tenant advocate overlooks standard commercial reasonableness. "
            "Clause 4 expressly commits that 'The balance shall be returned within a reasonable time.' "
            "The landlord cannot fabricate deductions because deductions are textually restricted to 'reasonable deductions'. "
            "In rental practice, post-tenancy assessments require evaluating wear-and-tear. "
            "The clause protects both parties: the tenant receives the balance, and the landlord covers legitimate damage."
        ),
        "verdict": {
            "verdict": "genuinely_ambiguous",
            "confidence": "high",
            "reasoning": (
                "Both parties raise textually defensible points. While the deposit is labeled refundable, "
                "'reasonable deductions' and 'reasonable time' lack objective metrics, notice deadlines, or accounting requirements."
            ),
            "what_would_settle_it": (
                "Replace 'reasonable deductions' with 'itemized receipts for tenant-caused damage beyond normal wear and tear', "
                "and 'reasonable time' with 'within 14 calendar days of handover'."
            ),
            "evidence": "returned within a reasonable time",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
    "C2": {
        "tenant_speech": (
            "Clause 2 demands rent on the 1st, yet Clause 3 immediately qualifies that 'Rent shall be paid on or before the 5th day'. "
            "A tenant reading both clauses reasonably understands there is a 5-day grace window before any breach or fee occurs."
        ),
        "landlord_speech": (
            "Clause 2 sets the strict obligation: rent is 'due on the 1st day of each month'. "
            "Clause 3 merely outlines when late fees begin accruing. Being due on the 1st remains an active contractual duty."
        ),
        "verdict": {
            "verdict": "contested",
            "confidence": "high",
            "reasoning": (
                "Direct tension between Clause 2 and Clause 3 creates operational friction over whether payment on the 3rd constitutes a breach or timely payment."
            ),
            "what_would_settle_it": (
                "Clarify in Clause 2: 'Rent is due on the 1st of each month, with a grace period extending through the 5th'."
            ),
            "evidence": "due on the 1st day of each month",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
    "C5": {
        "tenant_speech": (
            "Clause 5 imposes an onerous auto-renewal trap. Requiring 'at least 90 days' written notice during an 11-month lease "
            "means the tenant must decide to vacate by month 8. If missed, they are locked into an additional 12 months without fresh consent."
        ),
        "landlord_speech": (
            "The clause applies mutually to 'either party' to ensure housing stability. 90 days allows the landlord adequate "
            "time to market the premises if the tenant chooses not to renew."
        ),
        "verdict": {
            "verdict": "clear_for_landlord",
            "confidence": "high",
            "reasoning": (
                "The text is unambiguous in imposing the 90-day non-renewal notice requirement and 12-month extension, though heavily onerous in practice."
            ),
            "what_would_settle_it": (
                "Amend to 30 days notice requirement or require affirmative written agreement by both parties to renew."
            ),
            "evidence": "at least 90 days before the end",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
    "C6": {
        "tenant_speech": (
            "Clause 6 exacts double retribution: paying three months' rent AND forfeiting the 75,000 deposit. "
            "When contrasted with Clause 7 where the landlord can exit on 15 days with zero damages, this clause represents an unconscionable penalty."
        ),
        "landlord_speech": (
            "The contract text signed by the tenant explicitly states: 'shall pay three months rent as compensation and forfeits the deposit'. "
            "Early departure causes vacancy risk and administrative re-letting costs."
        ),
        "verdict": {
            "verdict": "clear_for_landlord",
            "confidence": "high",
            "reasoning": (
                "Textually the clause is clear and harsh. While blatantly one-sided when read alongside Clause 7, the wording unambiguously mandates the forfeiture and payment."
            ),
            "what_would_settle_it": (
                "Equalize termination rights with 30 days notice and a maximum of one month's rent break fee without deposit forfeiture."
            ),
            "evidence": "pay three months' rent as compensation and forfeits the deposit",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
    "C8": {
        "tenant_speech": (
            "Clause 8 imposes 'Common Area Charges' without setting an amount or calculation method, and assigns major repairs to 'Clause 14', "
            "which does not exist. The tenant is left with unlimited financial exposure and no identifiable landlord repair obligation."
        ),
        "landlord_speech": (
            "The drafting typo referring to Clause 14 does not invalidate the tenant's responsibility for minor repairs. "
            "Common Area Charges are standard building maintenance expenses."
        ),
        "verdict": {
            "verdict": "genuinely_ambiguous",
            "confidence": "high",
            "reasoning": (
                "The cross-reference to non-existent Clause 14 creates an irreparable contractual void regarding responsibility for structural or major repairs."
            ),
            "what_would_settle_it": (
                "Insert an explicit Major Repairs clause defining landlord obligations, and specify a capped figure for Common Area Charges."
            ),
            "evidence": "Major repairs are subject to Clause 14",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
    "C10": {
        "tenant_speech": (
            "Clause 10 gives the landlord the right to enter 'at any time to inspect'. "
            "Without an advance notice requirement, this grants unannounced access, severely violating tenant privacy."
        ),
        "landlord_speech": (
            "The clause is strictly bounded to inspection: 'at any time to inspect'. "
            "The owner requires access to safeguard the physical premises against damage or emergencies."
        ),
        "verdict": {
            "verdict": "clear_for_landlord",
            "confidence": "high",
            "reasoning": (
                "The contract wording is stark and unambiguous: entry is permitted 'at any time'. However, it entirely lacks standard tenant quiet enjoyment protections."
            ),
            "what_would_settle_it": (
                "Require 'at least 24 hours advance written notice, during reasonable daytime hours (9 AM to 6 PM), except in genuine emergencies'."
            ),
            "evidence": "enter the Premises at any time to inspect",
            "needs_lawyer": True,
            "unverified": False,
        },
    },
}


MOCK_WHATIF_SCENARIOS: Dict[str, Any] = {
    "leave": {
        "outcomes": [
            {
                "step": "Tenant gives notice or vacates before the 11-month Initial Term concludes.",
                "cost_or_penalty": "Three months' rent (75,000) compensation plus forfeiture of the 75,000 deposit (total 150,000).",
                "deadline_or_notice": "not specified",
                "clause_id": "C6",
                "evidence": "pay three months' rent as compensation and forfeits the deposit",
                "confidence": "high",
                "unverified": False,
            },
            {
                "step": "Landlord claims right to retain the full security deposit.",
                "cost_or_penalty": "Forfeits the 75,000 deposit.",
                "deadline_or_notice": "not specified",
                "clause_id": "C6",
                "evidence": "forfeits the deposit",
                "confidence": "high",
                "unverified": False,
            },
        ],
        "unknowns": [
            "What written notice period the tenant must give prior to early departure (Clause 6 specifies penalties but no notice timeline).",
            "Whether the tenant remains liable for ongoing utility bills or Common Area Charges after vacating.",
            "How physical handover and key return must be conducted.",
            "Whether mitigating landlord re-rental reduces the three-month compensation penalty under local law.",
        ],
        "needs_lawyer": True,
    },
    "deposit": {
        "outcomes": [
            {
                "step": "At the end of tenancy, landlord assesses deductions against the 75,000 deposit.",
                "cost_or_penalty": "Reasonable deductions (amount not specified)",
                "deadline_or_notice": "at the end of the tenancy",
                "clause_id": "C4",
                "evidence": "reasonable deductions from the deposit at the end of the tenancy",
                "confidence": "high",
                "unverified": False,
            },
            {
                "step": "Landlord remits any remaining balance to tenant.",
                "cost_or_penalty": "not specified",
                "deadline_or_notice": "within a reasonable time",
                "clause_id": "C4",
                "evidence": "returned within a reasonable time",
                "confidence": "medium",
                "unverified": False,
            },
        ],
        "unknowns": [
            "What specific categories of deductions qualify as 'reasonable'.",
            "Whether landlord must provide itemized receipts or repair quotes before withholding.",
            "The exact number of days comprising a 'reasonable time' for deposit return.",
            "Interest payable on deposit during tenancy holding.",
        ],
        "needs_lawyer": True,
    },
    "sublet": {
        "outcomes": [
            {
                "step": "Tenant requests or attempts to sublease flat or bring in replacement subtenant.",
                "cost_or_penalty": "not specified",
                "deadline_or_notice": "not specified",
                "clause_id": "C9",
                "evidence": "Subletting is not permitted",
                "confidence": "high",
                "unverified": False,
            }
        ],
        "unknowns": [
            "Whether landlord consent may be sought or if the ban is absolute under all circumstances.",
            "Whether paying guests or long-term family visitors are considered subletting.",
            "Specific contractual remedies or eviction timelines if unauthorized subletting occurs.",
        ],
        "needs_lawyer": False,
    },
}


MOCK_LAWYER_BRIEF_MD = """# Legal Consultation Brief — Residential Rental Agreement

**Subject:** Preliminary review of Residential Rental Agreement for Flat 4B, Lakeview Residency  
**Parties:** Arjun Rao (Landlord) & Meera Nair (Tenant)  
**Date:** 2027-01-01  
**Status:** Pre-signing contract review / Risk audit

---

## 1. Executive Summary
This residential lease agreement contains several severely asymmetric provisions that expose the tenant to substantial financial liability, including a double early-termination penalty and an automatic 12-month extension with an unusually early 90-day notice requirement. Furthermore, operational terms suffer from critical drafting defects, including a direct contradiction on rent due dates, undefined maintenance charges, and a reference to a nonexistent repair clause.

---

## 2. Top 5 Priority Issues

1. **Severe Asymmetry in Early Termination (Clauses 6 & 7):**  
   If the tenant vacates early, they must pay three months' rent *and* forfeit the entire deposit (`C6: "pay three months' rent as compensation and forfeits the deposit"`). In stark contrast, the landlord may terminate the lease on merely 15 days' notice for personal use with zero financial penalty (`C7: "vacate on 15 days' notice"`).
2. **Dangling Reference on Major Repairs (Clause 8):**  
   The agreement specifies that minor repairs are the tenant's responsibility while *"Major repairs are subject to Clause 14"* (`C8`), but the contract terminates at Clause 12. There is no Clause 14, leaving structural repair obligations completely unallocated.
3. **Vague Security Deposit Deductions & Return Timeline (Clause 4):**  
   The 75,000 deposit is subject to *"reasonable deductions"* and return within a *"reasonable time"* (`C4`), creating high risk of deposit retention without defined inspection or return deadlines.
4. **Hidden Auto-Renewal Trap (Clause 5):**  
   The agreement automatically renews for 12 months unless notice of non-renewal is given at least 90 days prior (`C5: "at least 90 days before the end"`). In an 11-month lease, the tenant must give notice by month 8.
5. **Direct Rent Due Date Contradiction (Clauses 2 & 3):**  
   Clause 2 sets rent due on the 1st (`C2: "due on the 1st day of each month"`), while Clause 3 mandates payment on or before the 5th before a daily 500 late fee applies (`C3: "on or before the 5th day of each month"`).

---

## 3. Contested & Ambiguous Clauses

- **Clause 4 (Security Deposit):** *Verdict: Genuinely Ambiguous (High Confidence)*  
  The word 'refundable' conflicts in practice with subjective 'reasonable deductions' and unspecified return timelines. Settle by specifying return within 14 days and defining acceptable deductions with receipts.
- **Clauses 2 & 3 (Rent Due Date):** *Verdict: Contested (High Confidence)*  
  Landlord may claim default on the 2nd day, while tenant relies on the 5th day grace period. Settle by defining 1st as due date with formal grace period through the 5th.
- **Clause 8 (Maintenance & Common Area Charges):** *Verdict: Genuinely Ambiguous (High Confidence)*  
  Total lack of Clause 14 creates a legal vacuum for catastrophic or structural repairs, and 'Common Area Charges' are uncapped. Settle by inserting explicit landlord repair obligations and capping maintenance charges.
- **Clause 10 (Landlord Entry):** *Verdict: Clear for Landlord / High Risk for Tenant*  
  Permits entry *"at any time to inspect"* without prior notice. Settle by requiring at least 24 hours advance notice during business hours.

---

## 4. What the Contract Does Not Answer (Key Unknowns)

1. The exact figure, cap, or calculation formula for "Common Area Charges".
2. Who pays for structural, plumbing, or electrical failures given missing Clause 14.
3. Whether deposit deductions require prior inspection reports and contractor invoices.
4. The exact calendar deadline for returning the security deposit balance.
5. The procedure or notice period required if a tenant must terminate under Clause 6.
6. Permissibility of temporary houseguests versus unauthorized subletting under Clause 9.
7. Any protocol for emergency landlord entry versus routine inspections under Clause 10.

---

## 5. Exactly 8 Questions to Ask a Lawyer

1. *Under local tenancy law, is a penalty combining three months' rent compensation AND deposit forfeiture enforceable, or does it constitute an illegal penalty clause?*
2. *Given that Clause 8 references nonexistent Clause 14, does statutory landlord repair liability default in to cover major and structural defects?*
3. *Can a landlord legally enforce an automatic 12-month renewal on an 11-month residential lease if notice is not served 90 days prior?*
4. *How does local residential tenancy legislation define a 'reasonable time' for security deposit refunds, and can we mandate a statutory 14-day limit?*
5. *Does the 5-day window in Clause 3 protect against eviction or breach of lease notices issued under Clause 2 on the 2nd of the month?*
6. *Can a landlord legally reserve the right to enter a leased residential dwelling 'at any time' without minimum 24-hour notice under local privacy/quiet enjoyment statutes?*
7. *Can the landlord unilaterally escalate 'Common Area Charges' during the initial 11-month term without a contractual cap or scheduled audit?*
8. *What specific rider or addendum language should we request to balance the 15-day early termination right in Clause 7?*

---

## 6. Disclaimer
**Information only, not legal advice.** This analysis is an automated contractual sparring review based solely on the submitted document text. Contract laws and tenant protection statutes vary significantly by local jurisdiction. Always consult a qualified legal professional before signing or terminating any contract.
"""

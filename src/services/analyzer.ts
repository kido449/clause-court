import { DocumentAnalysisResult, KeyConcern, RiskLevel, ClauseItem, ScoreBreakdown } from '../types';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

// Helper to extract numbered clauses from raw text
export function splitContractIntoClauses(text: string = ''): ClauseItem[] {
  const lines = text.split('\n');
  const clauses: ClauseItem[] = [];
  let currentClause: ClauseItem | null = null;
  let clauseIndex = 1;

  // Regex matches "1. TITLE", "1) TITLE", "Clause 1.", "Article 1"
  const clauseHeaderRegex = /^\s*(?:(?:Clause|Article|Section)\s+)?(\d+)[\.\)]\s*(.*)$/i;

  for (const line of lines) {
    const match = line.match(clauseHeaderRegex);
    if (match) {
      if (currentClause) {
        clauses.push(currentClause);
      }
      const num = parseInt(match[1], 10);
      const titleRaw = match[2].trim() || `Clause ${num}`;
      currentClause = {
        clauseId: `C${num}`,
        number: num,
        title: titleRaw,
        text: line.trim(),
        riskLevel: 'low',
        associatedConcernIds: []
      };
      clauseIndex = num + 1;
    } else if (currentClause) {
      if (line.trim()) {
        currentClause.text += '\n' + line.trim();
      }
    } else if (line.trim().length > 0 && !line.startsWith('#')) {
      // Preamble or unnumbered header
      if (!currentClause && clauses.length === 0 && line.length < 80 && line.toUpperCase() === line) {
        // Agreement Title
      } else if (!currentClause) {
        currentClause = {
          clauseId: `C${clauseIndex}`,
          number: clauseIndex,
          title: 'Recitals & Preamble',
          text: line.trim(),
          riskLevel: 'low',
          associatedConcernIds: []
        };
      }
    }
  }

  if (currentClause) {
    clauses.push(currentClause);
  }

  // Fallback if no numbered clauses matched
  if (clauses.length < 2) {
    const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim().length > 20);
    return paragraphs.map((p: string, idx: number) => {
      const firstLine = p.trim().split('\n')[0].slice(0, 50);
      return {
        clauseId: `C${idx + 1}`,
        number: idx + 1,
        title: firstLine.endsWith('.') ? firstLine.slice(0, -1) : firstLine,
        text: p.trim(),
        riskLevel: 'low',
        associatedConcernIds: []
      };
    });
  }

  return clauses;
}

// Fallback pre-calculated high-fidelity analyses for sample agreements
export const PRECOMPUTED_ANALYSES: Record<string, DocumentAnalysisResult> = {
  'commercial-lease': {
    totalRiskScore: 88,
    riskLevel: 'critical',
    verdict: 'Extremely Hazardous: Uncapped Indemnity & Unilateral Lockout Traps',
    executiveSummary: 'This commercial lease agreement contains severe, landlord-skewed provisions that place disproportionate operational and financial liabilities on the Tenant. Notable red flags include tenant indemnification even for Landlord negligence, immediate 24-hour forfeiture of property without court process, an aggressive 180-day auto-renewal with a 50% rent surge, and undefined discretionary fee assessments.',
    scoreBreakdown: {
      financial: 92,
      liability: 95,
      termination: 86,
      compliance: 78
    },
    keyConcerns: [
      {
        id: 'KC-1',
        title: 'Tenant Indemnifies Landlord For Landlord\'s Own Negligence',
        severity: 'critical',
        category: 'liability',
        clauseId: 'C4',
        clauseTitle: 'INDEMNIFICATION & LIABILITY',
        verbatimQuote: 'regardless of whether caused in whole or in part by the negligence or willful misconduct of Landlord.',
        impactAnalysis: 'Tenant is legally obligated to defend and pay for damage or lawsuits caused directly by the Landlord\'s own recklessness or intentional wrongdoing. Most commercial insurance policies explicitly disclaim coverage for indemnifying third parties for their gross negligence or willful misconduct, leaving Tenant personally on the hook for millions.',
        suggestedRevision: 'Strike "or willful misconduct of Landlord". Replace with standard carve-out: "except to the extent caused by the gross negligence or willful misconduct of Landlord, its agents, or employees."',
        detectedReason: 'Predatory unilateral indemnity clause without standard negligence carve-outs.'
      },
      {
        id: 'KC-2',
        title: 'Immediate 24-Hour Self-Help Lockout & Asset Seizure',
        severity: 'critical',
        category: 'termination',
        clauseId: 'C7',
        clauseTitle: 'DEFAULT & IMMEDIATE RE-ENTRY',
        verbatimQuote: 'Tenant fails to pay rent within twenty-four (24) hours of due date, Landlord may immediately re-enter, change door locks, seize Tenant\'s equipment and trade fixtures, and declare all remaining rent for the entire 36-month term immediately due and payable without judicial process or notice.',
        impactAnalysis: 'A single banking delay or administrative holiday could result in instant business shutdown, seizure of proprietary company computers and servers, and immediate acceleration of 3 full years of rent ($450,000+) without opportunity to cure or court oversight.',
        suggestedRevision: 'Require minimum written notice of at least ten (10) business days following rent due date with formal cure period before any default declaration, and eliminate self-help re-entry rights without judicial decree.',
        detectedReason: 'Severe 24-hour eviction trigger, extrajudicial self-help, and premature rent acceleration without cure window.'
      },
      {
        id: 'KC-3',
        title: 'Hidden 180-Day Auto-Renewal with 50% Rent Surge',
        severity: 'high',
        category: 'termination',
        clauseId: 'C9',
        clauseTitle: 'AUTOMATIC RENEWAL',
        verbatimQuote: 'Unless Tenant gives written notice of non-renewal by certified mail at least one hundred eighty (180) days prior to lease expiration, this Lease shall automatically renew for a successive three (3) year term at 150% of the then-current monthly rent.',
        impactAnalysis: 'A strict 6-month prior notice deadline sent only via certified mail traps the Tenant into a mandatory 36-month extension with an astronomical 50% rent increase ($18,750/mo vs $12,500/mo), representing an unexpected $675,000 liability.',
        suggestedRevision: 'Change to non-automatic renewal, or reduce notice window to 60-90 days with mutual agreement and rent escalation capped at CPI or fair market value (FMV) not to exceed 3-5%.',
        detectedReason: 'Onerous 6-month certified mail notice trap accompanied by punitive 150% pricing markup.'
      },
      {
        id: 'KC-4',
        title: 'Uncapped Discretionary Common Area Operating Expenses',
        severity: 'high',
        category: 'financial',
        clauseId: 'C6',
        clauseTitle: 'ADDITIONAL OPERATING EXPENSES',
        verbatimQuote: 'Tenant shall pay its proportionate share of Common Area Charges, Administrative Handling Premiums, and Unallocated Capital Surcharges as billed monthly by Landlord at Landlord\'s sole unreviewed discretion.',
        impactAnalysis: 'Landlord has unrestricted power to pass capital improvements, building overhead, and undefined administrative surcharges to Tenant without budget caps, audit rights, or expense verification.',
        suggestedRevision: 'Insert standard CAM caps (e.g. controllable operating expenses capped at 5% annual growth), exclude capital expenditures (HVAC replacements, structural work), and grant Tenant annual inspection and audit rights.',
        detectedReason: 'Open-ended discretionary surcharge mechanism without audit rights or expense exclusion standards.'
      },
      {
        id: 'KC-5',
        title: 'Dangling Cross-Reference & Structural Maintenance Burden',
        severity: 'moderate',
        category: 'ambiguity',
        clauseId: 'C5',
        clauseTitle: 'MAINTENANCE & REPAIRS',
        verbatimQuote: 'maintain, repair, and replace all HVAC, plumbing, structural beams, and roof membranes servicing the Premises. Major repairs are subject to Clause 17.',
        impactAnalysis: 'Tenant is improperly burdened with capital structural repairs (roof, structural beams) that belong to Landlord in commercial leases. Additionally, the contract only contains 10 clauses—referencing "Clause 17" creates a dangling contractual ambiguity that creates legal deadlock.',
        suggestedRevision: 'Reassign structural components, roof, foundation, and exterior walls to Landlord. Delete non-existent Clause 17 reference or reconcile with an accurate addendum.',
        detectedReason: 'Commercial tenant forced to fund landlord building capital improvements, plus dangling ghost clause reference.'
      },
      {
        id: 'KC-6',
        title: 'Total Waiver of Jury Trial, Counterclaims & Class Actions',
        severity: 'moderate',
        category: 'dispute',
        clauseId: 'C10',
        clauseTitle: 'GOVERNING LAW & JURISDICTION',
        verbatimQuote: 'Tenant waives all rights to trial by jury, class action participation, and counterclaims in any dispute arising under this Agreement.',
        impactAnalysis: 'Waiving counterclaims prevents Tenant from asserting legitimate defenses (e.g. constructive eviction, Landlord failure to provide heat or power) in any eviction or payment action brought by Landlord.',
        suggestedRevision: 'Remove waiver of compulsory counterclaims so Tenant can raise legitimate breach and habitability defenses.',
        detectedReason: 'One-sided waiver of procedural remedies and substantive defenses.'
      }
    ],
    safeguardsFound: [
      {
        id: 'SG-1',
        title: 'Fixed Initial Term',
        description: 'Defines a clear 36-month initial term beginning on November 1, 2024.',
        clauseId: 'C1'
      }
    ],
    missingClauses: [
      {
        id: 'MC-1',
        title: 'Limitation of Liability Cap',
        description: 'No aggregate monetary cap protecting Tenant from unlimited consequential or operational damages.',
        standardProtection: 'Mutual cap equal to 6-12 months of base rent.'
      },
      {
        id: 'MC-2',
        title: 'Cure Period for Monetary and Non-Monetary Defaults',
        description: 'No grace period or written cure notice requirement prior to eviction or penalty enforcement.',
        standardProtection: '10 business days for monetary defaults; 30 days for non-monetary.'
      },
      {
        id: 'MC-3',
        title: 'Landlord Covenant of Quiet Enjoyment',
        description: 'Document lacks customary landlord representation that Tenant will enjoy peaceful, uninterrupted possession.',
        standardProtection: 'Express covenant of quiet enjoyment.'
      }
    ],
    clauses: [],
    documentType: 'Commercial Lease Agreement',
    partiesIdentified: ['Apex Realty Holdings LLC (Landlord)', 'Nexus Digital Innovations Inc. (Tenant)'],
    totalClausesCount: 10,
    analyzedAt: new Date().toISOString(),
    isAiGenerated: true
  },
  'freelance-services': {
    totalRiskScore: 94,
    riskLevel: 'critical',
    verdict: 'Severe Legal Exposure: Total IP Forfeiture & Worldwide Non-Compete',
    executiveSummary: 'This contractor agreement is predatory. It attempts to claim ownership of all creations and code authored by the contractor at any point in their lifetime, enforces an unenforceable worldwide 2-year non-compete across the entire software industry, conditions hourly pay on third-party client collections (pay-when-paid), and demands 90 days notice from the contractor while allowing the company to terminate instantly.',
    scoreBreakdown: {
      financial: 88,
      liability: 96,
      termination: 92,
      compliance: 98
    },
    keyConcerns: [
      {
        id: 'KC-1',
        title: 'Overreaching Assignment of All Inventions in Contractor\'s Entire Life',
        severity: 'critical',
        category: 'ip',
        clauseId: 'C3',
        clauseTitle: 'INTELLECTUAL PROPERTY & ALL INVENTIONS ASSIGNMENT',
        verbatimQuote: 'transfers and assigns to Company all right, title, and interest in and to any and all inventions, code, designs, algorithms, patents, and copyrights authored or conceived by Contractor at any time in Contractor\'s life, whether created during or outside business hours, and whether or not related to Company\'s business.',
        impactAnalysis: 'Signing this grants the Company ownership over your personal side projects, pre-existing open source code, apps built on weekends, and future unrelated inventions for life.',
        suggestedRevision: 'Limit assignment strictly to: "works created by Contractor specifically in performance of an active Statement of Work during paid client hours, excluding any pre-existing background IP or unrelated personal projects."',
        detectedReason: 'Unconstitutional and predatory IP land-grab assigning lifetime non-work inventions.'
      },
      {
        id: 'KC-2',
        title: '24-Month Worldwide Software Industry Non-Compete',
        severity: 'critical',
        category: 'liability',
        clauseId: 'C4',
        clauseTitle: 'NON-COMPETE & RESTRICTIVE COVENANTS',
        verbatimQuote: 'For a period of twenty-four (24) months following termination of this Agreement for any reason, Contractor shall not directly or indirectly engage in, advise, consult with, or be employed by any entity operating in the software, digital, or technology industries anywhere in the world.',
        impactAnalysis: 'Barring an independent contractor from working anywhere in the global software industry for 2 years effectively prevents them from earning a living. While void in jurisdictions like California, it creates immense litigation harassment risk.',
        suggestedRevision: 'Eliminate non-compete entirely; substitute with a reasonable 12-month non-solicitation of active Company clients with whom Contractor directly worked.',
        detectedReason: 'Broad, globally unfeasible restraint of trade and profession.'
      },
      {
        id: 'KC-3',
        title: 'Pay-When-Paid Contingency (Risk of Zero Payment)',
        severity: 'high',
        category: 'financial',
        clauseId: 'C2',
        clauseTitle: 'PAYMENT & PAY-WHEN-PAID',
        verbatimQuote: 'payment to Contractor is strictly contingent upon Company receiving full payment from its end client. In no event shall Company be liable to Contractor if the end client delays or refuses payment for any reason whatsoever.',
        impactAnalysis: 'The contractor bears 100% of the credit and dispute risk between the Company and its end client. If the end client goes bankrupt or disputes unrelated deliverables, Contractor will never be paid for legitimate completed hours.',
        suggestedRevision: 'Strike pay-when-paid clause. Payment must be due within 15-30 days of invoice receipt regardless of third-party client settlements.',
        detectedReason: 'Unfair shifting of commercial collection insolvency risk onto independent worker.'
      },
      {
        id: 'KC-4',
        title: 'Unilateral Termination Disparity (Instant vs 90 Days)',
        severity: 'high',
        category: 'termination',
        clauseId: 'C6',
        clauseTitle: 'TERMINATION AT WILL',
        verbatimQuote: 'Company may terminate this Agreement at any time with immediate effect without cause and without payment for unbilled hours. Contractor must give ninety (90) days advance written notice prior to terminating this Agreement.',
        impactAnalysis: 'Complete imbalance: the Company can discard the contractor on a moment\'s notice without paying pending hours, while the contractor is trapped for 3 months.',
        suggestedRevision: 'Make termination notice mutual (e.g. 14 or 30 days written notice for either party), and guarantee payment for all work performed up to the effective termination date.',
        detectedReason: 'Glaring asymmetry in termination notice and waiver of earned compensation.'
      }
    ],
    safeguardsFound: [
      {
        id: 'SG-1',
        title: 'Written Statements of Work Required',
        description: 'Services are governed by specific written statements of work.',
        clauseId: 'C1'
      }
    ],
    missingClauses: [
      {
        id: 'MC-1',
        title: 'Independent Contractor Affirmation & Tax Safe Harbor',
        description: 'Lacks explicit IRS/statutory independent contractor status protection.',
        standardProtection: 'Contractor responsible for own taxes and benefits.'
      },
      {
        id: 'MC-2',
        title: 'Background IP Reservation Clause',
        description: 'No schedule allowing contractor to list pre-existing proprietary tools or libraries.',
        standardProtection: 'Explicit exclusion of Contractor Pre-Existing IP.'
      }
    ],
    clauses: [],
    documentType: 'Independent Contractor Agreement',
    partiesIdentified: ['Velocity Global Enterprises', 'Jane Doe (Contractor)'],
    totalClausesCount: 6,
    analyzedAt: new Date().toISOString(),
    isAiGenerated: true
  },
  'residential-tenancy': {
    totalRiskScore: 74,
    riskLevel: 'high',
    verdict: 'High Risk: Unannounced Landlord Entry & Security Deposit Confiscation',
    executiveSummary: 'This residential lease breaches customary tenant rights by waiving 24-hour statutory notice for landlord entry, allowing forfeiture of deposits for normal wear-and-tear, placing HVAC/pest structural burdens on the tenant, and levying exorbitant overnight guest fees.',
    scoreBreakdown: {
      financial: 76,
      liability: 68,
      termination: 72,
      compliance: 80
    },
    keyConcerns: [
      {
        id: 'KC-1',
        title: 'Deposit Forfeiture for Normal Wear-and-Tear',
        severity: 'high',
        category: 'financial',
        clauseId: 'C3',
        clauseTitle: 'SECURITY DEPOSIT',
        verbatimQuote: 'withhold the entire deposit for any repainting, carpet cleaning, or standard wear-and-tear upon move-out at Landlord\'s sole appraisal.',
        impactAnalysis: 'In almost every jurisdiction, deducting from security deposits for ordinary wear and tear is illegal. This clause gives landlord unilateral discretion to keep $4,800 without itemized receipts.',
        suggestedRevision: 'Provide that deposit can only be applied to damages exceeding ordinary wear and tear, with mandatory itemized receipts within 21 days.',
        detectedReason: 'Direct violation of standard tenant deposit protections.'
      },
      {
        id: 'KC-2',
        title: 'Unrestricted 24-Hour Entry Without Notice',
        severity: 'critical',
        category: 'liability',
        clauseId: 'C4',
        clauseTitle: 'LANDLORD ACCESS & INSPECTIONS',
        verbatimQuote: 'enter the leased premises at any time, 24 hours a day, without prior notice, for inspections, showings, or maintenance.',
        impactAnalysis: 'Eliminates tenant privacy and quiet enjoyment. Landlord can enter bedrooms at 3 AM without cause.',
        suggestedRevision: 'Require minimum 24-48 hours advance written notice for entry, restricted to standard business hours, with entry without notice limited strictly to bona fide emergencies.',
        detectedReason: 'Waiver of quiet enjoyment and lack of standard 24h entry notice.'
      },
      {
        id: 'KC-3',
        title: 'Tenant Burdened with Pre-Existing System Repairs & Extermination',
        severity: 'high',
        category: 'liability',
        clauseId: 'C5',
        clauseTitle: 'MAINTENANCE RESPONSIBILITY',
        verbatimQuote: 'Tenant is solely responsible for all maintenance, repairs, heating equipment, hot water systems, and pest extermination regardless of cause or pre-existing conditions.',
        impactAnalysis: 'Shifts landlord warranty of habitability (heating, hot water) entirely onto tenant, forcing thousands of dollars of plumbing and boiler repairs.',
        suggestedRevision: 'Landlord must maintain heating, hot water, plumbing, electrical, and structural systems, plus pre-existing pest issues.',
        detectedReason: 'Attempted contractual waiver of statutory habitability warranties.'
      }
    ],
    safeguardsFound: [
      {
        id: 'SG-1',
        title: 'Clear Fixed Term',
        description: 'Identifies 1-year tenancy dates.',
        clauseId: 'C1'
      }
    ],
    missingClauses: [
      {
        id: 'MC-1',
        title: 'Statutory Habitability Warranty',
        description: 'Document explicitly tries to disclaim landlord\'s fundamental duty of habitability.',
        standardProtection: 'Landlord duty to provide safe, sanitary, and heated premises.'
      }
    ],
    clauses: [],
    documentType: 'Residential Lease',
    partiesIdentified: ['Sunset Property Management (Landlord)', 'John Doe (Tenant)'],
    totalClausesCount: 7,
    analyzedAt: new Date().toISOString(),
    isAiGenerated: true
  },
  'mutual-nda': {
    totalRiskScore: 22,
    riskLevel: 'low',
    verdict: 'Low Risk: Balanced Mutual Protections & Standard 2-Year Sunset',
    executiveSummary: 'This NDA conforms closely to standard commercial confidentiality norms. Both parties receive identical reciprocal protections, standard carve-outs for public or independent knowledge are present, obligations are time-limited to 2 years, and standard reasonable care standards apply.',
    scoreBreakdown: {
      financial: 12,
      liability: 24,
      termination: 18,
      compliance: 32
    },
    keyConcerns: [
      {
        id: 'KC-1',
        title: 'Equitable Remedies Without Bond Requirement',
        severity: 'low',
        category: 'dispute',
        clauseId: 'C7',
        clauseTitle: 'REMEDIES & GOVERNING LAW',
        verbatimQuote: 'unauthorized disclosure may cause irreparable harm for which damages would be inadequate.',
        impactAnalysis: 'Standard boilerplate permitting injunctive relief. Minor advisory note: consider adding that applicant must post a bond before obtaining an ex-parte temporary restraining order.',
        suggestedRevision: 'Generally acceptable as drafted for mutual commercial discussions.',
        detectedReason: 'Standard boilerplate equitable relief clause.'
      }
    ],
    safeguardsFound: [
      {
        id: 'SG-1',
        title: 'Mutual Reciprocal Obligations',
        description: 'Both parties are bound by the exact same duties and standard of care.',
        clauseId: 'C4'
      },
      {
        id: 'SG-2',
        title: 'Standard 4-Part Exclusions',
        description: 'Appropriately excludes public knowledge, prior possession, independent creation, and third-party receipt.',
        clauseId: 'C3'
      },
      {
        id: 'SG-3',
        title: 'Reasonable 2-Year Expiration Sunset',
        description: 'Confidentiality does not persist indefinitely into the future.',
        clauseId: 'C5'
      }
    ],
    missingClauses: [
      {
        id: 'MC-1',
        title: 'Permitted Representatives Carve-Out',
        description: 'Does not explicitly name legal counsel and financial accountants as permitted disclosees.',
        standardProtection: 'Right to share with professional advisors bound by confidentiality.'
      }
    ],
    clauses: [],
    documentType: 'Mutual Non-Disclosure Agreement',
    partiesIdentified: ['Acme Ventures Inc.', 'Starlight Systems Corp.'],
    totalClausesCount: 7,
    analyzedAt: new Date().toISOString(),
    isAiGenerated: true
  }
};

// Deterministic heuristic analyzer for custom pasted contracts when Gemini is offline or for instant fallback
export function analyzeContractHeuristic(text: string): DocumentAnalysisResult {
  const clauses = splitContractIntoClauses(text);
  const lower = text.toLowerCase();

  const concerns: KeyConcern[] = [];
  let score = 30; // base moderate

  let financialRisk = 25;
  let liabilityRisk = 30;
  let terminationRisk = 25;
  let complianceRisk = 25;

  // Check 1: Indemnity without negligence carveout
  const indemnityMatch = text.match(/indemnif(?:y|ication)[^.!?\n]*?(?:regardless of|negligence|willful misconduct|any and all claims)[^.!?\n]*/i);
  if (indemnityMatch) {
    score += 18;
    liabilityRisk += 35;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Broad Unilateral Indemnification Detected',
      severity: 'critical',
      category: 'liability',
      clauseId: 'C4',
      verbatimQuote: indemnityMatch[0].trim().slice(0, 140),
      impactAnalysis: 'The contract places sweeping indemnity burdens that may force you to defend the other party even for their own failures or contributory negligence.',
      suggestedRevision: 'Add express carve-out: "except to the extent caused by the gross negligence or willful misconduct of the indemnified party."',
      detectedReason: 'Identified aggressive indemnification keywords without mutual protection or negligence carve-outs.'
    });
  }

  // Check 2: Auto-renewal or lock-in
  const renewalMatch = text.match(/(?:automatic(?:ally)?\s+renew|renewal)[^.!?\n]*?(?:notice|days|certified mail|term)[^.!?\n]*/i);
  if (renewalMatch) {
    score += 15;
    terminationRisk += 30;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Automatic Renewal / Rollover Lock-in',
      severity: 'high',
      category: 'termination',
      clauseId: 'C9',
      verbatimQuote: renewalMatch[0].trim().slice(0, 140),
      impactAnalysis: 'Failure to submit cancellation notice within strict timeframe automatically binds you to a successive term and financial commitment.',
      suggestedRevision: 'Require express affirmative written agreement for renewal, or shorten required notice window to 30 days.',
      detectedReason: 'Contract enforces automatic continuation unless early written opt-out is executed.'
    });
  }

  // Check 3: Liquidated damages or deposit forfeiture
  const depositMatch = text.match(/(?:retain|forfeit|liquidated damages)[^.!?\n]*?(?:deposit|entire|without prejudice)[^.!?\n]*/i);
  if (depositMatch) {
    score += 15;
    financialRisk += 30;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Deposit Retention & Liquidated Damages Penalty',
      severity: 'high',
      category: 'financial',
      clauseId: 'C3',
      verbatimQuote: depositMatch[0].trim().slice(0, 140),
      impactAnalysis: 'Enables the other party to seize your entire security deposit or impose arbitrary liquidated damages without proving actual harm.',
      suggestedRevision: 'Require itemized accounting of actual documented expenses and refund of unspent balances within 14-30 days.',
      detectedReason: 'Clause permits full forfeiture of funds upon any breach.'
    });
  }

  // Check 4: Unilateral entry or immediate eviction/termination
  const reEntryMatch = text.match(/(?:re-enter|change locks|terminate(?:d)?\s+immediately|twenty-four \(24\) hours)[^.!?\n]*/i);
  if (reEntryMatch) {
    score += 16;
    terminationRisk += 25;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Accelerated Termination / Extrajudicial Remedies',
      severity: 'critical',
      category: 'termination',
      clauseId: 'C7',
      verbatimQuote: reEntryMatch[0].trim().slice(0, 140),
      impactAnalysis: 'Drastic enforcement actions (lockouts, termination, asset seizure) can be triggered with 24 hours notice or zero opportunity to cure.',
      suggestedRevision: 'Mandate at least 15 days written notice with explicit right to cure before any termination or default remedy.',
      detectedReason: 'Disproportionately swift termination or self-help remedies without judicial recourse.'
    });
  }

  // Check 5: Unilateral fee discretion
  const discretionMatch = text.match(/(?:sole|unreviewed|unilateral)\s+discretion[^.!?\n]*/i);
  if (discretionMatch) {
    score += 12;
    financialRisk += 20;
    complianceRisk += 25;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Unchecked Discretionary Surcharges or Fees',
      severity: 'high',
      category: 'financial',
      clauseId: 'C6',
      verbatimQuote: discretionMatch[0].trim().slice(0, 140),
      impactAnalysis: 'Permits the opposing party to calculate and assess charges at will with no external benchmark or audit right.',
      suggestedRevision: 'Replace "sole discretion" with "reasonable commercial judgment, substantiated by audited receipts and documentation."',
      detectedReason: 'Open-ended discretionary authority over fees or contractual conditions.'
    });
  }

  // Check 6: Non-compete or IP assignment
  const ipMatch = text.match(/(?:all right, title, and interest|authored.*?at any time|non-compete|anywhere in the world)[^.!?\n]*/i);
  if (ipMatch) {
    score += 20;
    liabilityRisk += 30;
    concerns.push({
      id: `KC-${concerns.length + 1}`,
      title: 'Excessive Restrictive Covenants / Broad IP Grab',
      severity: 'critical',
      category: 'ip',
      clauseId: 'C3',
      verbatimQuote: ipMatch[0].trim().slice(0, 140),
      impactAnalysis: 'Severe restraint on trade or claim over creations produced outside of direct paid business scope.',
      suggestedRevision: 'Confine assignment strictly to specific work product delivered under the agreement, and remove blanket non-competes.',
      detectedReason: 'Broad restrictive covenants or overreaching intellectual property transfer.'
    });
  }

  // Normalize scores
  score = Math.min(98, Math.max(15, score));
  financialRisk = Math.min(99, Math.max(10, financialRisk));
  liabilityRisk = Math.min(99, Math.max(10, liabilityRisk));
  terminationRisk = Math.min(99, Math.max(10, terminationRisk));
  complianceRisk = Math.min(99, Math.max(10, complianceRisk));

  let riskLevel: RiskLevel = 'low';
  if (score >= 75) riskLevel = 'critical';
  else if (score >= 55) riskLevel = 'high';
  else if (score >= 35) riskLevel = 'moderate';

  const docTitle = text.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 45) || 'Legal Agreement';

  return {
    totalRiskScore: score,
    riskLevel,
    verdict: score >= 75 ? 'Critical Warning: High Risk Traps Detected' : score >= 55 ? 'Action Required: Significant Concerns Flagged' : 'Moderate Posture: Minor Revisions Recommended',
    executiveSummary: `Analysis completed across ${clauses.length} distinct clauses. The document exhibits a risk score of ${score}/100 with ${concerns.length} key concerns requiring negotiation before execution.`,
    scoreBreakdown: {
      financial: financialRisk,
      liability: liabilityRisk,
      termination: terminationRisk,
      compliance: complianceRisk
    },
    keyConcerns: concerns,
    safeguardsFound: [
      {
        id: 'SG-1',
        title: 'Written Agreement Formalism',
        description: 'Terms are documented in a formal written structure.',
        clauseId: 'C1'
      }
    ],
    missingClauses: [
      {
        id: 'MC-1',
        title: 'Liability Cap',
        description: 'Lacks mutual dollar cap on aggregate liability.',
        standardProtection: 'Mutual cap equal to 1x-2x contract fees.'
      },
      {
        id: 'MC-2',
        title: 'Notice & Cure Grace Period',
        description: 'Missing standard 15-day cure notice prior to default.',
        standardProtection: 'Written cure window for remediable breach.'
      }
    ],
    clauses,
    documentType: docTitle,
    partiesIdentified: ['Party A', 'Party B'],
    totalClausesCount: clauses.length,
    analyzedAt: new Date().toISOString(),
    isAiGenerated: false
  };
}

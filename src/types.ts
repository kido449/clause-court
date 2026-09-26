export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export type ConcernCategory = 
  | 'liability' 
  | 'financial' 
  | 'termination' 
  | 'ambiguity' 
  | 'ip' 
  | 'dispute';

export interface ScoreBreakdown {
  financial: number;
  liability: number;
  termination: number;
  compliance: number;
}

export interface KeyConcern {
  id: string;
  title: string;
  severity: RiskLevel;
  category: ConcernCategory;
  clauseId: string;
  clauseTitle?: string;
  verbatimQuote: string;
  impactAnalysis: string;
  suggestedRevision: string;
  detectedReason: string;
}

export interface Safeguard {
  id: string;
  title: string;
  description: string;
  clauseId?: string;
}

export interface MissingClause {
  id: string;
  title: string;
  description: string;
  standardProtection: string;
}

export interface ClauseItem {
  clauseId: string;
  number?: number;
  title: string;
  text: string;
  riskLevel: RiskLevel;
  associatedConcernIds: string[];
}

export interface DocumentAnalysisResult {
  totalRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  verdict: string;
  executiveSummary: string;
  scoreBreakdown: ScoreBreakdown;
  keyConcerns: KeyConcern[];
  safeguardsFound: Safeguard[];
  missingClauses: MissingClause[];
  clauses: ClauseItem[];
  documentType: string;
  partiesIdentified?: string[];
  totalClausesCount: number;
  analyzedAt: string;
  isAiGenerated: boolean;
}

export interface SampleContract {
  id: string;
  title: string;
  category: string;
  riskExpectation: RiskLevel;
  description: string;
  text: string;
}

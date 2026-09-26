import { describe, it, expect } from 'vitest';
import { analyzeContractHeuristic, PRECOMPUTED_ANALYSES } from '../src/services/analyzer';

const SAMPLE_CONTRACT_TEXT = `
COMMERCIAL OFFICE LEASE AGREEMENT

1. PREMISES & TERM. Landlord leases to Tenant Suite 400. The initial term is thirty-six (36) months.

2. BASE RENT. Tenant shall pay base monthly rent of $12,500.00.

3. SECURITY DEPOSIT. Tenant shall deposit $37,500.00 as security. Landlord may retain the entire deposit as liquidated damages without prejudice.

4. INDEMNIFICATION. Tenant agrees to indemnify Landlord regardless of whether caused by the negligence of Landlord.

5. AUTOMATIC RENEWAL. Unless Tenant gives written notice by certified mail at least 180 days prior, this Lease shall automatically renew.
`;

describe('Risk Score — Heuristic Analyzer Output Validation', () => {
  it('should return totalRiskScore as a number between 0 and 100', () => {
    const result = analyzeContractHeuristic(SAMPLE_CONTRACT_TEXT);
    expect(typeof result.totalRiskScore).toBe('number');
    expect(result.totalRiskScore).toBeGreaterThanOrEqual(0);
    expect(result.totalRiskScore).toBeLessThanOrEqual(100);
  });

  it('should return a valid riskLevel string', () => {
    const result = analyzeContractHeuristic(SAMPLE_CONTRACT_TEXT);
    expect(['critical', 'high', 'moderate', 'low']).toContain(result.riskLevel);
  });

  it('should return scoreBreakdown with all 4 pillars between 0-100', () => {
    const result = analyzeContractHeuristic(SAMPLE_CONTRACT_TEXT);
    const { financial, liability, termination, compliance } = result.scoreBreakdown;

    expect(typeof financial).toBe('number');
    expect(financial).toBeGreaterThanOrEqual(0);
    expect(financial).toBeLessThanOrEqual(100);

    expect(typeof liability).toBe('number');
    expect(liability).toBeGreaterThanOrEqual(0);
    expect(liability).toBeLessThanOrEqual(100);

    expect(typeof termination).toBe('number');
    expect(termination).toBeGreaterThanOrEqual(0);
    expect(termination).toBeLessThanOrEqual(100);

    expect(typeof compliance).toBe('number');
    expect(compliance).toBeGreaterThanOrEqual(0);
    expect(compliance).toBeLessThanOrEqual(100);
  });

  it('should return keyConcerns as a non-empty array for risky contract', () => {
    const result = analyzeContractHeuristic(SAMPLE_CONTRACT_TEXT);
    expect(Array.isArray(result.keyConcerns)).toBe(true);
    expect(result.keyConcerns.length).toBeGreaterThan(0);
  });

  it('should assign high/critical riskLevel for dangerous contracts', () => {
    const result = analyzeContractHeuristic(SAMPLE_CONTRACT_TEXT);
    expect(['critical', 'high']).toContain(result.riskLevel);
  });
});

describe('Risk Score — Precomputed Sample Analyses', () => {
  it('should have precomputed analysis for commercial-lease with score 88', () => {
    const analysis = PRECOMPUTED_ANALYSES['commercial-lease'];
    expect(analysis).toBeDefined();
    expect(analysis.totalRiskScore).toBe(88);
    expect(analysis.riskLevel).toBe('critical');
  });

  it('should have precomputed analysis for mutual-nda with low risk', () => {
    const analysis = PRECOMPUTED_ANALYSES['mutual-nda'];
    expect(analysis).toBeDefined();
    expect(analysis.totalRiskScore).toBeLessThanOrEqual(30);
    expect(analysis.riskLevel).toBe('low');
  });

  it('should have all 4 precomputed sample analyses', () => {
    const keys = Object.keys(PRECOMPUTED_ANALYSES);
    expect(keys).toContain('commercial-lease');
    expect(keys).toContain('freelance-services');
    expect(keys).toContain('residential-tenancy');
    expect(keys).toContain('mutual-nda');
    expect(keys.length).toBe(4);
  });

  it('each precomputed analysis should have valid totalRiskScore 0-100', () => {
    for (const [_key, analysis] of Object.entries(PRECOMPUTED_ANALYSES)) {
      expect(typeof analysis.totalRiskScore).toBe('number');
      expect(analysis.totalRiskScore).toBeGreaterThanOrEqual(0);
      expect(analysis.totalRiskScore).toBeLessThanOrEqual(100);
    }
  });
});

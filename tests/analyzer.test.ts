import { describe, it, expect } from 'vitest';
import { analyzeContractHeuristic, splitContractIntoClauses } from '../src/services/analyzer';

// Sample contract text containing indemnity, auto-renewal, and deposit clauses
const INDEMNITY_CONTRACT = `
COMMERCIAL OFFICE LEASE AGREEMENT

1. PREMISES & TERM. Landlord leases to Tenant Suite 400. The initial term is thirty-six (36) months.

2. BASE RENT. Tenant shall pay base monthly rent of $12,500.00.

3. SECURITY DEPOSIT & FORFEITURE. Tenant shall deposit $37,500.00 as security. In the event of any breach, Landlord may retain the entire deposit as liquidated damages without prejudice to any additional damage claims.

4. INDEMNIFICATION & LIABILITY. Tenant agrees to indemnify, defend, protect, and hold harmless Landlord from and against any and all claims, liabilities, losses, damages, regardless of whether caused in whole or in part by the negligence or willful misconduct of Landlord.

5. AUTOMATIC RENEWAL. Unless Tenant gives written notice of non-renewal by certified mail at least one hundred eighty (180) days prior to lease expiration, this Lease shall automatically renew for a successive three (3) year term.
`;

const CLEAN_CONTRACT = `
MUTUAL NON-DISCLOSURE AGREEMENT

1. PURPOSE. This Agreement governs the exchange of confidential information between the parties.

2. DEFINITION. Confidential Information means non-public business or technical information.

3. OBLIGATIONS. Each party shall protect the other's Confidential Information using reasonable care.

4. TERM. This Agreement shall remain in effect for two (2) years from the Effective Date.
`;

describe('Heuristic Analyzer — Indemnity Detection', () => {
  it('should detect broad indemnification clause as critical', () => {
    const result = analyzeContractHeuristic(INDEMNITY_CONTRACT);
    const indemnityKC = result.keyConcerns.find(
      (kc) => kc.title.toLowerCase().includes('indemnif')
    );
    expect(indemnityKC).toBeDefined();
    expect(indemnityKC!.severity).toBe('critical');
    expect(indemnityKC!.category).toBe('liability');
  });

  it('should NOT flag indemnity on a clean NDA', () => {
    const result = analyzeContractHeuristic(CLEAN_CONTRACT);
    const indemnityKC = result.keyConcerns.find(
      (kc) => kc.title.toLowerCase().includes('indemnif')
    );
    expect(indemnityKC).toBeUndefined();
  });
});

describe('Heuristic Analyzer — Auto-Renewal Detection', () => {
  it('should detect automatic renewal clause as high severity', () => {
    const result = analyzeContractHeuristic(INDEMNITY_CONTRACT);
    const renewalKC = result.keyConcerns.find(
      (kc) => kc.title.toLowerCase().includes('renewal') || kc.title.toLowerCase().includes('rollover')
    );
    expect(renewalKC).toBeDefined();
    expect(['high', 'critical']).toContain(renewalKC!.severity);
    expect(renewalKC!.category).toBe('termination');
  });
});

describe('Heuristic Analyzer — Deposit Forfeiture Detection', () => {
  it('should detect deposit forfeiture / liquidated damages clause', () => {
    const result = analyzeContractHeuristic(INDEMNITY_CONTRACT);
    const depositKC = result.keyConcerns.find(
      (kc) =>
        kc.title.toLowerCase().includes('deposit') ||
        kc.title.toLowerCase().includes('liquidated') ||
        kc.title.toLowerCase().includes('forfeiture')
    );
    expect(depositKC).toBeDefined();
    expect(['high', 'critical']).toContain(depositKC!.severity);
    expect(depositKC!.category).toBe('financial');
  });
});

describe('Clause Splitter', () => {
  it('should split a numbered contract into individual clauses', () => {
    const clauses = splitContractIntoClauses(INDEMNITY_CONTRACT);
    expect(clauses.length).toBeGreaterThanOrEqual(3);
    expect(clauses[0].clauseId).toBe('C1');
  });

  it('should assign clauseId in C{N} format', () => {
    const clauses = splitContractIntoClauses(INDEMNITY_CONTRACT);
    for (const clause of clauses) {
      expect(clause.clauseId).toMatch(/^C\d+$/);
    }
  });
});

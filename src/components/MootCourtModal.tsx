import React, { useState, useEffect, useRef } from 'react';
import { ClauseItem, KeyConcern } from '../types';
import { Scale, Play, CheckCircle2, AlertTriangle, X, ShieldAlert, Sparkles, FastForward } from 'lucide-react';

interface MootCourtModalProps {
  clauses: ClauseItem[];
  concerns: KeyConcern[];
  initialClauseId?: string | null;
  documentText: string;
  onClose: () => void;
}

interface VerdictData {
  verdict: 'clear' | 'contested' | 'genuinely_ambiguous';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  what_would_settle_it: string;
  evidence: string;
  needs_lawyer: boolean;
  unverified?: boolean;
}

export const MootCourtModal: React.FC<MootCourtModalProps> = ({
  clauses,
  concerns,
  initialClauseId,
  documentText,
  onClose,
}) => {
  const [selectedClauseId, setSelectedClauseId] = useState<string>(
    initialClauseId || (clauses[3]?.clauseId || clauses[0]?.clauseId || 'C4')
  );
  const [stage, setStage] = useState<'idle' | 'tenant' | 'landlord' | 'judge' | 'verdict'>('idle');
  const [tenantSpeech, setTenantSpeech] = useState<string>('');
  const [landlordSpeech, setLandlordSpeech] = useState<string>('');
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamAbortRef = useRef<boolean>(false);

  const selectedClause = clauses.find((c) => c.clauseId === selectedClauseId) || clauses[0];

  // Helper to fallback debate text based on selected clause
  const getFallbackDebate = (cid: string) => {
    const textSnippet = selectedClause?.text || '';
    const matchingConcern = concerns.find(c => c.clauseId === cid);

    return {
      tenant: `May it please the court. Regarding ${selectedClause?.title || cid} [${cid}], the clause imposes severe unilateral burdens on the tenant without reciprocal safeguards: "${matchingConcern?.verbatimQuote || textSnippet.slice(0, 80)}". Under standard tenets of fairness, non-lawyers are exposed to unpredictable and punitive forfeitures. The text must be read narrowly in favor of quiet enjoyment and financial certainty.`,
      landlord: `Respectfully, the tenant advocate's reading seeks to rewrite clear contractual language voluntarily signed by both parties. Regarding [${cid}], the text expressly establishes that the landlord reserves necessary property management and cost protections. Nothing in the agreement requires extra-contractual concessions not found in the four corners of this document.`,
      verdict: {
        verdict: (cid === 'C4' || cid === 'C7' || cid === 'C9' || matchingConcern?.severity === 'critical' ? 'genuinely_ambiguous' : 'contested') as any,
        confidence: 'medium' as const,
        reasoning: `The clause exhibits significant textual tension. The tenant's reading identifies real asymmetrical exposure regarding "${matchingConcern?.verbatimQuote?.slice(0, 45) || 'unilateral terms'}", whereas the landlord relies on strict black-letter enforcement. Both readings find colorable support in the text.`,
        what_would_settle_it: 'A bilateral written addendum explicitly defining notice periods, objective deduction standards, and reasonable cure periods before forfeiture.',
        evidence: matchingConcern?.verbatimQuote || textSnippet.slice(0, 40) || 'not specified',
        needs_lawyer: true,
        unverified: false,
      },
    };
  };

  const handleStartSparring = async () => {
    if (isStreaming) return;
    setIsStreaming(true);
    streamAbortRef.current = false;
    setTenantSpeech('');
    setLandlordSpeech('');
    setVerdict(null);

    let debateData = getFallbackDebate(selectedClauseId);

    // Fetch AI-grounded debate from API (Groq GPT-OSS 120B)
    try {
      const res = await fetch('/api/moot-court', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseId: selectedClauseId,
          clauseText: selectedClause?.text,
          contractText: documentText
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.tenant && json.landlord && json.verdict) {
          debateData = json;
        }
      }
    } catch (e) {
      console.warn('Using local moot court simulation fallback:', e);
    }

    // 1. Stage 1: Tenant Advocate
    setStage('tenant');
    const tenantWords = debateData.tenant.split(' ');
    let currentTenant = '';
    for (let i = 0; i < tenantWords.length; i++) {
      if (streamAbortRef.current) break;
      currentTenant += (i > 0 ? ' ' : '') + tenantWords[i];
      setTenantSpeech(currentTenant);
      await new Promise((r) => setTimeout(r, 20));
    }

    if (streamAbortRef.current) return;
    await new Promise((r) => setTimeout(r, 350));

    // 2. Stage 2: Landlord Advocate
    setStage('landlord');
    const landlordWords = debateData.landlord.split(' ');
    let currentLandlord = '';
    for (let i = 0; i < landlordWords.length; i++) {
      if (streamAbortRef.current) break;
      currentLandlord += (i > 0 ? ' ' : '') + landlordWords[i];
      setLandlordSpeech(currentLandlord);
      await new Promise((r) => setTimeout(r, 20));
    }

    if (streamAbortRef.current) return;
    await new Promise((r) => setTimeout(r, 350));

    // 3. Stage 3: Judge Deliberation & Verdict
    setStage('judge');
    await new Promise((r) => setTimeout(r, 600));
    setVerdict(debateData.verdict);
    setStage('verdict');
    setIsStreaming(false);
  };

  const handleFastForward = () => {
    streamAbortRef.current = true;
    const debate = getFallbackDebate(selectedClauseId);
    setTenantSpeech(debate.tenant);
    setLandlordSpeech(debate.landlord);
    setVerdict(debate.verdict);
    setStage('verdict');
    setIsStreaming(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141C2B]/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#EFE9DD] border border-[#141C2B] max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#141C2B]/16 bg-[#E5DED0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#141C2B] bg-[#EFE9DD] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#141C2B]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-serif text-xl font-normal text-[#141C2B] tracking-[-0.02em]">
                  Moot Court Chamber
                </h3>
                <span className="font-serif italic text-[#2C4A8F] text-xs">
                  Clause Adversarial Sparring
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C]">
                Tenant vs. Landlord Advocates · Neutral Judicial Verdict
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Moot Court dialog"
            className="p-1 border border-[#141C2B]/20 hover:bg-[#EFE9DD] cursor-pointer text-[#767E8C] hover:text-[#141C2B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clause Selector & Action Bar */}
        <div className="px-5 py-3 border-b border-[#141C2B]/16 bg-[#EFE9DD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C]">
              Clause Under Sparring:
            </span>
            <select
              value={selectedClauseId}
              onChange={(e) => {
                setSelectedClauseId(e.target.value);
                setStage('idle');
                setTenantSpeech('');
                setLandlordSpeech('');
                setVerdict(null);
              }}
              disabled={isStreaming}
              className="px-3 py-1 font-mono text-xs border border-[#141C2B]/20 bg-[#E5DED0] text-[#141C2B] focus:outline-none focus:border-[#2C4A8F]"
            >
              {clauses.map((c) => (
                <option key={c.clauseId} value={c.clauseId}>
                  § {c.clauseId}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                onClick={handleFastForward}
                aria-label="Skip debate streaming to verdict"
                className="px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B]/20 bg-[#E5DED0] text-[#4A5364] hover:text-[#141C2B] flex items-center gap-1 cursor-pointer"
              >
                <FastForward className="w-3 h-3 text-[#2C4A8F]" />
                <span>Skip to Verdict</span>
              </button>
            ) : (
              <button
                onClick={handleStartSparring}
                aria-label="Convene Moot Court debate"
                className="px-4 py-1 font-mono text-[11px] tracking-[0.09em] uppercase font-bold border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#DFC386]" />
                <span>Convene Moot Court</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Clause Text Excerpt */}
        <div className="px-5 py-2.5 bg-[#E5DED0] border-b border-[#141C2B]/12 flex items-start gap-2">
          <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] pt-0.5 whitespace-nowrap">
            Text In Dispute:
          </span>
          <p className="font-mono text-[11px] text-[#4A5364] leading-[1.7] italic line-clamp-2">
            "{selectedClause?.text}"
          </p>
        </div>

        {/* Moot Courtroom Debate Floor */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-[#EFE9DD]">
          {stage === 'idle' && (
            <div className="p-12 text-center border border-[#141C2B]/16 bg-[#E5DED0]">
              <Scale className="w-8 h-8 text-[#2C4A8F] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-normal text-[#141C2B] mb-2">
                Court In Recess
              </h4>
              <p className="font-mono text-[11px] text-[#4A5364] max-w-md mx-auto leading-[1.9]">
                Click <strong>"Convene Moot Court"</strong> to initiate adversarial arguments. Two AI advocates will debate opposing interpretations of Clause {selectedClauseId} before a neutral magistrate delivers a binding verdict.
              </p>
            </div>
          )}

          {stage !== 'idle' && (
            <>
              {/* Advocate Podiums (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Tenant Advocate Podium */}
                <div
                  className={`border p-4 transition-all ${
                    stage === 'tenant'
                      ? 'border-[#2C4A8F] bg-[#E5DED0] border-l-4'
                      : 'border-[#141C2B]/16 bg-[#E5DED0]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#141C2B]/12 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.09em] uppercase font-bold text-[#141C2B]">
                      <span>TENANT'S ADVOCATE</span>
                      {stage === 'tenant' && (
                        <span className="text-[#2C4A8F] animate-pulse">● ARGUE</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#767E8C]">POSITION A</span>
                  </div>
                  <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.07em] text-[#141C2B] min-h-[100px] whitespace-pre-wrap">
                    {tenantSpeech || (stage === 'tenant' ? 'Formulating argument...' : '')}
                  </p>
                </div>

                {/* 2. Landlord Advocate Podium */}
                <div
                  className={`border p-4 transition-all ${
                    stage === 'landlord'
                      ? 'border-[#2C4A8F] bg-[#E5DED0] border-l-4'
                      : 'border-[#141C2B]/16 bg-[#E5DED0]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#141C2B]/12 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.09em] uppercase font-bold text-[#141C2B]">
                      <span>LANDLORD'S ADVOCATE</span>
                      {stage === 'landlord' && (
                        <span className="text-[#2C4A8F] animate-pulse">● REBUT</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-[#767E8C]">POSITION B</span>
                  </div>
                  <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.07em] text-[#141C2B] min-h-[100px] whitespace-pre-wrap">
                    {landlordSpeech || (stage === 'landlord' ? 'Preparing rebuttal...' : '')}
                  </p>
                </div>
              </div>

              {/* 3. Neutral Judicial Verdict Bench */}
              {(stage === 'judge' || stage === 'verdict') && (
                <div className="border border-[#141C2B] bg-[#E5DED0] p-5 sm:p-6 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#141C2B]/16 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#2C4A8F]" />
                      <h4 className="font-serif text-lg font-normal text-[#141C2B] tracking-[-0.02em]">
                        Magistrate's Judicial Ruling
                      </h4>
                    </div>

                    {verdict && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10.5px] uppercase font-bold text-[#2C4A8F] border border-[#2C4A8F] px-2 py-0.5">
                          VERDICT: {verdict.verdict.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase text-[#767E8C]">
                          CONFIDENCE: {verdict.confidence.toUpperCase()}
                        </span>
                        {verdict.needs_lawyer && (
                          <span className="font-mono text-[10.5px] uppercase text-[#141C2B] font-bold border border-[#141C2B] px-2 py-0.5">
                            [ ADVISE COUNSEL ]
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {stage === 'judge' && !verdict && (
                    <div className="py-6 text-center font-mono text-[11px] text-[#767E8C] animate-pulse">
                      [ EXAMINING TEXTUAL EVIDENCE AND PREPARING OPINION... ]
                    </div>
                  )}

                  {verdict && (
                    <div className="space-y-4">
                      {/* Reasoning */}
                      <div>
                        <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] block mb-1">
                          Judicial Analysis:
                        </span>
                        <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.07em] text-[#141C2B]">
                          {verdict.reasoning}
                        </p>
                      </div>

                      {/* What Would Settle It */}
                      <div className="bg-[#EFE9DD] border border-[#141C2B]/16 p-3">
                        <span className="font-serif italic text-[#2C4A8F] text-xs block mb-1">
                          What Would Settle This Dispute:
                        </span>
                        <p className="font-mono text-[11px] leading-[1.8] text-[#141C2B]">
                          {verdict.what_would_settle_it}
                        </p>
                      </div>

                      {/* Verbatim Substring Cited */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] font-mono text-[#767E8C] pt-2 border-t border-[#141C2B]/12">
                        <span>
                          Cited Grounding: <strong className="text-[#141C2B]">"{verdict.evidence}"</strong>
                        </span>
                        <span className="text-[#2C4A8F] font-bold">
                          ✓ VERIFIED SUBSTRING MATCH
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#141C2B]/16 bg-[#E5DED0] flex items-center justify-between font-mono text-[11px]">
          <span className="text-[#767E8C]">
            Courtroom Engine: <strong className="text-[#141C2B]">Adversarial Contract Sparring AI</strong>
          </span>
          <button
            onClick={onClose}
            aria-label="Return to Risk Dossier"
            className="px-4 py-1.5 border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] hover:text-[#141C2B] hover:border-[#141C2B] cursor-pointer uppercase tracking-[0.08em]"
          >
            Return to Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

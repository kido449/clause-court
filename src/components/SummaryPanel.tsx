import React, { useState, useMemo } from 'react';
import { DocumentAnalysisResult, KeyConcern, RiskLevel, ConcernCategory } from '../types';
import { RiskMeter } from './RiskMeter';
import { 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2,
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';

interface SummaryPanelProps {
  analysis: DocumentAnalysisResult;
  onSelectClause?: (clauseId: string) => void;
  onExportReport?: () => void;
  onOpenMootCourt?: (clauseId?: string) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  analysis,
  onSelectClause,
  onExportReport,
  onOpenMootCourt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ConcernCategory>('all');
  const [resolvedConcerns, setResolvedConcerns] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSafeguards, setShowSafeguards] = useState(false);
  const [showMissing, setShowMissing] = useState(true);

  // Quick counts
  const criticalCount = useMemo(() => 
    analysis.keyConcerns.filter(c => c.severity === 'critical').length, 
    [analysis.keyConcerns]
  );
  const highCount = useMemo(() => 
    analysis.keyConcerns.filter(c => c.severity === 'high').length, 
    [analysis.keyConcerns]
  );
  const moderateCount = useMemo(() => 
    analysis.keyConcerns.filter(c => c.severity === 'moderate').length, 
    [analysis.keyConcerns]
  );

  // Filtered concerns
  const filteredConcerns = useMemo(() => {
    return analysis.keyConcerns.filter(c => {
      if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesQuote = c.verbatimQuote.toLowerCase().includes(q);
        const matchesImpact = c.impactAnalysis.toLowerCase().includes(q);
        const matchesClause = c.clauseId.toLowerCase().includes(q);
        return matchesTitle || matchesQuote || matchesImpact || matchesClause;
      }
      return true;
    });
  }, [analysis.keyConcerns, severityFilter, categoryFilter, searchQuery]);

  const toggleResolved = (id: string) => {
    setResolvedConcerns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyRevision = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityLabel = (sev: RiskLevel) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[#141C2B] font-bold">[ CRITICAL TRAP ]</span>;
      case 'high':
        return <span className="text-[#4A5364] font-bold">[ HIGH WARNING ]</span>;
      case 'moderate':
        return <span className="text-[#767E8C] font-semibold">[ MODERATE RISK ]</span>;
      default:
        return <span className="text-[#767E8C]">[ CUSTOMARY ]</span>;
    }
  };

  const getCategoryName = (cat: ConcernCategory) => {
    const map: Record<ConcernCategory, string> = {
      liability: 'Liability & Indemnity',
      financial: 'Financial Penalty',
      termination: 'Termination Lock-in',
      ambiguity: 'Ambiguity & Vagueness',
      ip: 'Intellectual Property',
      dispute: 'Dispute Arbitration'
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-6" id="summary-panel-container">
      {/* Editorial Document Header Card */}
      <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#767E8C] mb-2 uppercase">
              <span className="text-[#141C2B] font-bold">Document: {analysis.documentType}</span>
              <span>·</span>
              <span>Audited: {analysis.totalClausesCount} Clauses</span>
              {analysis.partiesIdentified && analysis.partiesIdentified.length > 0 && (
                <>
                  <span>·</span>
                  <span>Parties: {analysis.partiesIdentified.join(' / ')}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-[#141C2B] tracking-[-0.02em] leading-tight">
              Contract Risk & AI Legal Intelligence <span className="font-serif italic text-[#2C4A8F]">Summary Dossier</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {onOpenMootCourt && (
              <button
                onClick={() => onOpenMootCourt()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] transition-colors cursor-pointer font-bold"
              >
                <Scale className="w-3.5 h-3.5 text-[#DFC386]" />
                <span>Convene Moot Court</span>
              </button>
            )}
            {onExportReport && (
              <button
                onClick={onExportReport}
                id="btn-export-summary"
                className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#EFE9DD] text-[#141C2B] hover:bg-[#141C2B] hover:text-[#EFE9DD] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#2C4A8F]" />
                <span>Export Brief</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Section: Stamped Risk Meter + Executive Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Risk Meter Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <RiskMeter
            score={analysis.totalRiskScore}
            riskLevel={analysis.riskLevel}
            breakdown={analysis.scoreBreakdown}
            verdict={analysis.verdict}
          />
        </div>

        {/* Right Column: AI Executive Briefing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#E5DED0] border border-[#141C2B]/16 p-6">
          <div>
            <div className="flex items-center justify-between border-b border-[#141C2B]/16 pb-2 mb-3">
              <span className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C]">
                Executive Assessment
              </span>
              <span className="font-serif italic text-[#2C4A8F] text-xs">
                Neutral Legal Analysis
              </span>
            </div>

            <h2 className="font-serif text-xl font-normal text-[#141C2B] mb-3 leading-snug tracking-[-0.02em]">
              {analysis.verdict}
            </h2>

            <div className="bg-[#EFE9DD] border border-[#141C2B]/16 p-4 mb-5">
              <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.08em] text-[#141C2B]">
                {analysis.executiveSummary}
              </p>
            </div>
          </div>

          {/* Metric Ledger Table */}
          <div className="border-t border-[#141C2B]/16 pt-4">
            <span className="block font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C] mb-2">
              Concern Tally By Severity
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-[#141C2B]/16 bg-[#EFE9DD] p-2.5 text-center">
                <span className="font-serif text-2xl font-normal text-[#141C2B] block">{criticalCount}</span>
                <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C]">Critical</span>
              </div>
              <div className="border border-[#141C2B]/16 bg-[#EFE9DD] p-2.5 text-center">
                <span className="font-serif text-2xl font-normal text-[#141C2B] block">{highCount}</span>
                <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C]">High Warning</span>
              </div>
              <div className="border border-[#141C2B]/16 bg-[#EFE9DD] p-2.5 text-center">
                <span className="font-serif text-2xl font-normal text-[#141C2B] block">{moderateCount}</span>
                <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C]">Moderate</span>
              </div>
              <div className="border border-[#141C2B]/16 bg-[#EFE9DD] p-2.5 text-center">
                <span className="font-serif text-2xl font-normal text-[#141C2B] block">{analysis.safeguardsFound.length}</span>
                <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C]">Safeguards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concerns Section */}
      <div className="bg-[#E5DED0] border border-[#141C2B]/16">
        {/* Section Header with Controls */}
        <div className="p-6 border-b border-[#141C2B]/16">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-4">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#141C2B] tracking-[-0.02em]">
                Audited Key Concerns <span className="font-serif italic text-[#2C4A8F]">— Ranked & Cited</span>
              </h3>
              <p className="font-mono text-[11px] text-[#767E8C] tracking-[0.08em] mt-0.5">
                Each finding cites verbatim contractual evidence under 25 words with recommended revisions.
              </p>
            </div>
            <span className="font-mono text-[11px] tracking-[0.08em] text-[#141C2B] self-start">
              Showing {filteredConcerns.length} of {analysis.keyConcerns.length} Findings
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#141C2B]/16">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767E8C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concern, quote, or clause..."
                className="w-full pl-8 pr-3 py-1 font-mono text-[11px] border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] focus:outline-none focus:border-[#2C4A8F]"
              />
            </div>

            {/* Severity Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {(['all', 'critical', 'high', 'moderate'] as const).map((sev) => {
                const isActive = severityFilter === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] uppercase border transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#141C2B] bg-[#EFE9DD] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                        : 'border-[#141C2B]/16 bg-[#E5DED0] text-[#767E8C] hover:text-[#141C2B]'
                    }`}
                  >
                    {sev === 'all' ? 'All Severities' : sev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Concerns Docket / List */}
        <div className="divide-y divide-[#141C2B]/16">
          {filteredConcerns.length === 0 ? (
            <div className="p-12 text-center font-mono text-[11px] text-[#767E8C] tracking-[0.08em]">
              No contractual concerns match the current search filter criteria.
            </div>
          ) : (
            filteredConcerns.map((concern, index) => {
              const isResolved = !!resolvedConcerns[concern.id];
              const isCopied = copiedId === concern.id;

              return (
                <article
                  key={concern.id}
                  id={`concern-card-${concern.id}`}
                  className={`p-6 transition-colors ${
                    isResolved ? 'opacity-60 bg-[#E5DED0]/60' : 'bg-[#E5DED0] hover:bg-[#EAE4D7]'
                  }`}
                >
                  {/* Concern Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-[11px] tracking-[0.09em] uppercase font-bold text-[#141C2B]">
                        #{index + 1} {concern.id}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.08em]">
                        {getSeverityLabel(concern.severity)}
                      </span>
                      <span className="font-mono text-[11px] text-[#767E8C] uppercase tracking-[0.08em]">
                        · {getCategoryName(concern.category)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenMootCourt && (
                        <button
                          onClick={() => onOpenMootCourt(concern.clauseId)}
                          className="font-mono text-[11px] tracking-[0.08em] text-[#2C4A8F] hover:underline flex items-center gap-1 cursor-pointer font-bold mr-1"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#2C4A8F]" />
                          <span>Spar in Moot Court</span>
                        </button>
                      )}
                      {onSelectClause && (
                        <button
                          onClick={() => onSelectClause(concern.clauseId)}
                          className="font-mono text-[11px] tracking-[0.08em] text-[#4A5364] hover:text-[#141C2B] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect Clause {concern.clauseId}</span>
                          <ExternalLink className="w-3 h-3 text-[#767E8C]" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleResolved(concern.id)}
                        className={`font-mono text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 border border-[#141C2B]/20 cursor-pointer ${
                          isResolved ? 'bg-[#141C2B] text-[#EFE9DD]' : 'bg-[#EFE9DD] text-[#4A5364]'
                        }`}
                      >
                        {isResolved ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>

                  {/* Title in Newsreader text serif */}
                  <h4 className="font-serif text-lg font-normal text-[#141C2B] tracking-[-0.02em] mb-3">
                    {concern.title}
                  </h4>

                  {/* Verbatim Quote: styled as true manuscript transcript */}
                  {concern.verbatimQuote && (
                    <div className="mb-3">
                      <span className="block font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] mb-1">
                        Verbatim Contractual Substring (Evidence):
                      </span>
                      <blockquote className="border-l-2 border-[#2C4A8F] pl-3 py-1 font-mono text-[11px] leading-[1.9] text-[#141C2B] bg-[#EFE9DD] border-t border-r border-b border-[#141C2B]/12">
                        "{concern.verbatimQuote}"
                      </blockquote>
                    </div>
                  )}

                  {/* Hazard Analysis & Suggested Revision Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#141C2B]/16">
                    {/* Hazard Impact */}
                    <div>
                      <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] block mb-1">
                        Hazard & Practical Impact:
                      </span>
                      <p className="font-mono text-[11px] leading-[1.9] tracking-[0.08em] text-[#4A5364]">
                        {concern.impactAnalysis}
                      </p>
                    </div>

                    {/* Counter-Proposal Revision */}
                    <div className="bg-[#EFE9DD] border border-[#141C2B]/16 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif italic text-[#2C4A8F] text-xs">
                          Counter-Proposal Phrasing:
                        </span>
                        <button
                          onClick={() => copyRevision(concern.id, concern.suggestedRevision)}
                          className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#141C2B] hover:text-[#2C4A8F] flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-[#2C4A8F]" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-[11px] leading-[1.9] tracking-[0.08em] text-[#141C2B]">
                        {concern.suggestedRevision}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Supplemental Safeguards & Missing Clauses Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Standard Protections */}
        <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-5">
          <div className="flex items-center justify-between border-b border-[#141C2B]/16 pb-2 mb-3">
            <div>
              <h4 className="font-serif text-base font-normal text-[#141C2B] tracking-[-0.02em]">
                Missing Customary Protections <span className="font-serif italic text-[#2C4A8F]">({analysis.missingClauses.length})</span>
              </h4>
              <p className="font-mono text-[10px] tracking-[0.08em] text-[#767E8C]">
                Standard leaseholder safeguards absent from this text
              </p>
            </div>
            <button
              onClick={() => setShowMissing(!showMissing)}
              className="text-[#767E8C] hover:text-[#141C2B] cursor-pointer"
            >
              {showMissing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showMissing && (
            <div className="space-y-3">
              {analysis.missingClauses.map((mc, idx) => (
                <div key={idx} className="bg-[#EFE9DD] border border-[#141C2B]/16 p-3">
                  <div className="font-serif text-sm font-normal text-[#141C2B] mb-1">
                    {mc.title}
                  </div>
                  <p className="font-mono text-[11px] leading-[1.9] tracking-[0.08em] text-[#4A5364] mb-2">
                    {mc.description}
                  </p>
                  <div className="font-mono text-[10.5px] leading-[1.8] tracking-[0.08em] text-[#141C2B] pt-2 border-t border-[#141C2B]/12">
                    <strong className="text-[#2C4A8F]">Drafting Recommendation:</strong> {mc.standardProtection}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Identified Balanced Safeguards */}
        <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-5">
          <div className="flex items-center justify-between border-b border-[#141C2B]/16 pb-2 mb-3">
            <div>
              <h4 className="font-serif text-base font-normal text-[#141C2B] tracking-[-0.02em]">
                Identified Safeguards <span className="font-serif italic text-[#2C4A8F]">({analysis.safeguardsFound.length})</span>
              </h4>
              <p className="font-mono text-[10px] tracking-[0.08em] text-[#767E8C]">
                Provisions offering balanced or reciprocal rights
              </p>
            </div>
            <button
              onClick={() => setShowSafeguards(!showSafeguards)}
              className="text-[#767E8C] hover:text-[#141C2B] cursor-pointer"
            >
              {showSafeguards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showSafeguards ? (
            <div className="space-y-3">
              {analysis.safeguardsFound.length === 0 ? (
                <p className="font-mono text-[11px] text-[#767E8C] p-3 text-center">
                  No reciprocal or affirmative tenant protections identified.
                </p>
              ) : (
                analysis.safeguardsFound.map((sg, idx) => (
                  <div key={idx} className="bg-[#EFE9DD] border border-[#141C2B]/16 p-3">
                    <div className="font-serif text-sm font-normal text-[#141C2B] mb-1">
                      {sg.title} {sg.clauseId && <span className="font-mono text-xs text-[#2C4A8F]">[{sg.clauseId}]</span>}
                    </div>
                    <p className="font-mono text-[11px] leading-[1.9] tracking-[0.08em] text-[#4A5364]">
                      {sg.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="font-mono text-[11px] text-[#767E8C] py-2">
              {analysis.safeguardsFound.length} terms identified. Click expand to examine details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { ClauseItem, KeyConcern } from '../types';
import { FileText, Search, Copy, Check, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  clauses: ClauseItem[];
  concerns: KeyConcern[];
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  clauses,
  concerns,
  selectedClauseId,
  onSelectClause
}) => {
  const [search, setSearch] = useState('');
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedClauseId && clauseRefs.current[selectedClauseId]) {
      clauseRefs.current[selectedClauseId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedClauseId]);

  const handleCopyClause = (clauseId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseId(clauseId);
    setTimeout(() => setCopiedClauseId(null), 2000);
  };

  const filteredClauses = clauses.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.text.toLowerCase().includes(q) || c.clauseId.toLowerCase().includes(q);
  });

  return (
    <div className="bg-[#E5DED0] border border-[#141C2B]/16 flex flex-col h-full overflow-hidden">
      {/* Viewer Header */}
      <div className="p-4 border-b border-[#141C2B]/16 bg-[#E5DED0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-base font-normal text-[#141C2B] tracking-[-0.02em]">
            Clause Inspector <span className="font-serif italic text-[#2C4A8F]">({clauses.length} Articles)</span>
          </h3>
          <p className="font-mono text-[10px] tracking-[0.08em] text-[#767E8C]">
            Synchronized with Key Concerns and Moot Court
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767E8C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clause text..."
            className="w-full pl-8 pr-3 py-1 font-mono text-[11px] border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] focus:outline-none focus:border-[#2C4A8F]"
          />
        </div>
      </div>

      {/* Clause Transcript Feed */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[750px] divide-y divide-[#141C2B]/16">
        {filteredClauses.map((clause) => {
          const isSelected = selectedClauseId === clause.clauseId;
          const matchingConcerns = concerns.filter(
            c => c.clauseId === clause.clauseId || clause.text.includes(c.verbatimQuote?.slice(0, 25) || '___')
          );
          const hasCritical = matchingConcerns.some(c => c.severity === 'critical');
          const hasHigh = matchingConcerns.some(c => c.severity === 'high');

          return (
            <div
              key={clause.clauseId}
              ref={el => { clauseRefs.current[clause.clauseId] = el; }}
              id={`doc-clause-${clause.clauseId}`}
              className={`p-4 transition-colors pt-4 first:pt-0 ${
                isSelected
                  ? 'bg-[#EAE4D7] border-l-2 border-l-[#2C4A8F] pl-4'
                  : 'bg-[#E5DED0]'
              }`}
            >
              {/* Clause Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#141C2B]">
                    [ § {clause.clauseId} ]
                  </span>
                  <h4 className="font-serif text-base font-normal text-[#141C2B] tracking-[-0.02em]">
                    {clause.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {matchingConcerns.length > 0 && (
                    <span className="font-mono text-[10px] tracking-[0.08em] text-[#2C4A8F]">
                      {matchingConcerns.length} concern{matchingConcerns.length > 1 ? 's' : ''} cited
                    </span>
                  )}
                  <button
                    onClick={() => handleCopyClause(clause.clauseId, clause.text)}
                    className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#767E8C] hover:text-[#141C2B] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedClauseId === clause.clauseId ? (
                      <>
                        <Check className="w-3 h-3 text-[#2C4A8F]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verbatim Text */}
              <div className="bg-[#EFE9DD] border border-[#141C2B]/12 p-3 my-2">
                <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.08em] text-[#141C2B] whitespace-pre-wrap">
                  {clause.text}
                </p>
              </div>

              {/* Cited Concerns for this clause */}
              {matchingConcerns.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#141C2B]/10">
                  <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] block">
                    Associated AI Hazards Flagged:
                  </span>
                  {matchingConcerns.map(kc => (
                    <div key={kc.id} className="font-mono text-[10.5px] leading-[1.8] text-[#4A5364] flex items-start gap-1.5">
                      <span className="text-[#2C4A8F] font-bold">›</span>
                      <span>
                        <strong className="text-[#141C2B]">[{kc.id}]</strong> {kc.title} — {kc.impactAnalysis}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

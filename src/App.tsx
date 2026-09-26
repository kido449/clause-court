import React, { useState, useEffect } from 'react';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';
import { DocumentAnalysisResult } from './types';
import { PRECOMPUTED_ANALYSES, analyzeContractHeuristic, splitContractIntoClauses } from './services/analyzer';
import { DocumentSelector } from './components/DocumentSelector';
import { SummaryPanel } from './components/SummaryPanel';
import { DocumentViewer } from './components/DocumentViewer';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ExportModal } from './components/ExportModal';
import { MootCourtModal } from './components/MootCourtModal';
import { LayoutDashboard, Columns, FileText, Scale, Share2, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentContractId, setCurrentContractId] = useState<string>('commercial-lease');
  const [documentText, setDocumentText] = useState<string>(SAMPLE_CONTRACTS[0].text);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'split' | 'document'>('summary');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isMootCourtOpen, setIsMootCourtOpen] = useState<boolean>(false);
  const [activeMootClauseId, setActiveMootClauseId] = useState<string | null>(null);

  // Analyze function
  const runAnalysis = async (text: string, contractId?: string, customTitle?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, contractId })
      });

      if (res.ok) {
        const data: DocumentAnalysisResult = await res.json();
        setAnalysis(data);
      } else {
        if (contractId && PRECOMPUTED_ANALYSES[contractId]) {
          const fallback = { ...PRECOMPUTED_ANALYSES[contractId] };
          fallback.clauses = splitContractIntoClauses(text);
          setAnalysis(fallback);
        } else {
          const heuristicResult = analyzeContractHeuristic(text);
          if (customTitle) heuristicResult.documentType = customTitle;
          setAnalysis(heuristicResult);
        }
      }
    } catch (err: any) {
      if (contractId && PRECOMPUTED_ANALYSES[contractId]) {
        const fallback = { ...PRECOMPUTED_ANALYSES[contractId] };
        fallback.clauses = splitContractIntoClauses(text);
        setAnalysis(fallback);
      } else {
        const heuristicResult = analyzeContractHeuristic(text);
        if (customTitle) heuristicResult.documentType = customTitle;
        setAnalysis(heuristicResult);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialSample = SAMPLE_CONTRACTS[0];
    setDocumentText(initialSample.text);
    runAnalysis(initialSample.text, initialSample.id);
  }, []);

  const handleSelectSample = (id: string) => {
    const sample = SAMPLE_CONTRACTS.find(s => s.id === id);
    if (!sample) return;
    setCurrentContractId(id);
    setDocumentText(sample.text);
    setSelectedClauseId(null);
    runAnalysis(sample.text, id);
  };

  const handleAnalyzeCustom = (text: string, title?: string) => {
    setCurrentContractId('custom');
    setDocumentText(text);
    setSelectedClauseId(null);
    runAnalysis(text, undefined, title);
  };

  const handleSelectClause = (clauseId: string) => {
    setSelectedClauseId(clauseId);
    if (viewMode === 'summary') {
      setViewMode('split');
    }
  };

  const handleOpenMootCourt = (clauseId?: string) => {
    setActiveMootClauseId(clauseId || selectedClauseId || (analysis?.clauses?.[3]?.clauseId || 'C4'));
    setIsMootCourtOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#EFE9DD] flex flex-col text-[#141C2B] font-mono text-[11.5px] leading-[1.9] tracking-[0.08em] selection:bg-[#E5DED0] selection:text-[#2C4A8F]">
      {/* Top Header & Contract Selector */}
      <DocumentSelector
        currentContractId={currentContractId}
        onSelectSample={handleSelectSample}
        onAnalyzeCustom={handleAnalyzeCustom}
        isLoading={isLoading}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* View Mode Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[#141C2B]/16">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setViewMode('summary')}
              id="tab-summary-view"
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-all cursor-pointer border ${
                viewMode === 'summary'
                  ? 'border-[#141C2B] bg-[#E5DED0] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                  : 'border-[#141C2B]/16 bg-[#EFE9DD] text-[#767E8C] hover:text-[#141C2B]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>Risk Dossier</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              id="tab-split-view"
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-all cursor-pointer border ${
                viewMode === 'split'
                  ? 'border-[#141C2B] bg-[#E5DED0] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                  : 'border-[#141C2B]/16 bg-[#EFE9DD] text-[#767E8C] hover:text-[#141C2B]'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>Split Inspector</span>
            </button>
            <button
              onClick={() => setViewMode('document')}
              id="tab-doc-view"
              className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-all cursor-pointer border ${
                viewMode === 'document'
                  ? 'border-[#141C2B] bg-[#E5DED0] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                  : 'border-[#141C2B]/16 bg-[#EFE9DD] text-[#767E8C] hover:text-[#141C2B]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>Clause Text ({analysis?.clauses?.length || 0})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenMootCourt()}
              className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] transition-colors cursor-pointer font-bold"
            >
              <Scale className="w-3.5 h-3.5 text-[#DFC386]" />
              <span>Convene Moot Court</span>
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] hover:border-[#141C2B] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>Export Brief</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-16 text-center flex flex-col items-center justify-center my-6">
            <div className="font-mono text-sm tracking-[0.1em] uppercase text-[#141C2B] mb-2 animate-pulse">
              [ AUDITING CONTRACT TEXT & CALCULATING TOTAL RISK SCORE... ]
            </div>
            <p className="font-mono text-[11px] text-[#4A5364] max-w-md leading-[1.9]">
              Splitting clauses, validating verbatim quotes, examining cross-clause contradictions, and assembling consultation dossier with verified evidence quotes.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-[#E5DED0] border border-[#141C2B] p-6 text-center my-6">
            <AlertCircle className="w-6 h-6 text-[#141C2B] mx-auto mb-2" />
            <h3 className="font-serif text-base font-normal text-[#141C2B] mb-1">Audit Notice</h3>
            <p className="font-mono text-[11px] text-[#4A5364] mb-4">{error}</p>
            <button
              onClick={() => runAnalysis(documentText, currentContractId)}
              className="px-4 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] transition-colors"
            >
              Retry Examination
            </button>
          </div>
        )}

        {/* Main Content Layouts */}
        {!isLoading && analysis && (
          <>
            {/* 1. Full Summary View Mode */}
            {viewMode === 'summary' && (
              <div className="space-y-6">
                <SummaryPanel
                  analysis={analysis}
                  onSelectClause={handleSelectClause}
                  onExportReport={() => setIsExportOpen(true)}
                  onOpenMootCourt={handleOpenMootCourt}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <ScenarioSimulator
                      documentType={analysis.documentType}
                      totalRiskScore={analysis.totalRiskScore}
                    />
                  </div>
                  <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-[#2C4A8F]" />
                        <h4 className="font-serif text-base font-normal text-[#141C2B] tracking-[-0.02em]">
                          Moot Court <span className="font-serif italic text-[#2C4A8F]">Sparring</span>
                        </h4>
                      </div>
                      <p className="font-mono text-[11px] text-[#4A5364] mb-4 leading-[1.9] tracking-[0.07em]">
                        Hear two AI advocates argue opposite readings of any clause before a neutral judge delivers an evidence-grounded verdict.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenMootCourt()}
                      className="w-full py-2 px-3 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] transition-colors cursor-pointer font-bold"
                    >
                      Enter Moot Court Chamber →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Side-by-Side Split View Mode */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <SummaryPanel
                    analysis={analysis}
                    onSelectClause={handleSelectClause}
                    onExportReport={() => setIsExportOpen(true)}
                    onOpenMootCourt={handleOpenMootCourt}
                  />
                  <ScenarioSimulator
                    documentType={analysis.documentType}
                    totalRiskScore={analysis.totalRiskScore}
                  />
                </div>
                <div className="lg:col-span-5 sticky top-20">
                  <DocumentViewer
                    clauses={analysis.clauses}
                    concerns={analysis.keyConcerns}
                    selectedClauseId={selectedClauseId}
                    onSelectClause={(cid) => setSelectedClauseId(cid)}
                  />
                </div>
              </div>
            )}

            {/* 3. Dedicated Document Inspector View Mode */}
            {viewMode === 'document' && (
              <div className="space-y-6">
                <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-[#141C2B] tracking-[-0.02em]">
                      {analysis.documentType} <span className="font-serif italic text-[#2C4A8F]">— Complete Clause Transcript</span>
                    </h2>
                    <p className="font-mono text-[11px] text-[#767E8C] tracking-[0.08em]">
                      Total Risk Score: <strong className="text-[#141C2B]">{analysis.totalRiskScore}/100</strong> · {analysis.keyConcerns.length} Findings Documented
                    </p>
                  </div>
                  <button
                    onClick={() => setViewMode('summary')}
                    className="px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase border border-[#141C2B] bg-[#EFE9DD] text-[#141C2B] hover:bg-[#141C2B] hover:text-[#EFE9DD] transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    ← Return to Dossier
                  </button>
                </div>

                <DocumentViewer
                  clauses={analysis.clauses}
                  concerns={analysis.keyConcerns}
                  selectedClauseId={selectedClauseId}
                  onSelectClause={(cid) => setSelectedClauseId(cid)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Moot Court Live Sparring Modal */}
      {isMootCourtOpen && analysis && (
        <MootCourtModal
          clauses={analysis.clauses}
          concerns={analysis.keyConcerns}
          initialClauseId={activeMootClauseId}
          documentText={documentText}
          onClose={() => setIsMootCourtOpen(false)}
        />
      )}

      {/* Export Report Modal */}
      {isExportOpen && analysis && (
        <ExportModal
          analysis={analysis}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Colophon & Legal Disclaimer Footer */}
      <footer className="border-t border-[#141C2B]/16 bg-[#E5DED0] py-8 mt-12 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Scale className="w-4 h-4 text-[#141C2B]" />
            <p className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#141C2B] font-bold">
              Clause Court · Contract Sparring Partner & Risk Diagnostic
            </p>
          </div>
          <div className="w-12 h-[1px] bg-[#2C4A8F] mx-auto my-2" />
          <p className="font-mono text-[10.5px] text-[#767E8C] max-w-2xl mx-auto leading-[1.8] tracking-[0.07em]">
            Disclaimer: Information only, not legal advice. Every cited claim is grounded in verbatim contract substrings under 25 words. Always consult qualified legal counsel in your jurisdiction before executing binding agreements.
          </p>
        </div>
      </footer>
    </div>
  );
}

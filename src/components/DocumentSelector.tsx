import React, { useState } from 'react';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';
import { FileText, Upload, ChevronDown, Scale, Check } from 'lucide-react';

interface DocumentSelectorProps {
  currentContractId: string | null;
  onSelectSample: (id: string) => void;
  onAnalyzeCustom: (text: string, title?: string) => void;
  isLoading: boolean;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  currentContractId,
  onSelectSample,
  onAnalyzeCustom,
  isLoading
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAnalyzeCustom(customText, customTitle || 'Custom Agreement');
    setIsCustomOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="bg-[#EFE9DD] border-b border-[#141C2B]/16 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Masthead / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#141C2B] bg-[#E5DED0] flex items-center justify-center text-[#141C2B]">
              <Scale className="w-4 h-4 text-[#141C2B]" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl tracking-[-0.02em] font-semibold text-[#141C2B]">
                  Clause Court
                </span>
                <span className="font-serif italic text-[#2C4A8F] text-sm">
                  Contract Sparring Partner
                </span>
              </div>
              <p className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C] leading-none">
                Stationery Diagnostic & Legal Linter · Non-Lawyer Edition
              </p>
            </div>
          </div>

          {/* Sample Selectors & Custom Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-[#767E8C] mr-1 hidden sm:inline">
              Archive:
            </span>

            {SAMPLE_CONTRACTS.map((sample) => {
              const isSelected = currentContractId === sample.id && !isCustomOpen;
              return (
                <button
                  key={sample.id}
                  onClick={() => {
                    setIsCustomOpen(false);
                    onSelectSample(sample.id);
                  }}
                  disabled={isLoading}
                  aria-label={`Select sample contract: ${sample.title}`}
                  className={`px-3 py-1 font-mono text-[11px] tracking-[0.08em] transition-all cursor-pointer flex items-center gap-1.5 border border-[#141C2B]/16 ${
                    isSelected
                      ? 'bg-[#E5DED0] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                      : 'bg-[#EFE9DD] text-[#4A5364] hover:bg-[#E5DED0] hover:text-[#141C2B]'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-[#2C4A8F] text-xs font-mono">§</span>
                  <span className="truncate max-w-[140px] sm:max-w-none">{sample.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsCustomOpen(!isCustomOpen)}
              disabled={isLoading}
              aria-label="Toggle custom document paste or upload panel"
              aria-expanded={isCustomOpen}
              className={`px-3 py-1 font-mono text-[11px] tracking-[0.08em] transition-all cursor-pointer flex items-center gap-1.5 border border-[#141C2B]/16 ${
                isCustomOpen
                  ? 'bg-[#E5DED0] text-[#141C2B] font-bold border-b-2 border-b-[#2C4A8F]'
                  : 'bg-[#EFE9DD] text-[#4A5364] hover:bg-[#E5DED0] hover:text-[#141C2B]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#2C4A8F]" />
              <span>Paste / Upload</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isCustomOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Upload Dropdown */}
        {isCustomOpen && (
          <div className="mt-4 pt-4 border-t border-[#141C2B]/16 bg-[#E5DED0] p-5 border border-[#141C2B]/16">
            <div className="flex items-center justify-between mb-3 border-b border-[#141C2B]/16 pb-2">
              <h4 className="font-serif text-base font-semibold text-[#141C2B] tracking-[-0.02em]">
                Examine Custom Document <span className="font-serif italic text-[#2C4A8F]">— Text or Unformatted PDF</span>
              </h4>
              <span className="font-mono text-[11px] tracking-[0.08em] text-[#767E8C]">
                Untrusted data wrapped in &lt;contract&gt; delimiters
              </span>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C] mb-1">
                    Document Title / Designation
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Standard Residential Tenancy Agreement"
                    className="w-full px-3 py-1.5 font-mono text-xs border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] focus:outline-none focus:border-[#2C4A8F]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C] mb-1">
                    Direct File Attachment
                  </label>
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="w-full font-mono text-[11px] file:mr-2 file:py-1 file:px-2.5 file:border file:border-[#141C2B]/20 file:bg-[#E5DED0] file:text-[#141C2B] file:font-mono file:text-[11px] file:cursor-pointer text-[#4A5364]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C] mb-1">
                  Contract Text Content
                </label>
                <textarea
                  rows={6}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste complete agreement text here for structured risk audit and clause extraction..."
                  className="w-full p-3 font-mono text-[11px] leading-[1.8] border border-[#141C2B]/20 bg-[#EFE9DD] text-[#141C2B] focus:outline-none focus:border-[#2C4A8F]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-[11px] tracking-[0.08em] text-[#767E8C]">
                  {customText.length > 0 ? `${customText.split('\n').length} lines · ~${customText.length} characters` : 'No text entered'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomOpen(false)}
                    aria-label="Cancel custom document input"
                    className="px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] border border-[#141C2B]/20 bg-[#EFE9DD] text-[#4A5364] hover:text-[#141C2B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customText.trim() || isLoading}
                    aria-label="Commence contract risk audit"
                    className="px-4 py-1.5 font-mono text-[11px] tracking-[0.08em] font-bold border border-[#141C2B] bg-[#141C2B] text-[#EFE9DD] hover:bg-[#4A5364] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Auditing Agreement...' : 'Commence Audit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

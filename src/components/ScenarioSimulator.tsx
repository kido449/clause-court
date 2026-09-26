import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface ScenarioSimulatorProps {
  documentType: string;
  totalRiskScore: number;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  documentType,
  totalRiskScore
}) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const getScenarios = () => {
    if (documentType.toLowerCase().includes('lease') || documentType.toLowerCase().includes('residential')) {
      return [
        {
          id: 's1',
          question: 'What if I need to vacate or terminate after 4 months?',
          outcome: 'HIGH EXPOSURE: The default clause accelerates all remaining rent through the end of the term ($400,000+ liability) and permits full retention of the security deposit without mitigation requirement.',
          severity: 'critical'
        },
        {
          id: 's2',
          question: 'What if a guest stays overnight for a weekend?',
          outcome: 'LEASE BREACH: Any stay exceeding 1 night requires prior written consent and incurs mandatory $50/night charges, triggering unilateral default remedies.',
          severity: 'high'
        },
        {
          id: 's3',
          question: 'What if a pipe bursts or roof leaks damaging tenant property?',
          outcome: 'UNREMEDIED LOSS: Tenant expressly waived landlord liability even for the Landlord\'s own negligence, leaving tenant to bear 100% replacement costs.',
          severity: 'critical'
        }
      ];
    } else if (documentType.toLowerCase().includes('contractor') || documentType.toLowerCase().includes('freelance')) {
      return [
        {
          id: 's1',
          question: 'What if the client disputes the final project milestone?',
          outcome: 'PAYMENT FORFEITURE: Pay-when-paid provision means contractor absorbs total loss without right to demand compensation from the hiring entity.',
          severity: 'critical'
        },
        {
          id: 's2',
          question: 'Can I build my own side SaaS product on weekends?',
          outcome: 'IP ASSIGNMENT RISK: Broad assignment clause claims all inventions created at any hour during the term of representation.',
          severity: 'critical'
        },
        {
          id: 's3',
          question: 'What if I receive a software job offer next year?',
          outcome: 'NON-COMPETE INJUNCTION: Restrictive 24-month worldwide restriction creates risk of litigation from current client.',
          severity: 'high'
        }
      ];
    } else {
      return [
        {
          id: 's1',
          question: 'What if confidential information was already public?',
          outcome: 'SAFE: Clause 3 provides customary carve-outs for information already in the public domain without recipient breach.',
          severity: 'low'
        },
        {
          id: 's2',
          question: 'How long do confidentiality duties last?',
          outcome: 'DEFINED: Obligations sunset after exactly 2 years from date of disclosure under Clause 5.',
          severity: 'low'
        }
      ];
    }
  };

  const scenarios = getScenarios();

  return (
    <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#141C2B]/16 pb-3 mb-4">
        <div>
          <h4 className="font-serif text-lg font-normal text-[#141C2B] tracking-[-0.02em]">
            "What-If" Scenario Tester <span className="font-serif italic text-[#2C4A8F]">— Practical Dispute Outcomes</span>
          </h4>
          <p className="font-mono text-[11px] text-[#767E8C] tracking-[0.08em] mt-0.5">
            Test real-world scenarios to see how this contract's specific wording will apply.
          </p>
        </div>
        <span className="font-mono text-[11px] tracking-[0.08em] text-[#141C2B]">
          [ DOCUMENT SIMULATOR ]
        </span>
      </div>

      <div className="space-y-3">
        {scenarios.map((sc) => {
          const isOpen = activeScenario === sc.id;
          return (
            <div
              key={sc.id}
              className="border border-[#141C2B]/16 bg-[#EFE9DD] transition-all"
            >
              <button
                onClick={() => setActiveScenario(isOpen ? null : sc.id)}
                aria-label={`Toggle scenario question: ${sc.question}`}
                aria-expanded={isOpen}
                className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-[#EAE4D7] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-serif italic text-[#2C4A8F] text-base leading-none pt-0.5">
                    Q:
                  </span>
                  <span className="font-serif text-sm font-normal text-[#141C2B] tracking-[-0.01em]">
                    {sc.question}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#767E8C] pt-0.5">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-[#141C2B]/12 bg-[#E5DED0]">
                  <div className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] mb-1">
                    Contractual Outcome & Legal Consequence:
                  </div>
                  <p className="font-mono text-[11.5px] leading-[1.9] tracking-[0.08em] text-[#141C2B]">
                    {sc.outcome}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

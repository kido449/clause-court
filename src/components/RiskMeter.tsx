import React from 'react';
import { ScoreBreakdown, RiskLevel } from '../types';

interface RiskMeterProps {
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown;
  verdict: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, riskLevel, breakdown, verdict }) => {
  // SVG gauge constants
  const size = 180;
  const strokeWidth = 3;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240-degree arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  const getRiskDesignation = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'critical':
        return '[ SEVERE EXPOSURE ]';
      case 'high':
        return '[ HIGH WARNING ]';
      case 'moderate':
        return '[ MODERATE BURDEN ]';
      default:
        return '[ CUSTOMARY / BALANCED ]';
    }
  };

  return (
    <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-6 flex flex-col justify-between h-full">
      <div>
        {/* Metric Header */}
        <div className="flex items-baseline justify-between border-b border-[#141C2B]/16 pb-2 mb-4">
          <span className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C]">
            Total Risk Diagnostic
          </span>
          <span className="font-mono text-[11px] tracking-[0.08em] font-bold text-[#141C2B]">
            {getRiskDesignation(riskLevel)}
          </span>
        </div>

        {/* Precision Ink Gauge */}
        <div className="flex flex-col items-center my-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-[210deg]"
              viewBox={`0 0 ${size} ${size}`}
              aria-hidden="true"
            >
              {/* Outer calibration ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius + 6}
                fill="none"
                stroke="rgba(20, 28, 43, 0.12)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
              {/* Background Hairline Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(20, 28, 43, 0.16)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
              />
              {/* Drawn Indicator Line in the One Ink Blue */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#2C4A8F"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </svg>

            {/* Score Text in Newsreader display serif */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="font-serif text-5xl font-normal tracking-[-0.02em] text-[#141C2B]">
                {score}
              </span>
              <span className="font-serif italic text-[#2C4A8F] text-xs mt-0.5">
                of 100 points
              </span>
            </div>
          </div>

          <p className="text-center font-mono text-[11px] leading-[1.9] tracking-[0.07em] text-[#4A5364] mt-1 px-1">
            {score >= 75
              ? 'Uncapped indemnification and non-standard liabilities identified.'
              : score >= 55
              ? 'Material exposure clauses require negotiated revisions.'
              : score >= 35
              ? 'Moderate contractual friction with negotiable conditions.'
              : 'Predominantly reciprocal provisions with standard liability boundaries.'}
          </p>
        </div>
      </div>

      {/* 4 Pillars Breakdown as crisp ruled lines */}
      <div className="mt-5 pt-4 border-t border-[#141C2B]/16 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.09em] uppercase text-[#767E8C]">
            Pillar Subscores
          </span>
          <span className="font-serif italic text-[#2C4A8F] text-[11px]">
            four audit axes
          </span>
        </div>

        {/* Financial */}
        <div>
          <div className="flex justify-between font-mono text-[11px] tracking-[0.08em] leading-[1.9] mb-0.5">
            <span className="text-[#4A5364]">Financial Exposure</span>
            <span className="text-[#141C2B] font-bold">{breakdown.financial}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#141C2B]/16">
            <div
              className="h-full bg-[#141C2B] transition-all duration-700"
              style={{ width: `${breakdown.financial}%` }}
            />
          </div>
        </div>

        {/* Liability */}
        <div>
          <div className="flex justify-between font-mono text-[11px] tracking-[0.08em] leading-[1.9] mb-0.5">
            <span className="text-[#4A5364]">Liability & Indemnity</span>
            <span className="text-[#141C2B] font-bold">{breakdown.liability}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#141C2B]/16">
            <div
              className="h-full bg-[#2C4A8F] transition-all duration-700"
              style={{ width: `${breakdown.liability}%` }}
            />
          </div>
        </div>

        {/* Termination */}
        <div>
          <div className="flex justify-between font-mono text-[11px] tracking-[0.08em] leading-[1.9] mb-0.5">
            <span className="text-[#4A5364]">Termination & Lock-in</span>
            <span className="text-[#141C2B] font-bold">{breakdown.termination}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#141C2B]/16">
            <div
              className="h-full bg-[#141C2B] transition-all duration-700"
              style={{ width: `${breakdown.termination}%` }}
            />
          </div>
        </div>

        {/* Compliance */}
        <div>
          <div className="flex justify-between font-mono text-[11px] tracking-[0.08em] leading-[1.9] mb-0.5">
            <span className="text-[#4A5364]">Ambiguity & Disputes</span>
            <span className="text-[#141C2B] font-bold">{breakdown.compliance}%</span>
          </div>
          <div className="w-full h-[2px] bg-[#141C2B]/16">
            <div
              className="h-full bg-[#4A5364] transition-all duration-700"
              style={{ width: `${breakdown.compliance}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

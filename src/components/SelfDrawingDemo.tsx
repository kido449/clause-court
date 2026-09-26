import React, { useState, useRef, useEffect } from 'react';

interface Variant {
  id: string;
  label: string;
  name: string;
  strokeWidth: number;
  // SVG path data of the product's actual drawn output
  pathD: string;
  secondaryPaths?: { d: string; strokeWidth: number; dash?: string }[];
  facts: [
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string }
  ];
}

const VARIANTS: Variant[] = [
  {
    id: 'hairline',
    label: '01. 0.25MM',
    name: 'Technical Hairline',
    strokeWidth: 1.2,
    // Architectural drafting grid, isometric box and precision calibration ticks
    pathD: `
      M 40 180 
      L 140 120 
      L 260 140 
      L 160 200 
      Z 
      M 40 180 
      L 40 260 
      L 160 320 
      L 160 200 
      M 260 140 
      L 260 220 
      L 160 320 
      M 140 120 
      L 140 70 
      L 460 70 
      L 460 280 
      L 340 330 
      M 260 220 
      L 460 220 
      M 80 70 
      L 80 50 
      M 200 70 
      L 200 50 
      M 320 70 
      L 320 50 
      M 440 70 
      L 440 50 
      M 50 340 
      H 550
      M 100 335 V 345
      M 200 335 V 345
      M 300 332 V 348
      M 400 335 V 345
      M 500 335 V 345
    `,
    facts: [
      { label: 'TRACE BREADTH', value: '0.25 MM (±0.02)' },
      { label: 'DRAW LINEAGE', value: '1,420 METERS' },
      { label: 'HYDROSTATIC FEED', value: '14 µL/MIN DRAW' },
    ],
  },
  {
    id: 'script',
    label: '02. 0.50MM',
    name: 'Covenant Script',
    strokeWidth: 2.2,
    // Elaborate legal mark, continuous signature flourish and formal rubric
    pathD: `
      M 60 260 
      C 100 120, 130 90, 160 160 
      C 190 230, 210 250, 240 180 
      C 270 110, 310 80, 340 150 
      C 370 220, 390 260, 430 190 
      C 470 120, 520 130, 500 230 
      C 480 320, 320 340, 180 310 
      C 90 290, 50 240, 110 200 
      C 180 150, 320 180, 480 210 
      C 530 220, 550 250, 520 270 
      C 480 290, 380 290, 260 290 
      L 540 290
    `,
    facts: [
      { label: 'TRACE BREADTH', value: '0.50 MM (±0.03)' },
      { label: 'DRAW LINEAGE', value: '980 METERS' },
      { label: 'HYDROSTATIC FEED', value: '28 µL/MIN DRAW' },
    ],
  },
  {
    id: 'cadence',
    label: '03. 0.80MM',
    name: 'Architectural Cadence',
    strokeWidth: 3.4,
    // Structural datum boundary, framing rule and section elevation markers
    pathD: `
      M 50 90 
      H 550 
      V 310 
      H 50 
      Z 
      M 70 110 
      H 530 
      V 290 
      H 70 
      Z 
      M 50 200 
      H 550 
      M 200 90 
      V 310 
      M 400 90 
      V 310 
      M 190 190 L 200 200 L 210 190 
      M 390 190 L 400 200 L 410 190 
      M 30 200 H 50 
      M 550 200 H 570
    `,
    facts: [
      { label: 'TRACE BREADTH', value: '0.80 MM (±0.04)' },
      { label: 'DRAW LINEAGE', value: '620 METERS' },
      { label: 'HYDROSTATIC FEED', value: '44 µL/MIN DRAW' },
    ],
  },
];

export const SelfDrawingDemo: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [isDrawn, setIsDrawn] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainPathRef = useRef<SVGPathElement>(null);

  const currentVariant = VARIANTS[selectedIdx];

  // Measure path length and trigger animation
  const triggerDraw = () => {
    if (!mainPathRef.current) return;
    const len = mainPathRef.current.getTotalLength();
    setPathLength(len);
    setIsDrawn(false);

    // Allow browser to apply initial offset, then animate to zero over 2 seconds
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsDrawn(true);
      });
    });
  };

  // Observe entry into viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEntered) {
            setHasEntered(true);
            triggerDraw();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasEntered]);

  // When variant changes, re-measure and re-draw
  useEffect(() => {
    if (hasEntered) {
      triggerDraw();
    }
  }, [selectedIdx, hasEntered]);

  return (
    <section
      ref={containerRef}
      id="demonstration"
      className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#141C2B]/16"
    >
      {/* Header and Variant Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#767E8C] block mb-2">
            02 · DIRECT PROOF
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141C2B] tracking-[-0.02em]">
            The instrument performing its own{' '}
            <em className="font-serif italic text-[#2C4A8F]">deliberate mark.</em>
          </h2>
        </div>

        {/* Variant Picker Buttons using aria-pressed */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {VARIANTS.map((v, idx) => {
            const isPressed = selectedIdx === idx;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={isPressed}
                onClick={() => setSelectedIdx(idx)}
                className={`px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors border cursor-pointer ${
                  isPressed
                    ? 'border-[#141C2B] bg-[#E5DED0] text-[#2C4A8F] font-bold border-b-2 border-b-[#2C4A8F]'
                    : 'border-[#141C2B]/16 bg-[#EFE9DD] text-[#4A5364] hover:text-[#141C2B] hover:border-[#141C2B]/40'
                }`}
              >
                <span>{v.label}</span>
                <span className="hidden sm:inline text-[#767E8C] font-normal ml-1.5">
                  / {v.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bordered Demonstration Panel holding the SVG of the product's own output */}
      <div className="bg-[#E5DED0] border border-[#141C2B]/16 p-6 sm:p-10 relative">
        {/* Panel Calibration Labels */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] pb-4 mb-4 border-b border-[#141C2B]/16">
          <span>PLATE № 0{selectedIdx + 1} — SCALE 1:1 REAL MARK</span>
          <div className="flex items-center gap-3">
            <span>INK BLUE #2C4A8F</span>
            <button
              onClick={triggerDraw}
              className="text-[#2C4A8F] hover:underline cursor-pointer font-bold"
              title="Re-draw output line"
            >
              [ RE-DRAW ]
            </button>
          </div>
        </div>

        {/* Drawing Canvas Box */}
        <div className="bg-[#EFE9DD] border border-[#141C2B]/16 h-[340px] sm:h-[400px] flex items-center justify-center p-4 relative overflow-hidden">
          {/* Subtle archival watermark grid rules */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(20, 28, 43, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(20, 28, 43, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Self-Drawing SVG */}
          <svg
            viewBox="0 0 600 400"
            className="w-full h-full relative z-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The single performing SVG path measured with getTotalLength() */}
            <path
              ref={mainPathRef}
              d={currentVariant.pathD}
              stroke="#2C4A8F"
              strokeWidth={currentVariant.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength > 0 ? pathLength : 2000,
                strokeDashoffset: isDrawn ? 0 : pathLength > 0 ? pathLength : 2000,
                transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Stylus contact crosshair at finish line */}
            <g
              className="transition-opacity duration-500"
              style={{ opacity: isDrawn ? 1 : 0 }}
            >
              <circle cx="540" cy="290" r="3" fill="#2C4A8F" />
              <line x1="534" y1="290" x2="546" y2="290" stroke="#141C2B" strokeWidth="0.8" />
              <line x1="540" y1="284" x2="540" y2="296" stroke="#141C2B" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Three monospaced facts beneath it that update together with variant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#141C2B]/16">
          {currentVariant.facts.map((fact, idx) => (
            <div key={idx} className="border-l-2 border-[#2C4A8F] pl-3 py-1">
              <span className="font-mono text-[10px] tracking-[0.09em] uppercase text-[#767E8C] block mb-0.5">
                {fact.label}
              </span>
              <span className="font-mono text-xs font-bold text-[#141C2B] tracking-[0.08em]">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

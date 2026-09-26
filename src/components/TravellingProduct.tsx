import React, { useEffect, useState } from 'react';

interface Stop {
  scrollPct: number; // 0.0 to 1.0
  x: number; // % of viewport width
  y: number; // % of viewport height
  rotate: number; // degrees
  scale: number;
  opacity: number;
}

// Keyframed path stops across the page sections
const KEYFRAME_STOPS: Stop[] = [
  { scrollPct: 0.00, x: 64, y: 38, rotate: -20, scale: 1.05, opacity: 1.0 }, // Hero (right of copy block)
  { scrollPct: 0.18, x: 76, y: 44, rotate: 14, scale: 0.95, opacity: 1.0 },  // Argument section (ruled rows)
  { scrollPct: 0.40, x: 20, y: 48, rotate: -42, scale: 0.88, opacity: 0.95 }, // Demo section (angles as if drawing)
  { scrollPct: 0.62, x: 74, y: 52, rotate: 8, scale: 0.90, opacity: 0.85 },  // Material section (alloy specs)
  { scrollPct: 0.80, x: 18, y: 56, rotate: -16, scale: 0.80, opacity: 0.45 }, // Measurements list (tabular dimensions)
  { scrollPct: 0.92, x: 50, y: 65, rotate: 0, scale: 0.70, opacity: 0.0 },   // Close (fades out completely)
];

// Smooth cubic easing for interpolation
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const TravellingProduct: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion media query
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mql.addEventListener('change', handleMotionChange);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      mql.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Under prefers-reduced-motion, hide the element entirely
  if (prefersReducedMotion) {
    return null;
  }

  // Find surrounding keyframe stops
  let prevStop = KEYFRAME_STOPS[0];
  let nextStop = KEYFRAME_STOPS[KEYFRAME_STOPS.length - 1];

  for (let i = 0; i < KEYFRAME_STOPS.length - 1; i++) {
    if (
      scrollProgress >= KEYFRAME_STOPS[i].scrollPct &&
      scrollProgress <= KEYFRAME_STOPS[i + 1].scrollPct
    ) {
      prevStop = KEYFRAME_STOPS[i];
      nextStop = KEYFRAME_STOPS[i + 1];
      break;
    }
  }

  const range = nextStop.scrollPct - prevStop.scrollPct;
  const rawT = range > 0 ? (scrollProgress - prevStop.scrollPct) / range : 0;
  const t = easeInOut(Math.min(1, Math.max(0, rawT)));

  const currentX = prevStop.x + (nextStop.x - prevStop.x) * t;
  const currentY = prevStop.y + (nextStop.y - prevStop.y) * t;
  const currentRotate = prevStop.rotate + (nextStop.rotate - prevStop.rotate) * t;
  const currentScale = prevStop.scale + (nextStop.scale - prevStop.scale) * t;
  const currentOpacity = prevStop.opacity + (nextStop.opacity - prevStop.opacity) * t;

  const isHidden = currentOpacity <= 0.01;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: `${currentX}vw`,
        top: `${currentY}vh`,
        transform: `translate(-50%, -50%) rotate(${currentRotate}deg) scale(${currentScale})`,
        opacity: currentOpacity,
        visibility: isHidden ? 'hidden' : 'visible',
        pointerEvents: 'none',
        zIndex: 25,
        transition: 'transform 0.08s linear, opacity 0.15s linear',
        willChange: 'transform, opacity, left, top',
      }}
      className="product-cutout-container"
    >
      {/* Precision Engineered Instrument Cut-Out SVG */}
      <svg
        width="110"
        height="460"
        viewBox="0 0 110 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="product-cutout"
        style={{
          // Product cut-out shadow explicitly permitted in specification
          filter:
            'drop-shadow(0 28px 38px rgba(20, 28, 43, 0.32)) drop-shadow(0 6px 14px rgba(20, 28, 43, 0.18))',
        }}
      >
        <defs>
          {/* Subtle metal highlights */}
          <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C8A663" />
            <stop offset="35%" stopColor="#DFC386" />
            <stop offset="70%" stopColor="#B38E46" />
            <stop offset="100%" stopColor="#8C6A2E" />
          </linearGradient>

          <linearGradient id="steelGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E2736" />
            <stop offset="25%" stopColor="#303A4D" />
            <stop offset="65%" stopColor="#141C2B" />
            <stop offset="100%" stopColor="#0B111A" />
          </linearGradient>

          <linearGradient id="nibSteel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7E8794" />
            <stop offset="45%" stopColor="#D9E0EB" />
            <stop offset="80%" stopColor="#5E6877" />
            <stop offset="100%" stopColor="#3A4350" />
          </linearGradient>

          <pattern id="knurl" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 4L4 0M0 0L4 4" stroke="#8C6A2E" strokeWidth="0.8" opacity="0.45" />
          </pattern>
        </defs>

        {/* 1. TOP POMMEL / FINIAL */}
        <path d="M42 12 H68 V24 H42 Z" fill="url(#brassGrad)" stroke="#141C2B" strokeWidth="1" />
        <line x1="42" y1="16" x2="68" y2="16" stroke="#141C2B" strokeWidth="0.75" />
        <line x1="42" y1="20" x2="68" y2="20" stroke="#141C2B" strokeWidth="0.75" />

        {/* 2. KNURLED ADJUSTMENT RING */}
        <rect x="38" y="24" width="34" height="28" fill="url(#brassGrad)" stroke="#141C2B" strokeWidth="1" />
        <rect x="38" y="24" width="34" height="28" fill="url(#knurl)" />
        <line x1="38" y1="24" x2="72" y2="24" stroke="#141C2B" strokeWidth="1" />
        <line x1="38" y1="52" x2="72" y2="52" stroke="#141C2B" strokeWidth="1" />

        {/* 3. UPPER BARREL COLLAR */}
        <rect x="40" y="52" width="30" height="12" fill="url(#brassGrad)" stroke="#141C2B" strokeWidth="1" />

        {/* 4. MAIN HEXAGONAL COLD-ROLLED STEEL BARREL */}
        <rect x="42" y="64" width="26" height="230" fill="url(#steelGrad)" stroke="#141C2B" strokeWidth="1" />
        {/* Hexagonal bevel facet lines */}
        <line x1="50" y1="64" x2="50" y2="294" stroke="#3D4B63" strokeWidth="0.8" />
        <line x1="60" y1="64" x2="60" y2="294" stroke="#0B111A" strokeWidth="0.8" />

        {/* Laser-etched calibration rulings along barrel */}
        {Array.from({ length: 18 }).map((_, idx) => {
          const y = 85 + idx * 11;
          const isMajor = idx % 5 === 0;
          return (
            <g key={idx}>
              <line
                x1="43"
                y1={y}
                x2={isMajor ? "54" : "48"}
                y2={y}
                stroke="#C8A663"
                strokeWidth={isMajor ? "1" : "0.6"}
                opacity="0.85"
              />
              {isMajor && (
                <text
                  x="56"
                  y={y + 3}
                  fill="#DFC386"
                  fontSize="6"
                  fontFamily="'Courier Prime', monospace"
                  letterSpacing="0.05em"
                >
                  {idx * 5}
                </text>
              )}
            </g>
          );
        })}

        {/* Serial number stamp on lower barrel */}
        <text
          x="55"
          y="278"
          fill="#DFC386"
          fontSize="5.5"
          fontFamily="'Courier Prime', monospace"
          textAnchor="middle"
          letterSpacing="0.1em"
        >
          VERITAS · № 0418
        </text>

        {/* 5. MID-BODY BRASS FLUID ACCENT RING */}
        <rect x="40" y="294" width="30" height="10" fill="url(#brassGrad)" stroke="#141C2B" strokeWidth="1" />
        <line x1="40" y1="299" x2="70" y2="299" stroke="#2C4A8F" strokeWidth="1.2" />

        {/* 6. KNURLED LOWER DRAFTING GRIP */}
        <rect x="41" y="304" width="28" height="65" fill="url(#brassGrad)" stroke="#141C2B" strokeWidth="1" />
        <rect x="41" y="304" width="28" height="65" fill="url(#knurl)" />
        <line x1="41" y1="325" x2="69" y2="325" stroke="#141C2B" strokeWidth="0.8" />
        <line x1="41" y1="346" x2="69" y2="346" stroke="#141C2B" strokeWidth="0.8" />

        {/* 7. TAPERED NOSE CONE */}
        <path
          d="M42 369 L48 406 H62 L68 369 Z"
          fill="url(#brassGrad)"
          stroke="#141C2B"
          strokeWidth="1"
        />

        {/* 8. HARDENED STEEL DUAL-TINE DRAFTING NIB */}
        <path
          d="M49 406 L53.5 448 L55 450 L56.5 448 L61 406 Z"
          fill="url(#nibSteel)"
          stroke="#141C2B"
          strokeWidth="1"
        />
        {/* Capillary ink slit */}
        <line x1="55" y1="410" x2="55" y2="450" stroke="#141C2B" strokeWidth="0.8" />
        {/* Breather orifice */}
        <circle cx="55" cy="416" r="1.5" fill="#141C2B" />
        {/* Fine ink deposit tip in ink blue */}
        <circle cx="55" cy="450" r="1.2" fill="#2C4A8F" />
      </svg>
    </div>
  );
};

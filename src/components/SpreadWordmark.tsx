import React, { useEffect, useState } from 'react';

const LETTERS = ['V', 'E', 'R', 'I', 'T', 'A', 'S'];

interface SpreadWordmarkProps {
  isFooter?: boolean;
}

export const SpreadWordmark: React.FC<SpreadWordmarkProps> = ({ isFooter = false }) => {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mql.addEventListener('change', handleMotionChange);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mql.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // For hero foot wordmark:
  // Spread letters apart from center (index 3) and sink them down as user scrolls
  const centerIdx = 3; // 'I'
  const spreadProgress = Math.min(1.5, scrollY / 450);

  return (
    <div
      aria-label="VERITAS"
      className={`w-full overflow-hidden select-none pointer-events-none relative ${
        isFooter ? 'mt-8' : 'mt-auto'
      }`}
      style={{
        lineHeight: 0.78,
      }}
    >
      <div
        className="w-[102%] -ml-[1%] flex justify-between items-baseline font-serif text-[18vw] sm:text-[19vw] lg:text-[20vw] font-semibold text-[#141C2B] tracking-[-0.05em]"
        style={{
          // Baseline cropped by the page / section frame
          transform: isFooter
            ? 'translateY(22%)'
            : prefersReducedMotion
            ? 'translateY(26%)'
            : `translateY(calc(26% + ${spreadProgress * 85}px))`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.05s linear',
        }}
      >
        {LETTERS.map((letter, i) => {
          const distFromCenter = i - centerIdx;
          const translateX =
            !isFooter && !prefersReducedMotion
              ? distFromCenter * spreadProgress * 42
              : 0;
          const opacity =
            !isFooter && !prefersReducedMotion
              ? Math.max(0.15, 1 - spreadProgress * 0.5)
              : 1;

          return (
            <span
              key={i}
              className="inline-block transition-transform duration-75 ease-out"
              style={{
                transform: `translateX(${translateX}px)`,
                opacity: opacity,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
};

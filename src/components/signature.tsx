'use client';

import { useInView } from 'react-intersection-observer';

import { signature, type SignatureData } from '@/signature-data';

const DRAW_SECONDS = 1.8;
const PEN_LIFT_SECONDS = 0.08;
const STROKE_PX = 1.5;

// Writes the signature stroke by stroke the first time it scrolls into view.
// Each path has pathLength=1, so a dash offset of 1 → 0 draws it start to end.
export function Signature({
  data = signature,
  height = 28,
  className,
}: {
  data?: SignatureData;
  /** Rendered height in px; the stroke width is held at 1.5px on screen. */
  height?: number;
  className?: string;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.6 });
  const total = data.strokes.reduce((sum, s) => sum + s.length, 0);
  let elapsed = 0;

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Kelvin Amoaba"
      viewBox={`0 0 ${data.width} ${data.height}`}
      height={height}
      width={(height * data.width) / data.height}
      fill="none"
      strokeWidth={(STROKE_PX * data.height) / height}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {data.strokes.map((stroke, i) => {
        const duration = (stroke.length / total) * DRAW_SECONDS;
        const delay = elapsed;
        elapsed += duration + PEN_LIFT_SECONDS;

        return (
          <path
            key={i}
            d={stroke.d}
            pathLength={1}
            className={`signature-stroke stroke-current ${inView ? 'signature-stroke-draw' : ''}`}
            style={
              {
                '--draw-duration': `${duration}s`,
                '--draw-delay': `${delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </svg>
  );
}

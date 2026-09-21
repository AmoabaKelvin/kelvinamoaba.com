'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'react-intersection-observer';

import type { ContributionDay } from '@/lib/github';

/* Sequential ramp on the contrast-ordered gray scale: reads light-to-dark
   in light mode and dark-to-light in dark mode without extra tokens.
   Even 100→400→600→800→1000 steps keep empty and low-activity days apart. */
const LEVEL_BG = [
  'var(--ds-gray-100)',
  'var(--ds-gray-400)',
  'var(--ds-gray-600)',
  'var(--ds-gray-800)',
  'var(--ds-gray-1000)',
];

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type Tooltip = { x: number; y: number; label: string };

export function ContributionGrid({ weeks }: { weeks: ContributionDay[][] }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  // Weeks sweep in left to right the first time the graph scrolls into view.
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });

  function handleOver(event: React.MouseEvent) {
    const cell = (event.target as HTMLElement).closest('[data-tip]');
    if (!cell) {
      setTooltip(null);
      return;
    }
    const rect = cell.getBoundingClientRect();
    // ponytail: clamp by a fixed half-width (the label is ~240px of mono
    // text) so edge cells cannot push the tooltip past the viewport.
    const center = rect.left + rect.width / 2;
    setTooltip({
      x: Math.min(Math.max(center, 130), window.innerWidth - 130),
      y: rect.top,
      label: cell.getAttribute('data-tip')!,
    });
  }

  return (
    <div ref={ref} className="-m-0.5 overflow-x-auto overflow-y-hidden p-0.5">
      <div
        className="grid min-w-[34rem] auto-cols-fr grid-flow-col gap-0.5"
        aria-hidden="true"
        onMouseOver={handleOver}
        onMouseLeave={() => setTooltip(null)}
      >
        {weeks.map((week, i) => (
          <div
            key={i}
            // Fade only: a translate here overflows the scroll container
            // and flashes a scrollbar during the sweep.
            className={`grid grid-rows-7 gap-0.5 ${
              inView
                ? 'animate-in fade-in fill-mode-backwards duration-500 motion-reduce:animate-none'
                : 'opacity-0'
            }`}
            style={{ animationDelay: `${i * 10}ms` }}
          >
            {week.map((day) => (
              <div
                key={day.date}
                data-tip={`${day.count} contribution${day.count === 1 ? '' : 's'} · ${formatDay(day.date)}`}
                className="aspect-square w-full rounded-xs outline-offset-1 outline-[var(--fg)] hover:outline-1"
                style={{
                  backgroundColor: LEVEL_BG[day.level],
                  // Pin partial first/last weeks to the real weekday so a
                  // lone day cannot stretch across the whole column.
                  gridRow: new Date(`${day.date}T00:00:00Z`).getUTCDay() + 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Portalled to <body>: any transformed or animating ancestor would
          otherwise become the containing block for position: fixed, which
          misplaces the tooltip and lets it widen the page. */}
      {tooltip &&
        createPortal(
          <div
            className="animate-in fade-in zoom-in-95 pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full duration-150 rounded-[var(--ds-radius)] bg-[var(--ds-gray-1000)] px-2 py-1 font-mono text-xs whitespace-nowrap text-[var(--bg)] tabular-nums"
            style={{ left: tooltip.x, top: tooltip.y - 6 }}
          >
            {tooltip.label}
          </div>,
          document.body
        )}
    </div>
  );
}

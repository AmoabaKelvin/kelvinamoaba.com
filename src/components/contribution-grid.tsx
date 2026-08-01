'use client';

import { useState } from 'react';

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

  function handleOver(event: React.MouseEvent) {
    const cell = (event.target as HTMLElement).closest('[data-tip]');
    if (!cell) {
      setTooltip(null);
      return;
    }
    const rect = cell.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: cell.getAttribute('data-tip')!,
    });
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[34rem] auto-cols-fr grid-flow-col gap-0.5"
        aria-hidden="true"
        onMouseOver={handleOver}
        onMouseLeave={() => setTooltip(null)}
      >
        {weeks.map((week, i) => (
          <div key={i} className="grid gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                data-tip={`${day.count} contribution${day.count === 1 ? '' : 's'} · ${formatDay(day.date)}`}
                className="aspect-square w-full rounded-xs"
                style={{ backgroundColor: LEVEL_BG[day.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-[var(--ds-radius)] bg-[var(--ds-gray-1000)] px-2 py-1 font-mono text-xs whitespace-nowrap text-[var(--bg)] tabular-nums"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

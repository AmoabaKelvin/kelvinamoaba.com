'use client';

import { useRef, useState } from 'react';

import { Signature } from '@/components/signature';
import type { SignatureData } from '@/signature-data';

type Point = { x: number; y: number };

const PAD_WIDTH = 720;
const PAD_HEIGHT = 260;
// Points closer than this to the previous one are dropped, which removes most
// trackpad jitter before smoothing.
const MIN_DISTANCE = 3;
const CROP_PADDING = 4;

const round = (n: number) => Math.round(n * 10) / 10;

// Centerline through the points: quadratic curves between segment midpoints,
// using each recorded point as the control point.
function toPath(points: Point[]): string {
  if (points.length < 2) {
    const { x, y } = points[0];
    return `M${round(x)} ${round(y)}l0.1 0`;
  }
  let d = `M${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += `Q${round(points[i].x)} ${round(points[i].y)} ${round(midX)} ${round(midY)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${round(last.x)} ${round(last.y)}`;
}

function lengthOf(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }
  return Math.max(round(length), 1);
}

// Crops to the ink's bounding box so the viewBox hugs the signature.
function toData(strokes: Point[][]): SignatureData {
  const all = strokes.flat();
  const minX = Math.min(...all.map((p) => p.x)) - CROP_PADDING;
  const minY = Math.min(...all.map((p) => p.y)) - CROP_PADDING;
  const maxX = Math.max(...all.map((p) => p.x)) + CROP_PADDING;
  const maxY = Math.max(...all.map((p) => p.y)) + CROP_PADDING;

  return {
    width: round(maxX - minX),
    height: round(maxY - minY),
    strokes: strokes.map((stroke) => {
      const shifted = stroke.map((p) => ({ x: p.x - minX, y: p.y - minY }));
      return { d: toPath(shifted), length: lengthOf(shifted) };
    }),
  };
}

function toFile(data: SignatureData): string {
  const strokes = data.strokes
    .map((s) => `    { d: '${s.d}', length: ${s.length} },`)
    .join('\n');

  return `export type SignatureData = {
  width: number;
  height: number;
  /** One entry per pen stroke, in drawing order. \`length\` paces the animation. */
  strokes: { d: string; length: number }[];
};

// Generated at /dev/signature (dev server only). Paste that page's output
// over this whole file. While \`strokes\` is empty the footer shows the location.
export const signature: SignatureData = {
  width: ${data.width},
  height: ${data.height},
  strokes: [
${strokes}
  ],
};
`;
}

export function SignatureCapture() {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [replay, setReplay] = useState(0);
  const [copied, setCopied] = useState(false);
  const drawing = useRef(false);

  const data = strokes.length ? toData(strokes) : null;
  const file = data ? toFile(data) : '';

  function toPoint(
    svg: SVGSVGElement,
    event: { clientX: number; clientY: number }
  ) {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PAD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * PAD_HEIGHT,
    };
  }

  function handleDown(event: React.PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const point = toPoint(event.currentTarget, event);
    setStrokes((prev) => [...prev, [point]]);
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!drawing.current) return;
    const svg = event.currentTarget;
    // Coalesced events carry the samples the browser batched between frames.
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
    const points = (samples.length ? samples : [event.nativeEvent]).map((e) =>
      toPoint(svg, e)
    );

    setStrokes((prev) => {
      const current = [...prev[prev.length - 1]];
      for (const point of points) {
        const last = current[current.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) >= MIN_DISTANCE) {
          current.push(point);
        }
      }
      return [...prev.slice(0, -1), current];
    });
  }

  function handleUp() {
    drawing.current = false;
    setReplay((n) => n + 1);
  }

  async function copy() {
    await navigator.clipboard.writeText(file);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28">
      <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
        Signature capture
      </h1>
      <p className="mt-4 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)] sm:text-sm/6">
        Sign in the box. Each time the pen lifts, a new stroke starts, and the
        footer replays them in the same order. Copy the output over{' '}
        <code className="font-mono">src/signature-data.ts</code>.
      </p>

      <svg
        viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-8 w-full cursor-crosshair touch-none rounded-[var(--ds-radius-lg)] border border-[var(--border-strong)] bg-[var(--bg-subtle)] stroke-[var(--fg)]"
      >
        <line
          x1={40}
          x2={PAD_WIDTH - 40}
          y1={PAD_HEIGHT * 0.72}
          y2={PAD_HEIGHT * 0.72}
          strokeWidth={1}
          strokeDasharray="4 6"
          className="stroke-[var(--border-strong)]"
        />
        {strokes.map((stroke, i) => (
          <path key={i} d={toPath(stroke)} />
        ))}
      </svg>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          disabled={!data}
          className="ds-button ds-button-primary ds-button-small"
        >
          {copied ? 'Copied' : 'Copy output'}
        </button>
        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          disabled={!data}
          className="ds-button ds-button-secondary ds-button-small"
        >
          Replay
        </button>
        <button
          type="button"
          onClick={() => setStrokes((prev) => prev.slice(0, -1))}
          disabled={!data}
          className="ds-button ds-button-secondary ds-button-small"
        >
          Undo stroke
        </button>
        <button
          type="button"
          onClick={() => setStrokes([])}
          disabled={!data}
          className="ds-button ds-button-secondary ds-button-small"
        >
          Clear
        </button>
      </div>

      {data && (
        <>
          <h2 className="mt-12 font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
            Preview
          </h2>
          <div className="mt-6 flex flex-wrap items-end gap-10 text-[var(--fg-muted)]">
            <Signature key={`large-${replay}`} data={data} height={96} />
            <Signature key={`footer-${replay}`} data={data} height={44} />
          </div>
          <p className="mt-3 font-mono text-sm text-[var(--fg-faint)] tabular-nums">
            {data.strokes.length} stroke{data.strokes.length === 1 ? '' : 's'} ·
            footer size on the right
          </p>

          <h2 className="mt-12 font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
            Output
          </h2>
          <textarea
            readOnly
            value={file}
            rows={12}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-6 w-full rounded-[var(--ds-radius)] border border-[var(--border-strong)] bg-[var(--bg-subtle)] p-3 font-mono text-xs text-[var(--fg-secondary)]"
          />
        </>
      )}
    </div>
  );
}

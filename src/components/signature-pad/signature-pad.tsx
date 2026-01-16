'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import getStroke from 'perfect-freehand';
import { Point } from './point';
import { getSvgPathFromStroke } from './helper';

export interface SignaturePadProps {
  onChange?: (dataUrl: string | null) => void;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const DPR = 3; // Higher resolution for better quality signatures

const strokeOptions = {
  size: 4,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

export function SignaturePad({
  onChange,
  className = '',
  containerClassName = '',
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [lines, setLines] = useState<Point[][]>([]);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const drawLines = useCallback(
    (linesToDraw: Point[][], current: Point[] = []) => {
      const ctx = getContext();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#111111';

      const allLines = [...linesToDraw, current].filter((l) => l.length > 0);

      for (const line of allLines) {
        const points = line.map((p) => [p.x, p.y, 0.5]);
        const stroke = getStroke(points, strokeOptions);
        const path = getSvgPathFromStroke(stroke);

        if (path) {
          const path2D = new Path2D(path);
          ctx.fill(path2D);
        }
      }
    },
    [getContext]
  );

  const emitChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;

    if (lines.length === 0 && currentLine.length === 0) {
      onChange(null);
    } else {
      onChange(canvas.toDataURL('image/png'));
    }
  }, [lines, currentLine, onChange]);

  // Initialize canvas with proper dimensions and styles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * DPR;
    canvas.height = rect.height * DPR;

    // Apply styles directly to prevent text selection
    Object.assign(canvas.style, {
      touchAction: 'none',
      msTouchAction: 'none',
      userSelect: 'none',
      webkitUserSelect: 'none',
      msUserSelect: 'none',
    });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(DPR, DPR);
    }
  }, []);

  useEffect(() => {
    drawLines(lines, currentLine);
  }, [lines, currentLine, drawLines]);

  useEffect(() => {
    emitChange();
  }, [lines, emitChange]);

  // Prevent text selection globally while drawing
  useEffect(() => {
    if (!isPressed) return;

    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);

    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [isPressed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsPressed(true);

    const point = Point.fromEvent(e.nativeEvent, 1);
    setCurrentLine([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPressed || disabled) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();

    const point = Point.fromEvent(e.nativeEvent, 1);
    setCurrentLine((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }

    setIsPressed(false);

    if (currentLine.length > 0) {
      setLines((prev) => [...prev, currentLine]);
      setCurrentLine([]);
    }
  };

  const handleClear = () => {
    setLines([]);
    setCurrentLine([]);
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange?.(null);
  };

  const handleUndo = () => {
    if (lines.length === 0) return;
    setLines((prev) => prev.slice(0, -1));
  };

  return (
    <div className={`relative ${containerClassName}`}>
      {!disabled && (
        <div className="absolute top-2 right-2 flex gap-3 z-10">
          {lines.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-xs text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
          >
            Clear
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`touch-none select-none ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}

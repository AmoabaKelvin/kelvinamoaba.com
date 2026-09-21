'use client';

import { useEffect } from 'react';

const INTERACTIVE = 'a, button, summary';

// Plays a soft tick when the mouse enters a link or control, and a lower one
// when it is pressed. Browsers keep audio locked until the first click or key
// press, so hovering is silent until then.
export function HoverSound() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let last: Element | null = null;

    const unlock = () => {
      ctx ??= new AudioContext();
      void ctx.resume();
    };

    // One short sine blip; hover and click differ only in pitch and level.
    const blip = (from: number, to: number, level: number) => {
      // No state check: a blip queued during resume() plays once it lands,
      // which is what makes the very first click audible.
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(from, now);
      osc.frequency.exponentialRampToValueAtTime(to, now + 0.04);
      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const target = (event.target as Element).closest(INTERACTIVE);
      if (target === last) return;
      last = target;
      if (target) blip(1800, 1100, 0.04);
    };

    // Lower and a little louder than the hover tick, so a press reads as a press.
    const onDown = (event: PointerEvent) => {
      unlock();
      if ((event.target as Element).closest(INTERACTIVE)) blip(700, 320, 0.08);
    };

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', unlock);
    document.addEventListener('pointerover', onOver);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('pointerover', onOver);
      void ctx?.close();
    };
  }, []);

  return null;
}

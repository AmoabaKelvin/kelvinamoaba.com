'use client';

import { Moon, Sun } from 'lucide-react';

// Both icons stay mounted and cross-fade off the `.dark` class, so there is
// no theme state to hydrate.
const iconClass =
  'size-[0.95rem] transition-[scale,opacity,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]';

export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="logo-mark relative"
    >
      <Moon
        aria-hidden="true"
        className={`${iconClass} dark:scale-25 dark:opacity-0 dark:blur-xs`}
      />
      <Sun
        aria-hidden="true"
        className={`${iconClass} absolute not-dark:scale-25 not-dark:opacity-0 not-dark:blur-xs`}
      />
    </button>
  );
}

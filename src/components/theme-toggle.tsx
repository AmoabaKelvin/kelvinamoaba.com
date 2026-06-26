'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="logo-mark"
      style={{ width: '2rem', height: '2rem' }}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      {mounted && theme === 'dark' ? (
        <Sun className="h-[0.95rem] w-[0.95rem]" />
      ) : (
        <Moon className="h-[0.95rem] w-[0.95rem]" />
      )}
    </button>
  );
}

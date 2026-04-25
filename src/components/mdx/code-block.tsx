'use client';

import { useRef, useState } from 'react';

type Props = React.HTMLAttributes<HTMLPreElement>;

export function CodeBlock({ children, ...props }: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = ref.current?.innerText ?? '';
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 z-10 px-2 py-1 text-[0.65rem] tracking-widest uppercase text-[var(--color-stone)] bg-[var(--color-paper)] border border-[var(--color-mist)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}

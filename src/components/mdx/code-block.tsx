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
        className="ds-mono absolute top-3 right-3 z-10 rounded-[var(--ds-radius)] border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[0.7rem] text-[var(--fg-muted)] opacity-0 transition group-hover:opacity-100 hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}

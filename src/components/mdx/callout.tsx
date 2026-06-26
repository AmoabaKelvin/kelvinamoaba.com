type Variant = 'note' | 'warn' | 'info';

const styles: Record<Variant, string> = {
  note: 'border-[var(--border)] bg-[var(--bg-subtle)]',
  warn: 'border-[var(--ds-amber-500)] bg-[var(--ds-gray-100)]',
  info: 'border-[var(--accent)] bg-[var(--ds-gray-100)]',
};

const labels: Record<Variant, string> = {
  note: 'Note',
  warn: 'Warning',
  info: 'Info',
};

export function Callout({
  variant = 'note',
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={`my-6 rounded-[var(--ds-radius-lg)] border-l-2 px-5 py-4 text-[0.95rem] leading-7 ${styles[variant]}`}
    >
      <div className="ds-mono mb-2 text-xs uppercase tracking-wide text-[var(--fg-muted)]">
        {title ?? labels[variant]}
      </div>
      <div className="text-[var(--fg-secondary)] [&>p:last-child]:mb-0 [&>p]:mb-3">
        {children}
      </div>
    </aside>
  );
}

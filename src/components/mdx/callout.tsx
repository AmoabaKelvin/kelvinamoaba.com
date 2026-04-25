type Variant = 'note' | 'warn' | 'info';

const styles: Record<Variant, string> = {
  note: 'border-[var(--color-mist)] bg-[var(--color-paper)]',
  warn: 'border-amber-300 bg-amber-50',
  info: 'border-sky-300 bg-sky-50',
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
      className={`my-6 border-l-2 px-5 py-4 text-[0.95rem] leading-7 ${styles[variant]}`}
    >
      <div className="text-[0.7rem] tracking-widest uppercase text-[var(--color-stone)] mb-2">
        {title ?? labels[variant]}
      </div>
      <div className="[&>p:last-child]:mb-0 [&>p]:mb-3">{children}</div>
    </aside>
  );
}

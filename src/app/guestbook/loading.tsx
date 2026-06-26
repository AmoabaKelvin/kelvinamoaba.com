export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex items-center gap-3 text-[var(--fg-muted)]">
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
        <span
          className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"
          style={{ animationDelay: '0.15s' }}
        />
        <span
          className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"
          style={{ animationDelay: '0.3s' }}
        />
      </div>
    </div>
  );
}

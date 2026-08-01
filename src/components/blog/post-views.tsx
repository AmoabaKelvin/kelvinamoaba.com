'use client';

import { useRecordView, useViews } from '@/lib/hooks/use-blog-engagement';

// Post header: records the view and shows the count once loaded.
export function PostViews({ slug }: { slug: string }) {
  useRecordView(slug);
  const { data } = useViews();
  const count = data?.counts[slug];
  if (!count) return null;
  return (
    <span className="tabular-nums">
      {' '}
      · {count.toLocaleString()} {count === 1 ? 'view' : 'views'}
    </span>
  );
}

// Blog index rows: count only, no recording.
export function ViewCount({ slug }: { slug: string }) {
  const { data } = useViews();
  const count = data?.counts[slug];
  if (!count) return null;
  return (
    <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--fg-faint)]">
      {count.toLocaleString()}
    </span>
  );
}

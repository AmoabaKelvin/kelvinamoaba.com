import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { compileDraftMdx } from '@/lib/studio/compile-preview';
import { getDraft } from '@/lib/studio/drafts';
import { verifyDraftKey } from '@/lib/studio/preview-link';

import { MDXPreview } from '../../[id]/mdx-preview';

export const dynamic = 'force-dynamic';

// Preview links are shareable; never let a leaked one get indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
};

export default async function DraftPreviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { key } = await searchParams;
  if (typeof key !== 'string' || !verifyDraftKey(id, key)) notFound();

  const draft = await getDraft(id);
  if (!draft) notFound();

  const isEmpty = draft.content.trim() === '';
  const result = isEmpty ? null : await compileDraftMdx(draft.content);

  return (
    <div className="relative px-6 mx-auto max-w-3xl">
      <div className="mt-10 rounded-[var(--ds-radius)] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2">
        <p className="ds-mono text-xs text-[var(--fg-secondary)]">
          Draft preview — not published
        </p>
      </div>
      <h1 className="ds-heading-1 mt-8 text-[var(--fg)]">
        {draft.title || 'Untitled draft'}
      </h1>
      <div className="ds-mono mt-3 text-sm text-[var(--fg-muted)]">
        Kelvin Amoaba ·{' '}
        {draft.updatedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      {draft.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={draft.cover}
          className="mt-8 rounded-[var(--ds-radius-lg)] border border-[var(--border)]"
          alt={draft.title}
        />
      )}
      <div className="mt-10 pb-20">
        {result === null ? (
          <p className="text-sm text-[var(--fg-faint)]">
            This draft has no content yet.
          </p>
        ) : (
          <MDXPreview
            code={result.code ?? null}
            compileError={result.error ?? null}
          />
        )}
      </div>
    </div>
  );
}

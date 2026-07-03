import { isAdminRequest } from '@/lib/studio/admin';

import { DraftsList } from './drafts-list';
import { StudioGate } from './studio-gate';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  if (!(await isAdminRequest())) {
    return <StudioGate />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10">
      <section className="pt-24 pb-10 md:pt-28">
        <h1 className="ds-heading-1 animate-fade-up stagger-1 mb-3 text-[var(--fg)]">
          Studio
        </h1>
        <p className="ds-copy animate-fade-up stagger-2 max-w-xl">
          Write, refine, and publish posts without leaving the site.
        </p>
      </section>
      <section className="animate-fade-up stagger-3 pb-20">
        <DraftsList />
      </section>
    </div>
  );
}

import { Metadata } from 'next';

import { WritingList } from '@/components/writing-list';
import { getWriting } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Essays and deep dives on systems, Go, algorithms, and the craft of building software.',
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: {
    title: 'Writing | Kelvin Amoaba',
    url: '/blog',
    description:
      'Essays and deep dives on systems, Go, algorithms, and the craft of building software.',
  },
};

export default function WritingIndex() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <section className="rise">
        <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
          Writing
        </h1>
        <p className="mt-6 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)]">
          Essays and deep dives on systems, Go, algorithms, and the craft of
          building software.
        </p>
      </section>

      <section className="rise mt-12 [--i:1] md:mt-16">
        <WritingList posts={getWriting()} showViews />
      </section>
    </div>
  );
}

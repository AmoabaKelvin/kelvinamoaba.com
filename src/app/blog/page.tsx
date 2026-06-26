import { Metadata } from 'next';

import { PostRow } from '@/components/post-row';
import { getSortedPosts, groupByYear } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Writing | Kelvin Amoaba',
  description:
    'Essays and deep dives on systems, Go, algorithms, and the craft of building software.',
  openGraph: {
    title: 'Writing | Kelvin Amoaba',
    description:
      'Essays and deep dives on systems, Go, algorithms, and the craft of building software.',
  },
};

export default function WritingIndex() {
  const years = groupByYear(getSortedPosts());

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10">
      <section className="pt-24 pb-12 md:pt-28 md:pb-16">
        <h1 className="ds-heading-1 animate-fade-up stagger-1 mb-4 text-[var(--fg)]">
          Writing
        </h1>
        <p className="ds-copy animate-fade-up stagger-2 max-w-xl text-lg">
          Essays and deep dives on systems, Go, algorithms, and the craft of
          building software.
        </p>
      </section>

      <section className="animate-fade-up stagger-3 pb-20">
        {years.map(({ year, posts }) => (
          <div
            key={year}
            className="border-b border-[var(--border)] py-6 last:border-0"
          >
            <div className="flex flex-col gap-1 md:flex-row md:gap-6">
              <span className="ds-mono w-16 flex-shrink-0 pt-3 text-xs text-[var(--fg-faint)] tabular-nums">
                {year}
              </span>
              <div className="min-w-0 flex-1">
                {posts.map((post) => (
                  <PostRow key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

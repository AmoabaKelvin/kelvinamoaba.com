import { Metadata } from 'next';

import { PostRow } from '@/components/post-row';
import { getSortedPosts, groupByYear } from '@/lib/posts';

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
  const years = groupByYear(getSortedPosts());

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <section>
        <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
          Writing
        </h1>
        <p className="mt-6 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)]">
          Essays and deep dives on systems, Go, algorithms, and the craft of
          building software.
        </p>
      </section>

      <section className="mt-16 space-y-14 md:mt-20">
        {years.map(({ year, posts }) => (
          <div key={year}>
            <h2 className="font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
              {year}
            </h2>
            <ul role="list" className="mt-6 space-y-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostRow post={post} showViews />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

import { allPosts } from 'content-collections';

export type Post = (typeof allPosts)[number];

export function getSortedPosts(): Post[] {
  return [...allPosts]
    .filter((p) => p.status !== 'draft')
    .sort((a, b) => b.datePublished.getTime() - a.datePublished.getTime());
}

/** A row in a writing list. First-party posts carry a slug; posts hosted elsewhere don't. */
export type WritingEntry = {
  title: string;
  datePublished: Date;
  href: string;
  kicker?: string;
  description?: string;
  slug?: string;
};

// Posts published on other sites, listed alongside the local ones.
const externalPosts: WritingEntry[] = [
  {
    title: 'Storing 10× more container logs in the same SQLite file',
    datePublished: new Date('2026-09-13'),
    href: 'https://logdeck.dev/blog/log-store',
    description:
      'One SQLite row per log line came out 28% bigger than the raw text. Sealing 1,000 lines into one zstd row holds about 10× more.',
  },
];

export function toWritingEntry(post: Post): WritingEntry {
  return {
    title: post.title,
    datePublished: post.datePublished,
    href: `/blog/${post.slug}`,
    kicker: post.kicker,
    slug: post.slug,
  };
}

export function getWriting(): WritingEntry[] {
  return [...getSortedPosts().map(toWritingEntry), ...externalPosts].sort(
    (a, b) => b.datePublished.getTime() - a.datePublished.getTime()
  );
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const tags = new Set(post.tags.map((t) => t.toLowerCase()));
  const score = (p: Post) =>
    p.tags.filter((t) => tags.has(t.toLowerCase())).length;

  // getSortedPosts is date-desc, so the stable sort falls back to recency
  return getSortedPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

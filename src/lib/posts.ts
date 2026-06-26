import { allPosts } from 'content-collections';

export type Post = (typeof allPosts)[number];

export function getSortedPosts(): Post[] {
  return [...allPosts]
    .filter((p) => p.status !== 'draft')
    .sort((a, b) => b.datePublished.getTime() - a.datePublished.getTime());
}

export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const map = new Map<number, Post[]>();
  for (const p of posts) {
    const year = p.datePublished.getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(p);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, posts]) => ({ year, posts }));
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

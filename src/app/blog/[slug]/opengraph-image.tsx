import { allPosts } from 'content-collections';

import { ogContentType, ogSize, renderOG } from '@/lib/og';

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export const alt = 'Blog Post';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  return renderOG({
    section: 'writing',
    kicker: post?.kicker || 'ESSAY',
    title: post?.title || 'Writing',
    footerLeft: 'Kelvin Amoaba — software engineer',
    footerRight: `${post?.readingTime ?? 1} min read`,
  });
}

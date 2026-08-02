import { MetadataRoute } from 'next';

import { getSortedPosts } from '@/lib/posts';
import { papers } from '@/papers';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    {
      url: 'https://kelvinamoaba.com',
      lastModified: now,
    },
    {
      url: 'https://kelvinamoaba.com/blog',
      lastModified: now,
    },
    {
      url: 'https://kelvinamoaba.com/guestbook',
      lastModified: now,
    },
    {
      url: 'https://kelvinamoaba.com/research',
      lastModified: now,
    },
    ...papers
      .filter((paper) => paper.slug)
      .map((paper) => ({
        url: `https://kelvinamoaba.com/research/${paper.slug}`,
        lastModified: now,
      })),
    ...getSortedPosts().map((post) => ({
      url: `https://kelvinamoaba.com/blog/${post.slug}`,
      lastModified: post.datePublished.toISOString(),
    })),
  ];
}

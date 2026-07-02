import { MetadataRoute } from 'next';

import { getSortedPosts } from '@/lib/posts';

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
    ...getSortedPosts().map((post) => ({
      url: `https://kelvinamoaba.com/blog/${post.slug}`,
      lastModified: post.datePublished.toISOString(),
    })),
  ];
}

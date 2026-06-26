import { allPosts } from 'content-collections';
import { MetadataRoute } from 'next';

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
    ...allPosts.map((post) => ({
      url: `https://kelvinamoaba.com/blog/${post.slug}`,
      lastModified: post.datePublished.toISOString(),
    })),
  ];
}

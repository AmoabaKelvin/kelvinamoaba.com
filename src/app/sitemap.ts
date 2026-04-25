import { allPosts } from 'content-collections';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kelvinamoaba.com',
      lastModified: new Date().toISOString(),
    },
    ...allPosts.map((post) => ({
      url: `https://kelvinamoaba.com/blog/${post.slug}`,
      lastModified: post.datePublished.toISOString(),
    })),
  ];
}

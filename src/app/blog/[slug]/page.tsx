import { allPosts } from 'content-collections';
import { MDXContent } from '@content-collections/mdx/react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostBody } from '@/components/blog/post-body';
import { PostEngagement } from '@/components/blog/post-engagement';
import { PostViews } from '@/components/blog/post-views';
import { mdxComponents } from '@/components/mdx/mdx-components';
import { TableOfContents } from '@/components/table-of-contents';
import type { TOCHeading } from '@/lib/extract-headings';

import BackButton from './back-button';

export const revalidate = false;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

function findPost(slug: string) {
  return allPosts.find((p) => p.slug === slug);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const post = findPost(slug);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;

  return {
    title,
    description: post.excerpt,
    authors: [{ name: 'Kelvin Amoaba', url: 'https://kelvinamoaba.com' }],
    keywords: post.tags,
    creator: 'Kelvin Amoaba',
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.status === 'draft' ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.datePublished.toISOString(),
      authors: ['Kelvin Amoaba'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@kelamoaba',
      title,
      description: post.excerpt,
    },
  };
}

const BlogDetailPage = async (props: Props) => {
  const { slug } = await props.params;
  const post = findPost(slug);
  if (!post) return notFound();

  const url = `https://kelvinamoaba.com/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.datePublished.toISOString(),
    url,
    mainEntityOfPage: url,
    image: post.cover || `${url}/opengraph-image`,
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      name: 'Kelvin Amoaba',
      url: 'https://kelvinamoaba.com',
    },
  };

  return (
    <div className="relative px-6 mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TableOfContents headings={post.headings as TOCHeading[]} />
      <BackButton className="mt-10" />
      <h1 className="ds-heading-1 mt-8 text-[var(--fg)]">{post.title}</h1>
      <div className="ds-mono mt-3 text-sm text-[var(--fg-muted)]">
        Kelvin Amoaba ·{' '}
        {new Date(post.datePublished).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}{' '}
        · {post.readingTime} min read
        <PostViews slug={post.slug} />
      </div>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          className="mt-8 rounded-[var(--ds-radius-lg)] border border-[var(--border)]"
          alt={post.title}
        />
      )}
      <article className="mt-10 max-w-3xl leading-7 prose">
        {post.interactive ? (
          <PostBody code={post.mdx} />
        ) : (
          <MDXContent code={post.mdx} components={mdxComponents} />
        )}
      </article>

      <div className="pb-20">
        <PostEngagement slug={post.slug} />
      </div>
    </div>
  );
};

export default BlogDetailPage;

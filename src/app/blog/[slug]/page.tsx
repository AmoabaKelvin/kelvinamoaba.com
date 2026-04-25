import { allPosts } from 'content-collections';
import { MDXContent } from '@content-collections/mdx/react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

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

  return {
    title: post.seoTitle ?? post.title,
    authors: [{ name: 'Kelvin Amoaba', url: 'https://kelvinamoaba.com' }],
    keywords: post.tags,
    creator: 'Kelvin Amoaba',
    description: undefined,
  };
}

const BlogDetailPage = async (props: Props) => {
  const { slug } = await props.params;
  const post = findPost(slug);
  if (!post) return notFound();

  return (
    <div className="relative px-5 mx-auto max-w-3xl">
      <TableOfContents headings={post.headings as TOCHeading[]} />
      <BackButton className="mt-10" />
      <div className="mt-10 text-xl font-bold md:text-3xl">{post.title}</div>
      <div className="mt-2 text-sm text-gray-500">
        Kelvin Amoaba •{' '}
        {new Date(post.datePublished).toLocaleDateString()}
      </div>
      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          className="mt-10 rounded-md"
          alt={post.title}
        />
      )}
      <article className="mt-10 space-y-6 max-w-3xl font-normal leading-7 prose text-black dark:prose-invert">
        <MDXContent code={post.mdx} components={mdxComponents} />

        <Script
          src="https://giscus.app/client.js"
          data-repo="AmoabaKelvin/blog"
          data-repo-id="R_kgDOK9FHvA"
          data-category="Announcements"
          data-category-id="DIC_kwDOK9FHvM4Cb-MF"
          data-mapping="url"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="top"
          data-theme="dark"
          data-lang="en"
          crossOrigin="anonymous"
          data-loading="lazy"
          async
        />
      </article>
    </div>
  );
};

export default BlogDetailPage;

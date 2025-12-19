import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getDocumentBySlug, getDocumentSlugs } from 'outstatic/server';
import Markdown from 'react-markdown';

import CodeSection from '@/app/blog/[slug]/code-section';

import BackButton from './back-button';

export const revalidate = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const posts = getDocumentSlugs('posts');
  return posts.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const blogSlug = params.slug;

  const blogPost = await getPost(blogSlug);

  return {
    title: blogPost?.title,
    authors: [
      {
        name: 'Kelvin Amoaba',
        url: 'https://kelvinamoaba.com',
      },
    ],
    keywords: [...((blogPost?.tags as string[]) || [])],
    creator: 'Kelvin Amoaba',
    description: blogPost?.content
      .replace(/<[^>]*>/g, '')
      // remove #, ##, ###, etc
      .replace(/#+\s/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 200),
  };
}

const BlogDetailPage = async (props0: Props) => {
  const { slug } = await props0.params;

  const post = await getPost(slug);

  if (!post) {
    return notFound();
  }

  return (
    <div className="px-5 mx-auto max-w-3xl">
      <BackButton className="mt-10" />
      <div className="mt-10 text-xl font-bold md:text-3xl">{post.title}</div>
      <div className="mt-2 text-sm text-gray-500">
        Kelvin Amoaba • {new Date(post.datePublished as string).toLocaleDateString()}
      </div>
      {(post.cover as string) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover as string}
          className="mt-10 rounded-md"
          alt={post.title}
        />
      )}
      <div className="mt-10 space-y-10 max-w-3xl font-normal leading-7 prose text-black dark:prose-invert">
        <Markdown
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <div className="overflow-hidden w-full rounded-md">
                  <CodeSection
                    code={String(children).replace(/\n$/, '')}
                    language={match[1]}
                  />
                </div>
              ) : (
                <code className={className + ' text-black'} {...props}>
                  {children}
                </code>
              );
            },
            // change color of headings
            h1({ node, ...props }) {
              return <h1 className="text-black font-semibold" {...props} />;
            },
            h2({ node, ...props }) {
              return <h2 className="text-black font-semibold" {...props} />;
            },
            h3({ node, ...props }) {
              return <h3 className="mb-0 text-black font-semibold" {...props} />;
            },
            h4({ node, ...props }) {
              return <h4 className="text-black font-medium" {...props} />;
            },
            h5({ node, ...props }) {
              return <h5 className="text-black font-medium" {...props} />;
            },
            // change color of bold text
            strong({ node, ...props }) {
              return <strong className="font-bold text-black" {...props} />;
            },
            // change color of italic text
            em({ node, ...props }) {
              return <em className="text-black" {...props} />;
            },

            blockquote({ node, ...props }) {
              return <blockquote className="text-black/80 font-normal" {...props} />;
            },
            // change color of links
            a({ node, ...props }) {
              return <a className="text-black font-medium underline underline-offset-2" {...props} />;
            },

            // remove background color in pre tags
            pre({ node, ...props }) {
              return <pre className="p-0 bg-transparent" {...props} />;
            },
          }}
        >
          {post.content}
        </Markdown>

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
      </div>
    </div>
  );
};

export default BlogDetailPage;

async function getPost(slug: string) {
  return getDocumentBySlug('posts', slug, [
    'title',
    'datePublished',
    'slug',
    'author',
    'content',
    'cover',
    'tags',
  ]);
}

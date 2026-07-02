import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import GithubSlugger from 'github-slugger';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';

export type TOCHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

function extractHeadings(source: string): TOCHeading[] {
  const slugger = new GithubSlugger();
  const withoutCode = source.replace(/```[\s\S]*?```/g, '');
  const re = /^(#{2,4})\s+(.+?)\s*$/gm;
  const out: TOCHeading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(withoutCode)) !== null) {
    const level = m[1].length as 2 | 3 | 4;
    const text = m[2].trim();
    out.push({ id: slugger.slug(text), text, level });
  }
  return out;
}

// First ~160 chars of prose, for meta descriptions when frontmatter has none.
function extractExcerpt(source: string): string {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= 160) return text;
  return text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    if (!v) return [] as string[];
    if (Array.isArray(v)) return v.map((t) => t.trim()).filter(Boolean);
    return v
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  });

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    datePublished: z.preprocess(
      (v) => (v instanceof Date ? v : new Date(String(v))),
      z.date()
    ),
    tags: tagsSchema,
    kicker: z.string().optional(),
    cover: z.string().optional().default(''),
    status: z.enum(['published', 'draft']).optional().default('published'),
    seoTitle: z.string().optional(),
    description: z.string().optional(),
    content: z.string(),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: { light: 'github-light', dark: 'github-dark' },
            keepBackground: false,
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: { className: ['heading-anchor'] },
          },
        ],
      ],
    });

    const { filePath, fileName, directory } = doc._meta;
    const slug =
      fileName === 'index.mdx'
        ? directory.split('/').pop()!
        : fileName.replace(/\.mdx$/, '');

    // Estimate reading time (~200 wpm), ignoring code blocks and inline code.
    const words = doc.content
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(words / 200));

    return {
      title: doc.title,
      datePublished: doc.datePublished,
      tags: doc.tags,
      kicker: doc.kicker,
      readingTime,
      cover: doc.cover,
      status: doc.status,
      seoTitle: doc.seoTitle,
      excerpt: doc.description ?? extractExcerpt(doc.content),
      slug,
      filePath,
      headings: extractHeadings(doc.content),
      mdx,
    };
  },
});

export default defineConfig({
  content: [posts],
});

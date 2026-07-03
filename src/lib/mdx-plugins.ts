import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';

// Single source of truth for the MDX pipeline, shared by the
// content-collections build and the studio's live preview so previews
// render exactly like published posts.
export const remarkPlugins: PluggableList = [remarkGfm];

export const rehypePlugins: PluggableList = [
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
];

import type { ComponentProps } from 'react';

import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { Figure } from './figure';

export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1 className="text-[var(--fg)] font-semibold scroll-mt-24" {...props} />
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2 className="text-[var(--fg)] font-semibold scroll-mt-24" {...props} />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3 className="text-[var(--fg)] font-semibold scroll-mt-24" {...props} />
  ),
  h4: (props: ComponentProps<'h4'>) => (
    <h4 className="text-[var(--fg)] font-medium scroll-mt-24" {...props} />
  ),
  h5: (props: ComponentProps<'h5'>) => (
    <h5 className="text-[var(--fg)] font-medium" {...props} />
  ),
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-semibold text-[var(--fg)]" {...props} />
  ),
  em: (props: ComponentProps<'em'>) => (
    <em className="text-[var(--fg)]" {...props} />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote
      className="border-l-2 border-[var(--border-strong)] pl-4 text-[var(--fg-secondary)] font-normal not-italic"
      {...props}
    />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a
      className="text-[var(--accent)] font-medium no-underline hover:underline underline-offset-2"
      {...props}
    />
  ),
  pre: (props: ComponentProps<'pre'>) => <CodeBlock {...props} />,
  Callout,
  Figure,
};

export type MDXComponents = typeof mdxComponents;

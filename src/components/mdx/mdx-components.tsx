import type { ComponentProps } from 'react';

import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { Figure } from './figure';

export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1 className="text-black font-semibold scroll-mt-24" {...props} />
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2 className="text-black font-semibold scroll-mt-24" {...props} />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3 className="text-black font-semibold scroll-mt-24" {...props} />
  ),
  h4: (props: ComponentProps<'h4'>) => (
    <h4 className="text-black font-medium scroll-mt-24" {...props} />
  ),
  h5: (props: ComponentProps<'h5'>) => (
    <h5 className="text-black font-medium" {...props} />
  ),
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-bold text-black" {...props} />
  ),
  em: (props: ComponentProps<'em'>) => (
    <em className="text-black" {...props} />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote className="text-black/80 font-normal" {...props} />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a
      className="text-black font-medium underline underline-offset-2"
      {...props}
    />
  ),
  pre: (props: ComponentProps<'pre'>) => <CodeBlock {...props} />,
  Callout,
  Figure,
};

export type MDXComponents = typeof mdxComponents;

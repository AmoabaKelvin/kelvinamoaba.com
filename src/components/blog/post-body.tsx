'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _jsx_runtime from 'react/jsx-runtime';
import { useMemo } from 'react';

import { mdxComponents } from '@/components/mdx/mdx-components';

// Client boundary for posts with inline MDX components: hooks need a client
// component to run in. The compiled bundle expects React/_jsx_runtime as
// free variables; supplying them from THIS module (app code) guarantees the
// same React instance as the rendering tree — going through the library's
// client helper resolves node_modules' React copy and breaks hooks during
// SSR. Still server-rendered for initial HTML, then hydrated.
function useMDXComponent(code: string) {
  return useMemo(() => {
    const scope = { React, ReactDOM, _jsx_runtime };
    const fn = new Function(...Object.keys(scope), code);
    return fn(...Object.values(scope)).default as React.ComponentType<{
      components?: Record<string, unknown>;
    }>;
  }, [code]);
}

export function PostBody({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return <Component components={mdxComponents} />;
}

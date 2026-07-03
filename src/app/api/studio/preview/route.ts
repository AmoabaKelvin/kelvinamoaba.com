import { NextRequest, NextResponse } from 'next/server';
import { compile } from '@mdx-js/mdx';

import { rehypePlugins, remarkPlugins } from '@/lib/mdx-plugins';
import { isAdminRequest } from '@/lib/studio/admin';

// Inline components in drafts may import from 'react' (hooks etc.).
// function-body output cannot resolve imports at runtime in the browser,
// so react imports are rewritten to bindings on the injected scope that
// mdx-preview.tsx supplies. Published posts keep the real imports, which
// mdx-bundler resolves at build time.
function shimReactImports(source: string): {
  stripped: string;
  prelude: string;
  error?: string;
} {
  const importRe = /^\s*import\s+(.+?)\s+from\s+(['"])([^'"]+)\2;?\s*$/;
  const named: string[] = [];
  let needsReact = false;
  const kept: string[] = [];

  for (const line of source.split('\n')) {
    const m = line.match(importRe);
    if (!m) {
      kept.push(line);
      continue;
    }
    if (m[3] !== 'react') {
      return {
        stripped: source,
        prelude: '',
        error: `Draft previews can only import from 'react'. Components like "${m[3]}" must be registered in mdx-components.tsx instead.`,
      };
    }
    const clause = m[1].trim();
    const namedPart = clause.match(/\{([^}]*)\}/)?.[1] ?? '';
    for (const spec of namedPart.split(',').map((s) => s.trim()).filter(Boolean)) {
      if (/\sas\s/.test(spec)) {
        return {
          stripped: source,
          prelude: '',
          error: `Import aliases ("${spec}") are not supported in draft previews.`,
        };
      }
      named.push(spec);
    }
    const rest = clause.replace(/\{[^}]*\}/, '').replace(/,/g, '').trim();
    if (rest === 'React' || rest === '* as React') needsReact = true;
    else if (rest !== '') {
      return {
        stripped: source,
        prelude: '',
        error: `Unsupported react import form: "${clause}". Use import React from 'react' or named imports.`,
      };
    }
    kept.push(''); // preserve line numbers for compile errors
  }

  const parts: string[] = [];
  if (needsReact) parts.push('const React = arguments[0].__react.React;');
  if (named.length > 0)
    parts.push(`const {${named.join(', ')}} = arguments[0].__react;`);

  return { stripped: kept.join('\n'), prelude: parts.join('\n') + (parts.length ? '\n' : '') };
}

// Compiles draft MDX through the same plugin pipeline as published posts.
// Uses @mdx-js/mdx (pure JS) rather than the build's mdx-bundler, which
// depends on the esbuild native binary and cannot be relied on inside a
// serverless function at request time.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { content } = await request.json();
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const { stripped, prelude, error: shimError } = shimReactImports(content);
  if (shimError) {
    return NextResponse.json({ error: shimError }, { status: 422 });
  }

  try {
    const code = String(
      await compile(stripped, {
        outputFormat: 'function-body',
        development: false,
        remarkPlugins,
        rehypePlugins,
      })
    );
    return NextResponse.json({ code: '"use strict";\n' + prelude + code });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to compile MDX';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

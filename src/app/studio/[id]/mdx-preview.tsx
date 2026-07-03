'use client';

import * as React from 'react';
import { Component, useMemo, type ReactNode } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';

import { mdxComponents } from '@/components/mdx/mdx-components';

// Scope injected for react imports in drafts (see the preview API route).
const reactScope = { React, ...React };

// Renders MDX compiled by /api/studio/preview (function-body output).
function useCompiledComponent(code: string | null) {
  return useMemo(() => {
    if (!code) return null;
    try {
      const fn = new Function(code);
      return fn({ ...jsxRuntime, __react: reactScope })
        .default as React.ComponentType<{
        components?: Record<string, unknown>;
      }>;
    } catch {
      return null;
    }
  }, [code]);
}

class PreviewErrorBoundary extends Component<
  { resetKey: string | null; children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidUpdate(prev: { resetKey: string | null }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <p className="ds-mono text-xs text-red-500">
          Render error: {this.state.error}
        </p>
      );
    }
    return this.props.children;
  }
}

export function MDXPreview({
  code,
  compileError,
}: {
  code: string | null;
  compileError: string | null;
}) {
  const Compiled = useCompiledComponent(code);

  return (
    <div>
      {compileError && (
        <div className="mb-6 rounded-[var(--ds-radius)] border border-[var(--ds-amber-500)] bg-[var(--ds-amber-100)] px-3 py-2 dark:bg-transparent">
          <p className="ds-mono break-words text-xs text-[var(--fg-secondary)]">
            {compileError}
          </p>
        </div>
      )}
      {Compiled ? (
        <article className="prose max-w-none leading-7">
          <PreviewErrorBoundary resetKey={code}>
            <Compiled components={mdxComponents} />
          </PreviewErrorBoundary>
        </article>
      ) : !compileError ? (
        <p className="text-sm text-[var(--fg-faint)]">
          The preview appears here as you write.
        </p>
      ) : null}
    </div>
  );
}

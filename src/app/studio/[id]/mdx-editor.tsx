'use client';

import { useEffect, useRef } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { placeholder } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    color: 'var(--fg)',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.75',
    padding: '1.25rem 0',
    caretColor: 'var(--fg)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--ds-gray-200) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--fg)' },
  '.cm-placeholder': { color: 'var(--fg-faint)' },
});

const mdHighlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: '600', color: 'var(--fg)' },
  { tag: tags.strong, fontWeight: '600', color: 'var(--fg)' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.monospace, color: 'var(--accent)' },
  { tag: tags.link, color: 'var(--accent)' },
  { tag: tags.url, color: 'var(--fg-muted)' },
  { tag: tags.quote, color: 'var(--fg-muted)' },
  { tag: tags.meta, color: 'var(--fg-faint)' },
  { tag: tags.processingInstruction, color: 'var(--fg-faint)' },
  { tag: tags.labelName, color: 'var(--accent)' },
]);

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

function imageFiles(data: DataTransfer | null): File[] {
  return Array.from(data?.files ?? []).filter((f) => IMAGE_TYPES.has(f.type));
}

type Props = {
  initialValue: string;
  onChange: (value: string) => void;
  // Called with null on unmount so callers never dispatch to a destroyed view.
  onViewReady?: (view: EditorView | null) => void;
  onImageFiles?: (files: File[]) => void;
};

export function MDXEditor({
  initialValue,
  onChange,
  onViewReady,
  onImageFiles,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onImageFilesRef = useRef(onImageFiles);
  onImageFilesRef.current = onImageFiles;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      extensions: [
        minimalSetup,
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
        editorTheme,
        syntaxHighlighting(mdHighlight),
        placeholder('Write in MDX…'),
        EditorView.domEventHandlers({
          paste: (event) => {
            const files = imageFiles(event.clipboardData);
            if (files.length === 0 || !onImageFilesRef.current) return false;
            event.preventDefault();
            onImageFilesRef.current(files);
            return true;
          },
          drop: (event, view) => {
            const files = imageFiles(event.dataTransfer);
            if (files.length === 0 || !onImageFilesRef.current) return false;
            event.preventDefault();
            // Move the cursor to the drop point so the caller inserts there.
            const pos = view.posAtCoords({
              x: event.clientX,
              y: event.clientY,
            });
            if (pos != null) view.dispatch({ selection: { anchor: pos } });
            onImageFilesRef.current(files);
            return true;
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
      parent: containerRef.current,
    });

    onViewReady?.(view);
    return () => {
      onViewReady?.(null);
      view.destroy();
    };
    // The editor owns its document after mount; remounts are keyed by draft id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full min-h-[60vh]" />;
}

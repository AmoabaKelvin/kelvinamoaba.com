'use client';

import { useEffect, useRef } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { EditorSelection } from '@codemirror/state';
import { keymap, placeholder } from '@codemirror/view';
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
  // The global ::selection rule inverts text to var(--bg), which is unreadable
  // on the gray selection layer drawSelection paints. Keep each token's color.
  '.cm-line::selection': { color: 'currentColor' },
  '.cm-line ::selection': { color: 'currentColor' },
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

// Wrap the selection in an inline marker (**, _, `), or unwrap it when the
// marker is already there. With no selection, inserts a pair and puts the
// cursor between the markers.
function toggleWrap(marker: string) {
  return (view: EditorView): boolean => {
    view.dispatch(
      view.state.changeByRange((range) => {
        const { from, to } = range;
        const before = view.state.sliceDoc(
          Math.max(0, from - marker.length),
          from
        );
        const after = view.state.sliceDoc(to, to + marker.length);
        if (before === marker && after === marker) {
          return {
            changes: [
              { from: from - marker.length, to: from },
              { from: to, to: to + marker.length },
            ],
            range: EditorSelection.range(from - marker.length, to - marker.length),
          };
        }
        const selected = view.state.sliceDoc(from, to);
        if (
          selected.length >= marker.length * 2 &&
          selected.startsWith(marker) &&
          selected.endsWith(marker)
        ) {
          return {
            changes: [
              { from, to: from + marker.length },
              { from: to - marker.length, to },
            ],
            range: EditorSelection.range(from, to - marker.length * 2),
          };
        }
        return {
          changes: [
            { from, insert: marker },
            { from: to, insert: marker },
          ],
          range: EditorSelection.range(from + marker.length, to + marker.length),
        };
      })
    );
    return true;
  };
}

// Turn the selection into [selection](url) with the url placeholder selected.
function insertLink(view: EditorView): boolean {
  view.dispatch(
    view.state.changeByRange((range) => {
      const text = view.state.sliceDoc(range.from, range.to);
      return {
        changes: { from: range.from, to: range.to, insert: `[${text}](url)` },
        range: EditorSelection.range(
          range.from + text.length + 3,
          range.from + text.length + 6
        ),
      };
    })
  );
  return true;
}

const formatKeymap = keymap.of([
  { key: 'Mod-b', run: toggleWrap('**') },
  { key: 'Mod-i', run: toggleWrap('_') },
  { key: 'Mod-e', run: toggleWrap('`') },
  { key: 'Mod-k', run: insertLink },
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
        formatKeymap,
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

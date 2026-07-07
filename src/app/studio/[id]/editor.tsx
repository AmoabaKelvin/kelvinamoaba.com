'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { EditorView } from 'codemirror';
import GithubSlugger from 'github-slugger';
import { nanoid } from 'nanoid';
import { Link } from 'next-view-transitions';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiArrowLeft, HiChevronDown, HiPhoto, HiPlus } from 'react-icons/hi2';

import {
  compilePreview,
  getDraft,
  patchDraft,
  publishDraft,
  uploadImage,
  type StudioDraftPatch,
} from '@/lib/api/studio';
import { cn } from '@/lib/utils';

import { MDXEditor } from './mdx-editor';
import { MDXPreview } from './mdx-preview';

const COMPONENT_SNIPPETS = [
  {
    name: 'Callout',
    description: 'Note, warning, or info aside',
    snippet: '<Callout variant="note" title="Note">\n\nYour text here.\n\n</Callout>\n',
  },
  {
    name: 'Figure',
    description: 'Image with an optional caption',
    snippet: '<Figure src="https://" alt="" caption="" />\n',
  },
  {
    name: 'Code block',
    description: 'Fenced code with highlighting',
    snippet: '```go\n\n```\n',
  },
  {
    name: 'Table',
    description: 'GFM table',
    snippet:
      '| Column | Column |\n| ------ | ------ |\n| Cell   | Cell   |\n',
  },
];

type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

type Fields = {
  title: string;
  slug: string;
  kicker: string;
  tags: string;
  cover: string;
  description: string;
  seoTitle: string;
};

function slugify(title: string): string {
  return new GithubSlugger().slug(title);
}

// Locate the placeholder by text: the user may have kept typing during the
// upload, so a remembered offset would be stale. Skip if it was deleted.
function replaceToken(view: EditorView, token: string, replacement: string) {
  const from = view.state.doc.toString().indexOf(token);
  if (from === -1) return;
  view.dispatch({
    changes: { from, to: from + token.length, insert: replacement },
  });
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ds-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 rounded-[var(--ds-radius)] border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:border-[var(--fg-muted)] focus:outline-none',
          mono && 'ds-mono text-xs'
        )}
      />
    </label>
  );
}

export function Editor({ id }: { id: string }) {
  const { data: draft, isLoading, error } = useQuery({
    queryKey: ['studio', 'draft', id],
    queryFn: () => getDraft(id),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const [fields, setFields] = useState<Fields | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [view, setView] = useState<'write' | 'preview'>('write');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [previewPending, setPreviewPending] = useState(false);

  const editorViewRef = useRef<EditorView | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugTouchedRef = useRef(false);
  const initializedRef = useRef(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close the component palette on outside click or Escape.
  useEffect(() => {
    if (!paletteOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!paletteRef.current?.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [paletteOpen]);

  // Hydrate local state once the draft arrives.
  useEffect(() => {
    if (draft && !initializedRef.current) {
      initializedRef.current = true;
      setFields({
        title: draft.title,
        slug: draft.slug,
        kicker: draft.kicker,
        tags: draft.tags,
        cover: draft.cover,
        description: draft.description,
        seoTitle: draft.seoTitle,
      });
      setContent(draft.content);
      slugTouchedRef.current =
        draft.slug !== '' && draft.slug !== slugify(draft.title);
    }
  }, [draft]);

  // --- Autosave (debounced) ---
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = useMutation({
    mutationFn: (patch: StudioDraftPatch) => patchDraft(id, patch),
    onSuccess: () => setSaveState('saved'),
    onError: () => setSaveState('error'),
  });
  const saveRef = useRef(save);
  saveRef.current = save;

  // Latest values for async callbacks (image uploads) that outlive a render.
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const contentRef = useRef(content);
  contentRef.current = content;

  const scheduleSave = useCallback((patch: StudioDraftPatch) => {
    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState('saving');
      saveRef.current.mutate(patch);
    }, 1200);
  }, []);

  const updateField = (key: keyof Fields, value: string) => {
    if (!fields) return;
    const next = { ...fields, [key]: value };
    if (key === 'slug') slugTouchedRef.current = true;
    if (key === 'title' && !slugTouchedRef.current) {
      next.slug = slugify(value);
    }
    setFields(next);
    scheduleSave({ ...next, content: content ?? undefined });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (fields) scheduleSave({ ...fields, content: value });
  };

  // --- Preview: compiled on demand when switching views ---
  const showPreview = async () => {
    setView('preview');
    setPreviewPending(true);
    try {
      const { code } = await compilePreview(content ?? '');
      setPreviewCode(code);
      setCompileError(null);
    } catch (e) {
      setCompileError(e instanceof Error ? e.message : 'Compile failed');
    } finally {
      setPreviewPending(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    const v = editorViewRef.current;
    setPaletteOpen(false);
    setView('write');
    if (!v) return;
    v.dispatch(v.state.replaceSelection('\n' + snippet));
    v.focus();
  };

  // Live-editor dispatches fire the updateListener, so autosave picks up both
  // the placeholder and the final markdown. When the CodeMirror view has been
  // destroyed mid-upload (switching to Preview unmounts it), patch React state
  // directly so the result still reaches the saved draft.
  const patchContent = (fn: (current: string) => string) => {
    const current = contentRef.current ?? '';
    const next = fn(current);
    if (next === current) return;
    contentRef.current = next;
    setContent(next);
    if (fieldsRef.current) scheduleSave({ ...fieldsRef.current, content: next });
  };

  const settleUpload = (token: string, replacement: string) => {
    // Re-read the ref: the view that inserted the token may be gone by now.
    const v = editorViewRef.current;
    if (v) replaceToken(v, token, replacement);
    else patchContent((c) => c.replace(token, replacement));
  };

  const uploadImages = async (files: File[]) => {
    if (!editorViewRef.current) return;
    setUploadError(null);
    for (const file of files) {
      const token = `![uploading ${nanoid(6)}…]()`;
      const v = editorViewRef.current;
      if (v) v.dispatch(v.state.replaceSelection(token + '\n'));
      else patchContent((c) => c + token + '\n');
      try {
        const { path } = await uploadImage(file);
        settleUpload(token, `![](${path})`);
      } catch (e) {
        settleUpload(token, '');
        setUploadError(e instanceof Error ? e.message : 'Upload failed');
      }
    }
  };

  // --- Publish ---
  const publish = useMutation({ mutationFn: () => publishDraft(id) });

  const canPublish =
    !!fields &&
    fields.title.trim().length > 0 &&
    /^[a-z0-9-]+$/.test(fields.slug) &&
    (content ?? '').trim().length > 0 &&
    saveState === 'saved';

  if (isLoading || !fields) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-24">
        {error ? (
          <p className="ds-copy">Draft not found.</p>
        ) : (
          <div className="ds-card h-96 animate-pulse" />
        )}
      </div>
    );
  }

  const saveLabel: Record<SaveState, string> = {
    saved: 'Saved',
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    error: 'Save failed — retrying on next edit',
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 md:px-10">
      {/* Top bar */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          <HiArrowLeft className="h-3.5 w-3.5" />
          Studio
        </Link>
        <span
          className={cn(
            'ds-mono text-xs',
            saveState === 'error' ? 'text-red-500' : 'text-[var(--fg-faint)]'
          )}
        >
          {saveLabel[saveState]}
        </span>
        <span className="flex-1" />

        {/* Write / Preview toggle */}
        <div className="flex rounded-[var(--ds-radius)] border border-[var(--border)] p-0.5">
          <button
            onClick={() => setView('write')}
            className={cn(
              'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
              view === 'write'
                ? 'bg-[var(--fg)] text-[var(--bg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            )}
          >
            Write
          </button>
          <button
            onClick={showPreview}
            className={cn(
              'rounded-[4px] px-3 py-1 text-xs font-medium transition-colors',
              view === 'preview'
                ? 'bg-[var(--fg)] text-[var(--bg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            )}
          >
            Preview
          </button>
        </div>

        {/* Image upload */}
        <button
          onClick={() => {
            setView('write');
            fileInputRef.current?.click();
          }}
          className="ds-button ds-button-secondary ds-button-small"
        >
          <HiPhoto className="h-3.5 w-3.5" />
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = '';
            if (files.length > 0) uploadImages(files);
          }}
        />

        {/* Component palette */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteOpen((v) => !v)}
            className="ds-button ds-button-secondary ds-button-small"
          >
            <HiPlus className="h-3.5 w-3.5" />
            Component
          </button>
          {paletteOpen && (
            <div className="absolute right-0 top-11 z-20 w-72 rounded-[var(--ds-radius-lg)] border border-[var(--border)] bg-[var(--bg)] p-1.5 shadow-[var(--ds-shadow-large)]">
              {COMPONENT_SNIPPETS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => insertSnippet(c.snippet)}
                  className="block w-full rounded-[var(--ds-radius)] px-3 py-2 text-left transition-colors hover:bg-[var(--ds-gray-100)]"
                >
                  <span className="block text-sm font-medium text-[var(--fg)]">
                    {c.name}
                  </span>
                  <span className="block text-xs text-[var(--fg-muted)]">
                    {c.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => publish.mutate()}
          disabled={!canPublish || publish.isPending}
          className="ds-button ds-button-primary ds-button-small disabled:cursor-not-allowed disabled:opacity-40"
        >
          {publish.isPending
            ? 'Publishing…'
            : draft?.publishedAt
              ? 'Republish'
              : 'Publish'}
        </button>
      </div>

      {publish.isError && (
        <div className="mb-4 rounded-[var(--ds-radius)] border border-red-300 px-3 py-2">
          <p className="ds-mono text-xs text-red-500">
            {(publish.error as Error).message}
          </p>
        </div>
      )}
      {uploadError && (
        <div className="mb-4 rounded-[var(--ds-radius)] border border-red-300 px-3 py-2">
          <p className="ds-mono text-xs text-red-500">{uploadError}</p>
        </div>
      )}
      {publish.isSuccess && (
        <div className="mb-4 rounded-[var(--ds-radius)] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2">
          <p className="ds-mono text-xs text-[var(--fg-secondary)]">
            Published — commit pushed, deploy in progress.{' '}
            <a
              href={publish.data.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-link"
            >
              View commit
            </a>
          </p>
        </div>
      )}

      {view === 'write' ? (
        <>
          {/* Title */}
          <input
            type="text"
            value={fields.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Post title"
            className="ds-heading-1 mb-2 w-full border-0 bg-transparent text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none"
          />

          {/* Details (frontmatter) */}
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            className="mb-6 flex items-center gap-1 text-xs text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <HiChevronDown
              className={cn(
                'h-3 w-3 transition-transform',
                detailsOpen && 'rotate-180'
              )}
            />
            Details
            <span className="ds-mono ml-2 text-[var(--fg-faint)]">
              /blog/{fields.slug || '…'}
            </span>
          </button>
          {detailsOpen && (
            <div className="mb-8 grid grid-cols-1 gap-4 rounded-[var(--ds-radius-lg)] border border-[var(--border)] p-4 md:grid-cols-2">
              <FieldInput label="Slug" value={fields.slug} onChange={(v) => updateField('slug', v)} placeholder="my-post" mono />
              <FieldInput label="Kicker" value={fields.kicker} onChange={(v) => updateField('kicker', v)} placeholder="SYSTEMS / GO / ESSAY" mono />
              <FieldInput label="Tags" value={fields.tags} onChange={(v) => updateField('tags', v)} placeholder="go, compilers" mono />
              <FieldInput label="Cover URL" value={fields.cover} onChange={(v) => updateField('cover', v)} placeholder="https://…" mono />
              <FieldInput label="SEO title" value={fields.seoTitle} onChange={(v) => updateField('seoTitle', v)} placeholder="Overrides the title in search results" />
              <FieldInput label="Description" value={fields.description} onChange={(v) => updateField('description', v)} placeholder="Meta description (~160 chars)" />
            </div>
          )}

          <div className="border-t border-[var(--border)]">
            <MDXEditor
              key={id}
              // Current state, not the fetched draft: the editor remounts
              // after Preview and must not revert to pre-toggle content.
              initialValue={content ?? draft?.content ?? ''}
              onChange={handleContentChange}
              onViewReady={(v) => (editorViewRef.current = v)}
              onImageFiles={uploadImages}
            />
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-3xl">
          {/* Preview: rendered at the published post's column width */}
          <h1 className="ds-heading-1 mb-2 text-[var(--fg)]">
            {fields.title || 'Post title'}
          </h1>
          <div className="ds-mono mb-10 text-sm text-[var(--fg-muted)]">
            Kelvin Amoaba ·{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          {previewPending ? (
            <p className="ds-mono text-xs text-[var(--fg-faint)]">
              Rendering preview…
            </p>
          ) : (
            <MDXPreview code={previewCode} compileError={compileError} />
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { HiPlus, HiTrash } from 'react-icons/hi2';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  createDraft,
  deleteDraft,
  listDrafts,
  type StudioDraft,
} from '@/lib/api/studio';

const draftsKey = ['studio', 'drafts'] as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DraftRow({
  draft,
  onDelete,
}: {
  draft: StudioDraft;
  onDelete: () => void;
}) {
  return (
    <div className="ds-card ds-card-interactive group relative p-5">
      <Link href={`/studio/${draft.id}`} className="block">
        <div className="flex items-baseline justify-between gap-4 pr-8">
          <span className="truncate text-[0.9375rem] font-medium text-[var(--fg)]">
            {draft.title || 'Untitled draft'}
          </span>
          <span className="ds-mono flex-shrink-0 text-xs tabular-nums text-[var(--fg-muted)]">
            {formatDate(draft.updatedAt)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {draft.publishedAt ? (
            <span className="ds-badge">published</span>
          ) : (
            <span className="ds-badge">draft</span>
          )}
          {draft.kicker && (
            <span className="ds-mono text-xs uppercase tracking-wide text-[var(--fg-faint)]">
              {draft.kicker}
            </span>
          )}
          <span className="ds-mono text-xs text-[var(--fg-faint)]">
            {draft.content.trim()
              ? `${draft.content.trim().split(/\s+/).length} words`
              : 'empty'}
          </span>
        </div>
      </Link>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            aria-label="Delete draft"
            className="absolute right-4 top-4 text-[var(--fg-faint)] opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{draft.title || 'Untitled draft'}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {draft.publishedAt
                ? 'The published post stays live; only this draft is removed.'
                : 'This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function DraftsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: drafts, isLoading } = useQuery({
    queryKey: draftsKey,
    queryFn: listDrafts,
  });

  const create = useMutation({
    mutationFn: createDraft,
    onSuccess: (draft) => {
      queryClient.invalidateQueries({ queryKey: draftsKey });
      router.push(`/studio/${draft.id}`);
    },
  });

  const remove = useMutation({
    mutationFn: deleteDraft,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: draftsKey });
      const previous = queryClient.getQueryData<StudioDraft[]>(draftsKey);
      queryClient.setQueryData<StudioDraft[]>(draftsKey, (old) =>
        (old ?? []).filter((d) => d.id !== id)
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(draftsKey, ctx.previous);
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <span className="ds-label">Drafts</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="ds-button ds-button-primary ds-button-small"
        >
          <HiPlus className="h-3.5 w-3.5" />
          New draft
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ds-card h-20 animate-pulse p-5" />
          ))}
        </div>
      ) : drafts && drafts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {drafts.map((draft) => (
            <DraftRow
              key={draft.id}
              draft={draft}
              onDelete={() => remove.mutate(draft.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--fg-faint)]">
          No drafts yet. Start one.
        </p>
      )}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FaGithub } from 'react-icons/fa';

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
import { signIn, useSession } from '@/lib/auth-client';
import {
  ADMIN_USERNAME,
  type CommentWithUser,
} from '@/lib/blog-engagement-shared';
import {
  useAddComment,
  useComments,
  useDeleteComment,
  useEditComment,
} from '@/lib/hooks/use-blog-engagement';
import { cn } from '@/lib/utils';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Renders @mentions in the accent color; a token only counts as a mention
// at the start of the body or after whitespace (so emails stay plain).
function CommentBody({ body }: { body: string }) {
  const parts = body.split(/(@[A-Za-z0-9][A-Za-z0-9-]*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const prev = parts[i - 1] ?? '';
        const isMention =
          part.startsWith('@') && (prev === '' || /\s$/.test(prev));
        return isMention ? (
          <span key={i} className="font-medium text-[var(--accent)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

function Avatar({ user }: { user: CommentWithUser['user'] }) {
  const displayName = user.name || user.username || 'Anonymous';
  return user.image ? (
    <Image
      src={user.image}
      alt={displayName}
      width={32}
      height={32}
      className="h-8 w-8 flex-shrink-0 rounded-full"
    />
  ) : (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--ds-gray-100)]">
      <span className="text-xs font-medium text-[var(--fg-muted)]">
        {displayName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function Composer({
  slug,
  parentId,
  placeholder,
  autoFocus,
  initialBody,
  onDone,
}: {
  slug: string;
  parentId?: string | null;
  placeholder: string;
  autoFocus?: boolean;
  initialBody?: string;
  onDone?: () => void;
}) {
  const { data: session } = useSession();
  const addComment = useAddComment(slug);
  const [body, setBody] = useState(initialBody ?? '');

  if (!session?.user) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-[var(--ds-radius-lg)] border border-[var(--border)] px-4 py-3">
        <p className="text-sm text-[var(--fg-muted)]">
          Sign in to join the discussion.
        </p>
        <button
          onClick={() =>
            signIn.social({
              provider: 'github',
              callbackURL: window.location.pathname,
            })
          }
          className="ds-button ds-button-secondary ds-button-small flex-shrink-0"
        >
          <FaGithub className="h-3.5 w-3.5" />
          Sign in
        </button>
      </div>
    );
  }

  const user = session.user as {
    id: string;
    name: string;
    image?: string | null;
    username?: string | null;
  };

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed || addComment.isPending) return;
    addComment.mutate({
      body: trimmed,
      parentId,
      optimisticUser: {
        id: user.id,
        name: user.name,
        image: user.image ?? null,
        username: user.username ?? null,
      },
    });
    setBody('');
    onDone?.();
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar
        user={{
          id: user.id,
          name: user.name,
          image: user.image ?? null,
          username: user.username ?? null,
        }}
      />
      <div className="min-w-0 flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          maxLength={2000}
          className="w-full resize-y rounded-[var(--ds-radius-lg)] border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm leading-relaxed text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:border-[var(--fg-muted)] focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-end gap-3">
          {body.length > 1800 && (
            <span className="ds-mono text-xs tabular-nums text-[var(--fg-muted)]">
              {2000 - body.length}
            </span>
          )}
          <button
            onClick={submit}
            disabled={!body.trim() || addComment.isPending}
            className="ds-button ds-button-primary ds-button-small disabled:cursor-not-allowed disabled:opacity-40"
          >
            {parentId ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  slug,
  comment,
  replies,
  threadRootId,
}: {
  slug: string;
  comment: CommentWithUser;
  replies: CommentWithUser[];
  // Replies always attach to the thread's top-level comment: the thread
  // stays visually flat, and replying to a reply prefills an @mention.
  threadRootId: string;
}) {
  const { data: session } = useSession();
  const deleteComment = useDeleteComment(slug);
  const editComment = useEditComment(slug);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState('');

  const me = session?.user as
    | { id: string; username?: string | null }
    | undefined;
  const isOwner = !!me && me.id === comment.user.id;
  const canDelete =
    !comment.deleted && (isOwner || me?.username === ADMIN_USERNAME);
  const canEdit = !comment.deleted && isOwner;

  const displayName = comment.user.name || comment.user.username || 'Anonymous';
  const isOptimistic = comment.id.startsWith('optimistic-');

  const startEditing = () => {
    setEditBody(comment.body);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === comment.body) {
      setEditing(false);
      return;
    }
    editComment.mutate({ id: comment.id, body: trimmed });
    setEditing(false);
  };

  return (
    <div className={cn('group', isOptimistic && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <Avatar user={comment.user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-[var(--fg)]">
              {comment.deleted ? '[deleted]' : displayName}
            </span>
            {!comment.deleted && comment.user.username && (
              <span className="ds-mono text-xs text-[var(--fg-muted)]">
                @{comment.user.username}
              </span>
            )}
            <time className="ds-mono text-xs tabular-nums text-[var(--fg-faint)]">
              {formatDate(comment.createdAt)}
            </time>
            {comment.edited && !comment.deleted && (
              <span className="ds-mono text-xs text-[var(--fg-faint)]">
                (edited)
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') setEditing(false);
                }}
                autoFocus
                rows={3}
                maxLength={2000}
                className="w-full resize-y rounded-[var(--ds-radius-lg)] border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm leading-relaxed text-[var(--fg)] focus:border-[var(--fg-muted)] focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={!editBody.trim()}
                  className="ds-button ds-button-primary ds-button-small disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                'mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed',
                comment.deleted
                  ? 'italic text-[var(--fg-faint)]'
                  : 'text-[var(--fg-secondary)]'
              )}
            >
              {comment.deleted ? (
                'This comment was deleted.'
              ) : (
                <CommentBody body={comment.body} />
              )}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-4 text-xs">
            {!comment.deleted && !editing && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
              >
                {replying ? 'Cancel' : 'Reply'}
              </button>
            )}
            {canEdit && !isOptimistic && !editing && (
              <button
                onClick={startEditing}
                className="text-[var(--fg-faint)] opacity-0 transition-all hover:text-[var(--fg)] group-hover:opacity-100"
              >
                Edit
              </button>
            )}
            {canDelete && !isOptimistic && !editing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-[var(--fg-faint)] opacity-0 transition-all hover:text-red-500 group-hover:opacity-100">
                    Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {replies.length > 0
                        ? 'It has replies, so it will be shown as [deleted] to keep the thread intact.'
                        : 'This cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => deleteComment.mutate(comment.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <Composer
                slug={slug}
                parentId={threadRootId}
                placeholder={`Reply to ${displayName}…`}
                initialBody={
                  comment.parentId
                    ? `@${comment.user.username || displayName} `
                    : undefined
                }
                autoFocus
                onDone={() => setReplying(false)}
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 border-l border-[var(--border)] pl-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  slug={slug}
                  comment={reply}
                  replies={[]}
                  threadRootId={threadRootId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Comments({ slug }: { slug: string }) {
  const { data: comments, isLoading } = useComments(slug);

  const { topLevel, repliesByParent } = useMemo(() => {
    const topLevel: CommentWithUser[] = [];
    const repliesByParent = new Map<string, CommentWithUser[]>();
    for (const c of comments ?? []) {
      if (c.parentId) {
        const list = repliesByParent.get(c.parentId) ?? [];
        list.push(c);
        repliesByParent.set(c.parentId, list);
      } else {
        topLevel.push(c);
      }
    }
    // Newest threads first; replies stay chronological within a thread.
    topLevel.reverse();
    return { topLevel, repliesByParent };
  }, [comments]);

  const count = (comments ?? []).filter((c) => !c.deleted).length;

  return (
    <section aria-label="Comments">
      <div className="mb-6 flex items-center gap-4">
        <span className="ds-label">
          Comments{count > 0 ? ` (${count})` : ''}
        </span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <Composer slug={slug} placeholder="Share your thoughts…" />

      {isLoading ? (
        <div className="mt-8 flex flex-col gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--ds-gray-100)]" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-32 rounded bg-[var(--ds-gray-100)]" />
                <div className="h-3 w-3/4 rounded bg-[var(--ds-gray-100)]" />
              </div>
            </div>
          ))}
        </div>
      ) : topLevel.length > 0 ? (
        <div className="mt-8 flex flex-col gap-7">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              slug={slug}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
              threadRootId={comment.id}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-[var(--fg-faint)]">
          No comments yet. Be the first.
        </p>
      )}
    </section>
  );
}

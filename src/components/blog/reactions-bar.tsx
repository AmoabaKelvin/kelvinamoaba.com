'use client';

import { cn } from '@/lib/utils';
import {
  REACTION_EMOJIS,
  type ReactionEmoji,
} from '@/lib/blog-engagement-shared';
import {
  useAnonToken,
  useReactions,
  useToggleReaction,
} from '@/lib/hooks/use-blog-engagement';

export function ReactionsBar({ slug }: { slug: string }) {
  const token = useAnonToken();
  const { data } = useReactions(slug, token);
  const toggle = useToggleReaction(slug, token);

  const handleToggle = (emoji: ReactionEmoji) => {
    if (!token) return;
    toggle.mutate(emoji);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {REACTION_EMOJIS.map((emoji) => {
        const count = data?.counts[emoji] ?? 0;
        const reacted = data?.reacted.includes(emoji) ?? false;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleToggle(emoji)}
            disabled={!token}
            aria-pressed={reacted}
            aria-label={`React with ${emoji}`}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-all duration-150',
              'hover:-translate-y-px active:translate-y-0',
              reacted
                ? 'border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]'
                : 'border-[var(--border)] bg-transparent text-[var(--fg-secondary)] hover:border-[var(--fg-muted)]'
            )}
          >
            <span className="text-base leading-none">{emoji}</span>
            {count > 0 && (
              <span className="ds-mono text-xs tabular-nums">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import Image from 'next/image';
import type { GuestbookPost } from '@/lib/data/guestbook';

type PostCardProps = {
  post: GuestbookPost;
};

export function PostCard({ post }: PostCardProps) {
  const displayName = post.user.name || post.user.username || 'Anonymous';
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="flex items-start gap-4">
      {post.user.image ? (
        <Image
          src={post.user.image}
          alt={displayName}
          width={32}
          height={32}
          className="shrink-0 rounded-full grayscale"
        />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-gray-100)]">
          <span className="text-xs font-medium text-[var(--fg-muted)]">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="truncate font-medium text-[var(--fg)]">
            {displayName}
          </span>
          {post.user.username && (
            <span className="font-mono text-xs text-[var(--fg-faint)]">
              @{post.user.username}
            </span>
          )}
          <time className="font-mono text-xs text-[var(--fg-faint)] tabular-nums">
            {formattedDate}
          </time>
        </div>

        <p className="mt-1.5 text-base/7 break-words whitespace-pre-wrap text-[var(--fg-secondary)] sm:text-sm/6">
          {post.message}
        </p>
      </div>

      {post.signature && (
        <Image
          src={post.signature}
          alt="Signature"
          width={96}
          height={48}
          className="shrink-0 object-contain opacity-60"
          unoptimized
        />
      )}
    </article>
  );
}

'use client';

import Image from 'next/image';
import type { GuestbookPost } from '@/lib/data/guestbook';

type PostCardProps = {
  post: GuestbookPost;
  index?: number;
};

export function PostCard({ post, index = 0 }: PostCardProps) {
  const displayName = post.user.name || post.user.username || 'Anonymous';
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="ds-card ds-card-interactive group animate-fade-up p-5"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      <div className="flex items-start gap-4">
        {post.user.image ? (
          <Image
            src={post.user.image}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full grayscale transition-all duration-300 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ds-gray-100)]">
            <span className="text-xs font-medium text-[var(--fg-muted)]">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="truncate text-[0.9375rem] font-medium text-[var(--fg)]">
              {displayName}
            </span>
            {post.user.username && (
              <span className="ds-mono text-xs text-[var(--fg-muted)]">
                @{post.user.username}
              </span>
            )}
          </div>

          <p className="mb-3 whitespace-pre-wrap break-words text-[0.875rem] leading-relaxed text-[var(--fg-secondary)]">
            {post.message}
          </p>

          <time className="ds-mono text-xs tabular-nums text-[var(--fg-muted)]">
            {formattedDate}
          </time>
        </div>
      </div>

      {post.signature && (
        <div className="absolute bottom-3 right-4 opacity-50 group-hover:opacity-80 transition-opacity">
          <Image
            src={post.signature}
            alt="Signature"
            width={150}
            height={75}
            className="object-contain"
            unoptimized
          />
        </div>
      )}
    </article>
  );
}

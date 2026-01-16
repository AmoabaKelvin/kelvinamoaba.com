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
      className="group relative p-5 border border-[var(--color-mist)] bg-[var(--color-paper)] transition-all duration-300 hover:border-[var(--color-ink)] hover:translate-y-[-2px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
    >
      <div className="flex items-start gap-4">
        {post.user.image ? (
          <Image
            src={post.user.image}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--color-mist)] flex items-center justify-center">
            <span className="text-xs font-medium text-[var(--color-stone)]">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[0.9375rem] font-medium text-[var(--color-ink)] truncate">
              {displayName}
            </span>
            {post.user.username && (
              <span className="text-xs text-[var(--color-stone)]">
                @{post.user.username}
              </span>
            )}
          </div>

          <p className="text-[0.875rem] text-[var(--color-ink)] leading-relaxed whitespace-pre-wrap break-words mb-3">
            {post.message}
          </p>

          <time className="text-xs tracking-wide text-[var(--color-stone)] tabular-nums">
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

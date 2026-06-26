'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGuestbookPosts } from '@/lib/hooks/use-guestbook';
import { PostCard } from './post-card';

export function PostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGuestbookPosts();

  const { ref, inView } = useInView({
    rootMargin: '1000px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex items-center gap-3 text-[var(--fg-muted)]">
          <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
          <span
            className="w-1 h-1 bg-current rounded-full animate-pulse"
            style={{ animationDelay: '0.15s' }}
          />
          <span
            className="w-1 h-1 bg-current rounded-full animate-pulse"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-[0.9375rem] text-[var(--fg-muted)]">
          Unable to load messages. Please try again.
        </p>
      </div>
    );
  }

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="rounded-[var(--ds-radius-lg)] border border-dashed border-[var(--border-strong)] py-16 text-center">
        <p className="ds-heading-3 mb-2 text-[var(--fg-secondary)]">
          No messages yet
        </p>
        <p className="text-[0.875rem] text-[var(--fg-muted)]">
          Be the first to leave your mark
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-[var(--fg-muted)]">
              <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
              <span
                className="w-1 h-1 bg-current rounded-full animate-pulse"
                style={{ animationDelay: '0.15s' }}
              />
              <span
                className="w-1 h-1 bg-current rounded-full animate-pulse"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

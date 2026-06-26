import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Suspense } from 'react';

import { getGuestbookPosts } from '@/lib/data/guestbook';
import { guestbookKeys } from '@/lib/guestbook-keys';
import { PostsList } from './posts-list';
import { GuestbookHeader } from './guestbook-header';

export const dynamic = 'force-dynamic';

export default function GuestbookPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20">
        <GuestbookHeader />
      </section>

      {/* Posts Section */}
      <section className="pb-20">
        <div className="animate-fade-up stagger-3 mb-8 flex items-center gap-4">
          <span className="ds-label">Messages</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Suspense fallback={<GuestbookSkeleton />}>
          <GuestbookPosts />
        </Suspense>
      </section>
    </div>
  );
}

// Server component: fetches the first page directly from the DB and dehydrates
// it into the React Query cache so the list renders in the server HTML. Infinite
// scroll and optimistic sign continue client-side against the same cache key.
async function GuestbookPosts() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: guestbookKeys.postsList(),
    queryFn: ({ pageParam }) => getGuestbookPosts(pageParam),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />
    </HydrationBoundary>
  );
}

function GuestbookSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="ds-card animate-pulse p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[var(--ds-gray-100)]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/4 rounded bg-[var(--ds-gray-100)]" />
              <div className="h-3 w-3/4 rounded bg-[var(--ds-gray-100)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--ds-gray-100)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Hero Section */}
      <section>
        <GuestbookHeader />
      </section>

      {/* Posts Section */}
      <section className="mt-20 md:mt-24">
        <h2 className="font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
          Messages
        </h2>

        <div className="mt-8">
          <Suspense fallback={<GuestbookSkeleton />}>
            <GuestbookPosts />
          </Suspense>
        </div>
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
    <div className="space-y-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex animate-pulse items-start gap-4">
          <div className="size-8 rounded-full bg-[var(--ds-gray-100)]" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/4 rounded bg-[var(--ds-gray-100)]" />
            <div className="h-3 w-3/4 rounded bg-[var(--ds-gray-100)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--ds-gray-100)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

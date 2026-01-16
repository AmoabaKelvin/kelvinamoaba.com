import { Suspense } from 'react';
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
        <div className="animate-fade-up stagger-3 mb-10 pl-6">
          <span className="section-heading">Messages</span>
        </div>

        <Suspense fallback={<GuestbookSkeleton />}>
          <PostsList />
        </Suspense>
      </section>
    </div>
  );
}

function GuestbookSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="p-5 border border-[var(--color-mist)] animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[var(--color-mist)] rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-[var(--color-mist)] rounded w-1/4" />
              <div className="h-3 bg-[var(--color-mist)] rounded w-3/4" />
              <div className="h-3 bg-[var(--color-mist)] rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

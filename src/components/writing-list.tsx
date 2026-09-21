import { Link } from 'next-view-transitions';
import { HiMiniArrowUpRight } from 'react-icons/hi2';

import { ViewCount } from '@/components/blog/post-views';
import type { WritingEntry } from '@/lib/posts';

const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
});

function Row({ post, showViews }: { post: WritingEntry; showViews: boolean }) {
  const external = !post.slug;

  const content = (
    <>
      <div className="flex items-baseline gap-4">
        <div className="min-w-0 flex-1 text-base/7 text-[var(--fg)] transition-transform duration-200 ease-out group-hover/row:translate-x-1 sm:text-sm/6">
          {post.title}
          {external && (
            <HiMiniArrowUpRight
              aria-hidden="true"
              className="ml-1 inline size-5 shrink-0 fill-[var(--fg-faint)] align-text-bottom transition-transform duration-200 ease-out group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 sm:size-4"
            />
          )}
        </div>
        <div className="flex shrink-0 items-baseline gap-3 font-mono text-sm text-[var(--fg-faint)] tabular-nums">
          {showViews && post.slug && <ViewCount slug={post.slug} />}
          <time dateTime={post.datePublished.toISOString()}>
            {dayFormat.format(post.datePublished)}
          </time>
        </div>
      </div>
      {post.description && (
        <p className="mt-0.5 text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
          {post.description}
        </p>
      )}
    </>
  );

  const className = 'group/row block py-2.5';

  return external ? (
    <a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link href={post.href} className={className}>
      {content}
    </Link>
  );
}

/** Date-sorted posts as an index: the year marks the first row of each year,
    and hovering a row dims the others. */
export function WritingList({
  posts,
  showViews = false,
}: {
  posts: WritingEntry[];
  showViews?: boolean;
}) {
  return (
    <ul role="list" className="group/list">
      {posts.map((post, i) => {
        const year = post.datePublished.getFullYear();
        const firstOfYear =
          i === 0 || posts[i - 1].datePublished.getFullYear() !== year;

        return (
          <li
            key={post.href}
            className="grid grid-cols-[3rem_1fr] transition-opacity duration-200 group-hover/list:not-hover:opacity-50 sm:grid-cols-[3.5rem_1fr]"
          >
            <div
              className={`border-t py-2.5 font-mono text-sm/7 text-[var(--fg-faint)] tabular-nums sm:text-sm/6 ${
                firstOfYear
                  ? 'border-[var(--ds-gray-alpha-200)]'
                  : 'border-transparent'
              }`}
            >
              {firstOfYear && year}
            </div>
            <div className="min-w-0 border-t border-[var(--ds-gray-alpha-200)]">
              <Row post={post} showViews={showViews} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

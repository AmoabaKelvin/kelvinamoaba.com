import { Link } from 'next-view-transitions';

import { ViewCount } from '@/components/blog/post-views';
import { formatPostDate, type Post } from '@/lib/posts';

export function PostRow({
  post,
  showViews = false,
}: {
  post: Post;
  showViews?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
    >
      <span className="w-28 shrink-0 font-mono text-sm text-[var(--fg-faint)] tabular-nums">
        {formatPostDate(post.datePublished)}
      </span>
      <span className="min-w-0 flex-1 text-base/7 text-[var(--fg)] group-hover:underline group-hover:decoration-[var(--border-strong)] group-hover:underline-offset-4 sm:text-sm/6">
        {post.title}
      </span>
      {showViews && <ViewCount slug={post.slug} />}
    </Link>
  );
}

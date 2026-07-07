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
    <Link href={`/blog/${post.slug}`} className="entry-item group">
      <div className="flex items-baseline gap-4">
        <span className="ds-mono w-24 flex-shrink-0 text-xs tabular-nums text-[var(--fg-muted)]">
          {formatPostDate(post.datePublished)}
        </span>
        <span className="flex-1 text-[0.9375rem] text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">
          {post.title}
        </span>
        {showViews && <ViewCount slug={post.slug} />}
      </div>
    </Link>
  );
}

'use client';

import { Comments } from './comments';
import { ReactionsBar } from './reactions-bar';

export function PostEngagement({ slug }: { slug: string }) {
  return (
    <div className="mt-14">
      <div className="ds-divider mb-8" />
      <ReactionsBar slug={slug} />
      <div className="mt-12">
        <Comments slug={slug} />
      </div>
    </div>
  );
}

import { NextRequest, NextResponse, after } from 'next/server';
import { allPosts } from 'content-collections';
import { getSession } from '@/lib/auth-server';
import {
  countRecentComments,
  createComment,
  getComments,
  getCommentWithUser,
  getThreadRecipients,
} from '@/lib/data/blog-engagement';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function isKnownSlug(slug: string): boolean {
  return allPosts.some((p) => p.slug === slug);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendReplyNotifications(input: {
  slug: string;
  postTitle: string;
  parentId: string;
  replyBody: string;
  replierId: string;
  replierName: string;
}) {
  const thread = await getThreadRecipients(input.parentId);
  if (!thread) return;

  // Mentions only count at the start of the body or after whitespace,
  // mirroring CommentBody in src/components/blog/comments.tsx.
  const mentioned = new Set(
    Array.from(
      input.replyBody.matchAll(/(?:^|\s)@([A-Za-z0-9][A-Za-z0-9-]*)/g),
      (m) => m[1].toLowerCase()
    )
  );

  const recipientEmails = new Set<string>();
  for (const p of thread.participants) {
    if (p.userId === input.replierId) continue;
    const isRootAuthor = p.userId === thread.rootUserId && !thread.rootDeleted;
    const isMentioned =
      p.username !== null && mentioned.has(p.username.toLowerCase());
    if (isRootAuthor || isMentioned) {
      recipientEmails.add(p.email);
    }
  }
  if (recipientEmails.size === 0) return;

  const url = `https://kelvinamoaba.com/blog/${input.slug}#comments`;
  const subject = `New reply on "${input.postTitle}"`;
  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px 16px; color: #111;">
  <p style="margin: 0 0 16px; font-size: 15px;">${escapeHtml(input.replierName)} replied to your comment on &#39;${escapeHtml(input.postTitle)}&#39;</p>
  <p style="margin: 0 0 20px; padding: 12px 16px; border-left: 3px solid #ddd; font-size: 14px; line-height: 1.6; color: #444;">${escapeHtml(input.replyBody).replace(/\n/g, '<br>')}</p>
  <p style="margin: 0; font-size: 14px;"><a href="${url}" style="color: #0068d6;">View the conversation</a></p>
</div>`;

  // One email per recipient so addresses are never exposed to each other.
  const results = await Promise.allSettled(
    Array.from(recipientEmails, (to) => sendEmail({ to, subject, html }))
  );
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Failed to send reply notification:', result.reason);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');
    if (!slug || !isKnownSlug(slug)) {
      return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
    }

    const comments = await getComments(slug);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { slug, body, parentId } = await request.json();

    if (!slug || typeof slug !== 'string' || !isKnownSlug(slug)) {
      return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
    }

    const trimmed = typeof body === 'string' ? body.trim() : '';
    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }
    if (trimmed.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be 2000 characters or less' },
        { status: 400 }
      );
    }
    if (parentId !== undefined && parentId !== null && typeof parentId !== 'string') {
      return NextResponse.json({ error: 'Invalid parent' }, { status: 400 });
    }

    // Replies fan out notification emails, so cap how fast one user can post.
    const recentCount = await countRecentComments(
      session.user.id,
      new Date(Date.now() - 60_000)
    );
    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'You are commenting too fast. Try again in a minute.' },
        { status: 429 }
      );
    }

    let id: string;
    try {
      id = await createComment({
        slug,
        userId: session.user.id,
        body: trimmed,
        parentId: parentId ?? null,
      });
    } catch {
      return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 });
    }

    const comment = await getCommentWithUser(id);

    if (parentId) {
      const replierId = session.user.id;
      const replierName =
        (session.user as { username?: string | null }).username ??
        session.user.name;
      const postTitle = allPosts.find((p) => p.slug === slug)?.title ?? slug;
      after(async () => {
        try {
          await sendReplyNotifications({
            slug,
            postTitle,
            parentId,
            replyBody: trimmed,
            replierId,
            replierName,
          });
        } catch (error) {
          console.error('Failed to send reply notifications:', error);
        }
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}

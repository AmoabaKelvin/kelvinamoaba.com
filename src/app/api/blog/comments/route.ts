import { NextRequest, NextResponse } from 'next/server';
import { allPosts } from 'content-collections';
import { getSession } from '@/lib/auth-server';
import {
  createComment,
  getComments,
  getCommentWithUser,
} from '@/lib/data/blog-engagement';

export const dynamic = 'force-dynamic';

function isKnownSlug(slug: string): boolean {
  return allPosts.some((p) => p.slug === slug);
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
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}

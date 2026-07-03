import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import {
  deleteComment,
  editComment,
  getCommentWithUser,
} from '@/lib/data/blog-engagement';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const { body } = await request.json();
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

    const result = await editComment({
      id,
      requesterId: session.user.id,
      body: trimmed,
    });

    if (result === 'not_found') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (result === 'forbidden') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }
    const comment = await getCommentWithUser(id);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error editing comment:', error);
    return NextResponse.json(
      { error: 'Failed to edit comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteComment({
      id,
      requesterId: session.user.id,
      requesterUsername:
        (session.user as { username?: string | null }).username ?? null,
    });

    if (result === 'not_found') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (result === 'forbidden') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

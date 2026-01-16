import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import {
  createPost,
  checkUserHasPost,
  getPostWithUser,
} from '@/lib/data/guestbook';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { message, signature } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Check if user has already signed
    const hasPost = await checkUserHasPost(session.user.id);
    if (hasPost) {
      return NextResponse.json(
        { error: 'You have already signed the guestbook' },
        { status: 409 }
      );
    }

    // Create the post
    const postId = await createPost(session.user.id, trimmedMessage, signature);

    // Get the post with user data
    const postWithUser = await getPostWithUser(postId);

    return NextResponse.json(postWithUser, { status: 201 });
  } catch (error) {
    console.error('Error signing guestbook:', error);
    return NextResponse.json(
      { error: 'Failed to sign guestbook' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { checkUserHasPost } from '@/lib/data/guestbook';

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { eligible: false, reason: 'Not authenticated' },
        {
          headers: {
            'Cache-Control': 'private, max-age=30',
          },
        }
      );
    }

    let hasPost = false;
    try {
      hasPost = await checkUserHasPost(session.user.id);
    } catch (dbError) {
      console.error('Database error checking user post:', dbError);
      // If we can't check, allow signing (will fail at sign time if there's an issue)
      hasPost = false;
    }

    return NextResponse.json(
      {
        eligible: !hasPost,
        reason: hasPost ? 'Already signed' : null,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30',
        },
      }
    );
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { eligible: false, reason: 'Error checking eligibility' },
      { status: 500 }
    );
  }
}

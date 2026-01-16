import { NextRequest, NextResponse } from 'next/server';
import { getGuestbookPosts } from '@/lib/data/guestbook';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? parseInt(cursorParam, 10) : 0;

    if (isNaN(cursor) || cursor < 0) {
      return NextResponse.json(
        { error: 'Invalid cursor parameter' },
        { status: 400 }
      );
    }

    const data = await getGuestbookPosts(cursor);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching guestbook posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

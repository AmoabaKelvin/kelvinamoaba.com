import { NextRequest, NextResponse } from 'next/server';
import { allPosts } from 'content-collections';
import { getAllViewCounts, recordView } from '@/lib/data/blog-engagement';

export const dynamic = 'force-dynamic';

function isKnownSlug(slug: string): boolean {
  return allPosts.some((p) => p.slug === slug);
}

export async function GET() {
  try {
    const counts = await getAllViewCounts();
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string' || !isKnownSlug(slug)) {
      return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
    }

    // Local dev shares the production database; don't inflate real counts.
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ ok: true });
    }

    await recordView(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    );
  }
}

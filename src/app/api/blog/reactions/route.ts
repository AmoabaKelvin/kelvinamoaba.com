import { NextRequest, NextResponse } from 'next/server';
import { allPosts } from 'content-collections';
import {
  getReactions,
  REACTION_EMOJIS,
  toggleReaction,
  type ReactionEmoji,
} from '@/lib/data/blog-engagement';

export const dynamic = 'force-dynamic';

function isKnownSlug(slug: string): boolean {
  return allPosts.some((p) => p.slug === slug);
}

function isValidToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{10,40}$/.test(token);
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const slug = params.get('slug');
    const token = params.get('token');

    if (!slug || !isKnownSlug(slug)) {
      return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
    }

    const data = await getReactions(slug, isValidToken(token) ? token : null);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, emoji, token } = await request.json();

    if (!slug || typeof slug !== 'string' || !isKnownSlug(slug)) {
      return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
    }
    if (!REACTION_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Unknown emoji' }, { status: 400 });
    }
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const result = await toggleReaction({
      slug,
      emoji: emoji as ReactionEmoji,
      anonToken: token,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to save reaction' },
      { status: 500 }
    );
  }
}

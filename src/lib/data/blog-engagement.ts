import 'server-only';

import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { blogComment, blogReaction, blogView, user } from '../db/schema';

import {
  ADMIN_USERNAME,
  type CommentWithUser,
  type ReactionEmoji,
  type ReactionsResponse,
} from '../blog-engagement-shared';

export { ADMIN_USERNAME, REACTION_EMOJIS } from '../blog-engagement-shared';
export type { CommentWithUser, ReactionEmoji, ReactionsResponse };

export async function getComments(slug: string): Promise<CommentWithUser[]> {
  const rows = await db
    .select({
      id: blogComment.id,
      parentId: blogComment.parentId,
      body: blogComment.body,
      createdAt: blogComment.createdAt,
      editedAt: blogComment.editedAt,
      deletedAt: blogComment.deletedAt,
      userId: blogComment.userId,
      userName: user.name,
      userImage: user.image,
      userUsername: user.username,
    })
    .from(blogComment)
    .innerJoin(user, eq(blogComment.userId, user.id))
    .where(eq(blogComment.postSlug, slug))
    .orderBy(asc(blogComment.createdAt));

  return rows.map((row) => ({
    id: row.id,
    parentId: row.parentId,
    body: row.deletedAt ? '' : row.body,
    createdAt: row.createdAt,
    edited: row.editedAt !== null,
    deleted: row.deletedAt !== null,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage,
      username: row.userUsername,
    },
  }));
}

export async function createComment(input: {
  slug: string;
  userId: string;
  body: string;
  parentId?: string | null;
}): Promise<string> {
  if (input.parentId) {
    const parent = await db
      .select({ id: blogComment.id, parentId: blogComment.parentId })
      .from(blogComment)
      .where(
        and(
          eq(blogComment.id, input.parentId),
          eq(blogComment.postSlug, input.slug),
          isNull(blogComment.parentId) // replies attach to top-level only
        )
      )
      .limit(1);
    if (parent.length === 0) {
      throw new Error('Invalid parent comment');
    }
  }

  const id = nanoid();
  await db.insert(blogComment).values({
    id,
    postSlug: input.slug,
    userId: input.userId,
    parentId: input.parentId ?? null,
    body: input.body,
    createdAt: new Date(),
  });
  return id;
}

export async function getCommentWithUser(
  id: string
): Promise<CommentWithUser | null> {
  const rows = await db
    .select({
      id: blogComment.id,
      parentId: blogComment.parentId,
      body: blogComment.body,
      createdAt: blogComment.createdAt,
      editedAt: blogComment.editedAt,
      deletedAt: blogComment.deletedAt,
      userId: blogComment.userId,
      userName: user.name,
      userImage: user.image,
      userUsername: user.username,
    })
    .from(blogComment)
    .innerJoin(user, eq(blogComment.userId, user.id))
    .where(eq(blogComment.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    parentId: row.parentId,
    body: row.deletedAt ? '' : row.body,
    createdAt: row.createdAt,
    edited: row.editedAt !== null,
    deleted: row.deletedAt !== null,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage,
      username: row.userUsername,
    },
  };
}

export async function editComment(input: {
  id: string;
  requesterId: string;
  body: string;
}): Promise<'edited' | 'not_found' | 'forbidden'> {
  const rows = await db
    .select({ userId: blogComment.userId, deletedAt: blogComment.deletedAt })
    .from(blogComment)
    .where(eq(blogComment.id, input.id))
    .limit(1);

  if (rows.length === 0 || rows[0].deletedAt !== null) return 'not_found';
  // Only the author may edit; admin can delete but not rewrite others' words.
  if (rows[0].userId !== input.requesterId) return 'forbidden';

  await db
    .update(blogComment)
    .set({ body: input.body, editedAt: new Date() })
    .where(eq(blogComment.id, input.id));
  return 'edited';
}

export async function deleteComment(input: {
  id: string;
  requesterId: string;
  requesterUsername: string | null;
}): Promise<'deleted' | 'not_found' | 'forbidden'> {
  const rows = await db
    .select({ id: blogComment.id, userId: blogComment.userId })
    .from(blogComment)
    .where(eq(blogComment.id, input.id))
    .limit(1);

  if (rows.length === 0) return 'not_found';

  const isOwner = rows[0].userId === input.requesterId;
  const isAdmin = input.requesterUsername === ADMIN_USERNAME;
  if (!isOwner && !isAdmin) return 'forbidden';

  const replies = await db
    .select({ id: blogComment.id })
    .from(blogComment)
    .where(eq(blogComment.parentId, input.id))
    .limit(1);

  if (replies.length > 0) {
    // Keep the thread intact; the client renders a "[deleted]" placeholder.
    await db
      .update(blogComment)
      .set({ deletedAt: new Date() })
      .where(eq(blogComment.id, input.id));
  } else {
    await db.delete(blogComment).where(eq(blogComment.id, input.id));
  }
  return 'deleted';
}

export async function getReactions(
  slug: string,
  anonToken: string | null
): Promise<ReactionsResponse> {
  const rows = await db
    .select({
      emoji: blogReaction.emoji,
      count: sql<number>`count(*)`,
    })
    .from(blogReaction)
    .where(eq(blogReaction.postSlug, slug))
    .groupBy(blogReaction.emoji);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.emoji] = row.count;

  let reacted: string[] = [];
  if (anonToken) {
    const mine = await db
      .select({ emoji: blogReaction.emoji })
      .from(blogReaction)
      .where(
        and(
          eq(blogReaction.postSlug, slug),
          eq(blogReaction.anonToken, anonToken)
        )
      );
    reacted = mine.map((r) => r.emoji);
  }

  return { counts, reacted };
}

export async function toggleReaction(input: {
  slug: string;
  emoji: ReactionEmoji;
  anonToken: string;
}): Promise<{ reacted: boolean }> {
  const existing = await db
    .select({ id: blogReaction.id })
    .from(blogReaction)
    .where(
      and(
        eq(blogReaction.postSlug, input.slug),
        eq(blogReaction.emoji, input.emoji),
        eq(blogReaction.anonToken, input.anonToken)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(blogReaction).where(eq(blogReaction.id, existing[0].id));
    return { reacted: false };
  }

  await db.insert(blogReaction).values({
    id: nanoid(),
    postSlug: input.slug,
    emoji: input.emoji,
    anonToken: input.anonToken,
    createdAt: new Date(),
  });
  return { reacted: true };
}

export async function getAllViewCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ postSlug: blogView.postSlug, count: blogView.count })
    .from(blogView);

  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.postSlug] = row.count;
  return counts;
}

export async function recordView(slug: string): Promise<void> {
  await db
    .insert(blogView)
    .values({ postSlug: slug, count: 1 })
    .onConflictDoUpdate({
      target: blogView.postSlug,
      set: { count: sql`${blogView.count} + 1` },
    });
}

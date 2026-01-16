import 'server-only';

import { desc, eq, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { post, user } from '../db/schema';

const PAGE_SIZE = 30;

export type GuestbookPost = {
  id: string;
  message: string;
  signature: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
};

export async function getGuestbookPosts(cursor: number = 0) {
  const results = await db
    .select({
      id: post.id,
      message: post.message,
      signature: post.signature,
      createdAt: post.createdAt,
      userId: post.userId,
      userName: user.name,
      userImage: user.image,
      userUsername: user.username,
    })
    .from(post)
    .innerJoin(user, eq(post.userId, user.id))
    .orderBy(desc(post.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset(cursor * PAGE_SIZE);

  const hasMore = results.length > PAGE_SIZE;
  const posts = results.slice(0, PAGE_SIZE).map((row) => ({
    id: row.id,
    message: row.message,
    signature: row.signature,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage,
      username: row.userUsername,
    },
  }));

  return {
    posts,
    nextCursor: hasMore ? cursor + 1 : null,
    hasMore,
  };
}

export async function getPostWithUser(postId: string): Promise<GuestbookPost> {
  const result = await db
    .select({
      id: post.id,
      message: post.message,
      signature: post.signature,
      createdAt: post.createdAt,
      userId: post.userId,
      userName: user.name,
      userImage: user.image,
      userUsername: user.username,
    })
    .from(post)
    .innerJoin(user, eq(post.userId, user.id))
    .where(eq(post.id, postId))
    .limit(1);

  if (result.length === 0) {
    throw new Error('Post not found');
  }

  const row = result[0];
  return {
    id: row.id,
    message: row.message,
    signature: row.signature,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage,
      username: row.userUsername,
    },
  };
}

export async function createPost(
  userId: string,
  message: string,
  signature?: string
): Promise<string> {
  const id = nanoid();

  await db.insert(post).values({
    id,
    userId,
    message,
    signature: signature || null,
    createdAt: new Date(),
  });

  return id;
}

export async function checkUserHasPost(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.userId, userId))
    .limit(1);

  return result.length > 0;
}

export async function getGuestbookCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(post);
  return result[0]?.count ?? 0;
}

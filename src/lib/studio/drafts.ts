import 'server-only';

import { desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { blogDraft, type BlogDraft } from '../db/schema';

export type { BlogDraft };

export type DraftPatch = Partial<
  Pick<
    BlogDraft,
    | 'title'
    | 'slug'
    | 'kicker'
    | 'tags'
    | 'cover'
    | 'description'
    | 'seoTitle'
    | 'content'
  >
>;

export async function listDrafts(): Promise<BlogDraft[]> {
  return db.select().from(blogDraft).orderBy(desc(blogDraft.updatedAt));
}

export async function getDraft(id: string): Promise<BlogDraft | null> {
  const rows = await db
    .select()
    .from(blogDraft)
    .where(eq(blogDraft.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createDraft(): Promise<BlogDraft> {
  const now = new Date();
  const draft: BlogDraft = {
    id: nanoid(),
    title: '',
    slug: '',
    kicker: '',
    tags: '',
    cover: '',
    description: '',
    seoTitle: '',
    content: '',
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    publishedSha: null,
  };
  await db.insert(blogDraft).values(draft);
  return draft;
}

export async function updateDraft(
  id: string,
  patch: DraftPatch
): Promise<BlogDraft | null> {
  await db
    .update(blogDraft)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(blogDraft.id, id));
  return getDraft(id);
}

export async function deleteDraft(id: string): Promise<void> {
  await db.delete(blogDraft).where(eq(blogDraft.id, id));
}

export async function markPublished(id: string, sha: string): Promise<void> {
  await db
    .update(blogDraft)
    .set({ publishedAt: new Date(), publishedSha: sha, updatedAt: new Date() })
    .where(eq(blogDraft.id, id));
}

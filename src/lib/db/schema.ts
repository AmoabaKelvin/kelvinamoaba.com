import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';

// User table - managed by Better Auth
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  // Custom fields for GitHub
  githubId: text('githubId'),
  username: text('username'),
});

// Session table - managed by Better Auth
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});

// Account table - managed by Better Auth
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// Verification table - managed by Better Auth
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

// Guestbook post table
export const post = sqliteTable('post', {
  id: text('id').primaryKey(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  message: text('message').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  signature: text('signature'),
});

// Blog comment table - one level of threading via parentId
export const blogComment = sqliteTable(
  'blog_comment',
  {
    id: text('id').primaryKey(),
    postSlug: text('postSlug').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    parentId: text('parentId').references(
      (): AnySQLiteColumn => blogComment.id
    ),
    body: text('body').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    editedAt: integer('editedAt', { mode: 'timestamp' }),
    // Soft delete keeps replies attached to a "[deleted]" placeholder
    deletedAt: integer('deletedAt', { mode: 'timestamp' }),
  },
  (t) => [index('blog_comment_slug_idx').on(t.postSlug)]
);

// Blog reaction table - anonymous, deduped per browser token
export const blogReaction = sqliteTable(
  'blog_reaction',
  {
    id: text('id').primaryKey(),
    postSlug: text('postSlug').notNull(),
    emoji: text('emoji').notNull(),
    anonToken: text('anonToken').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  },
  (t) => [
    uniqueIndex('blog_reaction_dedup_idx').on(t.postSlug, t.emoji, t.anonToken),
    index('blog_reaction_slug_idx').on(t.postSlug),
  ]
);

// Studio draft table - posts in progress, authored from /studio
export const blogDraft = sqliteTable('blog_draft', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default(''),
  slug: text('slug').notNull().default(''),
  kicker: text('kicker').notNull().default(''),
  tags: text('tags').notNull().default(''),
  cover: text('cover').notNull().default(''),
  description: text('description').notNull().default(''),
  seoTitle: text('seoTitle').notNull().default(''),
  content: text('content').notNull().default(''),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('publishedAt', { mode: 'timestamp' }),
  publishedSha: text('publishedSha'),
});

// Type exports
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Post = typeof post.$inferSelect;
export type BlogComment = typeof blogComment.$inferSelect;
export type BlogReaction = typeof blogReaction.$inferSelect;
export type BlogDraft = typeof blogDraft.$inferSelect;

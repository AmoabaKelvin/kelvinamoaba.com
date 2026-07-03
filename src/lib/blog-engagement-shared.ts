// Shared between the server data layer and client components.

export const ADMIN_USERNAME = 'AmoabaKelvin';

export const REACTION_EMOJIS = ['👍', '❤️', '🔥', '💡', '🎉'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export type CommentWithUser = {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
};

export type ReactionsResponse = {
  counts: Record<string, number>;
  reacted: string[];
};

export const blogEngagementKeys = {
  comments: (slug: string) => ['blog', 'comments', slug] as const,
  reactions: (slug: string) => ['blog', 'reactions', slug] as const,
};

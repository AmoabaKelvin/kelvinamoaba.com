'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';

import {
  addComment,
  getComments,
  getReactions,
  getViews,
  recordView,
  removeComment,
  toggleReaction,
  updateComment,
} from '../api/blog-engagement';
import {
  blogEngagementKeys,
  type CommentWithUser,
  type ReactionEmoji,
  type ReactionsResponse,
} from '../blog-engagement-shared';

const TOKEN_KEY = 'blog-reaction-token';

// Stable per-browser token so anonymous reactions can toggle and dedupe.
export function useAnonToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      let stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        stored = nanoid();
        localStorage.setItem(TOKEN_KEY, stored);
      }
      setToken(stored);
    } catch {
      // localStorage unavailable (private mode); reactions stay read-only
      setToken(null);
    }
  }, []);

  return token;
}

export function useReactions(slug: string, token: string | null) {
  return useQuery({
    queryKey: blogEngagementKeys.reactions(slug),
    queryFn: () => getReactions(slug, token!),
    enabled: token !== null,
    staleTime: 30 * 1000,
  });
}

export function useToggleReaction(slug: string, token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emoji: ReactionEmoji) =>
      toggleReaction({ slug, emoji, token: token! }),
    onMutate: async (emoji) => {
      const key = blogEngagementKeys.reactions(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReactionsResponse>(key);

      queryClient.setQueryData<ReactionsResponse>(key, (old) => {
        const base = old ?? { counts: {}, reacted: [] };
        const has = base.reacted.includes(emoji);
        return {
          counts: {
            ...base.counts,
            [emoji]: Math.max(0, (base.counts[emoji] ?? 0) + (has ? -1 : 1)),
          },
          reacted: has
            ? base.reacted.filter((e) => e !== emoji)
            : [...base.reacted, emoji],
        };
      });

      return { previous };
    },
    onError: (_err, _emoji, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          blogEngagementKeys.reactions(slug),
          context.previous
        );
      }
    },
  });
}

export function useViews() {
  return useQuery({
    queryKey: blogEngagementKeys.views(),
    queryFn: getViews,
    staleTime: 60 * 1000,
  });
}

const viewedKey = (slug: string) => `blog-viewed:${slug}`;

// Fire-and-forget: one view per browser session per slug.
export function useRecordView(slug: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(viewedKey(slug))) return;
      // Set the guard before the request so StrictMode's double
      // effect run in development does not double-count.
      sessionStorage.setItem(viewedKey(slug), '1');
    } catch {
      return; // sessionStorage unavailable; skip counting
    }
    recordView(slug)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: blogEngagementKeys.views(),
        })
      )
      .catch(() => {});
  }, [slug, queryClient]);
}

export function useComments(slug: string) {
  return useQuery({
    queryKey: blogEngagementKeys.comments(slug),
    queryFn: () => getComments(slug),
  });
}

export type AddCommentInput = {
  body: string;
  parentId?: string | null;
  optimisticUser: CommentWithUser['user'];
};

export function useAddComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCommentInput) =>
      addComment({ slug, body: input.body, parentId: input.parentId }),
    onMutate: async (input) => {
      const key = blogEngagementKeys.comments(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CommentWithUser[]>(key);

      const optimisticId = `optimistic-${Date.now()}`;
      const optimistic: CommentWithUser = {
        id: optimisticId,
        parentId: input.parentId ?? null,
        body: input.body,
        createdAt: new Date(),
        edited: false,
        deleted: false,
        user: input.optimisticUser,
      };
      queryClient.setQueryData<CommentWithUser[]>(key, (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous, optimisticId };
    },
    onSuccess: (real, _input, context) => {
      queryClient.setQueryData<CommentWithUser[]>(
        blogEngagementKeys.comments(slug),
        (old) =>
          (old ?? []).map((c) => (c.id === context?.optimisticId ? real : c))
      );
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          blogEngagementKeys.comments(slug),
          context.previous
        );
      }
    },
  });
}

export function useEditComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; body: string }) => updateComment(input),
    onMutate: async (input) => {
      const key = blogEngagementKeys.comments(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CommentWithUser[]>(key);

      queryClient.setQueryData<CommentWithUser[]>(key, (old) =>
        (old ?? []).map((c) =>
          c.id === input.id ? { ...c, body: input.body, edited: true } : c
        )
      );

      return { previous };
    },
    onSuccess: (real) => {
      queryClient.setQueryData<CommentWithUser[]>(
        blogEngagementKeys.comments(slug),
        (old) => (old ?? []).map((c) => (c.id === real.id ? real : c))
      );
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          blogEngagementKeys.comments(slug),
          context.previous
        );
      }
    },
  });
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeComment(id),
    onMutate: async (id) => {
      const key = blogEngagementKeys.comments(slug);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CommentWithUser[]>(key);

      queryClient.setQueryData<CommentWithUser[]>(key, (old) => {
        if (!old) return old;
        const hasReplies = old.some((c) => c.parentId === id);
        return hasReplies
          ? old.map((c) =>
              c.id === id ? { ...c, deleted: true, body: '' } : c
            )
          : old.filter((c) => c.id !== id);
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          blogEngagementKeys.comments(slug),
          context.previous
        );
      }
    },
  });
}

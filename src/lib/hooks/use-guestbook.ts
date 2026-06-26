'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getPosts,
  sign,
  checkEligibility,
  type GuestbookPostsResponse,
  type SignGuestbookInput,
} from '../api/guestbook';
import type { GuestbookPost } from '../data/guestbook';
import { guestbookKeys } from '../guestbook-keys';

export { guestbookKeys };

export function useGuestbookPosts() {
  return useInfiniteQuery({
    queryKey: guestbookKeys.postsList(),
    queryFn: ({ pageParam = 0 }) => getPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    select: (data) => ({
      posts: data.pages.flatMap((page) => page.posts),
      pageParams: data.pageParams,
    }),
  });
}

export function useGuestbookEligibility(enabled: boolean = true) {
  return useQuery({
    queryKey: guestbookKeys.eligibility(),
    queryFn: checkEligibility,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
}

export type SignGuestbookWithUserInput = SignGuestbookInput & {
  optimisticUser: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
};

export function useSignGuestbook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignGuestbookWithUserInput) => {
      const { optimisticUser, ...signInput } = input;
      return sign(signInput);
    },
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestbookKeys.postsList() });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<{
        pages: GuestbookPostsResponse[];
        pageParams: number[];
      }>(guestbookKeys.postsList());

      // Create optimistic post with a temporary ID
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticPost: GuestbookPost = {
        id: optimisticId,
        message: newPost.message,
        signature: newPost.signature || null,
        createdAt: new Date(),
        user: newPost.optimisticUser,
      };

      // Optimistically add the new post
      queryClient.setQueryData<{
        pages: GuestbookPostsResponse[];
        pageParams: number[];
      }>(guestbookKeys.postsList(), (old) => {
        if (!old) {
          // If no existing data, create initial structure
          return {
            pages: [{ posts: [optimisticPost], nextCursor: null, hasMore: false }],
            pageParams: [0],
          };
        }

        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                posts: [optimisticPost, ...page.posts],
              };
            }
            return page;
          }),
        };
      });

      // Optimistically update eligibility
      queryClient.setQueryData(guestbookKeys.eligibility(), {
        eligible: false,
        reason: 'Already signed',
      });

      return { previousPosts, optimisticId };
    },
    onSuccess: (realPost, _variables, context) => {
      // Replace optimistic post with the real one from server
      queryClient.setQueryData<{
        pages: GuestbookPostsResponse[];
        pageParams: number[];
      }>(guestbookKeys.postsList(), (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                posts: page.posts.map((post) =>
                  post.id === context?.optimisticId ? realPost : post
                ),
              };
            }
            return page;
          }),
        };
      });
    },
    onError: (_error, _newPost, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(
          guestbookKeys.postsList(),
          context.previousPosts
        );
      }
      // Rollback eligibility
      queryClient.invalidateQueries({ queryKey: guestbookKeys.eligibility() });
    },
  });
}

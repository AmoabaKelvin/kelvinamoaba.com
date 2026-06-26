// Shared React Query keys for the guestbook — imported by both the server
// (prefetch in the page) and the client hooks, so the keys never drift.
export const guestbookKeys = {
  all: ['guestbook'] as const,
  postsList: () => [...guestbookKeys.all, 'posts'] as const,
  eligibility: () => [...guestbookKeys.all, 'eligibility'] as const,
};

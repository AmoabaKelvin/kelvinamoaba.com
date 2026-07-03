import type {
  CommentWithUser,
  ReactionEmoji,
  ReactionsResponse,
} from '../blog-engagement-shared';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/blog${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'An error occurred');
  }

  return response.json();
}

function reviveComment(c: CommentWithUser): CommentWithUser {
  return { ...c, createdAt: new Date(c.createdAt) };
}

export async function getComments(slug: string): Promise<CommentWithUser[]> {
  const data = await fetchApi<{ comments: CommentWithUser[] }>(
    `/comments?slug=${encodeURIComponent(slug)}`
  );
  return data.comments.map(reviveComment);
}

export async function addComment(input: {
  slug: string;
  body: string;
  parentId?: string | null;
}): Promise<CommentWithUser> {
  const data = await fetchApi<CommentWithUser>('/comments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return reviveComment(data);
}

export async function removeComment(id: string): Promise<void> {
  await fetchApi(`/comments/${id}`, { method: 'DELETE' });
}

export async function updateComment(input: {
  id: string;
  body: string;
}): Promise<CommentWithUser> {
  const data = await fetchApi<CommentWithUser>(`/comments/${input.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ body: input.body }),
  });
  return reviveComment(data);
}

export async function getReactions(
  slug: string,
  token: string
): Promise<ReactionsResponse> {
  return fetchApi<ReactionsResponse>(
    `/reactions?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`
  );
}

export async function toggleReaction(input: {
  slug: string;
  emoji: ReactionEmoji;
  token: string;
}): Promise<{ reacted: boolean }> {
  return fetchApi<{ reacted: boolean }>('/reactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

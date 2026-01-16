import type { GuestbookPost } from '../data/guestbook';

class GuestbookApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'GuestbookApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api/guestbook${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new GuestbookApiError(
      data.error || 'An error occurred',
      response.status
    );
  }

  return response.json();
}

export type GuestbookPostsResponse = {
  posts: GuestbookPost[];
  nextCursor: number | null;
  hasMore: boolean;
};

export async function getPosts(
  cursor: number = 0
): Promise<GuestbookPostsResponse> {
  const data = await fetchApi<GuestbookPostsResponse>(`?cursor=${cursor}`);

  // Convert createdAt strings to Date objects
  return {
    ...data,
    posts: data.posts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    })),
  };
}

export type SignGuestbookInput = {
  message: string;
  signature?: string;
};

export async function sign(input: SignGuestbookInput): Promise<GuestbookPost> {
  const data = await fetchApi<GuestbookPost>('/sign', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
}

export type EligibilityResponse = {
  eligible: boolean;
  reason: string | null;
};

export async function checkEligibility(): Promise<EligibilityResponse> {
  return fetchApi<EligibilityResponse>('/check-eligibility');
}

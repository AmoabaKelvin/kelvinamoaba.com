// Client-side API for the studio. Dates arrive as ISO strings.
export type StudioDraft = {
  id: string;
  title: string;
  slug: string;
  kicker: string;
  tags: string;
  cover: string;
  description: string;
  seoTitle: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  publishedSha: string | null;
};

export type StudioDraftPatch = Partial<
  Omit<StudioDraft, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'publishedSha'>
>;

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/studio${endpoint}`, {
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

export async function listDrafts(): Promise<StudioDraft[]> {
  const data = await fetchApi<{ drafts: StudioDraft[] }>('/drafts');
  return data.drafts;
}

export async function createDraft(): Promise<StudioDraft> {
  return fetchApi<StudioDraft>('/drafts', { method: 'POST' });
}

export async function getDraft(id: string): Promise<StudioDraft> {
  return fetchApi<StudioDraft>(`/drafts/${id}`);
}

export async function patchDraft(
  id: string,
  patch: StudioDraftPatch
): Promise<StudioDraft> {
  return fetchApi<StudioDraft>(`/drafts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteDraft(id: string): Promise<void> {
  await fetchApi(`/drafts/${id}`, { method: 'DELETE' });
}

export async function compilePreview(
  content: string
): Promise<{ code: string }> {
  return fetchApi<{ code: string }>('/preview', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function publishDraft(
  id: string
): Promise<{ commitUrl: string; path: string }> {
  return fetchApi<{ commitUrl: string; path: string }>('/publish', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

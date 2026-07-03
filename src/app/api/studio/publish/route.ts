import { NextRequest, NextResponse } from 'next/server';
import { allPosts } from 'content-collections';

import { isAdminRequest } from '@/lib/studio/admin';
import { getDraft, markPublished, type BlogDraft } from '@/lib/studio/drafts';

const REPO_OWNER = 'AmoabaKelvin';
const REPO_NAME = 'kelvinamoaba.com';
const BRANCH = 'main';

// JSON.stringify produces valid YAML double-quoted scalars / flow sequences.
function serializeMDX(draft: BlogDraft): string {
  const lines: string[] = ['---'];
  lines.push(`kicker: ${JSON.stringify(draft.kicker || 'ESSAY')}`);
  lines.push(`title: ${JSON.stringify(draft.title)}`);
  if (draft.seoTitle) lines.push(`seoTitle: ${JSON.stringify(draft.seoTitle)}`);
  if (draft.description)
    lines.push(`description: ${JSON.stringify(draft.description)}`);
  const datePublished = (draft.publishedAt ?? new Date()).toISOString();
  lines.push(`datePublished: ${JSON.stringify(datePublished)}`);
  if (draft.cover) lines.push(`cover: ${JSON.stringify(draft.cover)}`);
  const tags = draft.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tags.length > 0) lines.push(`tags: ${JSON.stringify(tags)}`);
  lines.push('---', '', draft.content.trim(), '');
  return lines.join('\n');
}

async function github(path: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (!process.env.GITHUB_PAT) {
    return NextResponse.json(
      {
        error:
          'GITHUB_PAT is not configured. Create a fine-grained token with contents:write on the repo and add it to the environment.',
      },
      { status: 501 }
    );
  }

  const { id } = await request.json();
  const draft = typeof id === 'string' ? await getDraft(id) : null;
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (!draft.title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(draft.slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase letters, numbers, and hyphens' },
      { status: 400 }
    );
  }
  if (!draft.content.trim()) {
    return NextResponse.json({ error: 'Post is empty' }, { status: 400 });
  }

  // A never-published draft must not overwrite an existing post.
  const slugTaken = allPosts.some((p) => p.slug === draft.slug);
  if (!draft.publishedAt && slugTaken) {
    return NextResponse.json(
      { error: `A post with slug "${draft.slug}" already exists` },
      { status: 409 }
    );
  }

  const path = `content/posts/${draft.slug}.mdx`;
  const contentsUrl = `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  try {
    // Updating an existing file requires its current blob sha.
    let existingSha: string | undefined;
    const existing = await github(`${contentsUrl}?ref=${BRANCH}`);
    if (existing.ok) {
      existingSha = (await existing.json()).sha;
    } else if (existing.status !== 404) {
      throw new Error(`GitHub lookup failed (${existing.status})`);
    }

    const message = existingSha
      ? `content: update "${draft.title}"\n\nPublished from the studio.`
      : `content: publish "${draft.title}"\n\nPublished from the studio.`;

    const put = await github(contentsUrl, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(serializeMDX(draft), 'utf-8').toString('base64'),
        branch: BRANCH,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!put.ok) {
      const detail = await put.json().catch(() => ({}));
      throw new Error(
        `GitHub commit failed (${put.status}): ${detail.message ?? 'unknown'}`
      );
    }

    const result = await put.json();
    await markPublished(draft.id, result.commit.sha);

    return NextResponse.json({
      commitUrl: result.commit.html_url,
      path,
    });
  } catch (error) {
    console.error('Error publishing draft:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to publish';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

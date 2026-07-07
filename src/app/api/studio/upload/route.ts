import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

import { isAdminRequest } from '@/lib/studio/admin';

const REPO_OWNER = 'AmoabaKelvin';
const REPO_NAME = 'kelvinamoaba.com';
const BRANCH = 'main';

// Extension derives from the validated MIME type, never the user filename.
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_SIZE = 5 * 1024 * 1024;

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

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: 'Only PNG, JPEG, WebP, and GIF images are allowed' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Image must be 5MB or smaller' },
      { status: 400 }
    );
  }

  const base =
    file.name
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'image';
  const filename = `${base}-${nanoid(8)}.${ext}`;
  const publicPath = `/images/posts/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (process.env.NODE_ENV === 'development') {
    const dir = path.join(process.cwd(), 'public', 'images', 'posts');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ path: publicPath });
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

  try {
    const put = await github(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/images/posts/${filename}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message: `content: add image ${filename}\n\nUploaded from the studio.`,
          content: bytes.toString('base64'),
          branch: BRANCH,
        }),
      }
    );

    if (!put.ok) {
      const detail = await put.json().catch(() => ({}));
      throw new Error(
        `GitHub commit failed (${put.status}): ${detail.message ?? 'unknown'}`
      );
    }

    return NextResponse.json({ path: publicPath });
  } catch (error) {
    console.error('Error uploading image:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

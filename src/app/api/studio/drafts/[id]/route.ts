import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/studio/admin';
import {
  deleteDraft,
  getDraft,
  updateDraft,
  type DraftPatch,
} from '@/lib/studio/drafts';

export const dynamic = 'force-dynamic';

const PATCHABLE = [
  'title',
  'slug',
  'kicker',
  'tags',
  'cover',
  'description',
  'seoTitle',
  'content',
] as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  return NextResponse.json(draft);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();

  const patch: DraftPatch = {};
  for (const key of PATCHABLE) {
    if (typeof body[key] === 'string') patch[key] = body[key];
  }

  const draft = await updateDraft(id, patch);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  return NextResponse.json(draft);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { id } = await params;
  await deleteDraft(id);
  return NextResponse.json({ ok: true });
}

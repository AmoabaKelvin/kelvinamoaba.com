import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/studio/admin';
import { createDraft, listDrafts } from '@/lib/studio/drafts';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const drafts = await listDrafts();
  return NextResponse.json({ drafts });
}

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const draft = await createDraft();
  return NextResponse.json(draft, { status: 201 });
}

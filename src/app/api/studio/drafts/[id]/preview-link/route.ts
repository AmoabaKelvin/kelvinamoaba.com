import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/studio/admin';
import { getDraft } from '@/lib/studio/drafts';
import { signDraftId } from '@/lib/studio/preview-link';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }
  const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  return NextResponse.json({
    url: `${base}/studio/preview/${id}?key=${signDraftId(id)}`,
  });
}

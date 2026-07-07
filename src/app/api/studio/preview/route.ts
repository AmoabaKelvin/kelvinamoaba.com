import { NextRequest, NextResponse } from 'next/server';

import { compileDraftMdx } from '@/lib/studio/compile-preview';
import { isAdminRequest } from '@/lib/studio/admin';

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { content } = await request.json();
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const result = await compileDraftMdx(content);
  if (result.error !== undefined) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ code: result.code });
}

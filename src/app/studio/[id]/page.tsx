import { isAdminRequest } from '@/lib/studio/admin';

import { StudioGate } from '../studio-gate';
import { Editor } from './editor';

export const dynamic = 'force-dynamic';

export default async function StudioEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminRequest())) {
    return <StudioGate />;
  }

  const { id } = await params;
  return <Editor id={id} />;
}

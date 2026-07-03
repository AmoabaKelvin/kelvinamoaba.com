import 'server-only';

import { getSession } from '../auth-server';
import { ADMIN_USERNAME } from '../blog-engagement-shared';

// The studio is single-user. In `next dev` the gate is bypassed so the
// editor can be worked on without a GitHub session; production always
// requires the admin's GitHub identity.
export async function isAdminRequest(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true;
  const session = await getSession();
  const username = (session?.user as { username?: string | null } | undefined)
    ?.username;
  return username === ADMIN_USERNAME;
}

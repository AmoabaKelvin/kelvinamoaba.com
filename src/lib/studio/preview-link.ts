import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error('BETTER_AUTH_SECRET is not set');
  return s;
}

export function signDraftId(id: string): string {
  return createHmac('sha256', secret()).update(id).digest('hex');
}

export function verifyDraftKey(id: string, key: string): boolean {
  // Compare the hex strings as utf8 buffers: Buffer.from(key, 'hex') drops
  // invalid chars silently, and timingSafeEqual throws on unequal lengths.
  const expected = Buffer.from(signDraftId(id));
  const provided = Buffer.from(key);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

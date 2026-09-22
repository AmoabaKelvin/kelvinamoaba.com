import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';

export default defineCloudflareConfig({
  // Prerendered pages (blog posts, research) are served from KV instead of
  // being re-rendered per request. Rendering MDX at runtime needs
  // `new Function`, which Workers forbid, so without this every post 500s.
  incrementalCache: kvIncrementalCache,
  enableCacheInterception: true,
});

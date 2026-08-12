import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Shared "03 · concentric · cream" Open Graph template.
// Fonts are loaded lazily: importing this module must never touch the
// filesystem, because Next imports opengraph-image modules (which import
// this) while resolving metadata for dynamically rendered pages, inside
// serverless functions where the font files may not exist.
// On Cloudflare Workers there is no on-disk font file at all, so we fall
// back to fetching the copies in public/og-fonts through the ASSETS binding.
let fontsCache:
  | { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' }[]
  | null = null;

async function loadFont(w: 400 | 500 | 600): Promise<Buffer> {
  try {
    return readFileSync(join(process.cwd(), `src/app/fonts/Geist-${w}.ttf`));
  } catch {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    const assets = (env as { ASSETS: { fetch: typeof fetch } }).ASSETS;
    const res = await assets.fetch(
      `https://assets.local/og-fonts/Geist-${w}.ttf`
    );
    if (!res.ok) throw new Error(`font fetch failed: Geist-${w} (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
}

async function getFonts() {
  fontsCache ??= await Promise.all(
    ([400, 500, 600] as const).map(async (w) => ({
      name: 'Geist',
      data: await loadFont(w),
      weight: w,
      style: 'normal' as const,
    }))
  );
  return fontsCache;
}

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const CX = 1200 * 1.12;
const CY = 630 * 1.18;
const RINGS = Array.from({ length: 22 }, (_, i) => 64 * (i + 3));

type OGProps = {
  section?: string;
  kicker: string;
  title: string;
  footerLeft: string;
  footerRight?: string;
};

export async function renderOG({
  section,
  kicker,
  title,
  footerLeft,
  footerRight,
}: OGProps) {
  const titleSize = title.length > 46 ? 60 : title.length > 30 ? 70 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          backgroundColor: '#f3f1ec',
          fontFamily: 'Geist',
          overflow: 'hidden',
        }}
      >
        {/* concentric rings, anchored just past the bottom-right corner */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {RINGS.map((r) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: CX - r,
                top: CY - r,
                width: r * 2,
                height: r * 2,
                borderRadius: 9999,
                border: '1px solid rgba(0,0,0,0.09)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '70px 80px',
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 23,
              color: '#8d8d84',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: '#191917',
                marginRight: 14,
              }}
            />
            <div style={{ display: 'flex' }}>kelvinamoaba.com</div>
            {section ? (
              <>
                <div
                  style={{ color: '#bcbcb4', margin: '0 11px', display: 'flex' }}
                >
                  /
                </div>
                <div style={{ display: 'flex' }}>{section}</div>
              </>
            ) : null}
          </div>

          {/* kicker + title */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 20,
                letterSpacing: '0.22em',
                color: '#8d8d84',
                textTransform: 'uppercase',
                marginBottom: 22,
                display: 'flex',
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                color: '#191917',
                maxWidth: '88%',
                display: 'flex',
              }}
            >
              {title}
            </div>
          </div>

          {/* footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 23,
            }}
          >
            <div style={{ color: '#2b2b28', fontWeight: 500, display: 'flex' }}>
              {footerLeft}
            </div>
            {footerRight ? (
              <div style={{ color: '#8d8d84', display: 'flex' }}>
                {footerRight}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await getFonts() }
  );
}

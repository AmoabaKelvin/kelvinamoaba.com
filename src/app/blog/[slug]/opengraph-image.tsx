import { ImageResponse } from 'next/og';
import { getDocumentBySlug } from 'outstatic/server';

export const alt = 'Blog Post';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getDocumentBySlug('posts', slug, ['title']);
  const title = post?.title || 'Blog Post';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            backgroundColor: '#111111',
          }}
        />

        {/* Header with logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              border: '2px solid #000000',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#000000',
            }}
          >
            KA
          </div>
          <span
            style={{
              fontSize: '18px',
              color: '#333333',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            kelvinamoaba.com
          </span>
        </div>

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#000000',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '40px',
            borderTop: '1px solid #e5e5e5',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#000000',
              }}
            >
              Kelvin Amoaba
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#444444',
              }}
            >
              Software Engineer
            </span>
          </div>

          <div
            style={{
              padding: '12px 24px',
              border: '2px solid #000000',
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Blog
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

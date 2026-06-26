import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Guestbook | Kelvin Amoaba';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const fontData = readFileSync(
    join(process.cwd(), 'src/app/fonts/BerkeleyMono.ttf')
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          padding: '40px',
          fontFamily: 'Berkeley Mono',
        }}
      >
        {/* Lighter continuous lines that extend past the corners */}
        {/* Top horizontal line */}
        <div style={{ position: 'absolute', top: 50, left: 20, width: 1160, height: 1, backgroundColor: '#ebebeb' }} />
        {/* Bottom horizontal line */}
        <div style={{ position: 'absolute', bottom: 50, left: 20, width: 1160, height: 1, backgroundColor: '#ebebeb' }} />
        {/* Left vertical line */}
        <div style={{ position: 'absolute', top: 20, left: 50, width: 1, height: 590, backgroundColor: '#ebebeb' }} />
        {/* Right vertical line */}
        <div style={{ position: 'absolute', top: 20, right: 50, width: 1, height: 590, backgroundColor: '#ebebeb' }} />

        {/* Bold L-shaped corner marks */}
        {/* Top Left */}
        <div style={{ position: 'absolute', top: 50, left: 50, width: 60, height: 2, backgroundColor: '#d4d4d4' }} />
        <div style={{ position: 'absolute', top: 50, left: 50, width: 2, height: 60, backgroundColor: '#d4d4d4' }} />
        {/* Top Right */}
        <div style={{ position: 'absolute', top: 50, right: 50, width: 60, height: 2, backgroundColor: '#d4d4d4' }} />
        <div style={{ position: 'absolute', top: 50, right: 50, width: 2, height: 60, backgroundColor: '#d4d4d4' }} />
        {/* Bottom Left */}
        <div style={{ position: 'absolute', bottom: 50, left: 50, width: 60, height: 2, backgroundColor: '#d4d4d4' }} />
        <div style={{ position: 'absolute', bottom: 50, left: 50, width: 2, height: 60, backgroundColor: '#d4d4d4' }} />
        {/* Bottom Right */}
        <div style={{ position: 'absolute', bottom: 50, right: 50, width: 60, height: 2, backgroundColor: '#d4d4d4' }} />
        <div style={{ position: 'absolute', bottom: 50, right: 50, width: 2, height: 60, backgroundColor: '#d4d4d4' }} />

        {/* Content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            flex: 1,
            padding: '60px 100px 90px 100px',
          }}
        >
          {/* Category label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 20,
              fontWeight: 400,
              marginBottom: 20,
            }}
          >
            <span style={{ color: '#006bff' }}>GUESTBOOK</span>
            <span style={{ color: '#8f8f8f', margin: '0 12px' }}>•</span>
            <span style={{ color: '#8f8f8f' }}>KELVIN AMOABA</span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              color: '#171717',
              lineHeight: 1.1,
              marginLeft: -4,
            }}
          >
            Sign my guestbook
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Berkeley Mono',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}

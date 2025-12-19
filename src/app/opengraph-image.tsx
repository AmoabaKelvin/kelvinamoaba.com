import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Kelvin Amoaba';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
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
            backgroundColor: '#000000',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              border: '3px solid #000000',
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              marginBottom: '16px',
              color: '#000000',
            }}
          >
            KA
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Kelvin Amoaba
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#333333',
              letterSpacing: '0.05em',
            }}
          >
            Software Engineer
          </div>

          {/* Skills */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            {['Systems', 'Cloud', 'Go', 'AI/ML'].map((skill) => (
              <div
                key={skill}
                style={{
                  padding: '8px 20px',
                  border: '2px solid #000000',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#000000',
                  letterSpacing: '0.05em',
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            fontWeight: 500,
            color: '#555555',
            letterSpacing: '0.1em',
          }}
        >
          kelvinamoaba.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

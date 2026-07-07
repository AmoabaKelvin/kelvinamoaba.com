import { NextResponse } from 'next/server';

const RAW_BASE =
  'https://raw.githubusercontent.com/AmoabaKelvin/kelvinamoaba.com/main/public/images/posts';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

// Studio uploads are committed to the repo, but the running deployment only
// gains the static file on the next deploy. Static files in public/ take
// precedence over this route, so it serves exactly that gap: images that are
// in git but not yet in the deployed bundle.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const match = /^[A-Za-z0-9_-]+\.(png|jpg|webp|gif)$/.exec(filename);
  if (!match) {
    return new NextResponse('Not found', { status: 404 });
  }

  const upstream = await fetch(`${RAW_BASE}/${filename}`);
  if (!upstream.ok) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Filenames carry a nanoid suffix, so contents never change for a name.
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': MIME[match[1]],
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

const { withContentCollections } = require('@content-collections/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Satori fonts are read from disk at render time; make sure they are
  // traced into every serverless function that can render an OG image.
  outputFileTracingIncludes: {
    '/**': ['./src/app/fonts/*.ttf'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

module.exports = withContentCollections(nextConfig);

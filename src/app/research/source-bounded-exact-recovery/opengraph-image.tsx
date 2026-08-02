import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt =
  'Source-Bounded Exact Recovery for Docker Log Followers | Kelvin Amoaba';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    section: 'research',
    kicker: 'Research · Preprint',
    title: 'Source-Bounded Exact Recovery for Docker Log Followers',
    footerLeft: 'Kelvin Amoaba',
    footerRight: 'August 2026',
  });
}

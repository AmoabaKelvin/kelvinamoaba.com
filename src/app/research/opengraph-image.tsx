import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt = 'Research | Kelvin Amoaba';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    section: 'research',
    kicker: 'Research',
    title: 'Papers & first-party research',
    footerLeft: 'Kelvin Amoaba — software engineer',
    footerRight: 'systems · observability · ml',
  });
}

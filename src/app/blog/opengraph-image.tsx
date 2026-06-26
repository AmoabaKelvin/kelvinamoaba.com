import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt = 'Writing | Kelvin Amoaba';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    section: 'writing',
    kicker: 'Writing',
    title: 'Essays & deep dives',
    footerLeft: 'Kelvin Amoaba — software engineer',
    footerRight: 'systems · go · algorithms',
  });
}

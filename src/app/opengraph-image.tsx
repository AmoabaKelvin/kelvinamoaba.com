import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt = 'Kelvin Amoaba';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    kicker: 'Software Engineer',
    title: 'Kelvin Amoaba',
    footerLeft: 'Building scalable systems & low-level tools',
    footerRight: 'Accra, Ghana',
  });
}

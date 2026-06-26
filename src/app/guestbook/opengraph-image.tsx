import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt = 'Guestbook | Kelvin Amoaba';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    section: 'guestbook',
    kicker: 'Guestbook',
    title: 'Sign my guestbook',
    footerLeft: 'Kelvin Amoaba — software engineer',
    footerRight: 'Leave your mark',
  });
}

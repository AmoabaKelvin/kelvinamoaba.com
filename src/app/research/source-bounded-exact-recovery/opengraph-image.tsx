import { ogContentType, ogSize, renderOG } from '@/lib/og';

export const alt =
  "Source-Bounded Exact Recovery over Docker's Logs API | Kelvin Amoaba";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOG({
    section: 'research',
    kicker: 'Research · Preprint',
    title: "Source-Bounded Exact Recovery over Docker's Logs API",
    footerLeft: 'Kelvin Amoaba',
    footerRight: 'August 2026',
  });
}

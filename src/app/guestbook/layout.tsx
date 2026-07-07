import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guestbook',
  description: 'Let me know you passed by. Sign my guestbook and leave your mark.',
  alternates: { canonical: '/guestbook', types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: {
    title: 'Guestbook | Kelvin Amoaba',
    url: '/guestbook',
    description: 'Let me know you passed by. Sign my guestbook and leave your mark.',
  },
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

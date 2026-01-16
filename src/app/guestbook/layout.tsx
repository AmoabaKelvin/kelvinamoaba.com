import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guestbook | Kelvin Amoaba',
  description: 'Let me know you passed by. Sign my guestbook and leave your mark.',
  openGraph: {
    title: 'Guestbook | Kelvin Amoaba',
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

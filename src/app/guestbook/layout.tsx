import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guestbook | Kelvin Amoaba',
  description: 'Sign my guestbook and leave a message.',
  openGraph: {
    title: 'Guestbook | Kelvin Amoaba',
    description: 'Sign my guestbook and leave a message.',
  },
};

export default function GuestbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { Link } from 'next-view-transitions';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Kelvin Amoaba',
  description:
    'Building products that solve real-world problems and exploring the depths of low-level systems',
  metadataBase: new URL('https://kelvinamoaba.com'),
};

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${displayFont.variable} ${bodyFont.variable}`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <body>
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-10 header-glass">
            <div className="mx-auto max-w-4xl flex justify-between items-center">
              <Link href="/" className="logo-mark">
                <span>KA</span>
              </Link>
              <nav className="flex items-center gap-8">
                <a
                  href="https://drive.google.com/file/d/1CiE_n7PExjCYG1OO8W04CMZwwOK728LZ/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-widest uppercase text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
                >
                  Resume
                </a>
              </nav>
            </div>
          </header>

          <main className="h-full min-h-screen pt-20">
            {children}
            <Analytics />
          </main>

          {/* Footer */}
          <footer className="py-12 px-6 md:px-10">
            <div className="mx-auto max-w-4xl">
              <div className="section-divider mb-8"></div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="footer-text" suppressHydrationWarning>
                  {new Date().getFullYear()} Kelvin Amoaba
                </p>
                <p className="footer-text">Accra, Ghana</p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ViewTransitions>
  );
}

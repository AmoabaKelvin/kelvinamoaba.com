import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { Link } from 'next-view-transitions';

import { ThemeToggle } from '@/components/theme-toggle';
import { QueryProvider } from '@/lib/providers/query-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://kelvinamoaba.com'),
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
  title: {
    default: 'Kelvin Amoaba — Software Engineer',
    template: '%s | Kelvin Amoaba',
  },
  description:
    'Kelvin Amoaba is a software engineer building products that solve real-world problems and exploring the depths of low-level systems. Writing on Go, operating systems, and distributed systems.',
  openGraph: {
    type: 'website',
    siteName: 'Kelvin Amoaba',
    locale: 'en_US',
    url: 'https://kelvinamoaba.com',
    title: 'Kelvin Amoaba — Software Engineer',
    description:
      'Software engineer building products that solve real-world problems and exploring the depths of low-level systems.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@kelamoaba',
  },
};

// Sets the theme class before first paint to prevent a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body>
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-10 header-glass">
            <div className="mx-auto max-w-4xl flex justify-between items-center">
              <Link href="/" className="logo-mark" aria-label="Home">
                <span>KA</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/guestbook" className="nav-link">
                  Guestbook
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="h-full min-h-screen pt-16">
            <QueryProvider>{children}</QueryProvider>
            <Analytics />
          </main>

          {/* Footer */}
          <footer className="py-12 px-6 md:px-10">
            <div className="mx-auto max-w-4xl">
              <div className="ds-divider mb-8"></div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="footer-text" suppressHydrationWarning>
                  © {new Date().getFullYear()} Kelvin Amoaba
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

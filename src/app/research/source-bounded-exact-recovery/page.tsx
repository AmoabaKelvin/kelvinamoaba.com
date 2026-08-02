import fs from 'node:fs';
import path from 'node:path';

import { Metadata } from 'next';

import { TableOfContents } from '@/components/table-of-contents';
import type { TOCHeading } from '@/lib/extract-headings';

const title = 'Source-Bounded Exact Recovery for Docker Log Followers';
const description =
  'Defines source-bounded exactness for Docker log collection. A fixed LogDeck revision was exact in 60/60 seeded trials, unmodified Grafana Alloy 1.18.0 in 20/60 — lifecycle reacquisition determines exact recovery.';

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: 'Kelvin Amoaba', url: 'https://kelvinamoaba.com' }],
  alternates: { canonical: '/research/source-bounded-exact-recovery' },
  openGraph: {
    type: 'article',
    title,
    description,
    url: '/research/source-bounded-exact-recovery',
    authors: ['Kelvin Amoaba'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ScholarlyArticle',
  headline: title,
  description,
  author: {
    '@type': 'Person',
    name: 'Kelvin Amoaba',
    url: 'https://kelvinamoaba.com',
  },
  datePublished: '2026-08-01',
  url: 'https://kelvinamoaba.com/research/source-bounded-exact-recovery',
};

function readHtml(file: string): string {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      'src/app/research/source-bounded-exact-recovery',
      file
    ),
    'utf8'
  );
}

function extractHeadings(html: string): TOCHeading[] {
  const headings: TOCHeading[] = [];
  const pattern = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let match;
  while ((match = pattern.exec(html))) {
    headings.push({
      level: Number(match[1]) as 2 | 3,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '').trim(),
    });
  }
  return headings;
}

export default function Paper() {
  const abstract = readHtml('abstract.html');
  const body = readHtml('paper.html');
  const html = `<h2 id="abstract">Abstract</h2>\n${abstract}\n${body}`;
  const headings = extractHeadings(html);

  return (
    <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-24 md:pt-28">
      <TableOfContents headings={headings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
        {title}
      </h1>
      <p className="mt-3 font-mono text-sm text-[var(--fg-muted)]">
        Kelvin Amoaba · August 2026 · Preprint
      </p>
      <p className="mt-4 text-base/7 sm:text-sm/6">
        <a
          href="/research/source-bounded-exact-recovery.pdf"
          className="text-[var(--fg-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
        >
          Download PDF
        </a>
      </p>
      <article
        className="prose mt-10 leading-7"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

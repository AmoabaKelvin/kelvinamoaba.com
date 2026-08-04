import { Metadata } from 'next';
import { Link } from 'next-view-transitions';

import { papers } from '@/papers';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Papers and first-party research on systems, observability, and machine learning — readable in the browser or as PDF.',
  alternates: { canonical: '/research' },
  openGraph: {
    title: 'Research | Kelvin Amoaba',
    url: '/research',
    description:
      'Papers and first-party research on systems, observability, and machine learning.',
  },
};

const linkClass =
  'underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]';

export default function ResearchIndex() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <section>
        <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
          Research
        </h1>
        <p className="mt-6 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)]">
          Papers I have written or co-authored. First-party work can be read
          right here as HTML or downloaded as PDF.
        </p>
      </section>

      <section className="mt-16 md:mt-20">
        <ul role="list" className="space-y-14">
          {papers.map((paper) => (
            <li key={paper.title}>
              <h2 className="font-medium text-[var(--fg)]">
                {paper.slug ? (
                  <Link href={paper.link} className={linkClass}>
                    {paper.title}
                  </Link>
                ) : (
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {paper.title}
                  </a>
                )}
              </h2>
              <p className="mt-1.5 font-mono text-sm text-[var(--fg-faint)]">
                {paper.authors.join(', ')}
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--fg-faint)]">
                {paper.venue} {paper.year}
              </p>
              <p className="mt-3 max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
                {paper.abstract}
              </p>
              <p className="mt-3 flex gap-4 text-base/7 sm:text-sm/6">
                {paper.slug && (
                  <Link
                    href={paper.link}
                    className={`text-[var(--fg-muted)] ${linkClass}`}
                  >
                    Read
                  </Link>
                )}
                {paper.pdf && (
                  <a
                    href={paper.pdf}
                    className={`text-[var(--fg-muted)] ${linkClass}`}
                  >
                    PDF
                  </a>
                )}
                {paper.arxivId && (
                  <a
                    href={`https://arxiv.org/abs/${paper.arxivId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[var(--fg-muted)] ${linkClass}`}
                  >
                    arXiv:{paper.arxivId}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

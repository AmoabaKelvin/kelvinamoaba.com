import { Metadata } from 'next';
import { Link } from 'next-view-transitions';

import { ContributionGraph } from '@/components/contribution-graph';
import { PostRow } from '@/components/post-row';
import { getSortedPosts } from '@/lib/posts';
import { papers } from '@/papers';
import { projects } from '@/projects';
import { videos } from '@/videos';

const skills = [
  'System Design',
  'Cloud Infrastructure',
  'Distributed Systems',
  'Go',
  'Compilers',
];

const socials = [
  { href: 'https://github.com/AmoabaKelvin', label: 'GitHub' },
  { href: 'https://twitter.com/kelamoaba', label: 'Twitter' },
  { href: 'https://linkedin.com/in/kelvin-amoaba', label: 'LinkedIn' },
  { href: 'mailto:kel.amoaba@gmail.com', label: 'Email' },
];

export const metadata: Metadata = {
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kelvin Amoaba',
  url: 'https://kelvinamoaba.com',
  jobTitle: 'Software Engineer',
  email: 'mailto:kel.amoaba@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Accra',
    addressCountry: 'GH',
  },
  knowsAbout: skills,
  sameAs: socials
    .map((s) => s.href)
    .filter((href) => href.startsWith('https://')),
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Kelvin Amoaba',
  url: 'https://kelvinamoaba.com',
  author: { '@type': 'Person', name: 'Kelvin Amoaba' },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-xs tracking-wide text-[var(--fg-faint)] uppercase">
      {children}
    </h2>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
    >
      {children}
    </a>
  );
}

export default function Home() {
  const posts = getSortedPosts().slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, websiteJsonLd]),
        }}
      />
      {/* Intro */}
      <section>
        <h1 className="text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
          Kelvin Amoaba
        </h1>
        <p className="mt-6 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)]">
          Software engineer building scalable systems and exploring the depths
          of low-level architecture. Currently at{' '}
          <ExternalLink href="https://vela.partners">
            Vela Partners
          </ExternalLink>
          .
        </p>
        <p className="mt-4 font-mono text-base/7 text-[var(--fg-faint)] sm:text-sm/6">
          {skills.join(' · ')}
        </p>
        <ul role="list" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
          {socials.map(({ href, label }) => (
            <li key={label} className="text-base/7 sm:text-sm/6">
              <ExternalLink href={href}>{label}</ExternalLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Research */}
      <section className="mt-20 md:mt-24">
        <SectionHeading>Research</SectionHeading>
        <ul role="list" className="mt-8 space-y-10">
          {papers.map((paper) => (
            <li key={paper.arxivId}>
              <h3 className="font-medium text-[var(--fg)]">
                <a
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
                >
                  {paper.title}
                </a>
              </h3>
              <p className="mt-1.5 font-mono text-sm text-[var(--fg-faint)]">
                {paper.venue} {paper.year}
              </p>
              <p className="mt-3 max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
                {paper.abstract}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Teaching */}
      <section className="mt-20 md:mt-24">
        <SectionHeading>Teaching</SectionHeading>
        <ul role="list" className="mt-8 space-y-10">
          {videos.map((video) => (
            <li key={video.title}>
              <h3 className="font-medium text-[var(--fg)]">
                <a
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
                >
                  {video.title}
                </a>
              </h3>
              <p className="mt-3 max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
                {video.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Writing */}
      <section className="mt-20 md:mt-24">
        <SectionHeading>Writing</SectionHeading>
        <ul role="list" className="mt-8 space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostRow post={post} />
            </li>
          ))}
        </ul>
        <p className="mt-8 text-base/7 sm:text-sm/6">
          <Link
            href="/blog"
            className="text-[var(--fg-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
          >
            All writing
          </Link>
        </p>
      </section>

      {/* Projects */}
      <section className="mt-20 md:mt-24">
        <SectionHeading>Projects</SectionHeading>
        <ul role="list" className="mt-8 space-y-10">
          {projects.map((project) => (
            <li key={project.name}>
              <h3 className="font-medium text-[var(--fg)]">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              <p className="mt-2 max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
                {project.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ContributionGraph />
    </div>
  );
}

import { Metadata } from 'next';
import { Link } from 'next-view-transitions';
import {
  FaCalendarDays,
  FaEnvelope,
  FaGithub,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';

import { ContributionGraph } from '@/components/contribution-graph';
import { Disclosure } from '@/components/disclosure';
import { WritingList } from '@/components/writing-list';
import { getWriting } from '@/lib/posts';
import { papers } from '@/papers';
import { projects } from '@/projects';

// Not rendered; feeds the Person schema's knowsAbout.
const skills = [
  'System Design',
  'Cloud Infrastructure',
  'Distributed Systems',
  'Go',
  'Compilers',
];

const socials = [
  { href: 'https://github.com/AmoabaKelvin', label: 'GitHub', icon: FaGithub },
  { href: 'https://twitter.com/kelamoaba', label: 'Twitter', icon: FaXTwitter },
  {
    href: 'https://linkedin.com/in/kelvin-amoaba',
    label: 'LinkedIn',
    icon: FaLinkedinIn,
  },
  {
    href: 'https://www.youtube.com/@TechDecompiled',
    label: 'YouTube',
    icon: FaYoutube,
  },
  { href: 'mailto:kel.amoaba@gmail.com', label: 'Email', icon: FaEnvelope },
  {
    href: 'https://cal.com/amoabakelvin',
    label: 'Book a call',
    icon: FaCalendarDays,
  },
];

const VISIBLE_PROJECTS = 3;

const linkClass =
  'underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--fg)]';

// ponytail: first sentence is the always-visible tagline, the rest opens on
// click. Add an explicit `tagline` field if a description ever starts badly.
function splitDescription(description: string): [string, string] {
  const match = description.trim().match(/^(.+?[.!?])\s+(.+)$/s);
  return match ? [match[1], match[2]] : [description.trim(), ''];
}

function ProjectItem({ project }: { project: (typeof projects)[number] }) {
  const [tagline, rest] = splitDescription(project.description);
  const textClass =
    'max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6';

  return (
    <li>
      <h3 className="font-medium text-[var(--fg)]">
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {project.name}
          </a>
        ) : (
          project.name
        )}
      </h3>
      <div className="mt-1.5">
        {rest ? (
          <Disclosure summary={tagline} className={textClass}>
            <p className={`mt-2 ${textClass}`}>{rest}</p>
          </Disclosure>
        ) : (
          <p className={textClass}>{tagline}</p>
        )}
      </div>
    </li>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: '/', types: { 'application/rss+xml': '/rss.xml' } },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kelvin Amoaba',
  url: 'https://kelvinamoaba.com',
  jobTitle: 'Backend and Infrastructure Engineer',
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
      className={linkClass}
    >
      {children}
    </a>
  );
}

export default function Home() {
  const posts = getWriting().slice(0, 5);
  const moreProjects = projects.length - VISIBLE_PROJECTS;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, websiteJsonLd]),
        }}
      />
      {/* Intro */}
      <section>
        <h1 className="rise text-2xl font-medium tracking-tight text-balance text-[var(--fg)]">
          Kelvin Amoaba
        </h1>
        <p className="rise mt-6 max-w-[56ch] text-base/7 text-pretty text-[var(--fg-secondary)] [--i:1]">
          Backend and infrastructure engineer building scalable systems and
          exploring the depths of low-level architecture. Currently at{' '}
          <ExternalLink href="https://vela.partners">
            Vela Partners
          </ExternalLink>
          .
        </p>
        <ul role="list" className="rise mt-6 flex flex-wrap gap-5 [--i:2]">
          {socials.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="social-icon relative block"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Research */}
      <section className="rise mt-14 [--i:4] md:mt-16">
        <SectionHeading>Research</SectionHeading>
        <ul role="list" className="mt-6 space-y-5">
          {papers.slice(0, 2).map((paper) => (
            <li key={paper.title}>
              <h3 className="font-medium text-[var(--fg)]">
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
              </h3>
              <div className="mt-1.5">
                <Disclosure
                  summary={`${paper.venue} ${paper.year} · Abstract`}
                  className="font-mono text-sm text-[var(--fg-faint)]"
                >
                  <p className="mt-2 max-w-[64ch] text-base/7 text-pretty text-[var(--fg-muted)] sm:text-sm/6">
                    {paper.abstract}
                  </p>
                </Disclosure>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-base/7 sm:text-sm/6">
          <Link
            href="/research"
            className={`text-[var(--fg-muted)] ${linkClass}`}
          >
            All research
          </Link>
        </p>
      </section>

      {/* Writing */}
      <section className="rise mt-14 [--i:5] md:mt-16">
        <SectionHeading>Writing</SectionHeading>
        <div className="mt-4">
          <WritingList posts={posts} />
        </div>
        <p className="mt-4 text-base/7 sm:text-sm/6">
          <Link
            href="/blog"
            className={`text-[var(--fg-muted)] ${linkClass}`}
          >
            All writing
          </Link>
        </p>
      </section>

      {/* Projects */}
      <section className="rise mt-14 [--i:6] md:mt-16">
        <SectionHeading>Projects</SectionHeading>
        <ul role="list" className="mt-6 space-y-5">
          {projects.slice(0, VISIBLE_PROJECTS).map((project) => (
            <ProjectItem key={project.name} project={project} />
          ))}
        </ul>
        {moreProjects > 0 && (
          <details className="disclosure group/more mt-6 open:mt-5">
            <summary
              className={`w-fit cursor-pointer list-none text-base/7 text-[var(--fg-muted)] group-open/more:hidden sm:text-sm/6 [&::-webkit-details-marker]:hidden ${linkClass}`}
            >
              Show {moreProjects} more projects
            </summary>
            <ul role="list" className="space-y-5">
              {projects.slice(VISIBLE_PROJECTS).map((project) => (
                <ProjectItem key={project.name} project={project} />
              ))}
            </ul>
          </details>
        )}
      </section>

      <ContributionGraph />
    </div>
  );
}

import { Metadata } from 'next';
import { Link } from 'next-view-transitions';
import { FaDev, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaHashnode, FaXTwitter } from 'react-icons/fa6';
import { IoMailOpen } from 'react-icons/io5';
import { HiArrowRight, HiArrowUpRight } from 'react-icons/hi2';

import { PostRow } from '@/components/post-row';
import { cn } from '@/lib/utils';
import { getSortedPosts } from '@/lib/posts';
import { projects } from '@/projects';
import { papers } from '@/papers';
import { videos } from '@/videos';

const skills = [
  'System Design',
  'Cloud Infrastructure',
  'Distributed Systems',
  'Go',
  'Compilers',
];

const socials = [
  { href: 'https://github.com/AmoabaKelvin', label: 'GitHub', Icon: FaGithub },
  { href: 'https://twitter.com/kelamoaba', label: 'Twitter', Icon: FaXTwitter },
  {
    href: 'https://linkedin.com/in/kelvin-amoaba',
    label: 'LinkedIn',
    Icon: FaLinkedin,
  },
  {
    href: 'https://hashnode.com/@AmoabaKelvin',
    label: 'Hashnode',
    Icon: FaHashnode,
  },
  { href: 'https://dev.to/amoabakelvin', label: 'Dev.to', Icon: FaDev },
  { href: 'mailto:kel.amoaba@gmail.com', label: 'Email', Icon: IoMailOpen },
];

export const metadata: Metadata = {
  alternates: { canonical: '/' },
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="ds-label">{children}</span>
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export default async function Home() {
  const posts = getSortedPosts().slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd, websiteJsonLd]),
        }}
      />
      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20">
        <h1 className="ds-heading-hero animate-fade-up stagger-1 mb-6">
          Kelvin Amoaba
        </h1>

        <p className="ds-copy animate-fade-up stagger-2 mb-8 max-w-xl text-lg">
          Software engineer building scalable systems and exploring the depths
          of low-level architecture. Currently at{' '}
          <a
            href="https://vela.partners"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-line font-medium"
          >
            Vela Partners
          </a>
          .
        </p>

        <div className="animate-fade-up stagger-3 mb-10 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="ds-badge">
              {skill}
            </span>
          ))}
        </div>

        <div className="animate-fade-up stagger-4 flex items-center gap-5">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="social-icon"
              aria-label={label}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </section>

      {/* Research */}
      <section className="py-12 md:py-16">
        <div className="animate-fade-up stagger-5">
          <SectionLabel>Research</SectionLabel>
        </div>

        <div className="space-y-4">
          {papers.map((paper, index) => (
            <a
              key={paper.arxivId}
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'ds-card p-6 animate-fade-up',
                `stagger-${Math.min(index + 6, 10)}`
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="ds-heading-3 mb-2 text-[var(--fg)]">
                    {paper.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-[0.9375rem] leading-relaxed text-[var(--fg-secondary)]">
                    {paper.abstract}
                  </p>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {paper.tags.map((tag) => (
                      <span key={tag} className="ds-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="ds-mono text-xs text-[var(--fg-muted)]">
                    {paper.venue} {paper.year}
                  </p>
                </div>
                <HiArrowUpRight
                  className="flex-shrink-0 mt-1 text-[var(--fg-faint)]"
                  size={16}
                />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Teaching */}
      <section className="py-12 md:py-16">
        <div className="animate-fade-up stagger-5">
          <SectionLabel>Teaching</SectionLabel>
        </div>

        <div className="space-y-4">
          {videos.map((video, index) => (
            <a
              key={video.title}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'ds-card p-6 animate-fade-up',
                `stagger-${Math.min(index + 6, 10)}`
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="ds-heading-3 mb-2 text-[var(--fg)]">
                    {video.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-[var(--fg-secondary)]">
                    {video.description}
                  </p>
                </div>
                <HiArrowUpRight
                  className="flex-shrink-0 mt-1 text-[var(--fg-faint)]"
                  size={16}
                />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Writing */}
      <section className="py-12 md:py-16">
        <div className="animate-fade-up stagger-5">
          <SectionLabel>Writing</SectionLabel>
        </div>

        <div className="animate-fade-up stagger-6 space-y-0.5">
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>

        <div className="animate-fade-up stagger-7 mt-6">
          <Link
            href="/blog"
            className="ds-mono inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            All writing
            <HiArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Projects */}
      <section className="py-12 md:py-16">
        <div className="animate-fade-up stagger-5">
          <SectionLabel>Projects</SectionLabel>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => {
            const inner = (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.9375rem] font-medium text-[var(--fg)]">
                    {project.name}
                  </span>
                  {project.link && (
                    <HiArrowUpRight
                      className="text-[var(--fg-faint)] transition-colors group-hover:text-[var(--accent)]"
                      size={14}
                    />
                  )}
                </div>
                <p className="text-[0.875rem] leading-relaxed text-[var(--fg-secondary)]">
                  {project.description}
                </p>
              </>
            );

            return (
              <div
                key={project.name}
                className={cn(
                  'ds-card group p-5 animate-fade-up',
                  project.link && 'ds-card-interactive',
                  `stagger-${Math.min(index + 6, 10)}`
                )}
              >
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="h-full">{inner}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import { Link } from 'next-view-transitions';
import { getDocuments } from 'outstatic/server';
import { FaDev, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaHashnode, FaXTwitter } from 'react-icons/fa6';
import { IoMailOpen } from 'react-icons/io5';
import { HiArrowUpRight } from 'react-icons/hi2';

import { cn } from '@/lib/utils';
import { projects } from '@/projects';
import { papers } from '@/papers';

export default async function Home() {
  const posts = getDocuments('posts', ['title', 'datePublished', 'slug']).sort(
    (a, b) => {
      const dateA = new Date(a.datePublished as string);
      const dateB = new Date(b.datePublished as string);
      return dateB.getTime() - dateA.getTime();
    }
  );

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10">
      {/* Hero Section */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="animate-fade-up stagger-1">
          <h1
            className="text-5xl md:text-7xl font-medium tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Kelvin Amoaba
          </h1>
        </div>

        <div className="animate-fade-up stagger-2">
          <p className="text-lg md:text-xl text-[var(--color-stone)] font-light mb-8 max-w-xl leading-relaxed">
            Software engineer building scalable systems and exploring the depths
            of low-level architecture. Currently at{' '}
            <a
              href="https://vela.partners"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-ink)] hover-line"
            >
              Vela Partners
            </a>
            .
          </p>
        </div>

        <div className="animate-fade-up stagger-3 mb-10">
          <div className="flex flex-wrap gap-3 text-xs tracking-wide text-[var(--color-stone)]">
            {[
              'System Design',
              'Cloud Infrastructure',
              'Distributed Systems',
              'Go',
              'Compilers',
            ].map((skill, i) => (
              <span
                key={skill}
                className="px-3 py-1.5 border border-[var(--color-mist)] hover:border-[var(--color-stone)] transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-fade-up stagger-4">
          <div className="flex gap-5 items-center">
            <a
              href="https://github.com/AmoabaKelvin"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="GitHub"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://twitter.com/kelamoaba"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Twitter"
            >
              <FaXTwitter size={18} />
            </a>
            <a
              href="https://linkedin.com/in/kelvin-amoaba"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>
            <a
              href="https://hashnode.com/@AmoabaKelvin"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Hashnode"
            >
              <FaHashnode size={18} />
            </a>
            <a
              href="https://dev.to/amoabakelvin"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Dev.to"
            >
              <FaDev size={18} />
            </a>
            <a
              href="mailto:kel.amoaba@gmail.com"
              className="social-icon"
              aria-label="Email"
            >
              <IoMailOpen size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Papers Section */}
      <section className="py-16 md:py-20">
        <div className="animate-fade-up stagger-5 mb-10 pl-6">
          <span className="section-heading">Research</span>
        </div>

        <div className="space-y-6">
          {papers.map((paper, index) => (
            <a
              key={paper.arxivId}
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'paper-card block animate-fade-up',
                `stagger-${Math.min(index + 6, 10)}`
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3
                    className="text-xl md:text-[1.375rem] font-medium mb-2 leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {paper.title}
                  </h3>
                  <p className="text-[0.9375rem] text-[var(--color-stone)] mb-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {paper.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-stone)]">
                    {paper.authors.join(', ')} · {paper.venue} {paper.year}
                  </p>
                </div>
                <HiArrowUpRight
                  className="text-[var(--color-stone)] flex-shrink-0 mt-1"
                  size={16}
                />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Writings Section */}
      <section className="py-16 md:py-20">
        <div className="animate-fade-up stagger-5 mb-10 pl-6">
          <span className="section-heading">Writings</span>
        </div>

        <div className="space-y-1">
          {posts.map((post, index) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className={cn(
                'entry-item block group animate-fade-up',
                `stagger-${Math.min(index + 6, 10)}`
              )}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[0.8125rem] text-[var(--color-stone)] tabular-nums flex-shrink-0 w-24">
                  {new Date(post.datePublished as string).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )}
                </span>
                <span className="text-[0.9375rem] text-[var(--color-ink)] group-hover:text-[var(--color-stone)] transition-colors">
                  {post.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 md:py-20">
        <div className="animate-fade-up stagger-5 mb-10 pl-6">
          <span className="section-heading">Projects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <div
              key={project.name}
              className={cn(
                'group animate-fade-up p-5 border border-[var(--color-mist)] hover:border-[var(--color-ink)] transition-all duration-300',
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.9375rem] font-medium text-[var(--color-ink)]">
                      {project.name}
                    </span>
                    <HiArrowUpRight
                      className="text-[var(--color-stone)] group-hover:text-[var(--color-ink)] transition-colors"
                      size={14}
                    />
                  </div>
                  <p className="text-[0.875rem] text-[var(--color-stone)] leading-relaxed">
                    {project.description}
                  </p>
                </a>
              ) : (
                <div className="h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.9375rem] font-medium text-[var(--color-stone)]">
                      {project.name}
                    </span>
                  </div>
                  <p className="text-[0.875rem] text-[var(--color-stone)] leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

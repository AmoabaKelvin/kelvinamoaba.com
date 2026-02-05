'use client';

import { useEffect, useState } from 'react';

import { TOCHeading } from '@/lib/extract-headings';

interface TableOfContentsProps {
  headings: TOCHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        {
          rootMargin: '-80px 0px -80% 0px',
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length < 3) {
    return null;
  }

  return (
    <nav
      className="hidden xl:block fixed top-32 w-48"
      style={{ left: 'max(16px, calc(50% - 384px - 256px))' }}
    >
      <ul className="space-y-0">
        {headings.map(({ id, text, level }, index) => {
          const isActive = activeId === id;
          const isLast = index === headings.length - 1;

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                className={`
                  block py-3 text-sm transition-colors duration-200
                  ${level === 3 ? 'pl-4' : level === 4 ? 'pl-8' : ''}
                  ${!isLast ? 'border-b border-gray-200' : ''}
                  ${isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

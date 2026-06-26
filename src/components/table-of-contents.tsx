'use client';

import { useEffect, useMemo, useState } from 'react';

import { TOCHeading } from '@/lib/extract-headings';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  headings: TOCHeading[];
}

type Section = {
  root: TOCHeading;
  children: TOCHeading[];
};

const wght = (weight: number) => ({ fontVariationSettings: `'wght' ${weight}` });

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  // Group headings into sections keyed off the shallowest level present, so a
  // post made only of H3s stays flat while H2 → H3 nests correctly.
  const { sections, minLevel } = useMemo(() => {
    const min = headings.reduce((m, h) => Math.min(m, h.level), 6);
    const out: Section[] = [];
    for (const h of headings) {
      if (h.level === min || out.length === 0) {
        out.push({ root: h, children: [] });
      } else {
        out[out.length - 1].children.push(h);
      }
    }
    return { sections: out, minLevel: min };
  }, [headings]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(id);
          });
        },
        { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [headings]);

  // The section we're currently reading: the one whose root or child is active.
  const activeSectionIndex = useMemo(
    () =>
      sections.findIndex(
        (s) =>
          s.root.id === activeId || s.children.some((c) => c.id === activeId)
      ),
    [sections, activeId]
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (headings.length < 3) return null;

  // Weight + color animate (color cross-fades, the variable-font `wght` axis
  // grows in) so the active highlight slides between items instead of snapping.
  const itemBase =
    'block py-1.5 leading-snug transition-[color,font-variation-settings] duration-300 ease-out';

  return (
    <nav
      className="hidden xl:block fixed top-32 w-56"
      style={{ right: 'max(1.5rem, calc(50% - 656px))' }}
    >
      <ul className="text-[0.9375rem]">
        {sections.map((section, i) => {
          const rootActive = activeId === section.root.id;
          const sectionActive = activeSectionIndex === i;

          return (
            <li key={section.root.id}>
              <a
                href={`#${section.root.id}`}
                onClick={(e) => handleClick(e, section.root.id)}
                style={wght(rootActive ? 600 : sectionActive ? 520 : 400)}
                className={cn(
                  itemBase,
                  rootActive
                    ? 'text-[var(--fg)]'
                    : sectionActive
                      ? 'text-[var(--fg-secondary)]'
                      : 'text-[var(--ds-gray-500)] hover:text-[var(--fg-secondary)]'
                )}
              >
                {section.root.text}
              </a>

              {section.children.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: sectionActive ? '1fr' : '0fr',
                    transition: 'grid-template-rows 300ms ease',
                  }}
                >
                  <ul
                    style={{ minHeight: 0, overflow: 'hidden' }}
                    className={cn(
                      'transition-opacity duration-300',
                      sectionActive ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    {section.children.map((child) => {
                      const childActive = activeId === child.id;
                      const depth = child.level - minLevel;

                      return (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            onClick={(e) => handleClick(e, child.id)}
                            style={wght(childActive ? 560 : 400)}
                            className={cn(
                              itemBase,
                              depth >= 2 ? 'pl-8' : 'pl-4',
                              childActive
                                ? 'text-[var(--fg)]'
                                : 'text-[var(--ds-gray-500)] hover:text-[var(--fg-secondary)]'
                            )}
                          >
                            {child.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { HiMiniChevronDown } from 'react-icons/hi2';

import { cn } from '@/lib/utils';

// Native <details>: the summary line stays visible, the rest opens on click.
export function Disclosure({
  summary,
  className,
  children,
}: {
  summary: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="disclosure group/item">
      <summary
        className={cn(
          'cursor-pointer list-none hover:text-[var(--fg)] [&::-webkit-details-marker]:hidden',
          className
        )}
      >
        {summary}
        <HiMiniChevronDown
          aria-hidden="true"
          className="ml-1 inline size-5 shrink-0 fill-current align-text-bottom transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-open/item:rotate-180 sm:size-4"
        />
      </summary>
      {children}
    </details>
  );
}

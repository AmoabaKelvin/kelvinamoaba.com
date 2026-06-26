'use client';

import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] ${className ?? ''}`}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }}
    >
      <HiArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
};

export default BackButton;

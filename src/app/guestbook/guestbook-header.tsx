'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useGuestbookEligibility } from '@/lib/hooks/use-guestbook';
import { SignInButton } from './sign-in-button';
import { SignOutButton } from './sign-out-button';
import { SignDialog } from './sign-dialog';

export function GuestbookHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session, isPending: isSessionLoading } = useSession();
  const {
    data: eligibility,
    isLoading: isEligibilityLoading,
    isError: isEligibilityError,
    refetch: refetchEligibility,
  } = useGuestbookEligibility();

  const isLoading = isSessionLoading || isEligibilityLoading;
  const isAuthenticated = !!session?.user;
  const canSign = eligibility?.eligible ?? false;

  return (
    <div>
      <div className="animate-fade-up stagger-1">
        <h1
          className="text-5xl md:text-7xl font-medium tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Guestbook
        </h1>
      </div>

      <div className="animate-fade-up stagger-2">
        <p className="text-lg md:text-xl text-[var(--color-stone)] font-light mb-8 max-w-xl leading-relaxed">
          Leave your mark. Sign the guestbook and let me know you stopped by.
        </p>
      </div>

      <div className="animate-fade-up stagger-3">
        {isLoading ? (
          <div className="h-12 w-48 bg-[var(--color-mist)] animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-4">
            {isEligibilityError ? (
              <div className="flex items-center gap-3">
                <p className="text-[0.875rem] text-red-600">
                  Error checking eligibility
                </p>
                <button
                  onClick={() => refetchEligibility()}
                  className="text-[0.8125rem] text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors underline"
                >
                  Retry
                </button>
              </div>
            ) : canSign ? (
              <SignDialog onOpenChange={setIsDialogOpen} />
            ) : (
              <p className="text-[0.875rem] text-[var(--color-stone)] italic">
                {eligibility?.reason === 'Already signed'
                  ? "You've already left your mark"
                  : eligibility?.reason || "You've already left your mark"}
              </p>
            )}
            {!isDialogOpen && <SignOutButton />}
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </div>
  );
}

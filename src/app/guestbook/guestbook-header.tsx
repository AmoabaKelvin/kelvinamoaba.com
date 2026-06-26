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

  // Only check eligibility after we confirm the user is authenticated
  const isAuthenticated = !isSessionLoading && !!session?.user;
  const {
    data: eligibility,
    isLoading: isEligibilityLoading,
    isError: isEligibilityError,
    refetch: refetchEligibility,
  } = useGuestbookEligibility(isAuthenticated);

  const isLoading = isSessionLoading || (isAuthenticated && isEligibilityLoading);
  const canSign = eligibility?.eligible ?? false;

  return (
    <div>
      <h1 className="ds-heading-hero animate-fade-up stagger-1 mb-6">
        Guestbook
      </h1>

      <p className="ds-copy animate-fade-up stagger-2 mb-8 max-w-xl text-lg">
        Leave your mark. Sign the guestbook and let me know you stopped by.
      </p>

      <div className="animate-fade-up stagger-3">
        {isLoading ? (
          <div className="h-10 w-48 animate-pulse rounded-[var(--ds-radius)] bg-[var(--ds-gray-100)]" />
        ) : isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-4">
            {isEligibilityError ? (
              <div className="flex items-center gap-3">
                <p className="text-[0.875rem] text-[var(--ds-red-600)]">
                  Error checking eligibility
                </p>
                <button
                  onClick={() => refetchEligibility()}
                  className="text-[0.8125rem] text-[var(--fg-muted)] underline transition-colors hover:text-[var(--fg)]"
                >
                  Retry
                </button>
              </div>
            ) : canSign ? (
              <SignDialog onOpenChange={setIsDialogOpen} />
            ) : (
              <p className="text-[0.875rem] text-[var(--fg-muted)]">
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

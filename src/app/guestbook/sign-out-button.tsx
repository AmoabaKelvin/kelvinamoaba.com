'use client';

import { signOut } from '@/lib/auth-client';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-[0.8125rem] text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors hover-line"
    >
      Sign out
    </button>
  );
}

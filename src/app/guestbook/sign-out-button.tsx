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
      className="text-[0.8125rem] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] hover-line"
    >
      Sign out
    </button>
  );
}

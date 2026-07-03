'use client';

import { FaGithub } from 'react-icons/fa';
import { signIn, useSession } from '@/lib/auth-client';

export function StudioGate() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 pt-32 md:px-10">
      <span className="ds-label">Studio</span>
      {session?.user ? (
        <p className="ds-copy">This area is reserved for the site owner.</p>
      ) : (
        <>
          <p className="ds-copy">Sign in to access the studio.</p>
          <button
            onClick={() =>
              signIn.social({ provider: 'github', callbackURL: '/studio' })
            }
            className="ds-button ds-button-primary"
          >
            <FaGithub className="h-4 w-4" />
            Sign in with GitHub
          </button>
        </>
      )}
    </div>
  );
}

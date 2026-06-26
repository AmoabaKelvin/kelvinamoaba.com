'use client';

import { signIn } from '@/lib/auth-client';
import { FaGithub } from 'react-icons/fa';

export function SignInButton() {
  const handleSignIn = async () => {
    await signIn.social({
      provider: 'github',
      callbackURL: '/guestbook',
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className="ds-button ds-button-primary"
    >
      <FaGithub className="h-4 w-4" />
      Sign in with GitHub
    </button>
  );
}

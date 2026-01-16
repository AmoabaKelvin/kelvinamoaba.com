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
      className="group flex items-center gap-3 px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-[0.8125rem] tracking-wide uppercase transition-all duration-300 hover:bg-[var(--color-stone)]"
    >
      <FaGithub className="w-4 h-4 transition-transform group-hover:scale-110" />
      Sign in with GitHub
    </button>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSignGuestbook } from '@/lib/hooks/use-guestbook';
import { useSession } from '@/lib/auth-client';
import { SignaturePad } from '@/components/signature-pad';

interface SignDialogProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function SignDialog({ onOpenChange }: SignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const { mutate: signGuestbook, isPending } = useSignGuestbook();

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessage('');
    setSignature(null);
    setError(null);
    onOpenChange?.(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError('Please enter a message');
      return;
    }

    if (trimmedMessage.length > 500) {
      setError('Message must be 500 characters or less');
      return;
    }

    const user = session?.user;
    if (!user) {
      setError('You must be signed in');
      return;
    }

    signGuestbook(
      {
        message: trimmedMessage,
        signature: signature || undefined,
        optimisticUser: {
          id: user.id,
          name: user.name,
          image: user.image || null,
          username: (user as { username?: string }).username || null,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (error) => {
          setError(error.message || 'Failed to sign guestbook');
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="group relative px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-[0.8125rem] tracking-wide uppercase transition-all duration-300 hover:bg-[var(--color-stone)]"
      >
        Sign the Guestbook
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-ink)]/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative z-[101] bg-[var(--color-paper)] w-full max-w-lg border border-[var(--color-mist)] shadow-2xl animate-fade-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-mist)]">
          <h2
            id="dialog-title"
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Leave Your Mark
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-xs tracking-widest uppercase text-[var(--color-stone)] mb-2"
            >
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-[var(--color-mist)] bg-transparent text-[0.9375rem] leading-relaxed placeholder:text-[var(--color-stone)]/50 focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none"
              rows={4}
              maxLength={500}
              disabled={isPending}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-[var(--color-stone)] tabular-nums">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-[var(--color-stone)] mb-2">
              Signature{' '}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <SignaturePad
              onChange={setSignature}
              className="w-full h-[120px] bg-[#fafafa] border border-[var(--color-mist)] cursor-crosshair"
              disabled={isPending}
            />
            <p className="text-xs text-[var(--color-stone)] mt-2 italic">
              Draw your signature above
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[0.875rem] text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-[var(--color-mist)] text-[0.8125rem] tracking-wide uppercase text-[var(--color-stone)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-all"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] text-[0.8125rem] tracking-wide uppercase transition-all hover:bg-[var(--color-stone)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isPending ? 'Signing...' : 'Sign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

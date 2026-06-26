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
      <button onClick={handleOpen} className="ds-button ds-button-primary">
        Sign the Guestbook
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="animate-fade-up relative z-[101] w-full max-w-lg rounded-[var(--ds-radius-lg)] border border-[var(--border)] bg-[var(--bg)] shadow-[var(--ds-shadow-large)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 id="dialog-title" className="ds-heading-3 text-[var(--fg)]">
            Leave Your Mark
          </h2>
          <button
            onClick={handleClose}
            className="rounded-[var(--ds-radius)] p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--ds-gray-100)] hover:text-[var(--fg)]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="ds-label mb-2 block normal-case"
            >
              Your message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts…"
              className="w-full resize-none rounded-[var(--ds-radius)] border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-[0.9375rem] leading-relaxed text-[var(--fg)] transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--accent)] focus:outline-none"
              rows={4}
              maxLength={500}
              disabled={isPending}
            />
            <div className="mt-2 flex justify-end">
              <span className="ds-mono text-xs tabular-nums text-[var(--fg-muted)]">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Signature */}
          <div>
            <label className="ds-label mb-2 block normal-case">
              Signature <span className="text-[var(--fg-faint)]">(optional)</span>
            </label>
            <SignaturePad
              onChange={setSignature}
              className="h-[120px] w-full cursor-crosshair rounded-[var(--ds-radius)] border border-[var(--border)] bg-[var(--bg-subtle)]"
              disabled={isPending}
            />
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              Draw your signature above
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[0.875rem] text-[var(--ds-red-600)]" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="ds-button ds-button-secondary flex-1"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ds-button ds-button-primary flex-1"
              disabled={isPending}
            >
              {isPending ? 'Signing…' : 'Sign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';

import { SignatureCapture } from './capture';

export const metadata = {
  title: 'Signature capture',
  robots: { index: false },
};

// Dev-only tool for recording the footer signature. Delete once it's captured.
export default function SignatureCapturePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <SignatureCapture />;
}

import 'server-only';

const FROM_FALLBACK = 'Kelvin Amoaba <notifications@kelvinamoaba.com>';

let warnedMissingKey = false;

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.log('RESEND_API_KEY is not configured; skipping email send.');
      warnedMissingKey = true;
    }
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? FROM_FALLBACK,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(
      `Resend send failed (${res.status}): ${detail.message ?? 'unknown'}`
    );
  }
}

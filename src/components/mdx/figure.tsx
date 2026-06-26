/* eslint-disable @next/next/no-img-element */
export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-8">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-[var(--ds-radius-lg)] border border-[var(--border)]"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-[0.85rem] text-[var(--fg-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

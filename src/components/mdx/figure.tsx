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
      <img src={src} alt={alt} className="w-full" />
      {caption && (
        <figcaption className="mt-3 text-[0.85rem] text-[var(--color-stone)] text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

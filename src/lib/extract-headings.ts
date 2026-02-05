export interface TOCHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/**
 * Extract headings from markdown content
 */
export function extractHeadings(content: string): TOCHeading[] {
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  const idCounts = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].trim();
    const baseId = slugify(text) || 'heading';

    const count = idCounts.get(baseId) || 0;
    idCounts.set(baseId, count + 1);
    const uniqueId = count === 0 ? baseId : `${baseId}-${count}`;

    headings.push({ id: uniqueId, text, level });
  }

  return headings;
}

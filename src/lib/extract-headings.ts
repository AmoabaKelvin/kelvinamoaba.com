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
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].trim();
    const id = slugify(text);

    headings.push({ id, text, level });
  }

  return headings;
}

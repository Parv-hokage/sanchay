import * as crypto from 'crypto';

export interface ParsedSection {
  heading: string;
  content: string;
}

export interface ParsedDocument {
  title: string;
  rawText: string;
  sections: ParsedSection[];
  contentHash: string;
}

/**
 * Strips HTML markup, removes script/style/nav noise, and extracts structured sections
 */
export function parseHtmlContent(html: string, fallbackTitle = 'Official Government Document'): ParsedDocument {
  if (!html || typeof html !== 'string') {
    return {
      title: fallbackTitle,
      rawText: '',
      sections: [],
      contentHash: crypto.createHash('sha256').update('').digest('hex'),
    };
  }

  // Extract <title> if present
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : fallbackTitle;

  // Remove script, style, nav, header, footer, noscript tags
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');

  // Extract headings and paragraphs
  const sections: ParsedSection[] = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  let lastIndex = 0;
  let currentHeading = 'Overview';

  while ((match = headingRegex.exec(cleaned)) !== null) {
    const sectionText = stripHtmlTags(cleaned.substring(lastIndex, match.index)).trim();
    if (sectionText.length > 20) {
      sections.push({
        heading: currentHeading,
        content: sectionText,
      });
    }
    currentHeading = stripHtmlTags(match[2]).trim() || 'General Information';
    lastIndex = match.index + match[0].length;
  }

  // Trailing section
  const remainingText = stripHtmlTags(cleaned.substring(lastIndex)).trim();
  if (remainingText.length > 20) {
    sections.push({
      heading: currentHeading,
      content: remainingText,
    });
  }

  const rawText = sections.map((s) => `## ${s.heading}\n${s.content}`).join('\n\n') || stripHtmlTags(cleaned).trim();
  const contentHash = crypto.createHash('sha256').update(rawText).digest('hex');

  return {
    title,
    rawText,
    sections: sections.length > 0 ? sections : [{ heading: 'General Information', content: rawText }],
    contentHash,
  };
}

function stripHtmlTags(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

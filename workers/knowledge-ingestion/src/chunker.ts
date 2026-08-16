export interface GeneratedChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata: {
    section: string;
    heading: string;
    page?: number;
    charCount: number;
  };
}

export function semanticChunk(
  sections: { heading: string; content: string }[],
  maxChunkChars = 800,
  overlapChars = 100,
): GeneratedChunk[] {
  const chunks: GeneratedChunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    const text = section.content.trim();
    if (text.length <= maxChunkChars) {
      chunks.push({
        chunkIndex: chunkIndex++,
        content: `[${section.heading}]\n${text}`,
        tokenCount: Math.ceil(text.length / 4), // Approximate tokens
        metadata: {
          section: section.heading,
          heading: section.heading,
          charCount: text.length,
        },
      });
      continue;
    }

    // Split section by paragraphs
    const paragraphs = text.split(/\n\n+/);
    let currentBuffer = '';

    for (const para of paragraphs) {
      if (currentBuffer.length + para.length <= maxChunkChars) {
        currentBuffer += (currentBuffer ? '\n\n' : '') + para;
      } else {
        if (currentBuffer) {
          chunks.push({
            chunkIndex: chunkIndex++,
            content: `[${section.heading}]\n${currentBuffer}`,
            tokenCount: Math.ceil(currentBuffer.length / 4),
            metadata: {
              section: section.heading,
              heading: section.heading,
              charCount: currentBuffer.length,
            },
          });
        }
        currentBuffer = para;
      }
    }

    if (currentBuffer) {
      chunks.push({
        chunkIndex: chunkIndex++,
        content: `[${section.heading}]\n${currentBuffer}`,
        tokenCount: Math.ceil(currentBuffer.length / 4),
        metadata: {
          section: section.heading,
          heading: section.heading,
          charCount: currentBuffer.length,
        },
      });
    }
  }

  return chunks;
}

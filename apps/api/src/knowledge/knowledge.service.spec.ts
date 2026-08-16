import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeService } from './knowledge.service';
import {
  parseHtmlContent,
  semanticChunk,
  generateDeterministicEmbedding,
  computeCosineSimilarity,
} from '@sanchay/worker-knowledge-ingestion';
import { AuthorityLevel } from '@sanchay/types';

describe('KnowledgeService & Hybrid RAG Retrieval Tests', () => {
  let knowledgeService: KnowledgeService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      knowledgeChunk: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      knowledgeSource: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(null),
      },
    };

    knowledgeService = new KnowledgeService(mockPrisma as any);
  });

  it('performs hybrid search and returns evidence with structured citations for JEE eligibility', async () => {
    const results = await knowledgeService.searchKnowledge({
      query: 'What is the eligibility for JEE Main?',
      limit: 3,
    });

    expect(results.query).toBe('What is the eligibility for JEE Main?');
    expect(results.count).toBeGreaterThan(0);
    expect(results.evidence.length).toBeGreaterThan(0);

    const topEvidence = results.evidence[0];
    expect(topEvidence.title).toContain('JEE (Main)');
    expect(topEvidence.citation).toBeDefined();
    expect(topEvidence.citation.url).toBe('https://jeemain.nta.nic.in/information-bulletin');
    expect(topEvidence.citation.authorityLevel).toBe(AuthorityLevel.TIER_1_OFFICIAL_GOV);
    expect(topEvidence.citation.page).toBe(12);
    expect(topEvidence.score).toBeGreaterThan(0.2);
  });

  it('filters knowledge search by serviceId (Ayushman Bharat)', async () => {
    const results = await knowledgeService.searchKnowledge({
      query: 'What is the hospital coverage amount in Ayushman Bharat?',
      serviceId: 'ayushman-bharat',
    });

    expect(results.count).toBeGreaterThan(0);
    const topEvidence = results.evidence[0];
    expect(topEvidence.snippet).toContain('Rs. 5 Lakh');
    expect(topEvidence.citation.url).toBe('https://pmjay.gov.in/guidelines');
  });

  it('parses HTML, strips script tags, and extracts structured headings', () => {
    const sampleHtml = `
      <html>
        <head><title>NTA Notification</title></head>
        <body>
          <script>alert("hack");</script>
          <nav><a href="#">Home</a></nav>
          <h1>Examination Dates 2026</h1>
          <p>The session 1 exam will be conducted from January 22 to January 31, 2026.</p>
          <h2>Marking Scheme</h2>
          <p>Each correct question awards 4 marks while incorrect carries negative 1 mark.</p>
          <footer>Copyright NTA 2026</footer>
        </body>
      </html>
    `;

    const parsed = parseHtmlContent(sampleHtml);
    expect(parsed.title).toBe('NTA Notification');
    expect(parsed.sections.length).toBe(2);
    expect(parsed.sections[0].heading).toBe('Examination Dates 2026');
    expect(parsed.sections[0].content).toContain('January 22');
    expect(parsed.rawText).not.toContain('alert("hack")');
    expect(parsed.rawText).not.toContain('Copyright NTA');
    expect(parsed.contentHash).toBeDefined();
  });

  it('semantically chunks document and preserves section/heading citations', () => {
    const sections = [
      { heading: 'Eligibility', content: 'Candidates must have passed Class 12 examination.' },
      { heading: 'Reservation', content: 'OBC-NCL and SC/ST certificates are accepted.' },
    ];

    const chunks = semanticChunk(sections, 500);
    expect(chunks.length).toBe(2);
    expect(chunks[0].metadata.heading).toBe('Eligibility');
    expect(chunks[1].metadata.heading).toBe('Reservation');
    expect(chunks[0].content).toContain('[Eligibility]');
  });

  it('computes cosine similarity accurately between semantic query and chunk embeddings', () => {
    const textA = 'JEE Main application eligibility criteria and age limit';
    const textB = 'Candidates who passed class 12 are eligible for JEE Main with no age limit';
    const textC = 'Driving license application for heavy motor vehicles in transport office';

    const vecA = generateDeterministicEmbedding(textA);
    const vecB = generateDeterministicEmbedding(textB);
    const vecC = generateDeterministicEmbedding(textC);

    const simAB = computeCosineSimilarity(vecA, vecB);
    const simAC = computeCosineSimilarity(vecA, vecC);

    expect(simAB).toBeGreaterThan(simAC);
  });
});

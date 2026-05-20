/**
 * API Routes Test Suite
 * Tests for all Formly AI tool API routes.
 * Uses Jest-style patterns with fetch mocking (no actual network calls).
 */

// ---------------------------------------------------------------------------
// Shared mock infrastructure
// ---------------------------------------------------------------------------

/** Build a minimal NextRequest-like object */
function makeRequest(body: unknown, contentType = 'application/json'): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: JSON.stringify(body),
  });
}

function makeFormDataRequest(entries: Record<string, string | Blob>): Request {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return new Request('http://localhost/api/test', {
    method: 'POST',
    body: fd,
  });
}

/** Mock callAI so tests never hit the real Groq API */
jest.mock('@/lib/ai', () => ({
  callAI: jest.fn(),
}));

/** Mock logUsage to be a no-op */
jest.mock('@/lib/rate-limit', () => ({
  logUsage: jest.fn(),
}));

/** Mock pdf-parse so PDF tests don't require a real binary */
jest.mock('pdf-parse', () =>
  jest.fn().mockResolvedValue({ text: 'Extracted PDF text content for testing.' })
);

import { callAI } from '@/lib/ai';
const mockCallAI = callAI as jest.MockedFunction<typeof callAI>;

// ---------------------------------------------------------------------------
// Helper: reset mocks before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// /api/tools/pdf-to-markdown
// ---------------------------------------------------------------------------
describe('POST /api/tools/pdf-to-markdown', () => {
  // We import the handler lazily so the module-level mock is in effect
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/pdf-to-markdown/route'));
  });

  it('returns 400 when no file is provided', async () => {
    const fd = new FormData();
    const req = new Request('http://localhost', { method: 'POST', body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when file is not a PDF', async () => {
    const fd = new FormData();
    fd.append('file', new Blob(['hello'], { type: 'text/plain' }), 'doc.txt');
    const req = new Request('http://localhost', { method: 'POST', body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/pdf/i);
  });

  it('returns markdown on valid PDF upload', async () => {
    mockCallAI.mockResolvedValueOnce('# Document Title\n\nSome content here.');

    const fd = new FormData();
    fd.append('file', new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' }), 'test.pdf');
    const req = new Request('http://localhost', { method: 'POST', body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('markdown');
    expect(typeof json.markdown).toBe('string');
  });

  it('returns 400 when PDF has no extractable text', async () => {
    // Override pdf-parse mock to return empty text for this test
    const pdfParse = (await import('pdf-parse')).default as jest.MockedFunction<any>;
    pdfParse.mockResolvedValueOnce({ text: '   ' });

    const fd = new FormData();
    fd.append('file', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'empty.pdf');
    const req = new Request('http://localhost', { method: 'POST', body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/no readable text/i);
  });

  it('returns 400 when file exceeds 10 MB', async () => {
    const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'application/pdf' });
    const fd = new FormData();
    fd.append('file', largeBlob, 'huge.pdf');
    const req = new Request('http://localhost', { method: 'POST', body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/bio
// ---------------------------------------------------------------------------
describe('POST /api/tools/bio', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/bio/route'));
  });

  const validBody = {
    name: 'Jane Doe',
    profession: 'Software Engineer',
    achievements: 'Built scalable systems handling 10M+ requests/day at Acme Corp.',
    platform: 'LinkedIn',
    tone: 'Professional',
    length: 'medium' as const,
  };

  it('returns a bio string on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('Jane Doe is a Software Engineer with 10+ years building scalable systems.');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('bio');
    expect(typeof json.bio).toBe('string');
  });

  it('returns 400 when name is too short', async () => {
    const req = makeRequest({ ...validBody, name: 'J' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when achievements field is missing', async () => {
    const { achievements, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when length enum is invalid', async () => {
    const req = makeRequest({ ...validBody, length: 'tiny' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('trims whitespace from returned bio', async () => {
    mockCallAI.mockResolvedValueOnce('  Jane Doe bio text.  ');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.bio).toBe('Jane Doe bio text.');
  });
});

// ---------------------------------------------------------------------------
// /api/tools/email-writer
// ---------------------------------------------------------------------------
describe('POST /api/tools/email-writer', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/email-writer/route'));
  });

  const validBody = {
    purpose: 'Follow up after interview',
    recipient: 'Hiring Manager',
    tone: 'Professional',
    keyPoints: 'Thank them, reiterate interest, mention portfolio',
    senderName: 'Alice Smith',
  };

  it('returns email string on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('Subject: Follow Up\n\nDear Hiring Manager,\n\nThank you...\n\nBest regards,\nAlice Smith');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('email');
    expect(typeof json.email).toBe('string');
  });

  it('returns 400 when purpose is missing', async () => {
    const { purpose, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when keyPoints is too short', async () => {
    const req = makeRequest({ ...validBody, keyPoints: 'hi' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('works without optional senderName', async () => {
    mockCallAI.mockResolvedValueOnce('Subject: Test\n\nBody here.');
    const { senderName, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('email');
  });
});

// ---------------------------------------------------------------------------
// /api/tools/grammar
// ---------------------------------------------------------------------------
describe('POST /api/tools/grammar', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/grammar/route'));
  });

  const aiResponse = JSON.stringify({
    corrected: 'The quick brown fox jumps over the lazy dog.',
    score: 95,
    issues: [
      { type: 'spelling', original: 'quik', correction: 'quick', explanation: 'Misspelling.' },
    ],
  });

  it('returns corrected text, score, and issues on valid input', async () => {
    mockCallAI.mockResolvedValueOnce(aiResponse);
    const req = makeRequest({ text: 'The quik brown fox jump over the lazy dog.' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('corrected');
    expect(json).toHaveProperty('score');
    expect(json).toHaveProperty('issues');
    expect(Array.isArray(json.issues)).toBe(true);
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.score).toBeLessThanOrEqual(100);
  });

  it('returns 400 when text is too short', async () => {
    const req = makeRequest({ text: 'hi' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when text field is missing', async () => {
    const req = makeRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('clamps score to 0-100 range', async () => {
    mockCallAI.mockResolvedValueOnce(JSON.stringify({ corrected: 'ok', score: 150, issues: [] }));
    const req = makeRequest({ text: 'Some text to check for grammar issues.' });
    const res = await POST(req as any);
    const json = await res.json();
    expect(json.score).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/hashtag
// ---------------------------------------------------------------------------
describe('POST /api/tools/hashtag', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/hashtag/route'));
  });

  const aiResponse = JSON.stringify({
    popular: ['#tech', '#coding', '#developer', '#programming', '#software', '#ai'],
    niche: ['#webdev', '#javascript', '#typescript', '#react', '#nextjs', '#nodejs', '#fullstack', '#devops'],
    branded: ['#formly', '#aitools', '#productivitytools', '#devtools', '#buildinpublic', '#indiehacker'],
    all: ['#tech', '#coding', '#developer', '#programming', '#software', '#ai', '#webdev', '#javascript', '#typescript', '#react', '#nextjs', '#nodejs', '#fullstack', '#devops', '#formly', '#aitools', '#productivitytools', '#devtools', '#buildinpublic', '#indiehacker'],
  });

  it('returns popular, niche, branded and all arrays on valid input', async () => {
    mockCallAI.mockResolvedValueOnce(aiResponse);
    const req = makeRequest({ topic: 'JavaScript web development tutorials', platform: 'Instagram', count: 20 });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.popular)).toBe(true);
    expect(Array.isArray(json.niche)).toBe(true);
    expect(Array.isArray(json.branded)).toBe(true);
    expect(Array.isArray(json.all)).toBe(true);
  });

  it('returns 400 when topic is too short', async () => {
    const req = makeRequest({ topic: 'hi', platform: 'Instagram', count: 20 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is missing', async () => {
    const req = makeRequest({ platform: 'Instagram', count: 20 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('uses defaults for platform and count when omitted', async () => {
    mockCallAI.mockResolvedValueOnce(aiResponse);
    const req = makeRequest({ topic: 'Software engineering best practices' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/paraphrase
// ---------------------------------------------------------------------------
describe('POST /api/tools/paraphrase', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/paraphrase/route'));
  });

  const sampleText = 'The rapid advancement of artificial intelligence has transformed how we approach software development and problem solving in the modern era.';

  it('returns rewritten text on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('AI has quickly changed how we build software and solve problems today.');
    const req = makeRequest({ text: sampleText, mode: 'standard' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('result');
    expect(typeof json.result).toBe('string');
  });

  it('returns 400 when text is too short', async () => {
    const req = makeRequest({ text: 'Too short', mode: 'standard' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when mode is invalid', async () => {
    const req = makeRequest({ text: sampleText, mode: 'turbo' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when mode is missing', async () => {
    const req = makeRequest({ text: sampleText });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('accepts all valid modes', async () => {
    const modes = ['standard', 'formal', 'creative', 'academic', 'simple'] as const;
    for (const mode of modes) {
      mockCallAI.mockResolvedValueOnce('Rewritten text.');
      const req = makeRequest({ text: sampleText, mode });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    }
  });
});

// ---------------------------------------------------------------------------
// /api/tools/resume
// ---------------------------------------------------------------------------
describe('POST /api/tools/resume', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/resume/route'));
  });

  const validBody = {
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 555-0100',
    location: 'San Francisco, CA',
    jobTitle: 'Senior Software Engineer',
    skills: 'TypeScript, React, Node.js, PostgreSQL, AWS, Docker',
    experience: [
      {
        company: 'Acme Corp',
        role: 'Software Engineer',
        duration: '2020-2024',
        bullets: 'Built microservices. Led team of 5 engineers. Reduced latency by 40%.',
      },
    ],
    education: [
      {
        institution: 'MIT',
        degree: 'B.S. Computer Science',
        year: '2020',
      },
    ],
  };

  it('returns resume string on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('JOHN SMITH\n\nPROFESSIONAL SUMMARY\n...');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('resume');
    expect(typeof json.resume).toBe('string');
  });

  it('returns 400 when name is missing', async () => {
    const { name, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when skills is too short', async () => {
    const req = makeRequest({ ...validBody, skills: 'JS' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when jobTitle is missing', async () => {
    const { jobTitle, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('works with empty experience and education arrays', async () => {
    mockCallAI.mockResolvedValueOnce('JOHN SMITH\n\nSKILLS\n...');
    const req = makeRequest({ ...validBody, experience: [], education: [] });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/contract
// ---------------------------------------------------------------------------
describe('POST /api/tools/contract', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/contract/route'));
  });

  const validBody = {
    contractType: 'Freelance Service Agreement',
    party1: 'Jane Developer (Contractor)',
    party2: 'Acme Corp (Client)',
    scope: 'Build a full-stack web application including design, development, and deployment over 3 months.',
    payment: '$10,000 total, 50% upfront, 50% on delivery',
    duration: '3 months from signing',
    jurisdiction: 'California, USA',
  };

  it('returns contract string on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('FREELANCE SERVICE AGREEMENT\n\nThis agreement is entered into...');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('contract');
    expect(typeof json.contract).toBe('string');
  });

  it('returns 400 when contractType is missing', async () => {
    const { contractType, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when scope is too short', async () => {
    const req = makeRequest({ ...validBody, scope: 'Short' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when party1 is missing', async () => {
    const { party1, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('uses default jurisdiction when omitted', async () => {
    mockCallAI.mockResolvedValueOnce('CONTRACT CONTENT');
    const { jurisdiction, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/cover-letter
// ---------------------------------------------------------------------------
describe('POST /api/tools/cover-letter', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/cover-letter/route'));
  });

  const validBody = {
    jobTitle: 'Senior Frontend Engineer',
    company: 'Stripe',
    yourName: 'Alex Johnson',
    yourBackground: '7 years building React applications at scale. Led frontend team at TechCorp.',
    keySkills: 'React, TypeScript, Next.js, performance optimization, team leadership',
    tone: 'Professional' as const,
  };

  it('returns letter string on valid input', async () => {
    mockCallAI.mockResolvedValueOnce('Dear Hiring Manager,\n\nI am excited to apply...\n\nBest,\nAlex Johnson');
    const req = makeRequest(validBody);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('letter');
    expect(typeof json.letter).toBe('string');
  });

  it('returns 400 when jobTitle is missing', async () => {
    const { jobTitle, ...rest } = validBody;
    const req = makeRequest(rest);
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when yourBackground is too short', async () => {
    const req = makeRequest({ ...validBody, yourBackground: 'hi' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when tone is invalid', async () => {
    const req = makeRequest({ ...validBody, tone: 'Casual' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('accepts optional jobDescription field', async () => {
    mockCallAI.mockResolvedValueOnce('Cover letter with job desc reference.');
    const req = makeRequest({ ...validBody, jobDescription: 'We are looking for an expert in React...' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });

  it('accepts all valid tone values', async () => {
    const tones = ['Professional', 'Enthusiastic', 'Concise'] as const;
    for (const tone of tones) {
      mockCallAI.mockResolvedValueOnce('Letter content.');
      const req = makeRequest({ ...validBody, tone });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    }
  });
});

// ---------------------------------------------------------------------------
// /api/tools/code-explain
// ---------------------------------------------------------------------------
describe('POST /api/tools/code-explain', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/code-explain/route'));
  });

  const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

  it('returns result string on valid explain request', async () => {
    mockCallAI.mockResolvedValueOnce('## Overview\nThis function calculates Fibonacci numbers recursively.');
    const req = makeRequest({ code: sampleCode, language: 'JavaScript', mode: 'explain' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('result');
    expect(typeof json.result).toBe('string');
  });

  it('returns 400 when code is too short', async () => {
    const req = makeRequest({ code: 'hi', language: 'JS', mode: 'explain' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when mode is invalid', async () => {
    const req = makeRequest({ code: sampleCode, language: 'JavaScript', mode: 'translate' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when code is missing', async () => {
    const req = makeRequest({ language: 'JavaScript', mode: 'explain' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('accepts all valid modes', async () => {
    const modes = ['explain', 'improve', 'debug', 'document'] as const;
    for (const mode of modes) {
      mockCallAI.mockResolvedValueOnce('Analysis result.');
      const req = makeRequest({ code: sampleCode, language: 'JavaScript', mode });
      const res = await POST(req as any);
      expect(res.status).toBe(200);
    }
  });

  it('uses Auto-detect language default', async () => {
    mockCallAI.mockResolvedValueOnce('Result without language specified.');
    const req = makeRequest({ code: sampleCode, mode: 'explain' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// /api/tools/code-reviewer
// ---------------------------------------------------------------------------
describe('POST /api/tools/code-reviewer', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/code-reviewer/route'));
  });

  const sampleCode = `const express = require('express');
const app = express();
app.get('/user/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = ' + req.params.id);
  res.json(user);
});`;

  const aiReviewResponse = JSON.stringify({
    issues: [
      { line: '4', severity: 'critical', description: 'SQL injection vulnerability', fix: 'Use parameterized queries' },
    ],
    quality: {
      score: 4,
      summary: 'Code has critical security vulnerabilities.',
      positives: ['Clean structure'],
      negatives: ['SQL injection', 'No error handling'],
    },
    performance: ['Add database connection pooling'],
    improved_code: `const express = require('express');\nconst app = express();\napp.get('/user/:id', async (req, res) => {\n  try {\n    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);\n    res.json(user);\n  } catch (err) {\n    res.status(500).json({ error: 'Server error' });\n  }\n});`,
    grade: 'D',
  });

  it('returns structured review on valid input', async () => {
    mockCallAI.mockResolvedValueOnce(aiReviewResponse);
    const req = makeRequest({ code: sampleCode, language: 'JavaScript' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('issues');
    expect(json).toHaveProperty('quality');
    expect(json).toHaveProperty('grade');
    expect(json).toHaveProperty('improved_code');
    expect(Array.isArray(json.issues)).toBe(true);
  });

  it('returns 400 when code is too short', async () => {
    const req = makeRequest({ code: 'fn()', language: 'JavaScript' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when language is missing', async () => {
    const req = makeRequest({ code: sampleCode });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when code field is missing', async () => {
    const req = makeRequest({ language: 'JavaScript' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('handles JSON wrapped in markdown fences', async () => {
    mockCallAI.mockResolvedValueOnce('```json\n' + aiReviewResponse + '\n```');
    const req = makeRequest({ code: sampleCode, language: 'JavaScript' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('grade');
  });
});

// ---------------------------------------------------------------------------
// /api/tools/terms-simplifier
// ---------------------------------------------------------------------------
describe('POST /api/tools/terms-simplifier', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/tools/terms-simplifier/route'));
  });

  const sampleTerms = `By using this service, you agree to our terms of service and privacy policy. We collect your personal information including name, email address, browsing history, location data, and device identifiers. We may share this data with third-party advertising partners. You grant us a perpetual, worldwide, royalty-free license to use your content. We may modify these terms at any time without notice. This agreement is governed by the laws of California. You waive your right to a jury trial.`.repeat(2);

  const aiResponse = JSON.stringify({
    tldr: ['They collect lots of your data', 'They share it with advertisers', 'No jury trial allowed'],
    they_can_do: ['Share your data with third parties', 'Modify terms without notice'],
    you_can_do: ['Delete your account', 'Request data export'],
    red_flags: ['Waiver of jury trial rights', 'Perpetual license to your content'],
    data_collected: ['Name', 'Email', 'Browsing history', 'Location', 'Device identifiers'],
    your_rights: ['Access your data', 'Delete your account'],
    privacy_score: 3,
    privacy_score_reason: 'Excessive data collection and sharing with no opt-out.',
  });

  it('returns analysis object on valid input', async () => {
    mockCallAI.mockResolvedValueOnce(aiResponse);
    const req = makeRequest({ text: sampleTerms });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('tldr');
    expect(json).toHaveProperty('they_can_do');
    expect(json).toHaveProperty('you_can_do');
    expect(json).toHaveProperty('red_flags');
    expect(json).toHaveProperty('data_collected');
    expect(json).toHaveProperty('your_rights');
    expect(json).toHaveProperty('privacy_score');
    expect(Array.isArray(json.tldr)).toBe(true);
    expect(typeof json.privacy_score).toBe('number');
  });

  it('returns 400 when text is too short (< 100 chars)', async () => {
    const req = makeRequest({ text: 'Short text.' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when text field is missing', async () => {
    const req = makeRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('handles JSON wrapped in markdown fences', async () => {
    mockCallAI.mockResolvedValueOnce('```json\n' + aiResponse + '\n```');
    const req = makeRequest({ text: sampleTerms });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('privacy_score');
  });

  it('returns 400 when text exceeds 15000 chars', async () => {
    const req = makeRequest({ text: 'x'.repeat(15001) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

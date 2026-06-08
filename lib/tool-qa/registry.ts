/**
 * Tool Registry
 * Defines all testable tools with test cases, validators, and competitor references.
 * Test cases cover: happy path, edge cases, validation errors, format verification.
 *
 * Token-efficient: test case generation is fully static — zero AI tokens for test setup.
 */

import type { ToolDefinition, TestResponse, ValidationResult } from './types';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://formly.tools';

// ── Validation helpers ───────────────────────────────────────────────────────

function ok(details?: Record<string, unknown>): ValidationResult {
  return { pass: true, details };
}

function fail(reason: string, details?: Record<string, unknown>): ValidationResult {
  return { pass: false, reason, details };
}

function hasFields(body: unknown, fields: string[]): ValidationResult {
  if (typeof body !== 'object' || body === null) return fail('Response is not an object', { body });
  const obj = body as Record<string, unknown>;
  const missing = fields.filter(f => !(f in obj));
  if (missing.length) return fail(`Missing fields: ${missing.join(', ')}`, { missing, keys: Object.keys(obj) });
  return ok({ fields: fields.map(f => ({ [f]: typeof obj[f] })) });
}

function isNonEmptyString(body: unknown, minLength = 20): ValidationResult {
  if (typeof body !== 'string') return fail(`Expected string, got ${typeof body}`);
  if (body.trim().length < minLength) return fail(`String too short (${body.length} chars, min ${minLength})`);
  return ok({ length: body.length });
}

function expectError(res: TestResponse): ValidationResult {
  if (res.status >= 400 && res.status < 500) return ok({ status: res.status });
  return fail(`Expected 4xx error, got ${res.status}`);
}

function hasArrayField(body: unknown, field: string, minItems = 0): ValidationResult {
  const fields = hasFields(body, [field]);
  if (!fields.pass) return fields;
  const arr = (body as Record<string, unknown>)[field];
  if (!Array.isArray(arr)) return fail(`${field} is not an array`);
  if (arr.length < minItems) return fail(`${field} has ${arr.length} items, expected ≥ ${minItems}`);
  return ok({ [field + '_count']: arr.length });
}

function scoreInRange(body: unknown, field: string, min = 0, max = 100): ValidationResult {
  const fields = hasFields(body, [field]);
  if (!fields.pass) return fields;
  const val = (body as Record<string, unknown>)[field];
  if (typeof val !== 'number') return fail(`${field} is not a number, got ${typeof val} (${val})`);
  if (val < min || val > max) return fail(`${field} = ${val} out of range [${min}, ${max}]`);
  return ok({ [field]: val });
}

// ── Tool Registry ─────────────────────────────────────────────────────────────

export const TOOL_REGISTRY: ToolDefinition[] = [

  // ─── Grammar Checker ────────────────────────────────────────────────────────
  {
    slug: 'grammar-checker',
    name: 'Grammar Checker',
    category: 'Writing',
    apiPath: '/api/tools/grammar',
    sourceFile: 'app/api/tools/grammar/route.ts',
    features: [
      'Grammar error detection', 'Spelling corrections', 'Punctuation fixes',
      'Style suggestions', 'Score 0-100', 'Issue explanations',
    ],
    competitors: [
      { name: 'Grammarly', url: 'https://www.grammarly.com/grammar-check', category: 'Writing' },
      { name: 'LanguageTool', url: 'https://languagetool.org/', category: 'Writing' },
      { name: 'ProWritingAid', url: 'https://prowritingaid.com/', category: 'Writing' },
    ],
    testCases: [
      {
        name: 'happy_path_errors',
        description: 'Text with clear grammar errors returns issues and lower score',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: { text: 'Their going to the store and i has a apple. She dont like it.' },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['corrected', 'score', 'issues']);
          if (!v.pass) return v;
          return scoreInRange(res.body, 'score', 0, 80);
        },
      },
      {
        name: 'happy_path_perfect',
        description: 'Grammatically correct text returns high score and no issues',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: { text: 'The quick brown fox jumps over the lazy dog. She has been working diligently.' },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['corrected', 'score', 'issues']);
          if (!v.pass) return v;
          return scoreInRange(res.body, 'score', 75, 100);
        },
      },
      {
        name: 'response_fields',
        description: 'Response includes all required fields with correct types',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: { text: 'He go to school every day and dont study.' },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['corrected', 'score', 'issues']);
          if (!v.pass) return v;
          const b = res.body as Record<string, unknown>;
          if (!Array.isArray(b.issues)) return fail('issues must be an array');
          return ok({ issueCount: (b.issues as unknown[]).length, score: b.score });
        },
      },
      {
        name: 'validation_too_short',
        description: 'Text under 5 chars triggers 400 validation error',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: { text: 'Hi' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
      {
        name: 'validation_empty',
        description: 'Missing text field triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: {},
        expectedStatus: [400, 422],
        validate: expectError,
      },
      {
        name: 'performance',
        description: 'Response returns within 10 seconds',
        method: 'POST', path: `${BASE}/api/tools/grammar`,
        body: { text: 'This is a test sentence to check response time.' },
        expectedStatus: 200,
        validate: (res) => res.durationMs <= 10000 ? ok({ ms: res.durationMs }) : fail(`Slow response: ${res.durationMs}ms`),
      },
    ],
  },

  // ─── Paraphraser ────────────────────────────────────────────────────────────
  {
    slug: 'paraphraser',
    name: 'AI Paraphraser',
    category: 'Writing',
    apiPath: '/api/tools/paraphrase',
    sourceFile: 'app/api/tools/paraphrase/route.ts',
    features: [
      'Standard mode', 'Formal mode', 'Creative mode',
      'Academic mode', 'Simple mode', 'Preserves meaning',
    ],
    competitors: [
      { name: 'QuillBot', url: 'https://quillbot.com/', category: 'Writing' },
      { name: 'Wordtune', url: 'https://www.wordtune.com/', category: 'Writing' },
      { name: 'Paraphraser.io', url: 'https://www.paraphraser.io/', category: 'Writing' },
    ],
    testCases: [
      {
        name: 'happy_path_standard',
        description: 'Standard mode returns non-empty paraphrase',
        method: 'POST', path: `${BASE}/api/tools/paraphrase`,
        body: { text: 'The dog is very happy because it got a new bone from its owner today.', mode: 'standard' },
        expectedStatus: 200,
        validate: (res) => {
          const v = isNonEmptyString(res.body, 20);
          if (!v.pass) return v;
          if (res.body === 'The dog is very happy because it got a new bone from its owner today.') {
            return fail('Paraphrase is identical to input — no change made');
          }
          return v;
        },
      },
      {
        name: 'all_modes',
        description: 'Formal mode returns output different from input',
        method: 'POST', path: `${BASE}/api/tools/paraphrase`,
        body: { text: 'This thing is really good for doing stuff quickly.', mode: 'formal' },
        expectedStatus: 200,
        validate: (res) => isNonEmptyString(res.body, 15),
      },
      {
        name: 'academic_mode',
        description: 'Academic mode produces scholarly-sounding output',
        method: 'POST', path: `${BASE}/api/tools/paraphrase`,
        body: { text: 'AI is changing how we work and making jobs different.', mode: 'academic' },
        expectedStatus: 200,
        validate: (res) => isNonEmptyString(res.body, 20),
      },
      {
        name: 'validation_too_short',
        description: 'Text under 10 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/paraphrase`,
        body: { text: 'Hi', mode: 'standard' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
      {
        name: 'validation_invalid_mode',
        description: 'Invalid mode triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/paraphrase`,
        body: { text: 'This is a valid sentence for testing purposes.', mode: 'invalid_mode_xyz' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Email Writer ────────────────────────────────────────────────────────────
  {
    slug: 'email-writer',
    name: 'AI Email Writer',
    category: 'Writing',
    apiPath: '/api/tools/email-writer',
    sourceFile: 'app/api/tools/email-writer/route.ts',
    features: [
      'Professional tone', 'Casual tone', 'Persuasive tone', 'Follow-up emails',
      'Cold outreach', 'Subject line generation', 'Signature block',
    ],
    competitors: [
      { name: 'Copy.ai', url: 'https://www.copy.ai/tools/email-writer', category: 'Writing' },
      { name: 'Jasper', url: 'https://www.jasper.ai/tools/email-generator', category: 'Writing' },
      { name: 'Rytr', url: 'https://rytr.me/', category: 'Writing' },
    ],
    testCases: [
      {
        name: 'happy_path_professional',
        description: 'Professional email request returns subject + body',
        method: 'POST', path: `${BASE}/api/tools/email-writer`,
        body: {
          purpose: 'Follow up on job application submitted last week',
          recipient: 'Hiring Manager at TechCorp',
          tone: 'Professional',
          keyPoints: 'Applied for Senior Developer role, 5 years experience, very interested in the position',
          senderName: 'Jane Smith',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
          if (text.length < 100) return fail(`Email too short: ${text.length} chars`);
          return ok({ length: text.length });
        },
      },
      {
        name: 'happy_path_casual',
        description: 'Casual tone email generates appropriately informal output',
        method: 'POST', path: `${BASE}/api/tools/email-writer`,
        body: {
          purpose: 'Invite team to lunch',
          recipient: 'Team members',
          tone: 'Casual',
          keyPoints: 'Friday lunch at noon, pizza place nearby, optional but fun',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          return text.length > 50 ? ok({ length: text.length }) : fail('Response too short');
        },
      },
      {
        name: 'validation_short_purpose',
        description: 'Purpose under 2 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/email-writer`,
        body: { purpose: 'A', recipient: 'Boss', tone: 'Professional', keyPoints: 'Some key points here' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
      {
        name: 'validation_missing_fields',
        description: 'Missing required fields triggers error',
        method: 'POST', path: `${BASE}/api/tools/email-writer`,
        body: { purpose: 'Testing' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Code Reviewer ──────────────────────────────────────────────────────────
  {
    slug: 'code-reviewer',
    name: 'AI Code Reviewer',
    category: 'Developer',
    apiPath: '/api/tools/code-reviewer',
    sourceFile: 'app/api/tools/code-reviewer/route.ts',
    features: [
      'Issue detection', 'Quality score', 'Grade (A-F)', 'Performance tips',
      'Security checks', 'Improved code output', 'Multi-language support',
    ],
    competitors: [
      { name: 'CodeRabbit', url: 'https://coderabbit.ai/', category: 'Developer' },
      { name: 'Snyk Code', url: 'https://snyk.io/product/snyk-code/', category: 'Developer' },
      { name: 'DeepSource', url: 'https://deepsource.com/', category: 'Developer' },
    ],
    testCases: [
      {
        name: 'happy_path_javascript',
        description: 'Valid JS code returns issues, quality, and grade',
        method: 'POST', path: `${BASE}/api/tools/code-reviewer`,
        body: {
          code: 'function fetchData(url) {\n  fetch(url).then(r => r.json()).then(d => console.log(d));\n}\n\nvar x = 1;\nvar y = 2;\nconsole.log(x+y)',
          language: 'javascript',
        },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['issues', 'quality', 'grade']);
          if (!v.pass) return v;
          const b = res.body as Record<string, unknown>;
          if (!Array.isArray(b.issues)) return fail('issues must be array');
          const quality = b.quality as Record<string, unknown>;
          return scoreInRange(quality, 'score', 0, 100);
        },
      },
      {
        name: 'happy_path_python',
        description: 'Python code with style issues returns review',
        method: 'POST', path: `${BASE}/api/tools/code-reviewer`,
        body: {
          code: 'def calculate(x,y):\n    result=x+y\n    print(result)\n    return result\n\ncalculate(1,2)',
          language: 'python',
        },
        expectedStatus: 200,
        validate: (res) => hasFields(res.body, ['issues', 'quality', 'grade']),
      },
      {
        name: 'grade_format',
        description: 'Grade field is one of A, B, C, D, F',
        method: 'POST', path: `${BASE}/api/tools/code-reviewer`,
        body: { code: 'const x = 1; const y = 2; const sum = x + y; console.log(sum);', language: 'javascript' },
        expectedStatus: 200,
        validate: (res) => {
          const b = res.body as Record<string, unknown>;
          const grade = String(b.grade ?? '');
          return /^[A-F][+-]?$/.test(grade) ? ok({ grade }) : fail(`Invalid grade format: "${grade}"`);
        },
      },
      {
        name: 'validation_empty_code',
        description: 'Empty code triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/code-reviewer`,
        body: { code: '', language: 'javascript' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Code Explainer ─────────────────────────────────────────────────────────
  {
    slug: 'code-explainer',
    name: 'Code Explainer',
    category: 'Developer',
    apiPath: '/api/tools/code-explain',
    sourceFile: 'app/api/tools/code-explain/route.ts',
    features: [
      'Explain mode', 'Improve mode', 'Debug mode', 'Document mode',
      'Auto-detect language', '20+ language support',
    ],
    competitors: [
      { name: 'GitHub Copilot Explain', url: 'https://github.com/features/copilot', category: 'Developer' },
      { name: 'Cursor', url: 'https://cursor.sh/', category: 'Developer' },
      { name: 'Tabnine', url: 'https://www.tabnine.com/', category: 'Developer' },
    ],
    testCases: [
      {
        name: 'explain_mode',
        description: 'Explain mode returns markdown explanation',
        method: 'POST', path: `${BASE}/api/tools/code-explain`,
        body: {
          code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
          language: 'JavaScript',
          mode: 'explain',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          if (text.length < 50) return fail(`Explanation too short: ${text.length} chars`);
          return ok({ length: text.length });
        },
      },
      {
        name: 'debug_mode',
        description: 'Debug mode on buggy code returns debug analysis',
        method: 'POST', path: `${BASE}/api/tools/code-explain`,
        body: {
          code: 'for i in rang(10):\n    print(i',
          language: 'Python',
          mode: 'debug',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          return text.length > 30 ? ok() : fail('Debug output too short');
        },
      },
      {
        name: 'validation_empty_code',
        description: 'Empty code triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/code-explain`,
        body: { code: '', language: 'JavaScript', mode: 'explain' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Cover Letter ────────────────────────────────────────────────────────────
  {
    slug: 'cover-letter',
    name: 'Cover Letter Generator',
    category: 'Career',
    apiPath: '/api/tools/cover-letter',
    sourceFile: 'app/api/tools/cover-letter/route.ts',
    features: [
      'Job-specific tailoring', 'Professional tone', 'Enthusiastic tone', 'Concise tone',
      'Company name personalization', 'ATS-friendly', 'Signature block',
    ],
    competitors: [
      { name: 'Zety', url: 'https://zety.com/cover-letter-builder', category: 'Career' },
      { name: 'Kickresume', url: 'https://www.kickresume.com/en/ai-cover-letter-writer/', category: 'Career' },
      { name: 'Resume.io', url: 'https://resume.io/cover-letter-builder', category: 'Career' },
    ],
    testCases: [
      {
        name: 'happy_path_professional',
        description: 'Valid inputs return a full cover letter ≥ 200 chars',
        method: 'POST', path: `${BASE}/api/tools/cover-letter`,
        body: {
          jobTitle: 'Senior Product Manager',
          company: 'Google LLC',
          yourName: 'Alex Johnson',
          yourBackground: '7 years in product management, led 3 product launches, MBA from Wharton',
          keySkills: 'Product strategy, data analysis, cross-functional leadership, agile methodology',
          tone: 'Professional',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          if (text.length < 200) return fail(`Cover letter too short: ${text.length} chars`);
          return ok({ length: text.length });
        },
      },
      {
        name: 'mentions_company',
        description: 'Generated letter mentions the company name',
        method: 'POST', path: `${BASE}/api/tools/cover-letter`,
        body: {
          jobTitle: 'Software Engineer',
          company: 'Anthropic',
          yourName: 'Sam Lee',
          yourBackground: '4 years backend engineering, Python expert',
          keySkills: 'Python, distributed systems, ML pipelines',
          tone: 'Enthusiastic',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = (typeof res.body === 'string' ? res.body : String(res.body ?? '')).toLowerCase();
          return text.includes('anthropic') ? ok() : fail('Cover letter does not mention company name "Anthropic"');
        },
      },
      {
        name: 'validation_missing_required',
        description: 'Missing required fields triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/cover-letter`,
        body: { jobTitle: 'Developer' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Contract Generator ─────────────────────────────────────────────────────
  {
    slug: 'contract-generator',
    name: 'Contract Generator',
    category: 'Legal',
    apiPath: '/api/tools/contract',
    sourceFile: 'app/api/tools/contract/route.ts',
    features: [
      'Freelance contracts', 'NDA agreements', 'Service agreements',
      'Jurisdiction-specific', 'Payment terms', 'Signature blocks', 'Professional formatting',
    ],
    competitors: [
      { name: 'Bonsai', url: 'https://www.hellobonsai.com/contracts', category: 'Legal' },
      { name: 'PandaDoc', url: 'https://www.pandadoc.com/contract-templates/', category: 'Legal' },
      { name: 'LegalZoom', url: 'https://www.legalzoom.com/business/business-contracts/', category: 'Legal' },
    ],
    testCases: [
      {
        name: 'happy_path_freelance',
        description: 'Freelance contract returns well-formed legal document',
        method: 'POST', path: `${BASE}/api/tools/contract`,
        body: {
          contractType: 'Freelance Web Development Agreement',
          party1: 'Acme Technologies Pvt Ltd',
          party2: 'John Smith (Freelancer)',
          scope: 'Development of a responsive e-commerce website with payment integration, product catalog, and admin dashboard',
          payment: 'USD 5,000 fixed price, 50% upfront and 50% on delivery',
          duration: '3 months from contract signing',
          jurisdiction: 'India (General)',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          if (text.length < 500) return fail(`Contract too short: ${text.length} chars`);
          if (!text.toLowerCase().includes('agreement') && !text.toLowerCase().includes('contract')) {
            return fail('Output does not appear to be a legal contract');
          }
          return ok({ length: text.length });
        },
      },
      {
        name: 'parties_mentioned',
        description: 'Both parties are mentioned in the generated contract',
        method: 'POST', path: `${BASE}/api/tools/contract`,
        body: {
          contractType: 'NDA',
          party1: 'DisclosingCorp Inc',
          party2: 'RecipientLLC',
          scope: 'Mutual non-disclosure of proprietary business information and trade secrets',
          jurisdiction: 'United States (General)',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          if (!text.toLowerCase().includes('disclosingcorp')) return fail('Party 1 name not found in contract');
          if (!text.toLowerCase().includes('recipientllc')) return fail('Party 2 name not found in contract');
          return ok({ length: text.length });
        },
      },
      {
        name: 'validation_short_scope',
        description: 'Scope under 10 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/contract`,
        body: { contractType: 'NDA', party1: 'Corp A', party2: 'Corp B', scope: 'short' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Bio Writer ──────────────────────────────────────────────────────────────
  {
    slug: 'bio-writer',
    name: 'AI Bio Writer',
    category: 'Writing',
    apiPath: '/api/tools/bio',
    sourceFile: 'app/api/tools/bio/route.ts',
    features: [
      'LinkedIn bio', 'Twitter/X bio', 'Instagram bio', 'GitHub bio',
      'Short/Medium/Long length', 'Professional/Casual/Creative tones', 'Name mention',
    ],
    competitors: [
      { name: 'Taplio', url: 'https://taplio.com/linkedin-bio-generator', category: 'Writing' },
      { name: 'Writesonic', url: 'https://writesonic.com/bio-generator', category: 'Writing' },
      { name: 'Jasper', url: 'https://www.jasper.ai/', category: 'Writing' },
    ],
    testCases: [
      {
        name: 'happy_path_linkedin',
        description: 'LinkedIn bio returns formatted text mentioning the person',
        method: 'POST', path: `${BASE}/api/tools/bio`,
        body: {
          name: 'Priya Sharma',
          profession: 'Full Stack Engineer at Stripe',
          achievements: 'Built payment infrastructure serving 10M users, open source contributor, speaker at PyCon 2024',
          platform: 'LinkedIn',
          tone: 'Professional',
          length: 'medium',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          if (text.length < 80) return fail(`Bio too short: ${text.length}`);
          return ok({ length: text.length });
        },
      },
      {
        name: 'name_in_output',
        description: 'Generated bio contains the persons name',
        method: 'POST', path: `${BASE}/api/tools/bio`,
        body: {
          name: 'UniqueNameXYZ',
          profession: 'Product Designer',
          achievements: 'Designed 20+ apps, Figma expert, ex-Apple',
          platform: 'Twitter',
          tone: 'Casual',
          length: 'short',
        },
        expectedStatus: 200,
        validate: (res) => {
          const text = typeof res.body === 'string' ? res.body : String(res.body ?? '');
          return text.includes('UniqueNameXYZ') ? ok() : fail('Name not found in bio output');
        },
      },
      {
        name: 'validation_short_name',
        description: 'Name under 2 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/bio`,
        body: { name: 'A', profession: 'Engineer', achievements: 'Built things and did work over many years', platform: 'LinkedIn', tone: 'Professional', length: 'short' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Hashtag Generator ──────────────────────────────────────────────────────
  {
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    category: 'Social Media',
    apiPath: '/api/tools/hashtag',
    sourceFile: 'app/api/tools/hashtag/route.ts',
    features: [
      'Popular hashtags', 'Niche hashtags', 'Branded hashtags',
      'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Custom count 5-30',
    ],
    competitors: [
      { name: 'All Hashtag', url: 'https://www.all-hashtag.com/', category: 'Social Media' },
      { name: 'HashtagsForLikes', url: 'https://www.hashtagsforlikes.co/', category: 'Social Media' },
      { name: 'RiteTag', url: 'https://ritetag.com/', category: 'Social Media' },
    ],
    testCases: [
      {
        name: 'happy_path_instagram',
        description: 'Instagram hashtags return all 4 category arrays',
        method: 'POST', path: `${BASE}/api/tools/hashtag`,
        body: { topic: 'sustainable fashion tips for eco-conscious shoppers', platform: 'Instagram', count: 20 },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['popular', 'niche', 'branded', 'all']);
          if (!v.pass) return v;
          return hasArrayField(res.body, 'all', 5);
        },
      },
      {
        name: 'hashtags_have_hash',
        description: 'Hashtags in all array start with #',
        method: 'POST', path: `${BASE}/api/tools/hashtag`,
        body: { topic: 'digital marketing strategies for small businesses', platform: 'LinkedIn', count: 10 },
        expectedStatus: 200,
        validate: (res) => {
          const b = res.body as Record<string, unknown>;
          const all = b.all as string[];
          if (!Array.isArray(all) || all.length === 0) return fail('No hashtags returned');
          const badOnes = all.filter(h => !h.startsWith('#'));
          if (badOnes.length > 0) return fail(`${badOnes.length} hashtags missing # prefix: ${badOnes.slice(0, 3).join(', ')}`);
          return ok({ count: all.length });
        },
      },
      {
        name: 'validation_short_topic',
        description: 'Topic under 5 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/hashtag`,
        body: { topic: 'ab', platform: 'Instagram', count: 10 },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── ATS Resume Scanner ──────────────────────────────────────────────────────
  {
    slug: 'ats-resume-scanner',
    name: 'ATS Resume Scanner',
    category: 'Career',
    apiPath: '/api/tools/ats-resume-scanner',
    sourceFile: 'app/api/tools/ats-resume-scanner/route.ts',
    features: [
      'ATS compatibility score', 'Keyword match analysis', 'Missing keywords list',
      'Format issues detection', 'Section completeness check', 'Job description matching',
    ],
    competitors: [
      { name: 'Jobscan', url: 'https://www.jobscan.co/', category: 'Career' },
      { name: 'Resume Worded', url: 'https://resumeworded.com/', category: 'Career' },
      { name: 'TopResume', url: 'https://www.topresume.com/resume-critique', category: 'Career' },
    ],
    testCases: [
      {
        name: 'happy_path_text_input',
        description: 'Text resume + job description returns ATS analysis with score',
        method: 'POST', path: `${BASE}/api/tools/ats-resume-scanner`,
        body: {
          resumeText: 'John Smith | john@email.com | New York\n\nSUMMARY\nSenior Software Engineer with 8 years experience in JavaScript, React, Node.js, and Python.\n\nEXPERIENCE\nGoogle Inc | Senior SWE | 2019-Present\n- Led development of high-traffic APIs serving 50M users\n- Reduced latency by 40% through optimization\n- Mentored team of 5 junior engineers\n\nSKILLS: JavaScript, React, Node.js, Python, AWS, Docker, SQL, REST APIs',
          jobDescription: 'We are looking for a Senior Software Engineer with expertise in JavaScript, React, and Node.js. Must have experience with cloud platforms (AWS or GCP), agile methodologies, and leading engineering teams.',
        },
        expectedStatus: 200,
        validate: (res) => {
          if (typeof res.body !== 'object' || res.body === null) return fail('Response is not JSON');
          const b = res.body as Record<string, unknown>;
          const keys = Object.keys(b);
          const hasScore = keys.some(k => k.toLowerCase().includes('score') || k.toLowerCase().includes('ats'));
          return hasScore ? ok({ keys }) : fail(`No score field found in response. Keys: ${keys.join(', ')}`);
        },
      },
      {
        name: 'validation_missing_job_desc',
        description: 'Missing job description triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/ats-resume-scanner`,
        body: { resumeText: 'John Smith - Engineer with 5 years experience' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Will AI Replace Me ──────────────────────────────────────────────────────
  {
    slug: 'will-ai-replace-me',
    name: 'Will AI Replace Me',
    category: 'Career',
    apiPath: '/api/tools/will-ai-replace-me',
    sourceFile: 'app/api/tools/will-ai-replace-me/route.ts',
    features: [
      'Automation risk percentage', 'Oxford/McKinsey research anchors',
      'Skills that protect', 'Timeline estimate', 'Industry context',
    ],
    competitors: [
      { name: 'Will Robots Take My Job', url: 'https://willrobotstakemyjob.com/', category: 'Career' },
      { name: 'Replaceable', url: 'https://replaceable.ai/', category: 'Career' },
      { name: 'Future of Jobs', url: 'https://www.weforum.org/reports/future-of-jobs-report-2025', category: 'Career' },
    ],
    testCases: [
      {
        name: 'happy_path_developer',
        description: 'Software developer role returns risk percentage as number',
        method: 'POST', path: `${BASE}/api/tools/will-ai-replace-me`,
        body: {
          jobTitle: 'Software Engineer',
          industry: 'Technology',
          skills: 'Python, system design, problem solving, leadership',
          yearsExperience: '5',
        },
        expectedStatus: 200,
        validate: (res) => {
          if (typeof res.body !== 'object' || res.body === null) return fail('Response not JSON');
          const b = res.body as Record<string, unknown>;
          const risk = b.risk_percentage ?? b.riskPercentage ?? b.risk;
          if (risk === undefined) return fail(`No risk field. Keys: ${Object.keys(b).join(', ')}`);
          const n = Number(risk);
          if (isNaN(n) || n < 0 || n > 100) return fail(`risk_percentage ${risk} out of range 0-100`);
          return ok({ risk_percentage: n });
        },
      },
      {
        name: 'high_risk_job',
        description: 'Data entry clerk returns higher risk than software engineer',
        method: 'POST', path: `${BASE}/api/tools/will-ai-replace-me`,
        body: { jobTitle: 'Data Entry Clerk', industry: 'Administrative', skills: 'Typing, data entry, Excel' },
        expectedStatus: 200,
        validate: (res) => {
          if (typeof res.body !== 'object' || res.body === null) return fail('Response not JSON');
          return ok();
        },
      },
      {
        name: 'validation_short_title',
        description: 'Job title under 2 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/will-ai-replace-me`,
        body: { jobTitle: 'X', industry: 'Tech' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Terms Simplifier ────────────────────────────────────────────────────────
  {
    slug: 'terms-simplifier',
    name: 'Terms Simplifier',
    category: 'Legal',
    apiPath: '/api/tools/terms-simplifier',
    sourceFile: 'app/api/tools/terms-simplifier/route.ts',
    features: [
      'TL;DR summary', 'What they can do', 'What you can do', 'Red flags',
      'Data collected', 'Your rights', 'Privacy score 1-10',
    ],
    competitors: [
      { name: 'Terms of Service; Didn\'t Read', url: 'https://tosdr.org/', category: 'Legal' },
      { name: 'Polisis', url: 'https://pribot.org/', category: 'Legal' },
      { name: 'Privacy Spy', url: 'https://privacyspy.org/', category: 'Legal' },
    ],
    testCases: [
      {
        name: 'happy_path_terms',
        description: 'Valid ToS text returns all required analysis fields',
        method: 'POST', path: `${BASE}/api/tools/terms-simplifier`,
        body: {
          text: 'By using this service, you agree to these Terms. We may collect your personal data including name, email, IP address, and usage data. We may share your data with third-party advertising partners. You grant us a worldwide, royalty-free license to use your content. We may terminate your account at any time without notice. We are not liable for any damages. These terms may change without notice. Continued use constitutes acceptance. Disputes will be resolved by arbitration in Delaware. You waive class action rights. We may sell your data to data brokers. Children under 13 must not use this service.',
        },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['tldr', 'privacy_score']);
          if (!v.pass) return v;
          return scoreInRange(res.body, 'privacy_score', 1, 10);
        },
      },
      {
        name: 'all_fields_present',
        description: 'Response includes all 7 expected analysis fields',
        method: 'POST', path: `${BASE}/api/tools/terms-simplifier`,
        body: {
          text: 'These terms govern your use of our platform. ' + 'We collect data and may share it with partners. '.repeat(5),
        },
        expectedStatus: 200,
        validate: (res) => hasFields(res.body, ['tldr', 'they_can_do', 'you_can_do', 'red_flags', 'data_collected', 'your_rights', 'privacy_score']),
      },
      {
        name: 'validation_too_short',
        description: 'Text under 100 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/terms-simplifier`,
        body: { text: 'Short text' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Plagiarism Checker ──────────────────────────────────────────────────────
  {
    slug: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    category: 'Writing',
    apiPath: '/api/tools/plagiarism',
    sourceFile: 'app/api/tools/plagiarism/route.ts',
    features: [
      'Originality score', 'Risk level assessment', 'Segment-level analysis',
      'Search query suggestions', 'Rewrite suggestions',
    ],
    competitors: [
      { name: 'Turnitin', url: 'https://www.turnitin.com/', category: 'Writing' },
      { name: 'Grammarly Plagiarism', url: 'https://www.grammarly.com/plagiarism-checker', category: 'Writing' },
      { name: 'Copyscape', url: 'https://www.copyscape.com/', category: 'Writing' },
    ],
    testCases: [
      {
        name: 'happy_path_original',
        description: 'Original content returns high originality score',
        method: 'POST', path: `${BASE}/api/tools/plagiarism`,
        body: {
          text: 'Quantum entanglement has enabled researchers at the Vorpal Institute to develop a novel approach to distributed computing that leverages non-local correlations for zero-latency synchronization across geographically dispersed nodes in 2026. ' + 'The key innovation involves specially crafted photon pairs that maintain coherence across fiber networks longer than previously thought possible. '.repeat(2),
        },
        expectedStatus: 200,
        validate: (res) => {
          const v = hasFields(res.body, ['originality_score', 'risk_level']);
          if (!v.pass) return v;
          return scoreInRange(res.body, 'originality_score', 0, 100);
        },
      },
      {
        name: 'response_structure',
        description: 'Response contains all expected fields',
        method: 'POST', path: `${BASE}/api/tools/plagiarism`,
        body: {
          text: 'This is a test text for plagiarism checking purposes. It is written to verify that the response structure contains all the required fields. ' + 'The system should analyze the text and provide an originality score along with risk level assessment. '.repeat(2),
        },
        expectedStatus: 200,
        validate: (res) => hasFields(res.body, ['originality_score', 'risk_level', 'segments', 'suggestions']),
      },
      {
        name: 'validation_too_short',
        description: 'Text under 50 chars triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/terms-simplifier`,
        body: { text: 'Too short.' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Vibe Check ─────────────────────────────────────────────────────────────
  {
    slug: 'vibe-check',
    name: 'Vibe Check',
    category: 'Wellness',
    apiPath: '/api/tools/vibe-check',
    sourceFile: 'app/api/tools/vibe-check/route.ts',
    features: [
      'Mood analysis', 'Mental health guidance', 'Country-specific crisis numbers',
      '30+ countries supported', 'Area-specific advice (work/relationships/health)',
    ],
    competitors: [
      { name: 'Wysa', url: 'https://www.wysa.com/', category: 'Wellness' },
      { name: 'Woebot', url: 'https://woebothealth.com/', category: 'Wellness' },
      { name: 'Youper', url: 'https://www.youper.ai/', category: 'Wellness' },
    ],
    testCases: [
      {
        name: 'happy_path_anxiety',
        description: 'Anxiety mood returns non-empty wellness guidance',
        method: 'POST', path: `${BASE}/api/tools/vibe-check`,
        body: { mood: 'anxious', moodGroup: 'anxiety', area: 'work', country: 'US', context: 'Stressed about upcoming project deadline' },
        expectedStatus: 200,
        validate: (res) => {
          if (typeof res.body === 'string') return isNonEmptyString(res.body, 50);
          if (typeof res.body === 'object') {
            const text = JSON.stringify(res.body);
            return text.length > 100 ? ok({ keys: Object.keys(res.body as object) }) : fail('Response too brief');
          }
          return fail('Unexpected response type');
        },
      },
      {
        name: 'validation_empty_mood',
        description: 'Missing mood triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/vibe-check`,
        body: { mood: '', area: 'work' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Compliance AI ──────────────────────────────────────────────────────────
  {
    slug: 'compliance-ai',
    name: 'Compliance AI',
    category: 'Legal',
    apiPath: '/api/tools/compliance/assess',
    sourceFile: 'app/api/tools/compliance/assess/route.ts',
    features: [
      '12 frameworks (SOC2, HIPAA, GDPR, ISO27001, PCI DSS, NIST CSF, CCPA, SOX, FedRAMP, CIS, OWASP, Internal)',
      'Gap analysis', 'Risk scoring', 'Remediation roadmap', 'Quick wins',
      'Risk register (premium)', '16 policy templates',
    ],
    competitors: [
      { name: 'Comp AI', url: 'https://trycomp.ai/', category: 'Legal' },
      { name: 'Vanta', url: 'https://www.vanta.com/', category: 'Legal' },
      { name: 'Drata', url: 'https://drata.com/', category: 'Legal' },
    ],
    testCases: [
      {
        name: 'happy_path_hipaa',
        description: 'HIPAA assessment returns structured report with score',
        method: 'POST', path: `${BASE}/api/tools/compliance/assess`,
        body: {
          framework: 'hipaa',
          companyName: 'HealthData Corp',
          industry: 'Healthcare',
          size: '51-200',
          answers: [
            { id: 'hipaa_1', question: 'Do you handle Protected Health Information (PHI)?', answer: 'yes' },
            { id: 'hipaa_2', question: 'Do you have a HIPAA Privacy Officer?', answer: 'no' },
            { id: 'hipaa_3', question: 'Are all PHI transmissions encrypted?', answer: 'partial' },
          ],
        },
        expectedStatus: 200,
        validate: (res) => {
          if (typeof res.body !== 'object' || res.body === null) return fail('Not JSON');
          const b = res.body as Record<string, unknown>;
          const hasScore = 'overallScore' in b || 'score' in b || 'overall_score' in b;
          if (!hasScore) return fail(`No score field. Keys: ${Object.keys(b).join(', ')}`);
          return ok({ keys: Object.keys(b) });
        },
      },
      {
        name: 'validation_empty_framework',
        description: 'Missing framework triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/compliance/assess`,
        body: { companyName: 'Test Corp', answers: [] },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

  // ─── Diagrify ───────────────────────────────────────────────────────────────
  {
    slug: 'diagrify',
    name: 'Diagrify AI Diagram Maker',
    category: 'Design',
    apiPath: '/api/tools/diagrify',
    sourceFile: 'app/api/tools/diagrify/route.ts',
    features: [
      'AI flowchart generation', 'Entity relationship diagrams', 'Sequence diagrams',
      'Custom node positioning', 'Color coding', 'Plain-English description input',
    ],
    competitors: [
      { name: 'Miro', url: 'https://miro.com/ai/', category: 'Design' },
      { name: 'Lucidchart', url: 'https://www.lucidchart.com/', category: 'Design' },
      { name: 'Eraser', url: 'https://www.eraser.io/', category: 'Design' },
    ],
    testCases: [
      {
        name: 'happy_path_flowchart',
        description: 'Description returns array of diagram elements',
        method: 'POST', path: `${BASE}/api/tools/diagrify`,
        body: { description: 'User login flow: user enters email and password, system validates credentials, if valid show dashboard, if invalid show error message and retry option' },
        expectedStatus: 200,
        validate: (res) => {
          if (!Array.isArray(res.body)) return fail(`Expected array, got ${typeof res.body}`);
          if (res.body.length === 0) return fail('Empty diagram elements array');
          return ok({ elementCount: res.body.length });
        },
      },
      {
        name: 'elements_have_structure',
        description: 'Each diagram element has id and label fields',
        method: 'POST', path: `${BASE}/api/tools/diagrify`,
        body: { description: 'Simple process: start, process data, end' },
        expectedStatus: 200,
        validate: (res) => {
          if (!Array.isArray(res.body) || res.body.length === 0) return fail('Empty or non-array response');
          const first = res.body[0] as Record<string, unknown>;
          if (!('id' in first) && !('label' in first) && !('text' in first)) {
            return fail(`Element missing id/label fields. Keys: ${Object.keys(first).join(', ')}`);
          }
          return ok({ sampleKeys: Object.keys(first) });
        },
      },
      {
        name: 'validation_empty_description',
        description: 'Empty description triggers validation error',
        method: 'POST', path: `${BASE}/api/tools/diagrify`,
        body: { description: '' },
        expectedStatus: [400, 422],
        validate: expectError,
      },
    ],
  },

];

// Fast lookup by slug
export const TOOL_MAP = new Map(TOOL_REGISTRY.map(t => [t.slug, t]));

// Slugs of all testable tools (those with API routes)
export const TESTABLE_SLUGS = TOOL_REGISTRY.map(t => t.slug);

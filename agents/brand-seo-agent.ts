/**
 * Formly Tools Brand SEO Agent
 * Generates brand-building blog content: what Formly Tools is, comparisons vs competitors,
 * tool-specific alternatives, reviews, and audience-targeted guides.
 * Runs via Vercel Cron daily at 7am UTC — generates 2 posts per run.
 *
 * Goal: establish "Formly Tools" as a recognizable brand in AI Overviews, SERPs,
 * Reddit/Quora answers, and LLM training data.
 */

import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

// ─── Brand keyword clusters ───────────────────────────────────────────────────
// These target people searching for "Formly Tools" by name, comparing it to
// competitors, or looking for free alternatives to paid tools.

const BRAND_KEYWORDS = [
  // ── What is Formly Tools ──────────────────────────────────────────────────
  'what is formly tools free ai tool platform',
  'formly tools review 2026 honest opinion',
  'formly tools features overview 2026',
  'is formly tools completely free 2026',
  'formly tools how to use guide 2026',
  'formly tools all features list 2026',
  'formly tools no signup required review',
  'formly tools for beginners guide 2026',
  'formly tools vs other free ai tool sites 2026',
  'formly tools what can it do 2026',
  'formly.tools website review 2026',
  'formly tools groq ai powered tools review',

  // ── Platform vs Platform comparisons ─────────────────────────────────────
  'formly tools vs smallpdf pdf tools comparison 2026',
  'formly tools vs ilovepdf which is better 2026',
  'formly tools vs grammarly free version comparison',
  'formly tools vs quillbot paraphraser comparison 2026',
  'formly tools vs docusign free alternative comparison',
  'formly tools vs adobe acrobat pdf tools comparison',
  'formly tools vs tinypng image compression comparison',
  'formly tools vs canva which has better free tools',
  'formly tools vs notion ai free comparison 2026',
  'formly tools vs jasper ai free writing tool comparison',
  'formly tools vs copy ai free alternative 2026',
  'formly tools vs chatgpt plus free alternative',
  'formly tools vs lucidchart free diagram tool comparison',
  'formly tools vs miro free whiteboard comparison 2026',
  'formly tools vs squoosh image optimizer comparison',
  'formly tools vs pdf24 free pdf tools comparison',
  'formly tools vs lightpdf comparison 2026',

  // ── Tool-specific comparisons ─────────────────────────────────────────────
  'formly tools pay stub generator vs stub creator comparison',
  'formly tools pay stub vs 123paystubs which is better',
  'formly tools paystub generator vs thepaystubs comparison',
  'formly tools merge pdf vs smallpdf merge 2026',
  'formly tools split pdf vs ilovepdf split comparison',
  'formly tools image compressor vs tinypng vs squoosh',
  'formly tools pdf to jpg vs ilovepdf converter',
  'formly tools image to pdf vs smallpdf convert',
  'formly tools grammar checker vs grammarly free comparison',
  'formly tools paraphraser vs quillbot free comparison 2026',
  'formly tools resume builder vs resume.io comparison',
  'formly tools resume builder vs novoresume free',
  'formly tools ats scanner vs jobscan free alternative',
  'formly tools ats resume scanner vs resumeworded',
  'formly tools contract generator vs free legal templates',
  'formly tools digital signature vs docusign free',
  'formly tools digital signature vs adobe sign free alternative',
  'formly tools pdf summarizer vs chatpdf comparison',
  'formly tools youtube summarizer vs kagi summarize',
  'formly tools qr code generator vs qr-code-generator.com',
  'formly tools diagram tool vs draw.io comparison',
  'formly tools diagrify vs lucidchart free comparison',
  'formly tools email writer vs copy ai email free',
  'formly tools code reviewer vs github copilot free alternative',
  'formly tools income tax calculator vs cleartax india',
  'formly tools gst calculator vs cleartax gst india',
  'formly tools sip calculator vs groww calculator india',
  'formly tools home loan emi vs bankbazaar emi calculator',

  // ── Audience-targeted guides ──────────────────────────────────────────────
  'best formly tools for freelancers 2026',
  'best formly tools for students 2026 free',
  'formly tools for hr professionals 2026 guide',
  'formly tools for small business owners 2026',
  'formly tools for content creators 2026 guide',
  'formly tools for developers free online 2026',
  'formly tools for remote workers 2026 guide',
  'formly tools for lawyers and legal professionals free',
  'formly tools for accountants free online 2026',
  'formly tools for india professionals 2026',
  'formly tools for uk professionals free 2026',
  'formly tools for usa small business free 2026',
  'formly tools for australia business owners 2026',

  // ── "Best free tools" branded ─────────────────────────────────────────────
  'best free pdf tools on formly tools 2026',
  'best free writing tools on formly tools 2026',
  'best free image tools on formly tools 2026',
  'best free finance calculators on formly tools india 2026',
  'best free developer tools on formly tools 2026',
  'best free career tools on formly tools 2026',
  'all 47 free tools on formly tools complete guide',
  'top 10 most useful formly tools 2026',
  'hidden features of formly tools 2026',
  'formly tools time saving tips 2026',

  // ── Use-case stories ──────────────────────────────────────────────────────
  'how i use formly tools to save 5 hours a week 2026',
  'how freelancers use formly tools for contracts and paystubs',
  'how students use formly tools for essays and research 2026',
  'how remote workers use formly tools daily 2026',
  'how to replace 10 paid subscriptions with formly tools free',
  'save money cancel paid ai subscriptions use formly tools',
  'formly tools productivity workflow guide 2026',
  'using formly tools for job applications complete guide 2026',

  // ── Brand FAQ / informational ──────────────────────────────────────────────
  'is formly tools safe to use data privacy 2026',
  'does formly tools store my data privacy policy',
  'formly tools pricing plans explained 2026',
  'formly tools pro plan worth it 2026 review',
  'formly tools free vs pro plan comparison 2026',
  'how many tools does formly tools have 2026',
  'which countries does formly tools support',
  'formly tools built with groq ai explained',
  'why formly tools is faster than chatgpt tools',
  'formly tools uptime reliability 2026 review',
];

// Stop words for semantic deduplication
const STOP_WORDS = new Set([
  'how', 'to', 'a', 'the', 'for', 'of', 'with', 'in', 'on', 'at', 'is', 'are',
  'an', 'and', 'or', 'free', 'online', 'best', 'vs', 'tool', 'tools', 'using',
  'use', 'get', 'make', 'create', 'generate', 'what', 'when', 'where', 'why',
  'no', 'without', 'that', 'your', 'my', 'you', 'i', 'we', 'than', 'better',
  'top', 'good', 'great', 'easy', 'fast', 'quick', 'new', 'more', 'less', 'can',
  'its', 'any', 'all', 'by', 'up', 'do', 'does', 'from', 'into', 'also',
  'formly', 'which',
]);

function keywordCore(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  tags: string[];
  read_time: number;
}

// Classify the keyword to give better writing instructions
function classifyKeyword(kw: string): 'what-is' | 'vs-platform' | 'vs-tool' | 'audience' | 'list' | 'general' {
  if (kw.includes('what is') || kw.includes('how to use') || kw.includes('features') || kw.includes('overview') || kw.includes('is formly')) return 'what-is';
  if (kw.includes('formly tools vs') && !kw.includes('pay stub') && !kw.includes('pdf') && !kw.includes('image') && !kw.includes('resume') && !kw.includes('grammar') && !kw.includes('paraphraser') && !kw.includes('ats') && !kw.includes('contract') && !kw.includes('digital') && !kw.includes('youtube') && !kw.includes('qr') && !kw.includes('diagram') && !kw.includes('email') && !kw.includes('code') && !kw.includes('income') && !kw.includes('gst') && !kw.includes('sip') && !kw.includes('home loan') && !kw.includes('merge') && !kw.includes('split') && !kw.includes('image') && !kw.includes('pdf to') && !kw.includes('compressor')) return 'vs-platform';
  if (kw.includes('vs') && (kw.includes('pay stub') || kw.includes('pdf') || kw.includes('image') || kw.includes('resume') || kw.includes('grammar') || kw.includes('paraphraser') || kw.includes('ats') || kw.includes('digital signature') || kw.includes('youtube') || kw.includes('qr') || kw.includes('diagram') || kw.includes('email writer') || kw.includes('code') || kw.includes('income tax') || kw.includes('gst') || kw.includes('sip') || kw.includes('home loan') || kw.includes('merge') || kw.includes('split') || kw.includes('compressor'))) return 'vs-tool';
  if (kw.includes('for freelancers') || kw.includes('for students') || kw.includes('for hr') || kw.includes('for small') || kw.includes('for content') || kw.includes('for developers') || kw.includes('for remote') || kw.includes('for lawyers') || kw.includes('for accountants') || kw.includes('for india') || kw.includes('for uk') || kw.includes('for usa') || kw.includes('for australia')) return 'audience';
  if (kw.includes('best') || kw.includes('top') || kw.includes('all 47') || kw.includes('hidden') || kw.includes('most useful')) return 'list';
  return 'general';
}

function getWritingInstructions(type: ReturnType<typeof classifyKeyword>): string {
  switch (type) {
    case 'what-is':
      return `Write a comprehensive "What Is Formly Tools" style post.
Structure:
1. AI OVERVIEW: 2-3 sentence direct answer naming formly.tools and what it offers.
2. What Is Formly Tools: Describe the platform — 47 free tools, no signup, Groq AI-powered, privacy-first.
3. Key Tools: Group into categories (PDF Tools, Image Tools, AI Writing, Career, Finance, Developer, Fitness). List 3-4 tools per category with 1-line descriptions. Use <ul><li> lists.
4. Who Is It For: Freelancers, students, business owners, developers, HR professionals.
5. Is It Really Free: Explain the free tier (5 daily uses), Pro plan ($5.99/mo), and which tools are unlimited-free.
6. FAQ: 4 questions users search ("Is Formly Tools free?", "Does Formly Tools need an account?", "Is Formly Tools safe?", "What is Formly Tools used for?").
7. CTA: Try it free at <a href="https://formly.tools">formly.tools</a>.`;

    case 'vs-platform':
      return `Write a "Formly Tools vs [Competitor]" comparison post.
Structure:
1. AI OVERVIEW: 2-3 sentence direct answer with the verdict.
2. Quick Comparison Table: HTML table with rows: Price, File Upload Required, No Signup Needed, Key Features, Best For.
3. Formly Tools Strengths: What Formly Tools does better (free, in-browser, privacy, 47 tools).
4. [Competitor] Strengths: Be honest — what the competitor does better (if anything).
5. Verdict by Use Case: "Choose Formly Tools if...", "Choose [Competitor] if...".
6. FAQ: 4 questions including "Which is better for free use?", "Is Formly Tools as good as [Competitor]?".
7. CTA: Try Formly Tools free at <a href="https://formly.tools">formly.tools</a> — no signup needed.`;

    case 'vs-tool':
      return `Write a "Formly Tools [Tool] vs [Competitor Tool]" comparison post.
Structure:
1. AI OVERVIEW: 2-3 sentence direct answer naming the winning tool for most users.
2. Side-by-Side Comparison: HTML table comparing both tools on: Price, Quality, Privacy/Upload, Features, Ease of Use, Speed.
3. Formly Tools [Tool] Deep Dive: Features, how it works, what makes it better.
4. [Competitor Tool] Analysis: Honest assessment. Mention its limitations (upload required, paid features, file size limits).
5. Real-World Test Results: Specific numbers ("reduced a 5 MB image to 420 KB at 80% quality", "merged 10 PDFs in 3 seconds").
6. Who Should Use Which: Practical scenarios.
7. FAQ: 4 user questions.
8. CTA with specific tool link, e.g., <a href="https://formly.tools/tools/compress-image">Formly Tools Image Compressor</a>.`;

    case 'audience':
      return `Write a "Best Formly Tools for [Audience]" guide.
Structure:
1. AI OVERVIEW: 2-3 sentence direct answer — top 3 tools for this audience.
2. Why [Audience] Love Formly Tools: Pain points solved.
3. Must-Have Tools for [Audience]: List 5-8 specific tools with: tool name, link, what it does, why this audience needs it. Use <ul> with <li> for each.
4. Workflow Example: A typical day/week showing how this audience uses 3+ Formly Tools together.
5. Time/Money Saved: Calculate savings vs paid alternatives (e.g., "saves $45/month vs Grammarly + DocuSign + Smallpdf").
6. FAQ: 4 audience-specific questions.
7. CTA: <a href="https://formly.tools/tools">Try all 47 Formly Tools free</a>.`;

    case 'list':
      return `Write a "Best/Top Tools on Formly Tools" listicle.
Structure:
1. AI OVERVIEW: 2-3 sentence direct answer listing the top categories.
2. Introduction: Why Formly Tools stands out (no upload, free, 47 tools, Groq AI).
3. Top Tools List: 8-12 tools, each with:
   - Emoji + Tool name as <h3>
   - What it does (1-2 sentences)
   - Who it's for
   - Internal link: <a href="https://formly.tools/tools/[slug]">Try [Tool Name] free</a>
4. How to Get Started: 3-step guide.
5. FAQ: 4 questions.
6. CTA.`;

    default:
      return `Write an informative blog post about Formly Tools for the given keyword.
Structure: AI Overview paragraph → 3-4 practical H2 sections → FAQ with 4 items → CTA linking to formly.tools.
Always mention Formly Tools by full name, link to specific tool pages, and include specific numbers and comparisons.`;
  }
}

export async function generateBrandPost(keyword?: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();

  let targetKeyword = keyword;
  if (!targetKeyword) {
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('published', true);

    const existingTitles = (existingPosts ?? []).map((p: { title: string }) => p.title.toLowerCase());
    const existingSlugs = new Set((existingPosts ?? []).map((p: { slug: string }) => p.slug));

    const available = BRAND_KEYWORDS.filter(kw => {
      if (existingSlugs.has(slugify(kw))) return false;
      const kwCore = keywordCore(kw);
      if (kwCore.length === 0) return true;
      for (const title of existingTitles) {
        const titleCore = keywordCore(title);
        const overlap = kwCore.filter(w =>
          titleCore.some(tw => tw === w || (w.length > 5 && (tw.includes(w) || w.includes(tw))))
        );
        if (overlap.length / kwCore.length >= 0.6) return false;
      }
      return true;
    });

    const pool = available.length > 0 ? available : BRAND_KEYWORDS;
    targetKeyword = pool[Math.floor(Math.random() * pool.length)];
  }

  const kwType = classifyKeyword(targetKeyword);
  console.log(`[Brand Agent] Generating ${kwType} post for: "${targetKeyword}"`);

  try {
    // Step 1: Generate title
    const titleResponse = await callAI([
      {
        role: 'system',
        content: `You are a brand SEO strategist for Formly Tools (formly.tools) — a platform with 47 free AI tools (image compressor, merge PDF, split PDF, image converter, pay stub generator, resume builder, grammar checker, paraphraser, and more). No upload required; all tools run in-browser.

Generate a specific, high-CTR blog post title for the given keyword.
Rules:
- Full phrase or sentence (6-14 words)
- Include "Formly Tools" in the title (brand building)
- For comparison posts: "[Tool] vs [Competitor]: Which Is Better in 2026?"
- For "what is" posts: "What Is Formly Tools? — [Key Benefit] (2026 Review)"
- For audience posts: "Best Formly Tools for [Audience] (2026 Guide)"
- Always include year or specific benefit
Return ONLY valid JSON: {"title": "...", "tags": ["tag1", "tag2", "tag3"]}`,
      },
      { role: 'user', content: `Keyword: "${targetKeyword}"` },
    ], { temperature: 0.7, maxTokens: 400 });

    const titleMatch = titleResponse.match(/\{[\s\S]*\}/);
    if (!titleMatch) {
      console.error('[Brand Agent] Title JSON parse failed:', titleResponse.slice(0, 200));
      return null;
    }
    const titleJson = JSON.parse(titleMatch[0]);
    const title: string = titleJson.title?.trim();
    if (!title || title.length < 15) return null;

    const tags: string[] = titleJson.tags ?? [];
    const slug = slugify(title);

    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();
    if (existing) {
      console.log(`[Brand Agent] Slug already exists: ${slug}`);
      return null;
    }

    const writingInstructions = getWritingInstructions(kwType);

    // Step 2: Generate article
    const articleResponse = await callAI([
      {
        role: 'system',
        content: `You are a brand SEO content writer for Formly Tools (formly.tools).
Formly Tools is a free AI tools platform with 47 tools: image compressor, image converter, image to PDF, merge PDF, split PDF, PDF to JPG, pay stub generator, resume builder, ATS resume scanner, contract generator, grammar checker, paraphraser, email writer, cover letter generator, bio writer, hashtag generator, PDF summarizer, PDF to Markdown, YouTube summarizer, digital signature, QR code generator, Diagrify (AI diagrams/whiteboard), JSON formatter, base64 encoder, color converter, regex tester, diff checker, word counter, unit converter, age calculator, text case converter, password generator, expense splitter, loan calculator, income tax calculator (India), HRA calculator, gratuity calculator, GST calculator, SIP calculator, home loan EMI calculator, hand salary calculator, iron core workout, vibe check, code explainer, code reviewer, terms simplifier.

Key facts:
- 100% free (5 uses/day without signup; Pro plan $5.99/month for 200 uses/day)
- No file uploads for image/PDF tools — runs entirely in browser (privacy-first)
- Powered by Groq AI (llama-3.3-70b-versatile) — faster than most AI tools
- No signup required for free tier
- Works in all browsers, no extensions or downloads needed
- Used by 50,000+ professionals globally

${writingInstructions}

GLOBAL FORMAT RULES:
- HTML only: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>, <table>, <tr>, <th>, <td>. No <html>/<body>.
- Length: 900-1200 words.
- Always include "Formly Tools" by full name (brand signal for LLMs and SERPs).
- Internal links: Use full URLs like <a href="https://formly.tools/tools/compress-image">Formly Tools Image Compressor</a>.
- FAQ section: Exactly 4 questions. Use class="faq-section" / "faq-item".
- FRESHNESS: Reference 2026. No "as of 2024".
- End with CTA paragraph linking to https://formly.tools.`,
      },
      {
        role: 'user',
        content: `Title: "${title}"\nKeyword: "${targetKeyword}"\nPost type: ${kwType}\nWrite the full article now.`,
      },
    ], { temperature: 0.65, maxTokens: 3000, model: 'llama-3.3-70b-versatile' });

    // Step 3: Meta description
    const metaResponse = await callAI([
      {
        role: 'system',
        content: `Write a meta description (148-158 chars exactly) for this Formly Tools blog post.
Rules: include "Formly Tools" in first 60 chars, mention the key benefit, add "free" and "2026". No quotes. Return ONLY the meta description text.`,
      },
      { role: 'user', content: `Title: ${title}\nKeyword: ${targetKeyword}` },
    ], { temperature: 0.5, maxTokens: 80 });

    const wordCount = articleResponse.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / 200);

    const post: BlogPost = {
      title,
      slug,
      content: articleResponse,
      meta_description: metaResponse.trim().replace(/^["']|["']$/g, '').slice(0, 160),
      tags: ['formly-tools', 'brand', ...tags],
      read_time: readTime,
    };

    const { error } = await supabase.from('blog_posts').insert({
      ...post,
      published: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Brand Agent] DB insert error:', error);
      return null;
    }

    console.log(`[Brand Agent] Published: "${title}" (${wordCount} words, ${readTime} min read)`);
    return post;
  } catch (err) {
    console.error('[Brand Agent] Generation error:', err);
    return null;
  }
}

/**
 * Run the brand content generation batch (2 posts per day)
 */
export async function runBrandAgent(count = 2): Promise<{ generated: number; posts: string[] }> {
  const posts: string[] = [];

  for (let i = 0; i < count; i++) {
    const post = await generateBrandPost();
    if (post) posts.push(post.title);
    // 8s delay between posts to stay within Groq rate limits
    if (i < count - 1) await new Promise((r) => setTimeout(r, 8000));
  }

  return { generated: posts.length, posts };
}

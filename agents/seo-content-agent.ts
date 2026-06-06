/**
 * SEO Content Agent
 * Autonomously generates SEO-optimized blog posts targeting high-value keywords.
 * Runs via Vercel Cron daily. Zero human input required.
 *
 * 2026 strategy: AI Overviews, People Also Ask, geo-specific queries (US/UK/IN/AU/CA),
 * competitor alternatives, and long-tail informational keywords.
 */

import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

const TOOL_KEYWORDS = [
  // ── Geo-targeted pay stub / payslip ──────────────────────────────────────
  'pay stub generator usa free online 2026',
  'payslip generator uk free no signup',
  'pay stub maker canada 2026 free',
  'payslip template australia free generator',
  'salary slip generator india free download',
  'how to make a pay stub self employed',
  'how to create pay stub for contractor usa',
  'free pay stub creator no watermark 2026',
  'uk payslip calculator free online',
  'canadian pay stub generator free template',
  'new zealand payslip generator free',

  // ── Resume & Career ───────────────────────────────────────────────────────
  'free ats resume builder ai 2026 no signup',
  'how to build resume that passes ats free',
  'ai resume writer free no account needed',
  'best free resume builder 2026',
  'how to use ai for job applications 2026',
  'free cover letter generator ai 2026',
  'cover letter for software engineer free ai',
  'how to write cover letter with ai free',
  'resume builder free download pdf 2026',

  // ── Competitor alternatives (high-intent) ─────────────────────────────────
  'grammarly alternative free online no signup',
  'best grammarly free alternatives 2026',
  'chatgpt free alternative tools no login',
  'docusign alternative free for small business',
  'adobe sign alternative free online',
  'jasper ai alternative free writing tool',
  'copy ai alternative free content writer',
  'lucidchart alternative free online diagram',
  'miro alternative free online whiteboard',
  'canva whiteboard alternative free',
  'quillbot alternative free paraphraser 2026',
  'writesonic alternative free tool',
  'notion ai alternative free tools',
  'microsoft word alternative free ai online',

  // ── AI Writing tools ─────────────────────────────────────────────────────
  'ai paraphraser free better than quillbot 2026',
  'paraphrase tool free academic no sign up',
  'paraphrase essay without plagiarism ai free',
  'reword text ai free online 2026',
  'ai text rewriter free tool online',
  'grammar checker free better than grammarly 2026',
  'fix grammar spelling ai free no account',
  'ai email writer free professional 2026',
  'how to write professional emails with ai free',
  'linkedin bio generator ai free 2026',
  'professional bio generator free no signup',
  'instagram hashtag generator ai free 2026',
  'tiktok hashtag generator ai free 2026',
  'viral hashtags generator free online',

  // ── PDF & Document tools ──────────────────────────────────────────────────
  'how to summarize a pdf for free ai 2026',
  'pdf summarizer free no signup upload',
  'summarize research paper ai free online',
  'pdf to notes converter free ai tool',
  'convert pdf to text online free 2026',
  'pdf to markdown converter free online',
  'pdf text extractor free online no signup',
  'summarize long document ai free',

  // ── Developer tools ───────────────────────────────────────────────────────
  'explain code plain english ai free 2026',
  'ai code explainer free online tool',
  'free ai code reviewer online 2026',
  'how to review code with ai free tool',
  'regex tester online free with explanation',
  'test regular expressions online free',
  'json formatter validator online free',
  'pretty print json online free tool',
  'base64 encode decode online free',
  'hex to rgb color converter online',
  'color converter hex rgb hsl free',
  'diff checker online free text compare',
  'compare two texts files online free',
  'code compare tool online free developer',

  // ── Finance & Calculators ─────────────────────────────────────────────────
  'loan emi calculator free online 2026',
  'split expenses group trip calculator free',
  'expense splitter app online free 2026',
  'personal finance tools free online',
  'compound interest calculator free online',

  // ── India-specific finance (high volume) ─────────────────────────────────
  'income tax calculator india new regime 2026',
  'income tax old vs new regime comparison india 2026',
  'how to calculate income tax india fy 2025 26',
  'ctc to in hand salary calculator india 2026',
  'how much take home salary for 10 lpa india',
  'how much take home salary for 15 lpa india',
  'how much take home salary for 20 lpa india',
  'hra exemption calculator india 2026 example',
  'how to calculate hra exemption india section 10',
  'gratuity calculator india 2026 formula',
  'how to calculate gratuity india act 1972',
  'gst calculator india online free 2026',
  'add remove gst calculator india cgst sgst',
  'sip calculator with step up india 2026',
  'mutual fund sip return calculator free india',
  'home loan emi calculator india 2026 section 24b',
  'home loan tax benefit calculator india section 24',
  'professional tax india state wise 2026 guide',
  'epf pf calculator india free 2026',

  // ── Utilities ─────────────────────────────────────────────────────────────
  'qr code generator free with logo no watermark 2026',
  'qr code maker custom color free online',
  'free digital e-signature online no account 2026',
  'sign pdf online free no signup',
  'electronic signature free alternative docusign 2026',
  'free password generator strong secure',
  'strong password generator with entropy check free',
  'word counter character counter free online',
  'unit converter length weight temperature free online',
  'age calculator exact days hours free',
  'text case converter camelcase snake case free',
  'ai whiteboard flowchart generator free online',
  'ai diagram generator text to flowchart free 2026',
  'flowchart maker free online no signup',

  // ── Freelancer / business focused ─────────────────────────────────────────
  'freelance contract generator free india',
  'nda generator free online no signup 2026',
  'service agreement template free generator',
  'terms of service simplifier ai free',
  'privacy policy plain english checker free',
  'free tools for freelancers 2026',
  'free ai tools for small business 2026',
  'free productivity tools for remote workers 2026',
  'free legal document generator online',
  'how to write nda freelancer free tool',

  // ── YouTube & Media ───────────────────────────────────────────────────────
  'youtube video summarizer free no signup 2026',
  'summarize youtube video ai free tool',
  'youtube transcript summarizer ai free',
  'get key points from youtube video free',

  // ── Trending / Comparison ─────────────────────────────────────────────────
  'best free ai tools 2026 no credit card required',
  'free ai tools that replace paid subscriptions 2026',
  'ai tools for students free 2026 no signup',
  'free ai tools for teachers 2026',
  'free ai writing tools for content creators 2026',
  'ai tools that are actually completely free 2026',
  'free tools instead of chatgpt plus 2026',
  'groq llama ai tools free faster than chatgpt',
  'best free online tools for professionals 2026',
  'free ai tools for hr professionals 2026',
  'how to save money cancelling ai subscriptions',
  'free ai tools for entrepreneurs 2026',

  // ── Original set (refreshed) ──────────────────────────────────────────────
  'best free ai paraphrasing tool online 2026',
  'how to write professional emails with ai',
  'explain code to beginners free ai tool',
  'free ats resume builder ai no account',
  'instagram hashtag generator ai free',
  'free ai writing tools for students india',
  'how to use ai to save time at work 2026',
  'pdf summarizer for research papers free',
  'how to make linkedin bio with ai free',
  'how to avoid plagiarism with ai paraphraser',
];

// Stop words ignored during semantic deduplication
const STOP_WORDS = new Set([
  'how', 'to', 'a', 'the', 'for', 'of', 'with', 'in', 'on', 'at', 'is', 'are',
  'an', 'and', 'or', 'free', 'online', 'best', 'vs', 'tool', 'tools', 'using',
  'use', 'get', 'make', 'create', 'generate', 'what', 'when', 'where', 'why',
  'no', 'without', 'that', 'your', 'my', 'you', 'i', 'we', 'than', 'better',
  'top', 'good', 'great', 'easy', 'fast', 'quick', 'new', 'more', 'less', 'can',
  'its', 'any', 'all', 'by', 'up', 'do', 'does', 'from', 'into', 'also',
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

export async function generateBlogPost(keyword?: string): Promise<BlogPost | null> {
  const supabase = createAdminClient();

  let targetKeyword = keyword;
  if (!targetKeyword) {
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .eq('published', true);

    const existingTitles = (existingPosts ?? []).map((p: { title: string }) => p.title.toLowerCase());
    const existingSlugs = new Set((existingPosts ?? []).map((p: { slug: string }) => p.slug));

    // Filter out keywords already well-covered by existing posts
    const available = TOOL_KEYWORDS.filter(kw => {
      // Exact slug match
      if (existingSlugs.has(slugify(kw))) return false;

      // Semantic overlap: skip if an existing post covers 60%+ of the significant words
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

    // Prefer uncovered keywords; fall back to full list when exhausted (allows fresh angles)
    const pool = available.length > 0 ? available : TOOL_KEYWORDS;
    targetKeyword = pool[Math.floor(Math.random() * pool.length)];
  }

  console.log(`[SEO Agent] Generating post for keyword: "${targetKeyword}"`);

  try {
    // Step 1: Generate title
    const titleResponse = await callAI([
      {
        role: 'system',
        content: `You are an SEO content strategist for Formly Tools (formly.tools), a free AI tools platform with 47 tools.
Generate a specific, compelling blog post title for the given keyword.
Rules:
- Full phrase or sentence (6-12 words, max 65 chars)
- Include the keyword naturally — must match search intent exactly
- Include "Free", "2026", or a specific number where natural
- Be specific: bad = "Best AI Tool", good = "Best Free Grammarly Alternative — No Account Needed (2026)"
- Geo examples: "Pay Stub Generator UK: Free Payslip Maker 2026", "India Income Tax New vs Old Regime 2026 Calculator"
Return ONLY valid JSON: {"title": "...", "tags": ["tag1", "tag2", "tag3"]}`,
      },
      { role: 'user', content: `Keyword: "${targetKeyword}"` },
    ], { temperature: 0.7, maxTokens: 400 });

    const titleMatch = titleResponse.match(/\{[\s\S]*\}/);
    if (!titleMatch) {
      console.error('[SEO Agent] Title JSON parse failed:', titleResponse.slice(0, 200));
      return null;
    }
    const titleJson = JSON.parse(titleMatch[0]);
    const title: string = titleJson.title?.trim();
    if (!title || title.length < 15) {
      console.error('[SEO Agent] Title too short:', titleJson);
      return null;
    }
    const tags: string[] = titleJson.tags ?? [];
    const slug = slugify(title);

    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();
    if (existing) {
      console.log(`[SEO Agent] Slug already exists: ${slug}`);
      return null;
    }

    // Step 2: Generate article — targeting AI Overviews, PAA, and geo audiences
    const articleResponse = await callAI([
      {
        role: 'system',
        content: `You are an SEO content writer for Formly Tools (formly.tools), a free AI tools platform with 47 tools.
Write a blog post following 2026 search best practices.

CRITICAL STRUCTURE (in this order):
1. AI OVERVIEW PARAGRAPH: First <p> must be a 2-3 sentence direct answer. Start with the keyword. No preamble. Google uses this for AI Overviews and featured snippets.
2. MAIN SECTIONS (2-3 H2s): Practical steps, comparisons, or how-tos with bullet points. Max 3 sentences per paragraph.
3. GEO SECTION (if applicable): If topic involves pay stubs, tax, salary, contracts — add a brief H2 covering country differences: USA, UK, India, Australia, Canada.
4. FAQ SECTION: End with exactly this HTML for People Also Ask targeting:
<div class="faq-section"><h2>Frequently Asked Questions</h2>
<div class="faq-item"><h3>Question?</h3><p>Direct 2-sentence answer.</p></div>
</div>
Include 4 FAQ items matching real search queries.
5. CTA: <p>Try it free at <a href="https://formly.tools/tools">Formly Tools — 47 Free Tools</a>. No signup required.</p>

FORMAT: HTML only. Tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>. No <html>/<body>/<head>.
LENGTH: 750-1000 words.
INTERNAL LINKS: Include 3-4 links to related Formly tools, e.g., <a href="/tools/grammar-checker">free grammar checker</a>.
FRESHNESS: Reference 2026, current year stats, or "as of 2026". Never say 2024.
E-E-A-T: Use specific numbers, steps, percentages. Never vague ("some tools", "many users").`,
      },
      {
        role: 'user',
        content: `Title: "${title}"\nKeyword: "${targetKeyword}"\nWrite the article now.`,
      },
    ], { temperature: 0.6, maxTokens: 2500, model: 'llama-3.3-70b-versatile' });

    // Step 3: Meta description
    const metaResponse = await callAI([
      {
        role: 'system',
        content: `Write a meta description (148-158 chars exactly) for this blog post.
Rules: keyword in first 60 chars, include "free", add specific benefit ("no signup", "instant", "2026", or a number). No quotes. Return ONLY the meta description text.`,
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
      tags,
      read_time: readTime,
    };

    const { error } = await supabase.from('blog_posts').insert({
      ...post,
      published: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[SEO Agent] DB insert error:', error);
      return null;
    }

    console.log(`[SEO Agent] Published: "${title}" (${wordCount} words, ${readTime} min read)`);
    return post;
  } catch (err) {
    console.error('[SEO Agent] Generation error:', err);
    return null;
  }
}

/**
 * Run a full SEO content generation batch
 */
export async function runSEOAgent(count = 3): Promise<{ generated: number; posts: string[] }> {
  const posts: string[] = [];

  for (let i = 0; i < count; i++) {
    const post = await generateBlogPost();
    if (post) posts.push(post.title);
    await new Promise((r) => setTimeout(r, 5000));
  }

  return { generated: posts.length, posts };
}
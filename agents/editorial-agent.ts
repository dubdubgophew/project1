/**
 * Editorial Content Agent
 * Publishes 4 high-quality, human-style articles daily on trending, high-engagement topics.
 * Focus: career, AI/tech, finance, productivity, legal, lifestyle — all connected to Formly tools.
 *
 * Writing philosophy:
 * - Prolific human writer voice: direct, confident, varied sentence rhythm
 * - Explicit avoidance of AI tells: no "Furthermore", "In conclusion", "It's worth noting",
 *   "Delve into", "It's important to note", "Certainly", "Absolutely", "Overall"
 * - GEO optimized: geographic specifics for US, UK, India, AU, CA
 * - 900-1200 words per article
 */

import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

/* ─── Topic pool: 6 rotating categories ─────────────────────────────────── */

const TOPIC_POOLS: Record<string, string[]> = {
  career: [
    'How to negotiate a salary raise in 2026 without feeling awkward',
    'Remote work is shrinking your salary — and most people don\'t know it',
    'The LinkedIn profiles that actually get recruiters to respond in 2026',
    'Why your resume passes the human eye but fails the ATS bot',
    'Job hopping in 2026: when it helps, when it hurts, and how to explain it',
    'How to get a promotion at a company that hasn\'t given raises in two years',
    'The cover letter is dead — here\'s what actually gets interviews in 2026',
    'Freelancing vs full-time employment: the real numbers after tax in 2026',
    'Career pivots over 35: what actually works and what hiring managers see',
    'How to use AI tools to cut your job application time by 80%',
    'The hidden job market: how 70% of jobs are filled before they\'re posted',
    'Why your resume needs different versions for every job application',
    'How to ace a video interview when you hate seeing yourself on camera',
    'Contractor vs employee: the tax difference that could cost you thousands',
    'How to build a strong professional bio when you have nothing impressive to say yet',
    'Getting your first job with no experience in 2026: what actually works',
    'The reference check is back — how to prepare for it in 2026',
    'How to write a resignation letter that keeps the door open',
    'Side hustle to main hustle: the financial checklist before you quit',
    'What hiring managers actually look at on a resume in the first 6 seconds',
  ],

  ai_tech: [
    'The AI tools replacing a $500/month creative team for solo founders in 2026',
    'ChatGPT vs Groq vs Claude: which AI is actually fastest and cheapest in 2026',
    'How small businesses are saving 20+ hours a week with free AI tools',
    'AI writing tools that won\'t make your emails sound like a robot wrote them',
    'The free AI tools that do what Grammarly Premium charges $30/month for',
    'AI is changing how we do tax prep — what you need to know in 2026',
    'Why AI-generated content is hurting search rankings (and how to fix it)',
    'The 12 free AI tools every freelancer should use daily in 2026',
    'How AI is automating the parts of HR that nobody liked doing anyway',
    'AI paraphrasing tools: which ones actually avoid plagiarism detection in 2026',
    'The AI tools teachers are quietly using to save 8 hours a week',
    'Stop paying for Canva Pro — free AI design tools that do the same job',
    'How students in India, UK, and US are using AI tools to land better internships',
    'AI code review tools that catch bugs senior developers miss',
    'The rise of AI document tools: why PDFs aren\'t the pain they used to be',
    'Free AI diagram tools vs Lucidchart: why you don\'t need to pay anymore',
    'How to use AI to write legal documents without paying a lawyer',
    'AI tools for content creators who can\'t afford a whole production team',
    'The AI tools Australian and Canadian small businesses are relying on in 2026',
    'How to tell if content was written by AI — and why it matters for SEO',
  ],

  finance: [
    'The pay stub mistakes that trigger tax audits — and how to avoid them',
    'How to calculate your actual take-home salary (the number HR never shows you)',
    'Freelancer taxes in 2026: what you owe, what you can deduct, and what kills you',
    'The hidden costs of being self-employed that employment calculators ignore',
    'How to read a pay stub: the line items most people ignore at their peril',
    'Income tax in India 2026: new vs old regime, explained with real numbers',
    'The salary negotiation scripts that add $10,000+ to a UK job offer',
    'How to budget on a variable income when your pay changes every month',
    'The 1099 vs W-2 tax difference — and how it affects what you actually earn',
    'Why your take-home pay in Australia and Canada is so different from the UK',
    'GST for freelancers in India: what to charge, collect, and file in 2026',
    'The financial documents you should have even if you\'re not a business owner',
    'How compound interest works when it\'s working against you (credit card debt)',
    'Emergency fund math: the number most financial advisors get wrong',
    'How to split expenses fairly in a relationship without fighting about it',
    'The real cost of a bad hire: what employers lose when they rush recruitment',
    'Salary benchmarking in 2026: tools and methods that actually work',
    'How to invoice as a freelancer and get paid on time every time',
    'Small business accounting mistakes that get flagged in the first audit',
    'The payslip deductions in the UK that most employees never question',
  ],

  productivity: [
    'The productivity system that actually works for people who hate productivity systems',
    'How to go from 100 browser tabs to a system you can actually manage',
    'The 2-hour workday myth and the legitimate techniques behind it',
    'Why the best writers and developers all do this one thing before lunch',
    'The free tools replacing Notion, Asana, and Slack for 5-person teams in 2026',
    'How to write faster without sacrificing quality: the writer\'s toolbox in 2026',
    'Remote meeting fatigue is real — here\'s how to cut meeting time by 40%',
    'Document management for freelancers who hate filing things',
    'How to build a personal knowledge base without paying for software',
    'The email templates that cut your inbox management from 2 hours to 20 minutes',
    'Why paper contracts are costing freelancers money in 2026',
    'The checklist apps that top project managers swear by (all free)',
    'How to create professional documents in 10 minutes without design skills',
    'Time-blocking vs to-do lists: what research says actually works',
    'The grammar and tone tools that make every professional email hit better',
    'How to use free online tools to run a one-person agency',
    'Writing tools that cut editing time in half for non-native English speakers',
    'The free alternatives to Microsoft 365 that remote teams actually trust in 2026',
    'How to manage passwords for a whole team without paying $15 per user per month',
    'The one habit top performers use to write better emails, reports, and proposals',
  ],

  legal_business: [
    'The freelance contract clauses that protect you when clients disappear',
    'NDA basics every freelancer should understand before signing one',
    'How to create a legally solid service agreement without hiring a lawyer',
    'The legal documents every one-person business needs in 2026',
    'What happens when a client doesn\'t pay — the practical legal options',
    'Intellectual property basics for freelancers: who owns what you create',
    'How to register as a sole trader in the UK, India, and Australia in 2026',
    'The privacy policy sections that make Google AdSense and Meta Ads approve faster',
    'GDPR for small websites: what you actually need to comply in 2026',
    'How to write terms and conditions users will actually read',
    'The documents you need before starting a business partnership',
    'Employment contracts: what a contractor can legally refuse to sign',
    'How to handle copyright claims on content you commissioned as a freelancer',
    'The legal risk of not having a written agreement for every project',
    'How to set up a proper invoice system that satisfies UK HMRC requirements',
    'Startup equity agreements explained in plain English (without the lawyer)',
    'Non-compete clauses in 2026: what\'s enforceable and what isn\'t',
    'How to write a demand letter for unpaid invoices that actually gets paid',
    'Data protection for freelancers who store client files in the cloud',
    'The contract terms that protect creative professionals from scope creep',
  ],

  lifestyle_wellness: [
    'The desk job body: how to stay physically healthy when you sit 8 hours a day',
    'Burnout vs tiredness: how to know which one you\'re actually dealing with',
    'The mental health cost of job hunting — and how to protect yourself',
    'How to stay motivated when remote work blurs into life',
    'The sleep science behind why late-night work sessions backfire',
    'Nutrition for people who eat at their desk and feel terrible for it',
    'How to set work-from-home boundaries that your employer will actually respect',
    'The workout routine for people with no gym, no time, and no energy',
    'Stress and productivity: the counterintuitive research that changes how you work',
    'Digital minimalism in 2026: how cutting screen time improved one writer\'s output by 30%',
    'How freelancers stay disciplined without a manager breathing down their neck',
    'The social isolation problem of remote work and practical ways to fight it',
    'How to build a morning routine you\'ll actually keep past week two',
    'Eye strain, posture, wrist pain: the remote worker\'s health checklist',
    'Why walking meetings work (and the research that proves it)',
    'How high performers decompress after high-stakes work without alcohol',
    'The friendship problem no one talks about when you work from home full-time',
    'How to handle anxiety about job security in an AI-shifting economy',
    'Creative hobbies that top professionals use to stay mentally sharp',
    'The case for the four-day work week — what the 2025 trials actually showed',
  ],
};

const CATEGORIES = Object.keys(TOPIC_POOLS) as Array<keyof typeof TOPIC_POOLS>;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function pickDailyTopics(existingSlugs: Set<string>): string[] {
  const today = new Date();
  const dayIndex = today.getDate() % CATEGORIES.length;

  // Rotate category starting point by day
  const orderedCategories = [
    ...CATEGORIES.slice(dayIndex),
    ...CATEGORIES.slice(0, dayIndex),
  ];

  const picked: string[] = [];

  for (const category of orderedCategories) {
    if (picked.length >= 4) break;
    const pool = TOPIC_POOLS[category];
    // Shuffle pool deterministically by date so we don't repeat recent picks
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const shuffled = [...pool].sort((a, b) => {
      const hashA = (a.charCodeAt(0) * seed) % 997;
      const hashB = (b.charCodeAt(0) * seed) % 997;
      return hashA - hashB;
    });

    for (const topic of shuffled) {
      const slug = slugify(topic);
      if (!existingSlugs.has(slug)) {
        picked.push(topic);
        break;
      }
    }
  }

  // If we didn't get 4 (all slugs taken), fill from any available topic
  if (picked.length < 4) {
    for (const category of CATEGORIES) {
      if (picked.length >= 4) break;
      for (const topic of TOPIC_POOLS[category]) {
        if (picked.length >= 4) break;
        if (!picked.includes(topic) && !existingSlugs.has(slugify(topic))) {
          picked.push(topic);
        }
      }
    }
  }

  return picked;
}

/* ─── Article generator ──────────────────────────────────────────────────── */

interface EditorialPost {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  tags: string[];
  read_time: number;
  topic: string;
}

async function generateEditorialArticle(topic: string): Promise<EditorialPost | null> {
  const supabase = createAdminClient();

  const slug = slugify(topic);
  const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();
  if (existing) {
    console.log(`[Editorial] Slug already exists: ${slug}`);
    return null;
  }

  console.log(`[Editorial] Generating article: "${topic}"`);

  try {
    // Step 1: Title + tags
    const titleResponse = await callAI([
      {
        role: 'system',
        content: `You are a senior editor at a major digital publication. Given a topic brief, produce a sharp, click-worthy article title and 4 relevant tags.

Rules for the title:
- 6-12 words, max 70 characters
- Specific, not vague ("5 mistakes" not "common mistakes")
- Include the year (2026) where it fits naturally
- No clickbait — must deliver on the premise
- Avoid starting with "How to" every time; mix in "Why", "The", declarative statements

Return ONLY valid JSON: {"title": "...", "tags": ["tag1", "tag2", "tag3", "tag4"]}`,
      },
      { role: 'user', content: `Topic brief: ${topic}` },
    ], { temperature: 0.75, maxTokens: 300 });

    const titleMatch = titleResponse.match(/\{[\s\S]*?\}/);
    if (!titleMatch) { console.error('[Editorial] Title parse failed'); return null; }

    let titleJson: { title?: string; tags?: string[] };
    try { titleJson = JSON.parse(titleMatch[0]); } catch { return null; }

    const title = titleJson.title?.trim();
    if (!title || title.length < 10) { console.error('[Editorial] Title too short'); return null; }
    const tags: string[] = titleJson.tags ?? [];
    const finalSlug = slugify(title);

    const { data: slugCheck } = await supabase.from('blog_posts').select('id').eq('slug', finalSlug).single();
    if (slugCheck) { console.log(`[Editorial] Slug taken: ${finalSlug}`); return null; }

    // Step 2: Full article
    const articleResponse = await callAI([
      {
        role: 'system',
        content: `You are a prolific writer with 15 years of experience writing for The Atlantic, Fast Company, and Wired. You write with authority, directness, and human texture. Your pieces feel like they were written by someone who deeply cares about the topic — not by a content mill.

VOICE & STYLE:
- Varied sentence rhythm: mix short punchy sentences with longer explanatory ones
- Start paragraphs with specific claims, not with transition words
- Use contractions naturally (you're, it's, don't, can't)
- Write in second person (you/your) or authoritative third — no passive voice
- Include specific numbers, real scenarios, named examples
- Opinions are good. Assert them.
- BANNED PHRASES: "Furthermore", "In conclusion", "It's worth noting", "Delve into", "It's important to note", "Certainly", "Absolutely", "Overall", "In summary", "To summarize", "Firstly", "Secondly", "Lastly", "As we've seen", "In this article", "In this post", "Look no further"

STRUCTURE (HTML only, no markdown):
<p>[Lead paragraph: 2-3 sentences. Start with the most interesting claim or stat. No preamble.]</p>

<h2>[Section 1 title — specific and descriptive]</h2>
<p>[2-3 paragraphs. Concrete. Data-backed where possible.]</p>

<h2>[Section 2 title]</h2>
<p>[2-3 paragraphs. Include a practical example or scenario.]</p>

<h2>[Section 3 title]</h2>
<p>[2-3 paragraphs. Practical advice or key insight.]</p>

<h2>[Section 4 title — GEO: How This Differs by Country]</h2>
<p>[Brief paragraph on US context.]</p>
<p>[Brief paragraph on UK/India/AU/CA context where relevant. Skip if topic doesn't have meaningful geographic variation.]</p>

<h2>The Bottom Line</h2>
<p>[2-3 sentences. Direct takeaway. No "In conclusion". Just: here's what matters.]</p>

<div class="faq-section">
<h2>Questions People Actually Ask</h2>
<div class="faq-item"><h3>[Real question from search, phrased naturally]</h3><p>[Direct 2-sentence answer.]</p></div>
<div class="faq-item"><h3>[Second question]</h3><p>[Direct 2-sentence answer.]</p></div>
<div class="faq-item"><h3>[Third question]</h3><p>[Direct 2-sentence answer.]</p></div>
<div class="faq-item"><h3>[Fourth question]</h3><p>[Direct 2-sentence answer.]</p></div>
</div>

<p>Most of the tasks described here are faster with the right tool. <a href="https://formly.tools/tools">Formly Tools</a> gives you 48 free AI tools — pay stub generators, resume builders, grammar checkers, document tools — with no signup and no paywalls.</p>

LENGTH: Target 950-1200 words of actual text (excluding HTML tags).
SEO: Use the topic phrase and related terms naturally throughout. Don't keyword-stuff.
INTERNAL LINKS: Include 2-3 links to specific Formly tools (e.g., <a href="/tools/pay-stub-generator">free pay stub generator</a>, <a href="/tools/grammar-checker">grammar checker</a>, <a href="/tools/resume-builder">resume builder</a>) where they fit the article naturally.
FRESHNESS: Reference 2026. Specific stats (even approximations) beat vague claims.`,
      },
      {
        role: 'user',
        content: `Write a full article on: "${title}"\n\nTopic brief: ${topic}`,
      },
    ], { temperature: 0.7, maxTokens: 3500, model: 'llama-3.3-70b-versatile', skipCache: true });

    // Step 3: Meta description
    const metaResponse = await callAI([
      {
        role: 'system',
        content: `Write a meta description for a blog article. Rules:
- 148-160 characters exactly
- Start with the primary keyword from the title
- Include a specific benefit or number
- No quotes in the output
- No "In this article" or "Learn how"
- End with action or hook
Return ONLY the meta description text, nothing else.`,
      },
      { role: 'user', content: `Title: ${title}\nTopic: ${topic}` },
    ], { temperature: 0.5, maxTokens: 80 });

    const wordCount = articleResponse.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / 220);

    const post: EditorialPost = {
      title,
      slug: finalSlug,
      content: articleResponse,
      meta_description: metaResponse.trim().replace(/^["']|["']$/g, '').slice(0, 160),
      tags,
      read_time: readTime,
      topic,
    };

    const { error } = await supabase.from('blog_posts').insert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      meta_description: post.meta_description,
      tags: post.tags,
      read_time: post.read_time,
      published: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Editorial] DB insert error:', error.message);
      return null;
    }

    console.log(`[Editorial] Published: "${title}" (${wordCount} words, ~${readTime} min read)`);
    return post;
  } catch (err) {
    console.error('[Editorial] Generation error for topic:', topic, err);
    return null;
  }
}

/* ─── Main runner ────────────────────────────────────────────────────────── */

export async function runEditorialAgent(count = 4): Promise<{ generated: number; posts: string[] }> {
  const supabase = createAdminClient();

  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true);

  const existingSlugs = new Set((existingPosts ?? []).map((p: { slug: string }) => p.slug));

  const topics = pickDailyTopics(existingSlugs);
  console.log(`[Editorial] Today's ${topics.length} topics:`, topics);

  const publishedTitles: string[] = [];

  for (const topic of topics.slice(0, count)) {
    const post = await generateEditorialArticle(topic);
    if (post) publishedTitles.push(post.title);
    // 8-second gap between API calls to avoid rate limits
    await new Promise((r) => setTimeout(r, 8000));
  }

  return { generated: publishedTitles.length, posts: publishedTitles };
}

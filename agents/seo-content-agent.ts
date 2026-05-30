/**
 * SEO Content Agent
 * Autonomously generates SEO-optimized blog posts targeting high-value keywords.
 * Runs via Vercel Cron every 2 days. Zero human input required.
 */

import { callAI } from '@/lib/ai';
import { createAdminClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

const TOOL_KEYWORDS = [
  // High-volume, low-competition long-tail keywords
  'how to summarize a pdf for free',
  'best free ai paraphrasing tool online',
  'free grammar checker better than grammarly',
  'how to write professional emails with ai',
  'explain code to beginners ai tool',
  'youtube video summarizer no sign up',
  'free ats resume builder ai 2024',
  'freelance contract generator free',
  'instagram hashtag generator ai free',
  'professional bio writer ai free',
  'free ai writing tools for students',
  'ai tools for freelancers india',
  'how to use ai to save time at work',
  'best free ai tools for content creators',
  'ai text rewriter online free',
  'paraphrase tool for academic writing',
  'pdf summarizer for research papers',
  'ai email writer for job applications',
  'youtube video to text summarizer',
  'how to make linkedin bio with ai',
  'free nda generator online india',
  'ai tools that replace expensive software',
  'groq llama ai tools free',
  'best free ai productivity tools 2024',
  'how to avoid plagiarism with ai paraphraser',
];

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

  // Pick a keyword not already covered
  let targetKeyword = keyword;
  if (!targetKeyword) {
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .eq('published', true);

    const existingTitles = (existingPosts ?? []).map((p: { title: string }) => p.title.toLowerCase());

    const available = TOOL_KEYWORDS.filter(
      (kw) => !existingTitles.some((t: string) => t.includes(kw.split(' ')[0]))
    );

    targetKeyword = available[Math.floor(Math.random() * available.length)] ?? TOOL_KEYWORDS[0];
  }

  console.log(`[SEO Agent] Generating post for keyword: "${targetKeyword}"`);

  try {
    // Step 1: Generate title and outline
    const titleResponse = await callAI([
      {
        role: 'system',
        content: `You are an expert SEO content strategist. Generate a compelling, click-worthy blog post title for the given keyword.
The title should:
- Include the keyword naturally
- Be under 65 characters
- Be actionable and specific
- Target search intent

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
    if (!title || title.length < 10) {
      console.error('[SEO Agent] Title too short or missing:', titleJson);
      return null;
    }
    const tags: string[] = titleJson.tags ?? [];
    const slug = slugify(title);

    // Check for duplicate slug
    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();
    if (existing) {
      console.log(`[SEO Agent] Slug already exists: ${slug}`);
      return null;
    }

    // Step 2: Generate article (600-900 words, scannable format)
    const articleResponse = await callAI([
      {
        role: 'system',
        content: `You are an SEO content writer for Formly (formly.tools), a free AI tools platform.

Write a short, scannable blog post:
- Target keyword: "${targetKeyword}"
- Length: 600-900 words (people skim — keep it tight)
- Format: HTML only (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <a> tags)
- Structure: 1 punchy intro paragraph → 3-4 H2 sections → bullet points wherever possible → short CTA
- NO long paragraphs — max 3 sentences per paragraph
- Include keyword in first sentence and one H2
- Add 2-3 internal links: <a href="/tools/pdf-summarizer">PDF Summarizer</a> etc.
- End with a single CTA linking to /tools
- Tone: direct, useful, zero fluff

Do NOT include <html>, <body>, <head> tags. Article HTML only.`,
      },
      {
        role: 'user',
        content: `Title: "${title}"\nKeyword: "${targetKeyword}"\nWrite the article now.`,
      },
    ], { temperature: 0.6, maxTokens: 2000, model: 'llama-3.3-70b-versatile' });

    // Step 3: Generate meta description
    const metaResponse = await callAI([
      {
        role: 'system',
        content: 'Generate a compelling meta description (150-160 chars) for this blog post. Include the keyword. Return only the meta description text.',
      },
      { role: 'user', content: `Title: ${title}\nKeyword: ${targetKeyword}` },
    ], { temperature: 0.5, maxTokens: 80 });

    const wordCount = articleResponse.replace(/<[^>]+>/g, '').split(' ').length;
    const readTime = Math.ceil(wordCount / 200);

    const post: BlogPost = {
      title,
      slug,
      content: articleResponse,
      meta_description: metaResponse.trim().slice(0, 160),
      tags,
      read_time: readTime,
    };

    // Save to database
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
 * Run the full SEO content generation batch (3 posts per run)
 */
export async function runSEOAgent(count = 3): Promise<{ generated: number; posts: string[] }> {
  const posts: string[] = [];

  for (let i = 0; i < count; i++) {
    const post = await generateBlogPost();
    if (post) posts.push(post.title);
    // Small delay between API calls
    await new Promise((r) => setTimeout(r, 2000));
  }

  return { generated: posts.length, posts };
}

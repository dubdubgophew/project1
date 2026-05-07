import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBlogPost } from '@/agents/seo-content-agent';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const post = await generateBlogPost(body.keyword);

    if (!post) {
      return NextResponse.json({ error: 'Post generation failed or slug already exists.' }, { status: 400 });
    }

    // Redirect back to admin after form submission
    if (req.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.json({ success: true, post: { title: post.title, slug: post.slug } });
  } catch (err) {
    console.error('Blog generation error:', err);
    return NextResponse.json({ error: 'Failed to generate blog post.' }, { status: 500 });
  }
}

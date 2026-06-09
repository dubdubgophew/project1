# Formly — Project Context for Claude Code

## What this is
**formly.tools** — free AI tools SaaS. 37 tools (pay stub, resume, grammar checker, calisthenics tracker, etc.). Next.js 14, Supabase, Groq AI, DodoPayments, Resend, Vercel.

## Branch rules
- Always develop on `claude/autonomous-saas-product-V9Uun`
- Push: `git push -u origin HEAD:claude/autonomous-saas-product-V9Uun`
- Also push main: `git push origin main`

## Key file locations
- Tools list: `app/tools/page.tsx` (TOOLS array)
- Homepage: `app/page.tsx`
- Popular tools widget: `components/landing/PopularTools.tsx`
- Blog content (static): `lib/blog-content.ts`
- Blog posts (dynamic): Supabase `blog_posts` table
- Sitemap: `app/sitemap.ts`
- AI calls: `lib/ai.ts` (uses Groq, model: llama-3.3-70b-versatile)
- Agents: `agents/` directory
- SEO agent: `agents/traffic-seo-agent.ts` + `lib/seo-agent/`
- Cron jobs: `vercel.json`

## SEO Traffic Agent
- Dashboard: `https://formly.tools/dashboard/seo?secret=ADMIN_SECRET`
- Manual run: `https://formly.tools/api/admin/seo-agent?secret=ADMIN_SECRET&run=1`
- GSC property: `sc-domain:formly.tools` (domain property, not URL prefix)
- GSC auth: OAuth2 refresh token (GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN, GSC_SITE_URL)
- Supabase tables: `seo_page_metrics`, `seo_keyword_metrics`, `seo_opportunities`, `seo_content_improvements`, `seo_agent_runs`
- Runs daily at 3am UTC via Vercel cron

## Tool count
Currently 37 tools. Update in: `app/page.tsx` title/description, `components/landing/PopularTools.tsx` "View all" links, `app/tools/page.tsx` auto-counts via TOOLS.length.

## Adding a new tool
1. Create `app/tools/[slug]/page.tsx` + `layout.tsx`
2. Add to TOOLS array in `app/tools/page.tsx`
3. Add to `app/sitemap.ts`
4. Add to `components/landing/PopularTools.tsx` if pinned
5. Add blog post to `lib/blog-content.ts`
6. Update tool count references

## Env vars (key ones)
- GROQ_API_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SECRET, CRON_SECRET
- GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN, GSC_SITE_URL=sc-domain:formly.tools
- RESEND_API_KEY, DODO_PAYMENTS_API_KEY

## Supabase migration
Run new `.sql` files manually in Supabase SQL Editor (not auto-applied).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

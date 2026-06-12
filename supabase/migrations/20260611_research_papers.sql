-- Research Papers: AI-curated top 3 trending papers per day across scientific domains
-- Source: arXiv RSS feeds  |  Cron: /api/cron/fetch-research-papers (daily noon UTC)

create table if not exists research_papers (
  id             uuid        default gen_random_uuid() primary key,
  arxiv_id       text        unique,
  title          text        not null,
  tldr           text,
  summary        text,
  key_findings   text[],
  methodology    text,
  use_cases      text,
  breakthrough   text,
  impact_level   text        default 'Notable',
  authors        text[]      default '{}',
  institution    text,
  journal        text,
  domain         text        not null default 'General Science',
  subdomain      text,
  published_date text,
  source_url     text        not null,
  pdf_url        text,
  abstract       text,
  image_url      text,
  fetched_at     timestamptz default now(),
  expires_at     timestamptz default (now() + interval '30 days'),
  rank           int         default 1,
  source_key     text,
  source_name    text
);

create index if not exists idx_rp_fetched_at on research_papers(fetched_at desc);
create index if not exists idx_rp_domain     on research_papers(domain);
create index if not exists idx_rp_arxiv_id   on research_papers(arxiv_id);
create index if not exists idx_rp_expires_at on research_papers(expires_at);
create index if not exists idx_rp_impact     on research_papers(impact_level);

alter table research_papers enable row level security;

-- Anyone can read; only service_role may write
create policy "rp_public_read"   on research_papers for select            using (true);
create policy "rp_service_write" on research_papers for all    using (auth.role() = 'service_role');

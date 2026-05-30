-- SEO Traffic Agent Tables

create table if not exists seo_page_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  page text not null,
  clicks int not null default 0,
  impressions int not null default 0,
  ctr numeric(6,4) not null default 0,
  position numeric(6,2) not null default 0,
  top_queries jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(date, page)
);

create table if not exists seo_keyword_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  query text not null,
  page text not null,
  clicks int not null default 0,
  impressions int not null default 0,
  ctr numeric(6,4) not null default 0,
  position numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(date, query, page)
);

create table if not exists seo_opportunities (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  type text not null check (type in ('fix_meta','content_refresh','add_faq','new_post','title_tweak','geo_markup')),
  score numeric(10,2) not null default 0,
  priority int not null default 3 check (priority between 1 and 3),
  data jsonb not null default '{}',
  status text not null default 'open' check (status in ('open','applied','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists seo_content_improvements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references seo_opportunities(id) on delete set null,
  page text not null,
  improvement_type text not null,
  field text,
  old_value text,
  new_value text,
  applied boolean not null default false,
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists seo_agent_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  trigger text not null default 'cron',
  pages_analyzed int not null default 0,
  keywords_analyzed int not null default 0,
  opportunities_found int not null default 0,
  improvements_applied int not null default 0,
  new_posts_queued int not null default 0,
  total_clicks_7d int not null default 0,
  total_impressions_7d int not null default 0,
  clicks_delta_pct numeric(8,2) not null default 0,
  impressions_delta_pct numeric(8,2) not null default 0,
  avg_position numeric(6,2) not null default 0,
  gsc_connected boolean not null default false,
  summary text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_seo_page_metrics_date on seo_page_metrics(date desc);
create index if not exists idx_seo_page_metrics_page on seo_page_metrics(page);
create index if not exists idx_seo_keyword_date on seo_keyword_metrics(date desc);
create index if not exists idx_seo_keyword_query on seo_keyword_metrics(query);
create index if not exists idx_seo_opps_status_score on seo_opportunities(status, score desc);
create index if not exists idx_seo_runs_date on seo_agent_runs(run_date desc);
create index if not exists idx_seo_improvements_applied on seo_content_improvements(applied, applied_at desc);

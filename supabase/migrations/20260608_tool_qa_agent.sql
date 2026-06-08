-- Tool QA Agent tables
-- Run in Supabase SQL Editor

-- Track when each tool was last tested
create table if not exists tool_last_tested (
  tool_slug text primary key,
  last_tested_at timestamptz default now(),
  last_test_pass_rate numeric(5,2) default 100
);

-- Bug reports from test failures
create table if not exists tool_bugs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tool_slug text not null,
  test_name text,
  error_type text,   -- validation_error | wrong_response | server_error | timeout | wrong_format | missing_field
  description text,
  test_input jsonb,
  expected text,
  actual text,
  severity text default 'medium',  -- critical | high | medium | low
  status text default 'open',      -- open | pr_created | fixed | wont_fix
  pr_url text,
  resolved_at timestamptz
);
create index if not exists tool_bugs_slug_idx on tool_bugs(tool_slug);
create index if not exists tool_bugs_status_idx on tool_bugs(status);
create index if not exists tool_bugs_created_idx on tool_bugs(created_at desc);

-- Feature gaps identified from competitor analysis
create table if not exists tool_feature_gaps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tool_slug text not null,
  competitor_name text,
  competitor_url text,
  feature_name text not null,
  feature_description text,
  priority text default 'medium',    -- critical | high | medium | low
  complexity text default 'medium',  -- easy | medium | hard
  status text default 'identified',  -- identified | pr_created | implemented
  pr_url text,
  implemented_at timestamptz
);
create index if not exists feature_gaps_slug_idx on tool_feature_gaps(tool_slug);
create index if not exists feature_gaps_status_idx on tool_feature_gaps(status);

-- Competitor analysis cache (7-day TTL)
create table if not exists competitor_analysis_cache (
  id uuid primary key default gen_random_uuid(),
  tool_slug text not null,
  competitor_name text not null,
  competitor_url text,
  features jsonb,
  cached_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days',
  unique(tool_slug, competitor_name)
);
create index if not exists competitor_cache_slug_idx on competitor_analysis_cache(tool_slug);

-- QA run log
create table if not exists tool_qa_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  trigger text default 'cron',
  tools_tested text[],
  tests_run int default 0,
  tests_passed int default 0,
  tests_failed int default 0,
  bugs_filed int default 0,
  pr_urls text[],
  features_identified int default 0,
  feature_pr_urls text[],
  summary text
);
create index if not exists tool_qa_runs_created_idx on tool_qa_runs(created_at desc);

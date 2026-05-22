-- AI News table for /ai-news feed
CREATE TABLE IF NOT EXISTS ai_news (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_key  text NOT NULL,
  source_name text NOT NULL,
  topic       text NOT NULL,
  summary     text NOT NULL,
  category    text NOT NULL DEFAULT 'General',
  source_url  text NOT NULL,
  source_title text,
  image_url   text,
  fetched_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  rank        integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS ai_news_fetched_at_idx  ON ai_news(fetched_at DESC);
CREATE INDEX IF NOT EXISTS ai_news_category_idx    ON ai_news(category);
CREATE INDEX IF NOT EXISTS ai_news_expires_at_idx  ON ai_news(expires_at);
CREATE INDEX IF NOT EXISTS ai_news_source_key_idx  ON ai_news(source_key);

-- Enable RLS
ALTER TABLE ai_news ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "ai_news_public_read" ON ai_news
  FOR SELECT USING (true);

-- Service role full access (for cron inserts)
CREATE POLICY "ai_news_service_write" ON ai_news
  FOR ALL USING (auth.role() = 'service_role');

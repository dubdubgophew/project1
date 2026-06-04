-- Add language fields to trending_news for regional language content support
ALTER TABLE trending_news
  ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS language_name VARCHAR(50) DEFAULT 'English';

-- Backfill existing rows
UPDATE trending_news
SET language_code = 'en', language_name = 'English'
WHERE language_code IS NULL OR language_code = '';

-- Index for language filtering
CREATE INDEX IF NOT EXISTS idx_trending_news_language_code ON trending_news(language_code);

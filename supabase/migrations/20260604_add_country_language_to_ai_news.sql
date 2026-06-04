ALTER TABLE ai_news
  ADD COLUMN IF NOT EXISTS country_code  VARCHAR(10)  DEFAULT 'GLOBAL',
  ADD COLUMN IF NOT EXISTS country_name  VARCHAR(50)  DEFAULT 'Global',
  ADD COLUMN IF NOT EXISTS language_code VARCHAR(10)  DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS language_name VARCHAR(50)  DEFAULT 'English';

UPDATE ai_news
SET country_code = 'GLOBAL', country_name = 'Global',
    language_code = 'en', language_name = 'English'
WHERE country_code IS NULL OR country_code = '';

CREATE INDEX IF NOT EXISTS idx_ai_news_country_code  ON ai_news(country_code);
CREATE INDEX IF NOT EXISTS idx_ai_news_language_code ON ai_news(language_code);

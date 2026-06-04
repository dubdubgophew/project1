-- Add key_points (3-5 AI-generated bullet points) to news tables.
-- Run manually in Supabase SQL Editor.

ALTER TABLE trending_news ADD COLUMN IF NOT EXISTS key_points jsonb;
ALTER TABLE ai_news       ADD COLUMN IF NOT EXISTS key_points jsonb;

COMMENT ON COLUMN trending_news.key_points IS '3-5 AI-generated bullet point takeaways, stored as JSON string array';
COMMENT ON COLUMN ai_news.key_points       IS '3-5 AI-generated bullet point takeaways, stored as JSON string array';

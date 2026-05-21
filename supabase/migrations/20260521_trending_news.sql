CREATE TABLE IF NOT EXISTS trending_news (
  id             uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code   varchar(2)   NOT NULL,
  country_name   varchar(50)  NOT NULL,
  topic          varchar(300) NOT NULL,
  summary        text         NOT NULL,
  traffic_volume varchar(50),
  category       varchar(50)  DEFAULT 'General',
  source_url     text         NOT NULL,
  source_name    varchar(100) NOT NULL,
  source_title   varchar(400),
  image_url      text,
  fetched_at     timestamptz  DEFAULT now() NOT NULL,
  expires_at     timestamptz  NOT NULL,
  rank           integer      NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_trending_fetched ON trending_news(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_country  ON trending_news(country_code, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_category ON trending_news(category);
CREATE INDEX IF NOT EXISTS idx_trending_expires  ON trending_news(expires_at);

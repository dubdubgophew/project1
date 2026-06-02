-- Run in Supabase Dashboard > SQL Editor
-- Vibe Check: persistent mood check-in history for logged-in users

CREATE TABLE IF NOT EXISTS vibe_checkins (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood         TEXT NOT NULL,
  mood_group   TEXT,
  area         TEXT,
  country      TEXT,
  insight      TEXT,
  affirmation  TEXT,
  action_type  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fast history queries per user
CREATE INDEX IF NOT EXISTS idx_vibe_checkins_user_created
  ON vibe_checkins(user_id, created_at DESC);

-- One check-in per user per calendar day (UTC) — prevents duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_vibe_checkins_user_day
  ON vibe_checkins(user_id, DATE(created_at));

ALTER TABLE vibe_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vibe checkins" ON vibe_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vibe checkins" ON vibe_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to vibe_checkins" ON vibe_checkins
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
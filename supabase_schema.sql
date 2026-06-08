-- ================================================================
--  Mimic — Supabase Schema
--  Supabase 대시보드 > SQL Editor 에서 실행하세요
-- ================================================================

-- ── transcripts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transcripts (
  id          TEXT        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario    TEXT        NOT NULL,
  date        DATE        NOT NULL,
  score       INTEGER     NOT NULL,
  lines       JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own transcripts" ON public.transcripts;
CREATE POLICY "Users can manage own transcripts"
  ON public.transcripts FOR ALL
  USING (auth.uid() = user_id);

-- ── profiles (leaderboard) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id        UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname       TEXT        NOT NULL,
  avg_score      INTEGER     NOT NULL DEFAULT 0,
  total_sessions INTEGER     NOT NULL DEFAULT 0,
  best_line      TEXT,
  best_scenario  TEXT,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_write_own" ON public.profiles;
CREATE POLICY "profiles_write_own"
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── vocab_words ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vocab_words (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word        TEXT        NOT NULL,
  ipa         TEXT,
  ko          TEXT,
  miss        INTEGER     DEFAULT 0,
  weak        TEXT,
  scenario    TEXT,
  added       DATE,
  score       INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, word)
);

ALTER TABLE public.vocab_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own vocab" ON public.vocab_words;
CREATE POLICY "Users can manage own vocab"
  ON public.vocab_words FOR ALL
  USING (auth.uid() = user_id);

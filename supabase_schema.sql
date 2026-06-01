-- ============================================
-- KOLESARJI TRACKER - Supabase SQL Schema
-- Izvedi v Supabase SQL Editorju
-- ============================================

-- Tabela: kolesarji
CREATE TABLE IF NOT EXISTS kolesarji (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ime TEXT NOT NULL,
  priimek TEXT NOT NULL,
  stevilka INTEGER NOT NULL UNIQUE,
  ekipa TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: cilji
CREATE TABLE IF NOT EXISTS cilji (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  naziv TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  opis TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: registracije
CREATE TABLE IF NOT EXISTS registracije (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kolesar_id UUID NOT NULL REFERENCES kolesarji(id) ON DELETE CASCADE,
  cilj_id UUID NOT NULL REFERENCES cilji(id) ON DELETE CASCADE,
  cas TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat_ob_skeniranju DOUBLE PRECISION,
  lon_ob_skeniranju DOUBLE PRECISION,
  razdalja_m INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
  -- UNIQUE omejitev je bila odstranjena - kolesar lahko doseže cilj večkrat
);

-- Indeksi za hitrejše poizvedbe
CREATE INDEX idx_registracije_kolesar ON registracije(kolesar_id);
CREATE INDEX idx_registracije_cilj ON registracije(cilj_id);
CREATE INDEX idx_registracije_cas ON registracije(cas DESC);

-- ============================================
-- Row Level Security (RLS) - opcijsko
-- Omogoči, če potrebuješ avtentikacijo
-- ============================================

-- ALTER TABLE kolesarji ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cilji ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE registracije ENABLE ROW LEVEL SECURITY;

-- Dovoli javni dostop (za tekmovanje brez prijave):
-- CREATE POLICY "Javni dostop" ON kolesarji FOR ALL USING (true);
-- CREATE POLICY "Javni dostop" ON cilji FOR ALL USING (true);
-- CREATE POLICY "Javni dostop" ON registracije FOR ALL USING (true);

-- ============================================
-- Primer testnih podatkov
-- ============================================

INSERT INTO kolesarji (ime, priimek, stevilka, ekipa) VALUES
  ('Janez', 'Novak', 1, 'KK Ljubljana'),
  ('Ana', 'Kovač', 2, 'KK Maribor'),
  ('Miha', 'Horvat', 3, NULL),
  ('Petra', 'Zupan', 4, 'KK Ljubljana');

INSERT INTO cilji (naziv, latitude, longitude, opis) VALUES
  ('Start - Celje', 46.2311, 15.2688, 'Glavni trg Celje'),
  ('Vmesni cilj - Žalec', 46.2520, 15.1648, 'Ob hmeljarni'),
  ('Cilj - Laško', 46.1551, 15.2359, 'Pred pivovarno');

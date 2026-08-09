-- Ayiti Alèt — Schema PostgreSQL + PostGIS

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             text NOT NULL,
  telefon         text NOT NULL UNIQUE,
  email           text UNIQUE,
  mot_de_pass     text NOT NULL,
  komin           text,
  katye           text,
  niveau_konfyans integer NOT NULL DEFAULT 0,
  wol             text NOT NULL DEFAULT 'sitwayen' CHECK (wol IN ('sitwayen', 'admin')),
  kontak_ijans    jsonb NOT NULL DEFAULT '[]',
  kreye_nan       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id),
  anonim        boolean NOT NULL DEFAULT false,
  kategori      text NOT NULL,
  tit           text NOT NULL,
  deskripsyon   text NOT NULL,
  niveau_ijans  text NOT NULL DEFAULT 'mwayen' CHECK (niveau_ijans IN ('ba', 'mwayen', 'grav')),
  statut        text NOT NULL DEFAULT 'nouvo' CHECK (statut IN ('nouvo', 'verifye', 'rejte', 'rezolu')),
  lokalizasyon  geography(Point, 4326) NOT NULL,
  adrès         text,
  kreye_nan     timestamptz NOT NULL DEFAULT now()
);

-- Si tab "reports" la te deja egziste anvan (soti nan yon ansyen deplwaman),
-- "CREATE TABLE IF NOT EXISTS" anwo a pa ajoute kolòn nouvo yo — se pou sa
-- nou toujou ajoute yo eksplisitman apre, pou schema.sql rete "idempotan"
-- (li ka egzekite plizyè fwa san erè, kit se yon baz done nèf oswa ansyen).
ALTER TABLE reports ADD COLUMN IF NOT EXISTS komin text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS komin text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS katye text;

CREATE INDEX IF NOT EXISTS reports_lokalizasyon_idx ON reports USING GIST (lokalizasyon);
CREATE INDEX IF NOT EXISTS reports_kategori_idx ON reports (kategori);
CREATE INDEX IF NOT EXISTS reports_kreye_nan_idx ON reports (kreye_nan DESC);
CREATE INDEX IF NOT EXISTS reports_komin_idx ON reports (komin);

CREATE TABLE IF NOT EXISTS report_media (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id      uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  tip            text NOT NULL CHECK (tip IN ('foto', 'videyo', 'odyo')),
  url            text NOT NULL,
  koulè_dominant text,
  briyans        real,
  flou           boolean,
  ahash          text
);

CREATE INDEX IF NOT EXISTS report_media_ahash_idx ON report_media (ahash);

CREATE TABLE IF NOT EXISTS report_confirmations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id    uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id),
  tip_aksyon   text NOT NULL CHECK (tip_aksyon IN ('konfime', 'siyale')),
  kreye_nan    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id, tip_aksyon)
);

CREATE TABLE IF NOT EXISTS places (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  non            text NOT NULL,
  kategori       text NOT NULL,
  sou_kategori   text,
  adrès          text,
  telefon        text,
  orè            text,
  lokalizasyon   geography(Point, 4326) NOT NULL,
  komin          text
);

CREATE INDEX IF NOT EXISTS places_lokalizasyon_idx ON places USING GIST (lokalizasyon);
CREATE INDEX IF NOT EXISTS places_kategori_idx ON places (kategori);

CREATE TABLE IF NOT EXISTS sos_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES users(id),
  tokèn_hash       text NOT NULL,
  statut           text NOT NULL DEFAULT 'aktif' CHECK (statut IN ('aktif', 'fini')),
  dènye_pozisyon   geography(Point, 4326) NOT NULL,
  dènye_mizajou    timestamptz NOT NULL DEFAULT now(),
  kreye_nan        timestamptz NOT NULL DEFAULT now(),
  fèmen_nan        timestamptz
);

CREATE TABLE IF NOT EXISTS sos_positions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_id       uuid NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
  lokalizasyon geography(Point, 4326) NOT NULL,
  kreye_nan    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sos_positions_sos_id_idx ON sos_positions (sos_id);

-- Referans jewografik-administratif Ayiti (Depatman -> Komin). Itilize pou
-- moun ka chwazi kote yo ye lè yo fè yon rapò, e pou aplikasyon an ka
-- konpare kote yon ensidan ye ak kote yon itilizatè ye (rejyon pa rejyon),
-- pou l montre alèt kòm "ijans" nan menm komin nan, e "enfòmasyon" ayè.
-- Nòt: lis sa a se pi bon efò referans — ajoute/korije komin nan SQL si nesesè.
CREATE TABLE IF NOT EXISTS komin_ayiti (
  id       serial PRIMARY KEY,
  depatman text NOT NULL,
  komin    text NOT NULL,
  UNIQUE (depatman, komin)
);

CREATE INDEX IF NOT EXISTS komin_ayiti_depatman_idx ON komin_ayiti (depatman);

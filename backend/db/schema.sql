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

-- Kòmantè piblik sou yon rapò (fonksyon "Collaboration" — moun ka ekri yon ti
-- mesaj pou konplete/mete ajou enfòmasyon sou yon ensidan, tankou "Ponpye
-- rive" oswa "Wout la debloke kounye a"). Rapò anonim ka gen kòmantè anonim
-- tou, konsistan ak rès aplikasyon an.
CREATE TABLE IF NOT EXISTS report_kòmantè (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id),
  non_afiche  text NOT NULL,
  kò          text NOT NULL,
  kreye_nan   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS report_kòmantè_report_id_idx ON report_kòmantè (report_id);

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

-- Limit jewografik 10 depatman yo (Natural Earth, domèn piblik) — itilize pou
-- detekte otomatikman ki depatman yon pozisyon GPS ye ladan, pou n ka redwi
-- lis komin yo pito nou fè moun chwazi nan 140 total. Nivo komin/seksyon
-- kominal poko gen done polygon egzat disponib.
CREATE TABLE IF NOT EXISTS depatman_zòn (
  id   serial PRIMARY KEY,
  non  text NOT NULL UNIQUE,  -- non Kreyòl, dwe matche kolòn "depatman" nan komin_ayiti
  zòn  geography(MultiPolygon, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS depatman_zòn_zòn_idx ON depatman_zòn USING GIST (zòn);

-- Dènye pozisyon apwoksimatif itilizatè a (mete ajou an silans lè aplikasyon
-- an louvri, menm jan ak useUserPosition() nan frontend la) — sèvi sèlman
-- pou detèmine ki moun ki "toupre" yon nouvo rapò pou nou ka voye yo yon
-- notifikasyon push. Nou pa estoke istorik, sèlman dènye pwen an.
ALTER TABLE users ADD COLUMN IF NOT EXISTS dènye_pozisyon geography(Point, 4326);
ALTER TABLE users ADD COLUMN IF NOT EXISTS dènye_pozisyon_nan timestamptz;

CREATE INDEX IF NOT EXISTS users_dènye_pozisyon_idx ON users USING GIST (dènye_pozisyon);

-- Tokèn Firebase Cloud Messaging pou chak aparèy yon itilizatè konekte sou —
-- yon moun ka gen plizyè aparèy (telefòn + òdinatè), se pou sa se yon tab
-- apa olye yon sèl kolòn sou "users".
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokèn      text NOT NULL UNIQUE,
  kreye_nan  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fcm_tokens_user_id_idx ON fcm_tokens (user_id);

-- Sijesyon/remak itilizatè yo voye atravè meni "Sijesyon" la — pèmèt ekip la
-- kolekte remak reyèl san bezwen yon sistèm apa.
CREATE TABLE IF NOT EXISTS sijesyon (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id),
  kò         text NOT NULL,
  kreye_nan  timestamptz NOT NULL DEFAULT now()
);

-- Kòd reyajisman modpas — yon kòd 6 chif ki gen yon dat ekspirasyon (10 min).
-- Nan pwodiksyon, kòd la voye pa SMS (Twilio, si FIREBASE... non pa konfonn,
-- gade TWILIO_* nan .env). Si Twilio pa konfigire, sèvè a ekri kòd la nan
-- jounal (console) sèlman — pa janm nan repons API a — pou rezon sekirite.
CREATE TABLE IF NOT EXISTS reyajisman_modpas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kòd_ash      text NOT NULL,
  itilize      boolean NOT NULL DEFAULT false,
  ekspire_nan  timestamptz NOT NULL,
  kreye_nan    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reyajisman_modpas_user_id_idx ON reyajisman_modpas (user_id);

-- "Lye mw yo" — adrès itilizatè a anrejistre (kay, travay, fanmi lòt kote)
-- pou l ka swiv alèt pou plizyè kote, pa sèlman kote li fizikman ye a.
CREATE TABLE IF NOT EXISTS lye_itilizatè (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  non        text NOT NULL,
  latitude   double precision NOT NULL,
  longitude  double precision NOT NULL,
  kreye_nan  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lye_itilizatè_user_id_idx ON lye_itilizatè (user_id);

-- ===== Sekirite done itilizatè: plis detay ak idantite verifyab =====
-- Nimewo dokiman idantite (NIF/CIN/Paspò) pa janm estoke an klè: nou gen
-- yon "ash" (SHA-256, fiks) pou verifye inisite san nou pa ka retounen l
-- an klè, ak yon vèsyon "chifre" (AES-256-GCM) si nou bezwen l afiche/verifye
-- pita (egzanp pou otorite ki verifye idantite pandan yon ankèt ofisyèl).
ALTER TABLE users ADD COLUMN IF NOT EXISTS non_konplè text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS adrès_kay text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dokiman_tip text CHECK (dokiman_tip IN ('NIF', 'CIN', 'Paspò'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS dokiman_ash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dokiman_chifre text;

CREATE UNIQUE INDEX IF NOT EXISTS users_dokiman_ash_uniq ON users (dokiman_ash) WHERE dokiman_ash IS NOT NULL;

-- ===== Konfimasyon otomatik administrasyon (1 minit apre yon rapò) =====
ALTER TABLE reports ADD COLUMN IF NOT EXISTS konfimasyon_pwograme_nan timestamptz;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS konfimasyon_voye boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS reports_konfimasyon_pwograme_idx ON reports (konfimasyon_pwograme_nan)
  WHERE konfimasyon_voye = false;

-- ===== Redwi enpak fo rapò/spam (itilize ak niveau_konfyans ki deja egziste
-- sou "users") — yon rapò kache otomatikman nan flux jeneral la si plizyè
-- moun siyale l, ap tann revizyon admin.
ALTER TABLE reports ADD COLUMN IF NOT EXISTS kache_pou_revizyon boolean NOT NULL DEFAULT false;

-- ===== Ijans deklare pa admin (pou "Mwen An Sekirite") =====
CREATE TABLE IF NOT EXISTS ijans_deklare (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tit         text NOT NULL,
  deskripsyon text,
  lokalizasyon geography(Point, 4326) NOT NULL,
  reyon_km    integer NOT NULL DEFAULT 50,
  kreye_pa    uuid REFERENCES users(id),
  aktif       boolean NOT NULL DEFAULT true,
  kreye_nan   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ijans_deklare_lokalizasyon_idx ON ijans_deklare USING GIST (lokalizasyon);
CREATE INDEX IF NOT EXISTS ijans_deklare_aktif_idx ON ijans_deklare (aktif) WHERE aktif = true;

CREATE TABLE IF NOT EXISTS ijans_repons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ijans_id    uuid NOT NULL REFERENCES ijans_deklare(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id),
  kreye_nan   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ijans_id, user_id)
);

-- ===== Alèt meteyo ofisyèl (NOAA/NHC) =====
CREATE TABLE IF NOT EXISTS alèt_meteyo (
  id            text PRIMARY KEY, -- idantifyan tanpèt NOAA a (egzanp "AL032026")
  non           text NOT NULL,
  tip           text NOT NULL, -- "Depresyon Twopikal", "Tanpèt Twopikal", "Siklòn", elt.
  entansite_kt  integer,
  deskripsyon   text,
  lyen_ofisyèl  text,
  distans_km    integer,
  aktif         boolean NOT NULL DEFAULT true,
  kreye_nan     timestamptz NOT NULL DEFAULT now(),
  mizajou_nan   timestamptz NOT NULL DEFAULT now()
);

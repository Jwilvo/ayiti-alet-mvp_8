# Ayiti Alèt — MVP

Sa a se premye vèsyon (MVP) platfòm Ayiti Alèt la, ki bati dirèkteman sou dokiman PRD a
(seksyon 8.1 — MVP). Li gen 2 pati:

- **backend/** — API REST (Node.js + Express + TypeScript + **PostgreSQL/PostGIS**).
  Otantifikasyon, kreyasyon/lis rapò, woutaj otomatik bay otorite yo, rechèch kote enpòtan,
  ak yon panèl admin ak deteksyon rapò repete (jewospatyal reyèl ak `ST_DWithin`).
- **frontend/** — Aplikasyon web mobil-first (React + TypeScript + Vite) ki konsome API a:
  Akèy (bouton SOS + kat), Kreye Rapò, Kat Ensidan, Detay Rapò, Rechèch Sèvis, Pwofil/Login,
  Panèl Administrasyon (`/admin`), ak mòd offline.

## Kijan pou kouri l an lokal

### 1. Enstale PostgreSQL + PostGIS (yon sèl fwa)

```bash
sudo apt-get install -y postgresql postgresql-contrib postgis postgresql-16-postgis-3
sudo service postgresql start

sudo -u postgres psql -c "CREATE USER ayiti_alet WITH PASSWORD 'ayiti_alet_dev' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE ayiti_alet OWNER ayiti_alet;"
sudo -u postgres psql -d ayiti_alet -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -d ayiti_alet -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ayiti_alet;"

# Aplike schema a
psql "postgresql://ayiti_alet:ayiti_alet_dev@localhost:5432/ayiti_alet" -f backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # ajiste DATABASE_URL si sa nesesè
npm install
npm run seed   # ranpli baz done a ak kèk done demo
npm run dev                    # kouri sou http://localhost:4000
```

Kont demo: `telefòn: 50937000000` / `modpas: demo1234`
Kont admin demo: `telefòn: 50900000000` / `modpas: admin1234`

### 3. Frontend

Nan yon lòt tèminal:

```bash
cd frontend
npm install
npm run dev       # kouri sou http://localhost:5173
```

Louvri `http://localhost:5173` nan navigatè ou (redwi lajè fenèt la pou wè fòma mobil la).
Panèl admin la disponib sou `http://localhost:5173/admin`.

## Estrikti API a

Gade `backend/README-API.md` pou lis konplè endpoint yo, oswa dokiman PRD orijinal la pou
achitekti konplè, modèl bazdone, ak plan pou Vèsyon 1.0 / 2.0.

## Fonksyon ki fin bati

- ✅ Backend API konplè sou **vrè PostgreSQL + PostGIS** (`backend/db/schema.sql`) — pa yon
  similasyon ankò. Pwen jewografik yo estoke kòm `geography(Point, 4326)` ak endèks GIST.
- ✅ Kat entèaktif reyèl (Leaflet + OpenStreetMap, san kle API)
- ✅ **Mòd offline**: si pa gen entènèt (oswa rekèt la echwe), rapò a estoke lokalman
  (`localStorage`) epi li voye otomatikman lè koneksyon an retounen (`frontend/src/offline.ts`).
  Ekran Akèy la montre yon ti tag "poko voye" pou rapò ki nan atant yo.
- ✅ **Panèl Administrasyon** (`/admin`): pou kont otorite yo (`wòl: admin`) — estatistik,
  verifye/rejte/rezoud rapò, ak **deteksyon rapò repete an tan reyèl ak PostGIS**
  (`ST_DWithin` — 2 rapò menm kategori, mwens pase 300m e 45 min apa). Kont demo:
  `50900000000` / `admin1234`.
- ✅ **Bouton SOS ak pataj pozisyon an tan reyèl**: deklanche yon SOS voye pozisyon GPS
  imedyatman e kontinye mete l ajou chak 15 segond pandan ijans lan ap kontinye
  (`frontend/src/sos.ts`, `backend/src/routes/sos.ts`). Yon **lyen piblik pou swiv**
  (`/swiv/:id`) pèmèt kontak ijans oswa otorite wè pozisyon an tan reyèl san yo pa bezwen
  kont. Itilizatè ka anrejistre jiska 5 kontak ijans nan Pwofil, e voye yo yon SMS ak lyen
  swiv la an yon sèl klik.
- ✅ **Telechajman foto pou rapò yo** (`backend/src/routes/uploads.ts`): itilizatè ka pran
  oswa chwazi jiska 3 foto lè l ap ranpli yon rapò; yo telechaje imedyatman epi parèt nan
  detay rapò a. Backend la valide tip fichye (JPEG/PNG/WEBP/GIF) ak gwosè (maks 8 Mo).
- ✅ **Modil analiz imaj (AI)** (`backend/src/util/imageAnalysis.ts`, pi JS ak Jimp — san
  bezwen modèl AI ki telechaje soti lòt kote): chak foto analize otomatikman pou:
  - **Koulè dominant** (ede kwaze ak kategori a — egzanp yon rapò "dife" ki gen yon foto
    prensipalman ble ta ka mande verifikasyon anplis)
  - **Deteksyon flou** (analiz kontras lokal) — avèti moun nan si foto a pa klè
  - **Deteksyon foto doub** ant rapò diferan (perceptual hash "average hash" + distans
    Hamming) — jwenn si menm ensidan an rapòte de fwa ak menm foto a. Teste ak imaj
    reyalis (fòm/gradyan): 2 vèsyon menm foto a byen detekte kòm "sanble", pandan yon foto
    konplètman diferan pa jwenn okenn fo-alèt.
  - Avètisman yo parèt bay itilizatè a apre soumèt, e nan detay rapò a (badj "flou" ak yon
    ti pwen koulè sou chak foto).
- ✅ **PWA (Progressive Web App)**: aplikasyon an ka **enstale dirèkteman sou telefòn**
  (Android/iPhone) san pase pa Google Play/App Store — moun nan vizite sit la nan
  navigatè a epi peze "Ajoute sou Akèy". Manifest, ikòn, ak service worker (mòd offline
  pou kòd aplikasyon an) deja konfigire ak `vite-plugin-pwa`. Verifye ak
  `npm run build` — jenere `manifest.webmanifest`, `sw.js`, ak precache 13 fichye.
- ✅ **Capacitor pou Google Play / App Store**: pwojè Android (`frontend/android/`) ak iOS
  (`frontend/ios/`) natif yo deja jenere e konfigire — pare pou louvri nan Android Studio /
  Xcode sou yon machin devlopè (SDK/Xcode pa disponib nan anviwonman sandbox sa a).
  Gade `DEPLOY.md` seksyon "Opsyon C" pou enstriksyon konplè.

## Pwochèn Etap: Deplwaman ak Piblikasyon

Gade **`DEPLOY.md`** pou yon gid detaye etap pa etap: deplwaman sou Render.com oswa
DigitalOcean, konfigirasyon non domèn/SSL, ak piblikasyon aplikasyon an sou Google Play ak
App Store ak Capacitor.

## Pwochèn etap (pou depase MVP nèt)

- Migre kliyan an sou Flutter pou vrè aplikasyon mobil (Android/iOS) ak SQLite lokal —
  pa t posib bati/teste nan anviwonman sa a paske SDK Flutter la mande telechajman ki bloke
  pa rezo sandbox la (`storage.googleapis.com`, elatriye)
  Nan sit sa a, tout lòt fonksyon PRD a te mande pou MVP → V1.0 fin fèt e teste, gade seksyon
  "Fonksyon ki fin bati" anwo a.
- Ranplase modil analiz imaj heuristik la (koulè/flou/hash) ak yon vrè modèl vizyon (deteksyon
  objè: dife, machin, moun) lè gen aksè a yon anviwonman ak GPU/modèl pre-antrene
- Entegrasyon SMS reyèl (Twilio) pou notifikasyon otorite yo, olye lyen `sms:` manyèl la
- Otantifikasyon sou wout `/sos/:id/pozisyon` (kounye a li louvri pou pèmèt SOS anonim —
  bon pou MVP, men ta dwe limite pa yon tokèn sesyon SOS pou pwodiksyon)
- Migrasyon/backup otomatik, monitoring (Prometheus/Grafana)

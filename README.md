# Ayiti Alèt — MVP

Platfòm sekirite sitwayen ak jesyon ijans pou Ayiti. Li gen 2 pati:

- **backend/** — API REST (Node.js + Express + TypeScript + **PostgreSQL/PostGIS**).
  Otantifikasyon, kreyasyon/lis rapò, woutaj otomatik bay otorite yo, rechèch kote enpòtan,
  panèl admin ak deteksyon rapò repete, SOS ak pozisyon an tan reyèl, ak **zonaj alèt pa
  depatman/komin**.
- **frontend/** — Aplikasyon web mobil-first (React + TypeScript + Vite), enstalab kòm PWA,
  ak pwojè Android/iOS natif (Capacitor) pare pou app store.

## Kijan pou kouri l an lokal (Docker — pi senp)

```bash
cp .env.example .env    # ajiste modpas/sekrè si w vle
docker compose up -d --build
docker compose exec backend node dist/scripts/seed.js
```

Louvri `http://localhost:8080`.

## Kijan pou kouri l an lokal (san Docker)

### 1. Enstale PostgreSQL + PostGIS (yon sèl fwa)

```bash
sudo apt-get install -y postgresql postgresql-contrib postgis postgresql-16-postgis-3
sudo service postgresql start
sudo -u postgres psql -c "CREATE USER ayiti_alet WITH PASSWORD 'ayiti_alet_dev' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE ayiti_alet OWNER ayiti_alet;"
sudo -u postgres psql -d ayiti_alet -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ayiti_alet;"
psql "postgresql://ayiti_alet:ayiti_alet_dev@localhost:5432/ayiti_alet" -f backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed       # ranpli done demo + lis komin/depatman
npm run dev         # http://localhost:4000
```

Kont demo: `50937000000` / `demo1234` · Kont admin: `50900000000` / `admin1234`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Fonksyon ki fin bati

- ✅ Backend API konplè sou vrè PostgreSQL + PostGIS
- ✅ Kat entèaktif reyèl (Leaflet + OpenStreetMap)
- ✅ Mòd offline ak sinkwonizasyon otomatik
- ✅ Panèl Administrasyon ak deteksyon rapò repete an tan reyèl ak PostGIS (`ST_DWithin`)
- ✅ Bouton SOS ak pataj pozisyon an tan reyèl, tokèn sesyon sekirize
- ✅ Telechajman foto + modil analiz imaj (AI heuristik: koulè, flou, deteksyon doub)
- ✅ **Alèt otomatik pa distans (san bouton, san seleksyon manyèl)**: aplikasyon an jwenn
  pozisyon telefòn ou an background (yon sèl pèmisyon pou tout sesyon an), epi klase chak
  rapò otomatikman: **🔔 Ijans pou ou** si li mwens pase 15km de ou (anviwon gwosè yon
  komin), **ℹ️ Enfòmasyon** si li ant 15-80km (anviwon gwosè yon depatman), oswa kache
  nèt si li pi lwen. Pa gen okenn non komin/depatman moun bezwen chwazi — tout kalkile ak
  distans GPS reyèl (`frontend/src/categories.ts` — `distansKm`, `nivoPètinans`).
- ✅ **Oto-deteksyon depatman pa GPS** (backend, `/zones/depatman-otomatik`): itilize PostGIS
  `ST_Contains` ak yon tolerans 5km pou konfime ki depatman yon pozisyon ye ladan — sa sèvi
  kòm baz pou fonksyon zòn ki pi presi nan lavni. Limit jewografik yo nan
  `backend/db/depatman_zòn_seed.sql` (Natural Earth, domèn piblik).
- ✅ **Notifikasyon push (son + vibrasyon)**: itilize Firebase Cloud Messaging. Aplikasyon an
  mande pèmisyon notifikasyon an silans (pa gen bouton apa), anrejistre tokèn aparèy la,
  epi backend la voye yon notifikasyon bay tout itilizatè ki nan 15km yon nouvo rapò lè l
  kreye. Yon sèl service worker konbine (`frontend/src/sw.ts`, estrateji "injectManifest")
  jere tou de mòd offline (Workbox) AK notifikasyon background (Firebase), pou evite konfli
  ant 2 service worker. San `FIREBASE_SERVICE_ACCOUNT` (backend) ak varyab `VITE_FIREBASE_*`
  (frontend) konfigire, fonksyon sa a dezaktive an silans san l pa kraze rès aplikasyon an.
- ✅ PWA (enstalasyon san app store) + pwojè Android/iOS natif (Capacitor)
- ✅ Sekirite: rate limiting, helmet, tokèn SOS

## Pwochèn Etap

Gade **`DEPLOY.md`** pou gid deplwaman (Render.com, DigitalOcean) ak piblikasyon app store.
Pwochèn amelyorasyon posib: zonaj nivo seksyon kominal (mande done GPS pi presi), notifikasyon
push reyèl (Firebase), modèl AI vizyon pou analiz foto.

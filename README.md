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
- ✅ **Zonaj alèt pa Depatman/Komin**: itilizatè chwazi komin yo (nan enskripsyon oswa
  Pwofil), rapò yo make ak yon komin lè yo kreye. Sou Akèy ak Kat la, rapò ki nan **menm
  komin ak itilizatè a** parèt kòm "🔔 Ijans pou ou", pandan rapò lòt komin parèt kòm
  "ℹ️ Enfòmasyon" sèlman — sa evite moun resevwa alèt ijans pou zòn ki pa konsène yo.
  Lis 139 komin/10 depatman yo nan `backend/db/komin_seed.sql`.
- ✅ PWA (enstalasyon san app store) + pwojè Android/iOS natif (Capacitor)
- ✅ Sekirite: rate limiting, helmet, tokèn SOS

## Pwochèn Etap

Gade **`DEPLOY.md`** pou gid deplwaman (Render.com, DigitalOcean) ak piblikasyon app store.
Pwochèn amelyorasyon posib: zonaj nivo seksyon kominal (mande done GPS pi presi), notifikasyon
push reyèl (Firebase), modèl AI vizyon pou analiz foto.

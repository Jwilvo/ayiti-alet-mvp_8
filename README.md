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
- ✅ **Kòmantè piblik sou rapò yo** (enspire pa SOSAFE "Collaboration"): moun ka ekri yon ti
  mesaj pou konplete/mete ajou yon rapò ("Ponpye rive", "Wout la debloke"), anonim oswa
  ak non yo. Fil kòmantè yo parèt sou Detay Rapò.
- ✅ **Estati vizib pou tout sitwayen** (enspire pa "Report Feed — kijan istwa a fini"):
  chak rapò kounye a montre klèman si li "🆕 Nouvo", "✔ Otorite konfime", "✅ Rezolu", oswa
  "✕ Rejte apre revizyon" — pa sèlman admin yo ki wè sa ankò.
- ✅ **Avize kontak ijans lè yon rapò grav** (enspire pa "Private Groups"): apre yon
  itilizatè konekte fè yon rapò nivo "grav", aplikasyon an pwopoze voye yon SMS ak lyen
  rapò a bay kontak ijans li yo (reyitilize menm sistèm SOS la deja genyen).
- ✅ **Nouvo navigasyon enspire pa SOSAFE**: Akèy la kounye a se yon **kat plenn ekran**
  (bouton SOS ak Rapòte flote sou li). Navigasyon anba a gen 5 bouton: **Akèy** (kat),
  **🔔 Alèt** (rapò nan 15km, ak yon badj ki konte kantite ki poko li, lekti yonn apre
  lòt), **📍 Sèvis**, **ℹ️ Nouvèl** (rapò 15-80km, menm mekanis lekti), ak **☰ Meni**
  (Pwofil sekirite, Lye mw yo, Group, Envite zanmiw, Blog, Sijesyon [ak backend
  fonksyonèl], Gid Kominotè, ak Reglaj — Kont, Reglaj Alèt, Vizyalizasyon Map, Nouvèl,
  Aparans, Tèm ak Kondisyon, Politik Konfidansyalite, Fèmen Sesyon). Kèk atik Meni yo
  (Pwofil sekirite, Lye mw yo, Group, Blog, Vizyalizasyon Map, Aparans) se plasholdè
  klè pou kounye a — estrikti a la, kontni konplè a ap vini pita.
- ✅ **Amelyorasyon SOS**: bouton SOS flotan an gen animasyon "ond" (pulsasyon) ankò,
  menm apre nou te fè l pi piti/flotan sou kat la. Deklanchman SOS voye **notifikasyon
  push otomatik** bay tout itilizatè aplikasyon ki nan 15km (menm jan ak rapò nòmal yo).
  Yon sèl klik voye SMS bay **tout** kontak ijans yo ansanm (olye youn pa youn), plis yon
  opsyon **WhatsApp** pou plis vizibilite/enpòtans lè mesaj la rive.
- ✅ **Bouton "Fè yon rapò"** kounye a se yon ba orizontal ble ak tèks vizib, olye yon ti
  wonn ak sèlman yon ikòn.
- ✅ **Alèt/Nouvèl vin yon lis konplè** (olye lekti kat pa kat): tout rapò yo parèt nan yon
  lis, ak yon **bouton triyaj** (pi nouvo an premye / pi ansyen an premye), ak yon **ti
  pwen koulè** ki make rapò ki poko li yo. Klike sou nenpòt rapò louvri detay li e make l
  "li".
- ✅ **Kat la ak koulè pi sonm/mwens ankonbre**: chanje tuil OpenStreetMap estanda yo
  (ki gen anpil koulè) pou vèsyon "Dark Matter" CARTO a, ki matche pi byen ak tèm nwa
  aplikasyon an, san bezwen okenn kle API.
- ✅ **Reyajiste modpas bliye**: flux konplè (mande kòd → kòd 6 chif → konfime → nouvo
  modpas) teste an dirèk. Kòd la voye pa SMS si `TWILIO_*` konfigire; si non, li ekri nan
  jounal sèvè a sèlman (JANM nan repons API a, pou rezon sekirite).
- ✅ **"Lye mw yo" konplè**: itilizatè ka anrejistre jiska 5 adrès (kay, travay, fanmi),
  chwazi pozisyon dirèkteman sou yon kat, e wè konbyen alèt "toupre" chak lye — san yo pa
  bezwen fizikman ye la.
- ✅ **Kat chalè + estatistik nan Admin**: grafik rapò sou 7 dènye jou, distribisyon pa lè
  jounen an, ak yon kat ki montre pozisyon tout rapò yo (dansite jewografik).
- ✅ **Plizyè lang (pati)**: Kreyòl/Français/English disponib nan Meni → Reglaj → Lang.
  Navigasyon prensipal la (Akèy, Alèt, Sèvis, Nouvèl, Meni), Akèy, ak Alèt/Nouvèl tradui
  konplètman. Rès aplikasyon an (kòmantè, admin, sèten paj Meni) rete an Kreyòl pou
  kounye a — kouvèti a ap ogmante nan pwochen vèsyon yo.
- ✅ **Konfimasyon otomatik administrasyon**: 1 minit apre yon rapò kreye, yon "worker"
  background (`backend/src/autoKonfimasyon.ts`, verifye chak 15 segond, rezisyan menm si
  sèvè a rekòmanse) ajoute yon kòmantè otomatik ki di administrasyon resevwa rapò a e l ap
  transfere l bay otorite konsène a. Teste an dirèk — mache egzakteman apre 60 segond.
- ✅ **Sekirite done itilizatè yo, elaji**:
  - Enskripsyon kounye a ka kolekte non konplè, tip dokiman idantite (NIF/CIN/Paspò),
    nimewo li, ak adrès kay.
  - Nimewo dokiman idantite yo **pa janm estoke an klè**: yon ash SHA-256 fiks sèvi pou
    detekte doub kont (menm si moun nan ekri l ak/san tirè/espas), e yon vèsyon chifre
    AES-256-GCM (`backend/src/encryption.ts`) estoke pou konsiltasyon ofisyèl pita.
  - Restriksyon: yon moun **pa ka** kreye 2 kont ak menm nimewo dokiman — teste an dirèk.
  - Modpas dwe swiv yon "fòma sekirize" (omwen 8 karaktè, yon majiskil, yon chif, yon
    karaktè espesyal) — validasyon backend teste ak modpas fèb (rejte) ak fò (aksepte).
  - Panèl Administrasyon **pa parèt ankò nan Meni pou sitwayen nòmal yo** — li sèlman
    vizib pou kont ki gen wòl "admin". (Wout `/admin` li menm te toujou mande kont admin
    separe pou konekte — sa a se yon amelyorasyon vizibilite/UX, pa yon nouvo restriksyon
    sekirite backend.)
- ✅ PWA (enstalasyon san app store) + pwojè Android/iOS natif (Capacitor)
- ✅ Sekirite: rate limiting, helmet, tokèn SOS

## Pwochèn Etap

Gade **`DEPLOY.md`** pou gid deplwaman (Render.com, DigitalOcean) ak piblikasyon app store.
Pwochèn amelyorasyon posib: zonaj nivo seksyon kominal (mande done GPS pi presi), notifikasyon
push reyèl (Firebase), modèl AI vizyon pou analiz foto.

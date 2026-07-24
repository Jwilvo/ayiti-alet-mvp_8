# Gid Deplwaman — Ayiti Alèt

Gid sa a montre w etap pa etap kijan pou mete Ayiti Alèt sou entènèt reyèl, pou moun ka
itilize l soti nenpòt kote. Nou rekòmande **Render.com** kòm premye chwa paske li pi senp
pou yon MVP (mwens konfigirasyon, gen yon plan gratis pou teste). Yon seksyon
**DigitalOcean** anba a montre altènativ la si ou bezwen plis kontwòl.

---

## Opsyon A — Render.com (rekòmande pou kòmanse)

### Etap 1 — Kreye kont ak konekte GitHub

1. Ale sou [render.com](https://render.com) → kreye yon kont (gratis pou kòmanse).
2. Mete kòd pwojè a sou yon repo GitHub prive oswa piblik (si li poko la):
   ```bash
   cd ayiti-alet
   git init
   git add .
   git commit -m "Premye vèsyon Ayiti Alèt"
   git branch -M main
   git remote add origin https://github.com/<non-itilizatè>/ayiti-alet.git
   git push -u origin main
   ```
3. Nan Render, peze **New +** → **Blueprint**, epi konekte repo GitHub ou a.

### Etap 2 — Kreye baz done PostgreSQL + PostGIS

1. Nan Render, **New +** → **PostgreSQL**.
2. Non: `ayiti-alet-db`. Chwazi rejyon ki pi pre Karayib la (Ohio oswa Virginia, USA, souvan pi bon latans pou Ayiti).
3. Apre l kreye, ale nan **Shell** oswa itilize `psql` ak "External Connection String" Render ba ou a pou aplike schema a:
   ```bash
   psql "<external-connection-string-render-ba-ou>" -f backend/db/schema.sql
   ```
4. **Enpòtan**: Render PostgreSQL pa vini ak PostGIS otomatikman sou plan gratis la — verifye
   opsyon "PostGIS" nan paramèt baz done a, oswa itilize yon founisè ki sipòte l (egzanp
   Supabase, Neon, oswa yon VM DigitalOcean — gade Opsyon B pi ba).

### Etap 3 — Deplwaye backend la (Web Service)

1. **New +** → **Web Service** → chwazi repo a, dosye `backend/`.
2. Konfigirasyon:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Node
3. Ajoute variables anviwònman (Environment Variables):
   - `DATABASE_URL` = "Internal Connection String" baz done Render ou a
   - `JWT_SECRET` = yon valè alatwa long (jenere ak `openssl rand -hex 32`)
   - `PORT` = `4000` (Render ka ranplase l otomatikman ak pwòp pò li)
4. Peze **Create Web Service**. Render ap bati e demare backend la otomatikman.
5. Lè li fini, ou ap gen yon URL tankou `https://ayiti-alet-backend.onrender.com`.
6. Teste: `curl https://ayiti-alet-backend.onrender.com/health`

### Etap 4 — Seed done demo yo (yon sèl fwa)

Sou machin ou (lokal), ak `DATABASE_URL` ki pwente sou baz done pwodiksyon an:
```bash
cd backend
DATABASE_URL="<external-connection-string>" npm run seed
```

### Etap 5 — Deplwaye frontend la (Static Site)

1. **New +** → **Static Site** → menm repo a, dosye `frontend/`.
2. Konfigirasyon:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Ajoute yon variab anviwònman: `VITE_API_URL` = URL backend ou a (Etap 3.5).
4. Peze **Create Static Site**. Render ba ou yon URL tankou `https://ayiti-alet.onrender.com`.

### Etap 6 — Non domèn pèsonalize (opsyonèl men rekòmande)

1. Achte yon non domèn (Namecheap, Google Domains, oswa yon rejistrè lokal).
2. Nan Render, ale nan paramèt Static Site la → **Custom Domain** → swiv enstriksyon pou
   ajoute yon rekò CNAME nan DNS domèn ou a.
3. Render jenere SSL/HTTPS otomatikman pou non domèn pèsonalize a (Let's Encrypt).

---

## Opsyon B — DigitalOcean (plis kontwòl, mande plis konfigirasyon)

Itil si ou vle Docker Compose konplè (backend + frontend + baz done) sou yon sèl sèvè, oswa
si ou bezwen PostGIS san limit.

### Etap 1 — Kreye yon Droplet
1. [digitalocean.com](https://digitalocean.com) → **Create** → **Droplet**.
2. Chwazi imaj **Docker** (deja gen Docker enstale) sou Ubuntu 24.04.
3. Rejyon: pi pre Karayib la posib (New York oswa Toronto).
4. Gwosè: kòmanse ak 2GB RAM / 1 vCPU pou yon MVP/pilòt.

### Etap 2 — Konekte ak konfigire sèvè a
```bash
ssh root@<adrès-ip-droplet-la>
git clone https://github.com/<non-itilizatè>/ayiti-alet.git
cd ayiti-alet
cp .env.example .env
nano .env   # mete vrè DB_PASSWORD ak JWT_SECRET
```

### Etap 3 — Demare tout bagay ak Docker Compose
```bash
docker compose up -d --build
docker compose exec backend node dist/scripts/seed.js
```

### Etap 4 — Konfigire Nginx + SSL pou domèn ou a
```bash
apt install -y certbot python3-certbot-nginx nginx
# Konfigire yon reverse proxy ki voye trafik https://tondomèn.com → pò 8080 (frontend)
# ak https://api.tondomèn.com → pò 4000 (backend)
certbot --nginx -d tondomèn.com -d api.tondomèn.com
```

---

## Opsyon C — Capacitor: Piblisite sou Google Play ak App Store

Pwojè a **deja gen Capacitor konfigire**, ak pwojè Android ak iOS natif ki deja jenere
(`frontend/android/` ak `frontend/ios/`) — sa te fèt e teste nan devlopman pwojè a. Sèl bagay
ki rete se konpile yo sou yon machin ki gen Android Studio / Xcode enstale (sandbox
devlopman an pa gen aksè pou telechaje Android SDK/Xcode).

### Android

1. Sou machin ou (ki gen [Android Studio](https://developer.android.com/studio) enstale):
   ```bash
   cd frontend
   npm install
   npm run cap:android    # bati web la, senkwonize, louvri Android Studio
   ```
2. Nan Android Studio: **Build → Generate Signed Bundle / APK**.
3. Kreye yon "keystore" (kle siyati) — **konsève l an sekirite, si w pèdi l ou pa ka mete
   ajou app la ankò sou Play Store**.
4. Chwazi **Android App Bundle (.aab)** — se fòma Google Play mande kounye a.
5. Ale sou [Google Play Console](https://play.google.com/console) (kont $25 yon sèl fwa),
   kreye yon nouvo app, telechaje `.aab` la, ranpli deskripsyon/foto ekran/politik
   konfidansyalite, epi soumèt pou revizyon.

### iOS

1. Sou yon Mac (obligatwa pou iOS) ki gen [Xcode](https://developer.apple.com/xcode/) enstale:
   ```bash
   cd frontend
   npm install
   npm run cap:ios    # bati web la, senkwonize, louvri Xcode
   ```
2. Nan Xcode: chwazi ekip devlopè ou a (Apple Developer, $99/an), **Product → Archive**.
3. Itilize **Organizer** pou soumèt dirèkteman nan **App Store Connect**.
4. Ranpli enfòmasyon app la, foto ekran, politik konfidansyalite, epi soumèt pou revizyon
   (souvan 1-3 semèn pou premye soumisyon an).

### Chak fwa ou modifye kòd la

Apre nenpòt chanjman nan `frontend/src`, kouri `npm run cap:sync` anvan ou re-bati nan
Android Studio/Xcode — sa kopye dènye vèsyon web la nan pwojè natif yo.



- [ ] `curl https://api.tondomèn.com/health` reponn `{"statut":"ok",...}`
- [ ] Sit la louvri sou `https://tondomèn.com` san erè SSL
- [ ] Ka kreye yon kont, konekte, fè yon rapò tès
- [ ] Kat la chaje (tuil OpenStreetMap yo mande yon koneksyon HTTPS ki mache byen)
- [ ] SOS deklanche e pozisyon mete ajou
- [ ] Sou telefòn: "Ajoute sou Akèy" enstale aplikasyon an kòm PWA
- [ ] Backup otomatik baz done a konfigire (Render/DigitalOcean toude ofri sa kòm opsyon peye)

## Pwochèn Pwoblèm Yo Ka Rankontre

| Pwoblèm | Solisyon |
|---|---|
| Kat la pa chaje | Verifye pa gen erè "mixed content" — tout rekèt yo (API, tuil) dwe HTTPS si sit la HTTPS |
| "CORS error" nan konsòl navigatè a | Verifye backend `cors()` konfigire pou aksepte orijin frontend ou a an pwodiksyon |
| Baz done pa konekte | Verifye `DATABASE_URL` egzat, e si IP backend ou a otorize nan "firewall" baz done a |
| PostGIS pa disponib | Kèk founisè "managed Postgres" pa gen PostGIS pa default — chèche opsyon "extensions" oswa itilize Opsyon B (Docker) |

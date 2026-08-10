# Gid Deplwaman — Ayiti Alèt

## Opsyon A — Render.com (rekòmande pou kòmanse)

### Baz done: Supabase (gratis, PostGIS aktive fasil)
1. Kreye kont sou supabase.com, kreye yon pwojè
2. SQL Editor → kole kontni `backend/db/schema.sql` → Run
3. SQL Editor → kole kontni `backend/db/komin_seed.sql` → Run
4. SQL Editor → kole kontni `backend/db/depatman_zòn_seed.sql` → Run (limit jewografik
   depatman yo, pou oto-sijesyon GPS)
4. "Connect" → "Session pooler" → kopye chemen an (itilize sa a, pa "Direct connection",
   pou konpatibilite ak rezo IPv4 Render)

### Backend
1. Render → New → Web Service → konekte repo GitHub ou
2. Root Directory: `backend` | Language: Docker (detekte otomatikman) | Plan: Free
3. Environment Variables: `DATABASE_URL` (Supabase), `JWT_SECRET` (yon fraz long),
   `PORT=4000`
4. Apre deplwaman, Shell → `node dist/scripts/seed.js`

### Frontend
1. Render → New → Static Site → menm repo a, dosye `frontend`
2. Build Command: `npm install && npm run build` | Publish Directory: `dist`
3. Environment Variable: `VITE_API_URL` = URL backend ou (san `/health`)

## Opsyon B — Docker Compose (yon sèl sèvè, plis kontwòl)

```bash
git clone <repo-ou>
cd ayiti-alet
cp .env.example .env   # mete vrè DB_PASSWORD ak JWT_SECRET
docker compose up -d --build
docker compose exec backend node dist/scripts/seed.js
```

Konfigire Nginx + Let's Encrypt pou HTTPS sou non domèn ou.

## Piblikasyon sou Google Play / App Store (Capacitor)

Pwojè Android (`frontend/android/`) ak iOS (`frontend/ios/`) natif yo deja jenere.

```bash
cd frontend
npm install
npm run cap:android    # louvri Android Studio
# oswa
npm run cap:ios        # louvri Xcode (Mac sèlman)
```

Nan Android Studio: Build → Generate Signed Bundle (.aab) → soumèt sou Google Play Console
($25 yon sèl fwa). Nan Xcode: Product → Archive → soumèt sou App Store Connect ($99/an).

Apre chak chanjman kòd: `npm run cap:sync` anvan ou re-bati nan Android Studio/Xcode.

---

## Konfigire Notifikasyon Push (Firebase Cloud Messaging)

### Etap 1 — Kreye pwojè Firebase (gratis)

1. Ale sou [console.firebase.google.com](https://console.firebase.google.com), konekte ak
   yon kont Google, peze **"Add project"** (Ajoute pwojè)
2. Bay li yon non (egzanp "Ayiti Alèt"), dezaktive Google Analytics si ou pa bezwen l
   (opsyonèl), peze "Create project"

### Etap 2 — Ajoute yon app Web

1. Nan dashboard pwojè a, peze ikòn **"</>"** (Web) pou ajoute yon app
2. Bay li yon ti non (egzanp "ayiti-alet-web"), **pa** koche "Firebase Hosting"
3. Firebase ap montre yon bwat `firebaseConfig` ak plizyè valè (`apiKey`, `authDomain`,
   `projectId`, elatriye) — **kopye yo**, ou ap bezwen yo pou varyab `VITE_FIREBASE_*` yo

### Etap 3 — Aktive Cloud Messaging ak jenere kle VAPID

1. Nan meni goch, ale nan **"Project settings"** (ikòn wou) → tab **"Cloud Messaging"**
2. Anba "Web configuration", peze **"Generate key pair"** — sa jenere yon **kle VAPID**
3. Kopye kle sa a → se valè `VITE_FIREBASE_VAPID_KEY`

### Etap 4 — Jenere kle sèvis (pou backend la)

1. Toujou nan "Project settings" → tab **"Service accounts"**
2. Peze **"Generate new private key"** → li telechaje yon fichye `.json`
3. Louvri fichye sa a ak Notepad, kopye **TOUT kontni li** (yon sèl liy JSON) — se valè
   `FIREBASE_SERVICE_ACCOUNT` backend la

### Etap 5 — Konfigire varyab yo

**Sou Render, backend (`ayiti-alet-backend`) → Environment**:
- `FIREBASE_SERVICE_ACCOUNT` = tout kontni fichye JSON etap 4 la (kole l tankou l ye a)

**Sou Render, frontend (`ayiti-alet-frontend`) → Environment**:
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  (soti nan Etap 2), `VITE_FIREBASE_VAPID_KEY` (soti nan Etap 3)

Apre ou ajoute varyab yo, fè yon **"Manual Deploy"** sou tou de sèvis yo pou yo pran nouvo
konfigirasyon an.

### Verifye li mache

1. Konekte sou aplikasyon an, aksepte pèmisyon notifikasyon lè navigatè a mande l
2. `curl https://api.tondomèn.com/notifications/estati` dwe reponn `{"aktif":true}`
3. Fè yon rapò tès pre yon lòt kont ki gen tokèn anrejistre — kont sa a dwe resevwa yon
   notifikasyon ak son nan kèk segond

---

## Lis Verifikasyon Apre Deplwaman

- [ ] `curl https://api.tondomèn.com/health` reponn `{"statut":"ok",...}`
- [ ] Ka kreye kont, konekte, fè yon rapò tès ak yon komin
- [ ] Sou Akèy, rapò nan menm komin ak itilizatè a montre tag "🔔 Ijans pou ou"
- [ ] SOS deklanche e lyen swiv la mache
- [ ] Sou telefòn: "Ajoute sou Akèy" enstale l kòm PWA

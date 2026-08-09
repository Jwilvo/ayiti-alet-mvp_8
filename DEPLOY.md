# Gid Deplwaman — Ayiti Alèt

## Opsyon A — Render.com (rekòmande pou kòmanse)

### Baz done: Supabase (gratis, PostGIS aktive fasil)
1. Kreye kont sou supabase.com, kreye yon pwojè
2. SQL Editor → kole kontni `backend/db/schema.sql` → Run
3. SQL Editor → kole kontni `backend/db/komin_seed.sql` → Run
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

## Lis Verifikasyon Apre Deplwaman

- [ ] `curl https://api.tondomèn.com/health` reponn `{"statut":"ok",...}`
- [ ] Ka kreye kont, konekte, fè yon rapò tès ak yon komin
- [ ] Sou Akèy, rapò nan menm komin ak itilizatè a montre tag "🔔 Ijans pou ou"
- [ ] SOS deklanche e lyen swiv la mache
- [ ] Sou telefòn: "Ajoute sou Akèy" enstale l kòm PWA

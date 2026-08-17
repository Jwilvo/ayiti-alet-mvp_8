# Chèkliste Anvan Lansman Piblik — Ayiti Alèt

## ⚠️ AKSYON OBLIGATWA anvan lansman: Peye Render

Kounye a backend la (`ayiti-alet-backend`) sou plan **gratis** Render. Sa kreye DE
pwoblèm kritik ki DWE korije anvan yon vrè lansman piblik:

1. **Backend "dòmi"** apre inaktivite — premye rekèt apre yon poz ka pran jiska 50
   segond. Danjere pou bouton SOS.
2. **Pò SMTP bloke nèt** (25, 465, 587) — Render bloke yo sou plan gratis depi
   Septanm 2025 kòm politik anti-spam. Sa vle di **reyajisman modpas pa imèl pa
   mache ditou** kounye a (kòd la jis ekri nan jounal sèvè a, itilizatè a pa janm
   resevwa l).

### Solisyon
Sou dashboard.render.com → `ayiti-alet-backend` → "Settings" → chanje plan an pou
**"Starter"** (~$7/mwa). Sa retire toude pwoblèm yo nan menm kou.

*Referans: konvèsasyon 15 Out 2026, kote nou te dekouvri ak konfime pwoblèm SMTP
la ak Logs Render yo.*

---

## Rès chèkliste a (gade tou README.md pou lis konplè fonksyon yo)

- [ ] Peye Render (Starter oswa pi wo) — gade anwo a
- [ ] Verifye Supabase paka "pran poz" (7 jou inaktivite sou plan gratis)
- [ ] Odit sekirite pwofesyonèl (sitou pou done idantite NIF/CIN/Paspò)
- [ ] Detèmine kiyès k ap veye Panèl Admin pandan yon vrè ijans (rapò "bezwen èd")
- [ ] Klarifye nan aplikasyon an ke "woutaj otorite" se entèn, pa yon vrè
      patenarya API ak PNH/Ponpye/elatriye (sof si yon patenarya reyèl siyen)
- [ ] Plan backup/rekiperasyon pou baz done Supabase a
- [ ] Revizyon legal Tèm ak Kondisyon / Politik Konfidansyalite

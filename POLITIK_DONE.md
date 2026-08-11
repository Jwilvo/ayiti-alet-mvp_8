# Politik Done — Ayiti Alèt

**Dènye mizajou**: Out 2026

Dokiman sa a eksplike ki done Ayiti Alèt kolekte, kijan yo pwoteje, ak ki limit reyèl
sistèm nan genyen. Li ekri pou itilizatè yo, patnè enstitisyonèl yo, ak nenpòt moun ki
mande "kijan nou pwoteje done sansib yo".

---

## 1. Ki done nou kolekte

| Done | Obligatwa? | Kote yo estoke |
|---|---|---|
| Non konplè | Non (opsyonèl) | Klè, nan baz done a |
| Nimewo telefòn | Wi | Klè (sèvi pou koneksyon) |
| Imèl | Non | Klè |
| Modpas | Wi | **Chifre ak bcrypt** (yon sèl direksyon — pa ka dechifre) |
| Adrès kay | Non | Klè |
| Tip ak nimewo dokiman (NIF/CIN/Paspò) | Non | **Chifre AES-256-GCM** + yon ash pou detekte doub |
| Pozisyon GPS (rapò, SOS) | Selon fonksyon | Klè (esansyèl pou fonksyon sekirite yo) |
| Foto rapò | Opsyonèl | Estoke sou sèvè a, analize otomatikman (koulè/netete) |
| Kontak ijans | Opsyonèl | Klè, nan kont itilizatè a sèlman |

**Rapò anonim**: lè yon moun chwazi rapòte san bay non, **okenn** enfòmasyon idantite
pa asosye ak rapò a nan baz done a.

---

## 2. Kijan nou pwoteje done sansib yo

### Nimewo dokiman idantite (NIF/CIN/Paspò)
- **Pa janm estoke an klè.**
- Yon **ash SHA-256** (fiks, san sèl) sèvi sèlman pou detekte si menm moun ap eseye
  kreye 2 kont — sistèm nan pa ka "li" nimewo a apati ash la.
- Yon vèsyon **chifre AES-256-GCM** estoke apa, itilize yon kle (`ENCRYPTION_KEY`) ki
  estoke sèlman nan konfigirasyon sèvè a — pa nan kòd sous la, pa nan repo GitHub la.
- **Okenn API pa retounen** valè sa yo (ni chifre ni an klè) nan repons li — nou verifye
  sa nan kòd la (pa gen `SELECT *`, chak rekèt nome kolòn li eksplisitman).
- Si `ENCRYPTION_KEY` pa konfigire an pwodiksyon, sistèm nan **refize** kreye nenpòt
  kont ak dokiman idantite, olye "sove" li ak yon kle tanporè ki ta pèdi apre yon
  rekòmansaj sèvè.

### Modpas
- Chifre ak **bcrypt** (yon sèl direksyon — menm nou pa ka "wè" modpas ou).
- Egzije yon fòma: omwen 8 karaktè, yon majiskil, yon chif, yon karaktè espesyal.

### Pwoteksyon kont atak
- **Limit vitès** sou koneksyon (40/15min), enskripsyon (**8/èdtan**, pi strik akoz
  risk "enimerasyon" nimewo dokiman), ak reyajisman modpas.
- **CORS limite**: sèlman sit ofisyèl Ayiti Alèt la ka rele API a soti nan yon navigatè.
- **Rekèt SQL parametrize** toupatou — okenn "SQL injection" posib.
- **Helmet** (antèt sekirite HTTP) aktive sou tout rekèt yo.

### Aksè administratif
- Panèl Administrasyon mande yon kont apa ak wòl "admin" — li **pa** vizib nan meni
  itilizatè nòmal yo.
- Okenn zouti/wout pa egziste pou "dechifre e afiche" yon nimewo dokiman — kapasite
  teknik la egziste nan kòd la (pou yon posib verifikasyon ofisyèl pita), men **pa gen
  okenn API ki ekspoze l kounye a**.

### Entèlijans Atifisyèl (AI)
- **Pa gen okenn sèvis AI/machine learning ki gen aksè done itilizatè yo**, ni pou
  enskripsyon, ni pou dokiman idantite. Sèl fonksyon "otomatik" nan aplikasyon an se
  analiz teknik senp sou koulè/netete foto rapò yo — li pa touche done pèsonèl.

### Rezime: 4 kouch pwoteksyon espesifik pou dokiman idantite yo

Kat mezi sa yo espesifikman ajoute pou redwi risk sou nimewo dokiman idantite yo, e
tout kat teste an dirèk pandan devlopman:

1. **Okenn API pa ka ekspoze done yo** — chak rekèt baz done nome kolòn li eksplisitman
   (pa gen `SELECT *`), kidonk `dokiman_ash`/`dokiman_chifre` pa janm ka "chape" nan yon
   repons API pa aksidan.
2. **Limit vitès dedye pou enskripsyon** (8 tantativ/èdtan, pi strik pase koneksyon
   nòmal la) — anpeche yon atakè "enimere" plizyè nimewo dokiman rapid pou dekouvri ki
   moun gen yon kont Ayiti Alèt.
3. **CORS limite a sit ofisyèl la sèlman** — yon lòt sit entènèt pa ka itilize navigatè
   yon itilizatè konekte pou rele API a an kachèt.
4. **Chifreman ki refize olye "sove pòv"** — si kle chifreman an (`ENCRYPTION_KEY`) pa
   konfigire kòrèkteman an pwodiksyon, sistèm nan **refize nèt** kreye yon kont ak
   dokiman idantite, olye chifre l ak yon kle tanporè ki ta pèdi valè li apre yon
   rekòmansaj sèvè.

---

## 3. Limit reyèl — pa gen okenn garanti

Dokiman sa a dekri **mekanis** ki aplike, men li **pa** yon garanti sekirite absoli:

1. **Pa gen odit sekirite pwofesyonèl** ki fèt sou kòd sa a jiska prezan. Bon pratik
   swiv, men sa pa ekivalan a yon revizyon endepandan pa yon espesyalis sètifye.
2. **Depandans lojisyèl** (npm packages) ka gen vilnerabilite ki dekouvri apre nou fin
   itilize yo — mizajou regilye nesesè.
3. **Sekirite depann de plizyè sèvis tyès pati** (Render, Supabase, GitHub) — yon fay
   nan sèvis sa yo ta ka afekte Ayiti Alèt tou.
4. **Sekirite kont administratè/enfrastrikti yo** (modpas Render/Supabase/GitHub, 2FA)
   rete responsablite ekip ki jere pwojè a.

## 4. Rekòmandasyon anvan yon lansman ak vrè done alaenswi

- Fè yon **odit sekirite pwofesyonèl** endepandan
- Verifye konfòmite ak lwa Ayisyen sou pwoteksyon done pèsonèl ki aplikab
- Mete an plas yon pwosesis pou itilizatè mande efase kont/done yo
- Etabli yon pwosedi klè an ka gen yon "brèch" done (kilès pou avize, nan konbyen tan)

---

*Pou kesyon sou dokiman sa a, kontakte ekip Ayiti Alèt la atravè kanal sipò ki
disponib nan aplikasyon an (Meni → Sijesyon).*

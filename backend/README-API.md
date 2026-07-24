# API — Ayiti Alèt (MVP)

Baz URL lokal: `http://localhost:4000`

## Otantifikasyon

| Metòd | Wout | Kò (body) | Deskripsyon |
|---|---|---|---|
| POST | `/auth/register` | `{ nom, telefon, motDePasse, komin?, katye? }` | Kreye yon kont, retounen `{ token, user }` |
| POST | `/auth/login` | `{ telefon, motDePasse }` | Konekte, retounen `{ token, user }` |

Mete tokèn nan header: `Authorization: Bearer <token>`

## Rapò

| Metòd | Wout | Otantifikasyon | Deskripsyon |
|---|---|---|---|
| POST | `/reports` | Opsyonèl (pèmèt anonim) | Kreye yon rapò. Retounen `{ report, otoriteAvize }` |
| GET | `/reports?kategori=&niveauIjans=&limit=` | Non | Lis rapò yo, pi resan an premye |
| GET | `/reports/:id` | Non | Detay yon rapò |
| POST | `/reports/:id/confirm` | Wi | `{ tipAksyon: "konfime" \| "siyale" }` |

## Kote enpòtan (Places)

| Metòd | Wout | Deskripsyon |
|---|---|---|
| GET | `/places?kategori=&komin=&q=` | Rechèch kote enpòtan |
| GET | `/places/:id` | Detay yon kote |

## Kategori rapò yo

`kidnaping`, `vòl`, `zak_sispèk`, `kout_zam`, `gang_ame`, `vyolans`, `dife`, `aksidan`,
`ijans_medikal`, `inondasyon`, `glisman_tè`, `tranblemanntè`, `pann_kouran`, `fwit_gaz`,
`wout_bloke`, `moun_disparèt`, `timoun_disparèt`, `lòt`

Chak kategori otomatikman mape sou yon lis otorite (`PNH`, `Ponpye`, `Pwoteksyon Sivil`,
`Anbilans`, `Mairi`) nan `backend/src/routes/reports.ts` — modifye `AUTORITE_PA_KATEGORI`
pou ajiste woutaj la.

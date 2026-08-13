import { pool } from "./pg";
import { voyeNotifikasyon } from "./firebase";

// Pozisyon apwoksimatif santral Ayiti — sèvi pou kalkile distans yon tanpèt.
const AYITI_LAT = 18.9712;
const AYITI_LNG = -72.2852;

// Yon tanpèt konsidere "touche Ayiti" si pozisyon aktyèl li (pa pwononstik
// konplè, ki mande analiz done GIS pi konplike) rete nan reyon sa a. Sa se
// yon apwoksimasyon — pa yon analiz kòn ensètitid ofisyèl NHC la.
const REYON_TOUCHE_KM = 800;

const NOAA_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";
const ENTÈVAL_MS = 30 * 60 * 1000; // chak 30 minit

const KLASIFIKASYON: Record<string, string> = {
  TD: "Depresyon Twopikal",
  TS: "Tanpèt Twopikal",
  HU: "Siklòn",
  SD: "Depresyon Soutwopikal",
  SS: "Tanpèt Soutwopikal",
  PC: "Rès Post-Twopikal",
  EX: "Sistèm Ekstwatwopikal",
};

function distansKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface StòmNOAA {
  id: string;
  name: string;
  classification: string;
  intensity?: string;
  latitudeNumeric: number;
  longitudeNumeric: number;
  publicAdvisory?: { url?: string };
}

async function trete() {
  try {
    const rep = await fetch(NOAA_URL, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "AyitiAlet/1.0 (platfòm sekirite sitwayen Ayiti; github.com/ayiti-alet)" },
    });
    if (!rep.ok) {
      console.error("NOAA CurrentStorms.json reponn ak statut:", rep.status);
      return;
    }
    const done_ = (await rep.json()) as { activeStorms?: StòmNOAA[] };
    const tanpèt = done_.activeStorms ?? [];

    const idTouchAyiti: string[] = [];

    for (const s of tanpèt) {
      if (!s.id || s.latitudeNumeric == null || s.longitudeNumeric == null) continue;
      const dist = Math.round(distansKm(AYITI_LAT, AYITI_LNG, s.latitudeNumeric, s.longitudeNumeric));
      if (dist > REYON_TOUCHE_KM) continue;

      idTouchAyiti.push(s.id.toUpperCase());
      const tip = KLASIFIKASYON[s.classification] ?? s.classification;

      const deja = await pool.query("SELECT id FROM alèt_meteyo WHERE id = $1", [s.id.toUpperCase()]);

      await pool.query(
        `INSERT INTO alèt_meteyo (id, non, tip, entansite_kt, lyen_ofisyèl, distans_km, aktif, mizajou_nan)
         VALUES ($1, $2, $3, $4, $5, $6, true, now())
         ON CONFLICT (id) DO UPDATE SET
           tip = EXCLUDED.tip, entansite_kt = EXCLUDED.entansite_kt,
           distans_km = EXCLUDED.distans_km, aktif = true, mizajou_nan = now()`,
        [
          s.id.toUpperCase(),
          s.name,
          tip,
          s.intensity ? Number(s.intensity) : null,
          s.publicAdvisory?.url ?? null,
          dist,
        ]
      );

      // Notifikasyon push sèlman pou yon NOUVO tanpèt (premye fwa n wè l touche
      // Ayiti) — pa chak mizajou, pou pa "spam" moun ak menm alèt la.
      if (deja.rows.length === 0) {
        avizeTout(s.name, tip, dist).catch((e) => console.error("Erè push meteyo:", e));
      }
    }

    // Mete tanpèt ki pa nan lis aktif NOAA a ankò (yo dissipe/pa menase Ayiti
    // ankò) kòm "pa aktif", san nou pa efase istorik la.
    if (idTouchAyiti.length > 0) {
      await pool.query(
        `UPDATE alèt_meteyo SET aktif = false WHERE aktif = true AND id != ALL($1)`,
        [idTouchAyiti]
      );
    } else {
      await pool.query(`UPDATE alèt_meteyo SET aktif = false WHERE aktif = true`);
    }
  } catch (e) {
    console.error("Erè pandan verifikasyon meteyo NOAA:", e);
  }
}

async function avizeTout(non: string, tip: string, distKm: number) {
  const { rows } = await pool.query("SELECT tokèn FROM fcm_tokens");
  const tokèns: string[] = rows.map((r) => r.tokèn);
  if (tokèns.length === 0) return;

  const tokènMouri = await voyeNotifikasyon(tokèns, {
    tit: `🌀 Alèt Meteyo Ofisyèl: ${non}`,
    kò: `${tip} — anviwon ${distKm}km de Ayiti. Sous: NOAA/NHC.`,
  });
  if (tokènMouri.length > 0) {
    await pool.query("DELETE FROM fcm_tokens WHERE tokèn = ANY($1)", [tokènMouri]);
  }
}

export function demareAlètMeteyoWorker() {
  setInterval(trete, ENTÈVAL_MS);
  trete();
}

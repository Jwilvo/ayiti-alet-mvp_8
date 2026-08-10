import { Router } from "express";
import { z } from "zod";
import path from "path";
import { pool } from "../pg";
import { AuthedRequest, optionalAuth, requireAuth } from "../middleware/auth";
import { analizeImaj, distansHamming } from "../util/imageAnalysis";
import { UPLOAD_DIR } from "./uploads";
import { voyeNotifikasyon } from "../firebase";

const RAYON_IJANS_MÈT = 15000; // menm sèy ak frontend la (15km) — gade categories.ts

const router = Router();

const AUTORITE_PA_KATEGORI: Record<string, string[]> = {
  kidnaping: ["PNH"],
  vòl: ["PNH"],
  zak_sispèk: ["PNH"],
  kout_zam: ["PNH"],
  gang_ame: ["PNH"],
  vyolans: ["PNH"],
  dife: ["Ponpye", "Pwoteksyon Sivil"],
  aksidan: ["Pwoteksyon Sivil", "Anbilans"],
  ijans_medikal: ["Anbilans"],
  inondasyon: ["Pwoteksyon Sivil", "Mairi"],
  glisman_tè: ["Pwoteksyon Sivil"],
  tranblemanntè: ["Pwoteksyon Sivil"],
  pann_kouran: ["Mairi"],
  fwit_gaz: ["Ponpye", "Pwoteksyon Sivil"],
  wout_bloke: ["Mairi"],
  moun_disparèt: ["PNH"],
  timoun_disparèt: ["PNH"],
  lòt: ["Mairi"],
};

function otoritePouKategori(kategori: string): string[] {
  return AUTORITE_PA_KATEGORI[kategori] ?? ["Mairi"];
}

const KATEGORI_GRAV = new Set([
  "kidnaping", "kout_zam", "gang_ame", "dife", "tranblemanntè",
  "timoun_disparèt", "ijans_medikal",
]);

const REPORT_SELECT = `
  SELECT r.id, r.user_id AS "userId", r.anonim, r.kategori, r.tit, r.deskripsyon,
         r.niveau_ijans AS "niveauIjans", r.statut,
         ST_Y(r.lokalizasyon::geometry) AS latitude,
         ST_X(r.lokalizasyon::geometry) AS longitude,
         r.adrès, r.komin, r.kreye_nan AS "kreyeNan"
  FROM reports r
`;

const createReportSchema = z.object({
  kategori: z.string(),
  tit: z.string().min(3),
  deskripsyon: z.string().min(5),
  niveauIjans: z.enum(["ba", "mwayen", "grav"]).optional(),
  latitude: z.number(),
  longitude: z.number(),
  adrès: z.string().optional(),
  komin: z.string().optional(),
  anonim: z.boolean().optional(),
  media: z
    .array(z.object({ tip: z.enum(["foto", "videyo", "odyo"]), url: z.string() }))
    .optional(),
});

router.post("/", optionalAuth, async (req: AuthedRequest, res, next) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erè: "Done rapò a pa valid.", detay: parsed.error.flatten() });
  }
  const data = parsed.data;
  const anonim = data.anonim ?? !req.userId;
  const niveauIjans = data.niveauIjans ?? (KATEGORI_GRAV.has(data.kategori) ? "grav" : "mwayen");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès, komin)
       VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, $9, $10)
       RETURNING id, user_id AS "userId", anonim, kategori, tit, deskripsyon,
                 niveau_ijans AS "niveauIjans", statut,
                 ST_Y(lokalizasyon::geometry) AS latitude, ST_X(lokalizasyon::geometry) AS longitude,
                 adrès, komin, kreye_nan AS "kreyeNan"`,
      [
        anonim ? null : req.userId ?? null,
        anonim,
        data.kategori,
        data.tit,
        data.deskripsyon,
        niveauIjans,
        data.longitude,
        data.latitude,
        data.adrès ?? null,
        data.komin ?? null,
      ]
    );
    const report = rows[0];

    const media = [];
    const avètisman: string[] = [];

    for (const m of data.media ?? []) {
      let analiz: { koulèDominant: string; briyans: number; flou: boolean; ahash: string } | null = null;

      if (m.tip === "foto" && m.url.startsWith("/uploads/")) {
        try {
          const chminFichye = path.join(UPLOAD_DIR, path.basename(m.url));
          analiz = await analizeImaj(chminFichye);

          if (analiz.flou) {
            avètisman.push("Youn nan foto yo sanble flou — yon foto pi klè ede otorite yo pi byen konprann sitiyasyon an.");
          }

          const { rows: lòtFoto } = await client.query(
            `SELECT rm.ahash, rm.report_id AS "reportId", r.tit
             FROM report_media rm JOIN reports r ON r.id = rm.report_id
             WHERE rm.ahash IS NOT NULL AND rm.report_id != $1`,
            [report.id]
          );
          const doub = lòtFoto.find((f: any) => distansHamming(f.ahash, analiz!.ahash) <= 6);
          if (doub) {
            avètisman.push(`Yon foto sanble ak yon foto ki deja nan rapò "${doub.tit}" — verifye si se pa menm ensidan an rapòte de fwa.`);
          }
        } catch {
          // Si analiz la echwe, kontinye san blokye kreyasyon rapò a
        }
      }

      const { rows: mediaRows } = await client.query(
        `INSERT INTO report_media (report_id, tip, url, koulè_dominant, briyans, flou, ahash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, tip, url, koulè_dominant AS "koulèDominant", briyans, flou`,
        [report.id, m.tip, m.url, analiz?.koulèDominant ?? null, analiz?.briyans ?? null, analiz?.flou ?? null, analiz?.ahash ?? null]
      );
      media.push(mediaRows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({
      report: { ...report, media },
      otoriteAvize: otoritePouKategori(data.kategori),
      avètisman,
    });

    // Fire-and-forget: voye notifikasyon push bay itilizatè ki toupre rapò a
    // (menm sèy 15km ak sa frontend lan itilize pou tag "ijans pou ou"). Nou
    // pa "await" sa a pou pa fè moun k ap kreye rapò a tann push la voye.
    avizeItilizatèToupre(report).catch((e) => console.error("Erè notifikasyon push:", e));
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
});

router.get("/", async (req, res, next) => {
  const { kategori, niveauIjans, komin, limit } = req.query;
  const conditions: string[] = [];
  const params: any[] = [];

  if (typeof kategori === "string") {
    params.push(kategori);
    conditions.push(`r.kategori = $${params.length}`);
  }
  if (typeof niveauIjans === "string") {
    params.push(niveauIjans);
    conditions.push(`r.niveau_ijans = $${params.length}`);
  }
  if (typeof komin === "string") {
    params.push(komin);
    conditions.push(`r.komin = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit ? Number(limit) : 50);

  try {
    const { rows } = await pool.query(
      `${REPORT_SELECT} ${where} ORDER BY r.kreye_nan DESC LIMIT $${params.length}`,
      params
    );

    const ids = rows.map((r) => r.id);
    const media = ids.length
      ? (await pool.query(
          `SELECT report_id, id, tip, url, koulè_dominant AS "koulèDominant", briyans, flou
           FROM report_media WHERE report_id = ANY($1)`,
          [ids]
        )).rows
      : [];
    const confirmCounts = ids.length
      ? (await pool.query(
          `SELECT report_id, COUNT(*)::int AS n FROM report_confirmations WHERE report_id = ANY($1) GROUP BY report_id`,
          [ids]
        )).rows
      : [];

    const result = rows.map((r) => ({
      ...r,
      media: media.filter((m) => m.report_id === r.id).map(({ id, tip, url, koulèDominant, briyans, flou }) => ({ id, tip, url, koulèDominant, briyans, flou })),
      konfimasyon: confirmCounts.find((c) => c.report_id === r.id)?.n ?? 0,
    }));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${REPORT_SELECT} WHERE r.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erè: "Rapò a pa egziste." });

    const media = await pool.query(
      `SELECT id, tip, url, koulè_dominant AS "koulèDominant", briyans, flou FROM report_media WHERE report_id = $1`,
      [req.params.id]
    );
    const confirmations = await pool.query(
      `SELECT id, report_id AS "reportId", user_id AS "userId", tip_aksyon AS "tipAksyon", kreye_nan AS "kreyeNan"
       FROM report_confirmations WHERE report_id = $1`,
      [req.params.id]
    );

    res.json({ ...rows[0], media: media.rows, confirmations: confirmations.rows });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/confirm", requireAuth, async (req: AuthedRequest, res, next) => {
  const tipAksyon = req.body.tipAksyon === "siyale" ? "siyale" : "konfime";
  try {
    const report = await pool.query("SELECT id FROM reports WHERE id = $1", [req.params.id]);
    if (!report.rows[0]) return res.status(404).json({ erè: "Rapò a pa egziste." });

    const { rows } = await pool.query(
      `INSERT INTO report_confirmations (report_id, user_id, tip_aksyon)
       VALUES ($1, $2, $3)
       ON CONFLICT (report_id, user_id, tip_aksyon) DO UPDATE SET kreye_nan = now()
       RETURNING id, report_id AS "reportId", user_id AS "userId", tip_aksyon AS "tipAksyon", kreye_nan AS "kreyeNan"`,
      [req.params.id, req.userId, tipAksyon]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// Jwenn tout itilizatè ki gen yon pozisyon konni ki nan 15km yon rapò, ki gen
// omwen yon tokèn FCM, epi voye yo yon notifikasyon push. Efase tokèn ki
// "mouri" (aparèy ki dezenstale app la) pou kenbe baz done a pwòp.
async function avizeItilizatèToupre(report: { id: string; kategori: string; tit: string; latitude: number; longitude: number; niveauIjans: string }) {
  const { rows } = await pool.query(
    `SELECT ft.tokèn
     FROM users u
     JOIN fcm_tokens ft ON ft.user_id = u.id
     WHERE u.dènye_pozisyon IS NOT NULL
       AND ST_DWithin(u.dènye_pozisyon, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    [report.longitude, report.latitude, RAYON_IJANS_MÈT]
  );
  const tokèns: string[] = rows.map((r) => r.tokèn);
  if (tokèns.length === 0) return;

  const meta = categoryMeta(report.kategori);
  const tokènMouri = await voyeNotifikasyon(tokèns, {
    tit: `${meta.emoji} ${report.niveauIjans === "grav" ? "Alèt Ijans" : "Nouvo Rapò"} Toupre W`,
    kò: report.tit,
    done_: { rapòId: report.id },
  });

  if (tokènMouri.length > 0) {
    await pool.query(`DELETE FROM fcm_tokens WHERE tokèn = ANY($1)`, [tokènMouri]);
  }
}

function categoryMeta(kategori: string): { emoji: string } {
  const emoji: Record<string, string> = {
    dife: "🔥", aksidan: "🚗", inondasyon: "🌊", kout_zam: "🔫",
    kidnaping: "🚨", vòl: "🧤", gang_ame: "⚠️", vyolans: "✊",
    ijans_medikal: "🩺", wout_bloke: "🚧", moun_disparèt: "🔍",
    timoun_disparèt: "🧒", glisman_tè: "⛰️", tranblemanntè: "🏚️",
    pann_kouran: "💡", fwit_gaz: "🛢️", zak_sispèk: "👀",
  };
  return { emoji: emoji[kategori] ?? "❗" };
}

export default router;

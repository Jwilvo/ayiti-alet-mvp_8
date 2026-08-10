import { Router } from "express";
import { pool } from "../pg";
import { requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAdmin);

const DIST_MAKS_MÈT = 300;
const TAN_MAKS_MIN = 45;

router.get("/stats", async (_req, res, next) => {
  try {
    const [total, itilizatè, konfimasyon, parKategori, parNiveau, parStatut] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM reports"),
      pool.query("SELECT COUNT(*)::int AS n FROM users"),
      pool.query("SELECT COUNT(*)::int AS n FROM report_confirmations"),
      pool.query("SELECT kategori, COUNT(*)::int AS n FROM reports GROUP BY kategori"),
      pool.query("SELECT niveau_ijans AS niveau, COUNT(*)::int AS n FROM reports GROUP BY niveau_ijans"),
      pool.query("SELECT statut, COUNT(*)::int AS n FROM reports GROUP BY statut"),
    ]);

    const toMap = (rows: any[], keyField: string) =>
      Object.fromEntries(rows.map((r) => [r[keyField], r.n]));

    res.json({
      totalRapò: total.rows[0].n,
      totalItilizatè: itilizatè.rows[0].n,
      totalKonfimasyon: konfimasyon.rows[0].n,
      parKategori: toMap(parKategori.rows, "kategori"),
      parNiveau: toMap(parNiveau.rows, "niveau"),
      parStatut: toMap(parStatut.rows, "statut"),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/reports", async (req, res, next) => {
  const { statut, niveauIjans } = req.query;
  const conditions: string[] = [];
  const params: any[] = [];

  if (typeof statut === "string") {
    params.push(statut);
    conditions.push(`r.statut = $${params.length}`);
  }
  if (typeof niveauIjans === "string") {
    params.push(niveauIjans);
    conditions.push(`r.niveau_ijans = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.user_id AS "userId", r.anonim, r.kategori, r.tit, r.deskripsyon,
              r.niveau_ijans AS "niveauIjans", r.statut,
              ST_Y(r.lokalizasyon::geometry) AS latitude, ST_X(r.lokalizasyon::geometry) AS longitude,
              r.adrès, r.komin, r.kreye_nan AS "kreyeNan",
              (SELECT COUNT(*)::int FROM report_confirmations c WHERE c.report_id = r.id) AS konfimasyon,
              (SELECT COUNT(*)::int FROM report_confirmations c WHERE c.report_id = r.id AND c.tip_aksyon = 'siyale') AS siyalman
       FROM reports r ${where}
       ORDER BY r.kreye_nan DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.patch("/reports/:id", async (req, res, next) => {
  const { statut } = req.body;
  const valid = ["nouvo", "verifye", "rejte", "rezolu"];
  if (!valid.includes(statut)) {
    return res.status(400).json({ erè: `Statut dwe youn nan: ${valid.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE reports SET statut = $1 WHERE id = $2
       RETURNING id, user_id AS "userId", anonim, kategori, tit, deskripsyon,
                 niveau_ijans AS "niveauIjans", statut,
                 ST_Y(lokalizasyon::geometry) AS latitude, ST_X(lokalizasyon::geometry) AS longitude,
                 adrès, komin, kreye_nan AS "kreyeNan"`,
      [statut, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erè: "Rapò a pa egziste." });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get("/duplicates", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id AS id_a, b.id AS id_b,
              ST_Distance(a.lokalizasyon, b.lokalizasyon) AS distans_mèt,
              EXTRACT(EPOCH FROM (b.kreye_nan - a.kreye_nan)) / 60 AS ekar_minit
       FROM reports a
       JOIN reports b ON a.id < b.id
         AND a.kategori = b.kategori
         AND ST_DWithin(a.lokalizasyon, b.lokalizasyon, $1)
         AND ABS(EXTRACT(EPOCH FROM (b.kreye_nan - a.kreye_nan))) <= $2 * 60`,
      [DIST_MAKS_MÈT, TAN_MAKS_MIN]
    );

    if (rows.length === 0) return res.json([]);

    const paran = new Map<string, string>();
    function jwenn(x: string): string {
      if (!paran.has(x)) paran.set(x, x);
      if (paran.get(x) !== x) paran.set(x, jwenn(paran.get(x)!));
      return paran.get(x)!;
    }
    function inyon(x: string, y: string) {
      paran.set(jwenn(x), jwenn(y));
    }
    for (const r of rows) {
      inyon(r.id_a, r.id_b);
    }

    const gwoupId = new Map<string, string[]>();
    for (const r of rows) {
      for (const id of [r.id_a, r.id_b]) {
        const rasin = jwenn(id);
        if (!gwoupId.has(rasin)) gwoupId.set(rasin, []);
        if (!gwoupId.get(rasin)!.includes(id)) gwoupId.get(rasin)!.push(id);
      }
    }

    const tousIds = [...new Set(rows.flatMap((r) => [r.id_a, r.id_b]))];
    const { rows: rapòDetay } = await pool.query(
      `SELECT id, tit, kategori, kreye_nan AS "kreyeNan" FROM reports WHERE id = ANY($1)`,
      [tousIds]
    );
    const detayParId = Object.fromEntries(rapòDetay.map((r) => [r.id, r]));

    const gwoup = [...gwoupId.values()].map((ids) => {
      const rapò = ids.map((id) => detayParId[id]);
      const pè = rows.find((r) => ids.includes(r.id_a) && ids.includes(r.id_b));
      return {
        rapò,
        distansMèt: pè ? Math.round(pè.distans_mèt) : null,
        ekarMinit: pè ? Math.round(Math.abs(pè.ekar_minit)) : null,
      };
    });

    res.json(gwoup);
  } catch (e) {
    next(e);
  }
});

export default router;

// Tandans sou 7 dènye jou yo (pou grafik) ak done brit pou kat chalè (lat/lng
// tout rapò yo, pou frontend la ka afiche dansite jewografik).
router.get("/tandans", async (_req, res, next) => {
  try {
    const [paJou, paLè, kèdKat] = await Promise.all([
      pool.query(
        `SELECT to_char(date_trunc('day', kreye_nan), 'YYYY-MM-DD') AS jou, COUNT(*)::int AS n
         FROM reports WHERE kreye_nan > now() - interval '7 days'
         GROUP BY 1 ORDER BY 1`
      ),
      pool.query(
        `SELECT EXTRACT(HOUR FROM kreye_nan)::int AS lè, COUNT(*)::int AS n
         FROM reports GROUP BY 1 ORDER BY 1`
      ),
      pool.query(
        `SELECT ST_Y(lokalizasyon::geometry) AS latitude, ST_X(lokalizasyon::geometry) AS longitude, niveau_ijans AS "niveauIjans"
         FROM reports ORDER BY kreye_nan DESC LIMIT 500`
      ),
    ]);
    res.json({ paJou: paJou.rows, paLè: paLè.rows, kèdKat: kèdKat.rows });
  } catch (e) {
    next(e);
  }
});

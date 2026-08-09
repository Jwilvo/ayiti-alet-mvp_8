import { Router } from "express";
import { pool } from "../pg";

const router = Router();

// Lis tout depatman/komin yo, pou ranpli yon dwopdaw seleksyon lè yon moun
// enskri oswa fè yon rapò.
router.get("/komin", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT depatman, komin FROM komin_ayiti ORDER BY depatman, komin`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// Detekte otomatikman ki depatman yon pozisyon GPS ye ladan, pou aplikasyon
// an ka redwi lis komin yo pito moun nan fouye nan 140 total.
// Nou itilize ST_Contains dabò (egzat), epi si pa gen rezilta (egzanp yon vil
// bò lanmè kote polygon senplifye a pa kouvri jiska pwen egzat la), nou aksepte
// pi pre depatman ki nan yon distans rezonab (5 km) — sa evite fo-negatif akoz
// senplifikasyon done jewografik yo oswa yon ti enpresizyon GPS.
router.get("/depatman-otomatik", async (req, res, next) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ erè: "Bay lat ak lng valid." });
  }

  try {
    const { rows: kontenn } = await pool.query(
      `SELECT non FROM depatman_zòn
       WHERE ST_Contains(zòn::geometry, ST_SetSRID(ST_MakePoint($1, $2), 4326))`,
      [lng, lat]
    );
    if (kontenn[0]) return res.json({ depatman: kontenn[0].non, presizyon: "egzat" });

    const { rows: pipre } = await pool.query(
      `SELECT non, ST_Distance(zòn, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distans
       FROM depatman_zòn ORDER BY distans ASC LIMIT 1`,
      [lng, lat]
    );
    if (pipre[0] && pipre[0].distans <= 5000) {
      return res.json({ depatman: pipre[0].non, presizyon: "apwoksimatif" });
    }

    res.json({ depatman: null });
  } catch (e) {
    next(e);
  }
});

export default router;

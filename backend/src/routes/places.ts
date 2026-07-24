import { Router } from "express";
import { pool } from "../pg";

const router = Router();

const PLACE_SELECT = `
  SELECT id, non, kategori, sou_kategori AS "souKategori", adrès, telefon, orè,
         ST_Y(lokalizasyon::geometry) AS latitude, ST_X(lokalizasyon::geometry) AS longitude,
         komin
  FROM places
`;

router.get("/", async (req, res, next) => {
  const { kategori, komin, q } = req.query;
  const conditions: string[] = [];
  const params: any[] = [];

  if (typeof kategori === "string") {
    params.push(kategori);
    conditions.push(`kategori = $${params.length}`);
  }
  if (typeof komin === "string") {
    params.push(komin);
    conditions.push(`komin = $${params.length}`);
  }
  if (typeof q === "string" && q.trim()) {
    params.push(`%${q.trim()}%`);
    conditions.push(`non ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(`${PLACE_SELECT} ${where} ORDER BY non ASC`, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${PLACE_SELECT} WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erè: "Kote a pa jwenn." });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;

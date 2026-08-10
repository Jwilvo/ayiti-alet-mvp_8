import { Router } from "express";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, non, latitude, longitude, kreye_nan AS "kreyeNan"
       FROM lye_itilizatè WHERE user_id = $1 ORDER BY kreye_nan ASC`,
      [req.userId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

const lyeSchema = z.object({
  non: z.string().min(1).max(60),
  latitude: z.number(),
  longitude: z.number(),
});

router.post("/", async (req: AuthedRequest, res, next) => {
  const parsed = lyeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Bay yon non ak yon pozisyon valid." });
  try {
    const { rows: kontwòl } = await pool.query("SELECT COUNT(*)::int AS n FROM lye_itilizatè WHERE user_id = $1", [req.userId]);
    if (kontwòl[0].n >= 5) return res.status(400).json({ erè: "Maksimòm 5 lye. Efase youn anvan ou ajoute yon lòt." });

    const { rows } = await pool.query(
      `INSERT INTO lye_itilizatè (user_id, non, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING id, non, latitude, longitude, kreye_nan AS "kreyeNan"`,
      [req.userId, parsed.data.non.trim(), parsed.data.latitude, parsed.data.longitude]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    await pool.query("DELETE FROM lye_itilizatè WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, optionalAuth } from "../middleware/auth";

const router = Router();

const sijesyonSchema = z.object({ kò: z.string().min(3).max(1000) });

router.post("/", optionalAuth, async (req: AuthedRequest, res, next) => {
  const parsed = sijesyonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Ekri omwen 3 karaktè pou sijesyon ou a." });
  try {
    await pool.query(`INSERT INTO sijesyon (user_id, kò) VALUES ($1, $2)`, [req.userId ?? null, parsed.data.kò.trim()]);
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

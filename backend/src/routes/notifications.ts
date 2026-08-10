import { Router } from "express";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { firebaseAktif } from "../firebase";

const router = Router();

router.get("/estati", async (_req, res) => {
  res.json({ aktif: firebaseAktif() });
});

const tokènSchema = z.object({ tokèn: z.string().min(10) });

// Anrejistre tokèn FCM aparèy la — rele otomatikman lè navigatè a bay
// pèmisyon notifikasyon, pa gen okenn aksyon manyèl siplemantè pou
// itilizatè a fè apre premye pèmisyon an.
router.post("/token", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = tokènSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Tokèn envalid." });
  try {
    await pool.query(
      `INSERT INTO fcm_tokens (user_id, tokèn) VALUES ($1, $2)
       ON CONFLICT (tokèn) DO UPDATE SET user_id = EXCLUDED.user_id`,
      [req.userId, parsed.data.tokèn]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/token", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = tokènSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Tokèn envalid." });
  try {
    await pool.query(`DELETE FROM fcm_tokens WHERE tokèn = $1 AND user_id = $2`, [parsed.data.tokèn, req.userId]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

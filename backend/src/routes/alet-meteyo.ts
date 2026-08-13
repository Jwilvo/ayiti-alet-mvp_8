import { Router } from "express";
import { pool } from "../pg";

const router = Router();

router.get("/aktif", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, non, tip, entansite_kt AS "entansiteKt", lyen_ofisyèl AS "lyenOfisyèl",
              distans_km AS "distansKm", kreye_nan AS "kreyeNan", mizajou_nan AS "mizajouNan"
       FROM alèt_meteyo WHERE aktif = true ORDER BY distans_km ASC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

export default router;

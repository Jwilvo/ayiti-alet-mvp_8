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

export default router;

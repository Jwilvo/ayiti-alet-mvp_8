import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { pool } from "../pg";
import { AuthedRequest, optionalAuth, requireAuth } from "../middleware/auth";

const router = Router();

function ashPouTokèn(tokèn: string): string {
  return crypto.createHash("sha256").update(tokèn).digest("hex");
}

const trigerSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

router.post("/trigger", optionalAuth, async (req: AuthedRequest, res, next) => {
  const parsed = trigerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Pozisyon envalid." });
  const { latitude, longitude } = parsed.data;

  const tokèn = crypto.randomBytes(24).toString("hex");
  const tokènHash = ashPouTokèn(tokèn);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO sos_events (user_id, tokèn_hash, dènye_pozisyon)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
       RETURNING id, statut, kreye_nan AS "kreyeNan"`,
      [req.userId ?? null, tokènHash, longitude, latitude]
    );
    const sos = rows[0];
    await client.query(
      `INSERT INTO sos_positions (sos_id, lokalizasyon)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`,
      [sos.id, longitude, latitude]
    );
    await client.query("COMMIT");

    let kontakIjans: any[] = [];
    if (req.userId) {
      const { rows: userRows } = await pool.query("SELECT kontak_ijans FROM users WHERE id = $1", [req.userId]);
      kontakIjans = userRows[0]?.kontak_ijans ?? [];
    }

    res.status(201).json({ ...sos, tokèn, kontakIjans });
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
  }
});

function verifyeTokèn(req: any, res: any, tokènHashStoke: string): boolean {
  const tokènBay = req.headers["x-sos-token"];
  if (typeof tokènBay !== "string" || !tokènBay) {
    res.status(401).json({ erè: "Tokèn SOS la manke." });
    return false;
  }
  if (ashPouTokèn(tokènBay) !== tokènHashStoke) {
    res.status(403).json({ erè: "Tokèn SOS la pa valid." });
    return false;
  }
  return true;
}

const pozisyonSchema = z.object({ latitude: z.number(), longitude: z.number() });

router.post("/:id/pozisyon", async (req, res, next) => {
  const parsed = pozisyonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Pozisyon envalid." });
  const { latitude, longitude } = parsed.data;

  try {
    const { rows: sosRows } = await pool.query("SELECT id, statut, tokèn_hash FROM sos_events WHERE id = $1", [req.params.id]);
    if (!sosRows[0]) return res.status(404).json({ erè: "SOS sa a pa egziste." });
    if (!verifyeTokèn(req, res, sosRows[0].tokèn_hash)) return;
    if (sosRows[0].statut !== "aktif") return res.status(409).json({ erè: "SOS sa a fèmen deja." });

    await pool.query(
      `INSERT INTO sos_positions (sos_id, lokalizasyon) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`,
      [req.params.id, longitude, latitude]
    );
    await pool.query(
      `UPDATE sos_events SET dènye_pozisyon = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, dènye_mizajou = now()
       WHERE id = $3`,
      [longitude, latitude, req.params.id]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/fermen", async (req, res, next) => {
  try {
    const { rows: sosRows } = await pool.query("SELECT id, tokèn_hash FROM sos_events WHERE id = $1", [req.params.id]);
    if (!sosRows[0]) return res.status(404).json({ erè: "SOS sa a pa egziste." });
    if (!verifyeTokèn(req, res, sosRows[0].tokèn_hash)) return;

    const { rows } = await pool.query(
      `UPDATE sos_events SET statut = 'fini', fèmen_nan = now() WHERE id = $1
       RETURNING id, statut`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, statut, kreye_nan AS "kreyeNan", dènye_mizajou AS "dènyeMizajou",
              ST_Y(dènye_pozisyon::geometry) AS latitude, ST_X(dènye_pozisyon::geometry) AS longitude
       FROM sos_events WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erè: "SOS sa a pa egziste." });

    const istorik = await pool.query(
      `SELECT ST_Y(lokalizasyon::geometry) AS latitude, ST_X(lokalizasyon::geometry) AS longitude,
              kreye_nan AS "kreyeNan"
       FROM sos_positions WHERE sos_id = $1 ORDER BY kreye_nan ASC`,
      [req.params.id]
    );

    res.json({ ...rows[0], istorik: istorik.rows });
  } catch (e) {
    next(e);
  }
});

router.get("/mwen/kontak-ijans", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query("SELECT kontak_ijans FROM users WHERE id = $1", [req.userId]);
    res.json(rows[0]?.kontak_ijans ?? []);
  } catch (e) {
    next(e);
  }
});

const kontakSchema = z.array(z.object({ non: z.string().min(1), telefon: z.string().min(6) })).max(5);

router.put("/mwen/kontak-ijans", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = kontakSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Lis kontak la envalid (maks 5)." });
  try {
    await pool.query("UPDATE users SET kontak_ijans = $1 WHERE id = $2", [JSON.stringify(parsed.data), req.userId]);
    res.json(parsed.data);
  } catch (e) {
    next(e);
  }
});

export default router;

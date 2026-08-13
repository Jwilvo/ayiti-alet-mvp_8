import { Router } from "express";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { voyeNotifikasyon } from "../firebase";
import { voyeSms } from "../sms";

const router = Router();

// ============ Sitwayen ============

// Ijans aktif ki toupre yon pozisyon bay (pou Akèy la ka montre bandwo a).
router.get("/aktif", async (req, res, next) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ erè: "Bay lat ak lng valid." });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, tit, deskripsyon, reyon_km AS "reyonKm", kreye_nan AS "kreyeNan"
       FROM ijans_deklare
       WHERE aktif = true
         AND ST_DWithin(lokalizasyon, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, reyon_km * 1000)
       ORDER BY kreye_nan DESC`,
      [lng, lat]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/an-sekirite", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const ijans = await pool.query("SELECT tit FROM ijans_deklare WHERE id = $1 AND aktif = true", [req.params.id]);
    if (!ijans.rows[0]) return res.status(404).json({ erè: "Ijans sa a pa aktif ankò." });

    await pool.query(
      `INSERT INTO ijans_repons (ijans_id, user_id) VALUES ($1, $2)
       ON CONFLICT (ijans_id, user_id) DO NOTHING`,
      [req.params.id, req.userId]
    );

    const [userRows, kontakRows] = await Promise.all([
      pool.query("SELECT nom FROM users WHERE id = $1", [req.userId]),
      pool.query("SELECT kontak_ijans FROM users WHERE id = $1", [req.userId]),
    ]);
    const non = userRows.rows[0]?.nom ?? "Yon moun";
    const kontakYo: { non: string; telefon: string }[] = kontakRows.rows[0]?.kontak_ijans ?? [];

    await Promise.all(
      kontakYo.map((k) =>
        voyeSms(k.telefon, `Ayiti Alèt — ${non} make tèt li AN SEKIRITE pandan "${ijans.rows[0].tit}".`)
      )
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ============ Admin ============

const deklareSchema = z.object({
  tit: z.string().min(3),
  deskripsyon: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  reyonKm: z.number().min(1).max(500).default(50),
});

router.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await pool.query("SELECT wol FROM users WHERE id = $1", [req.userId]);
  if (wòl.rows[0]?.wol !== "admin") return res.status(403).json({ erè: "Sèlman admin ka deklare yon ijans." });

  const parsed = deklareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Done envalid pou deklarasyon ijans lan." });
  const { tit, deskripsyon, latitude, longitude, reyonKm } = parsed.data;

  try {
    const { rows } = await pool.query(
      `INSERT INTO ijans_deklare (tit, deskripsyon, lokalizasyon, reyon_km, kreye_pa)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6)
       RETURNING id, tit, deskripsyon, reyon_km AS "reyonKm", kreye_nan AS "kreyeNan"`,
      [tit, deskripsyon ?? null, longitude, latitude, reyonKm, req.userId]
    );
    const ijans = rows[0];

    avizeZònIjans(latitude, longitude, reyonKm, tit).catch((e) => console.error("Erè push ijans:", e));

    res.status(201).json(ijans);
  } catch (e) {
    next(e);
  }
});

router.get("/admin/tout", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await pool.query("SELECT wol FROM users WHERE id = $1", [req.userId]);
  if (wòl.rows[0]?.wol !== "admin") return res.status(403).json({ erè: "Aksè refize." });
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.tit, d.deskripsyon, d.reyon_km AS "reyonKm", d.aktif, d.kreye_nan AS "kreyeNan",
              (SELECT COUNT(*) FROM ijans_repons r WHERE r.ijans_id = d.id)::int AS "konteAnSekirite"
       FROM ijans_deklare d ORDER BY d.kreye_nan DESC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/dezaktive", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await pool.query("SELECT wol FROM users WHERE id = $1", [req.userId]);
  if (wòl.rows[0]?.wol !== "admin") return res.status(403).json({ erè: "Aksè refize." });
  try {
    await pool.query("UPDATE ijans_deklare SET aktif = false WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

async function avizeZònIjans(lat: number, lng: number, reyonKm: number, tit: string) {
  const { rows } = await pool.query(
    `SELECT ft.tokèn FROM users u JOIN fcm_tokens ft ON ft.user_id = u.id
     WHERE u.dènye_pozisyon IS NOT NULL
       AND ST_DWithin(u.dènye_pozisyon, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    [lng, lat, reyonKm * 1000]
  );
  const tokèns: string[] = rows.map((r) => r.tokèn);
  if (tokèns.length === 0) return;
  const tokènMouri = await voyeNotifikasyon(tokèns, {
    tit: `🆘 Ijans deklare: ${tit}`,
    kò: "Peze pou make tèt ou an sekirite ak avize fanmi/zanmi ou.",
  });
  if (tokènMouri.length > 0) {
    await pool.query("DELETE FROM fcm_tokens WHERE tokèn = ANY($1)", [tokènMouri]);
  }
}

export default router;

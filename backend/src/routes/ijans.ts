import { Router } from "express";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { voyeNotifikasyon } from "../firebase";

import { WÒL_ENFO, WÒL_KAPAB_DEKLARE_IJANS, reyonMaksPouWòl } from "../wol";

const router = Router();

async function jwennWòl(userId: string): Promise<string | null> {
  const { rows } = await pool.query("SELECT wol FROM users WHERE id = $1", [userId]);
  return rows[0]?.wol ?? null;
}

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

// Mak repons lan — "wi" (an sekirite) oswa "non" (bezwen èd). Tout rete
// anndan Ayiti Alèt, pa gen SMS ki voye bay kontak pèsonèl ankò. Repons lan
// anrejistre pou parèt nan rapò admin an.
router.post("/:id/an-sekirite", requireAuth, async (req: AuthedRequest, res, next) => {
  const anSekirite = req.body?.anSekirite !== false; // default true pou konpatibilite
  try {
    const ijans = await pool.query("SELECT id FROM ijans_deklare WHERE id = $1 AND aktif = true", [req.params.id]);
    if (!ijans.rows[0]) return res.status(404).json({ erè: "Ijans sa a pa aktif ankò." });

    await pool.query(
      `INSERT INTO ijans_repons (ijans_id, user_id, an_sekirite) VALUES ($1, $2, $3)
       ON CONFLICT (ijans_id, user_id) DO UPDATE SET an_sekirite = EXCLUDED.an_sekirite, kreye_nan = now()`,
      [req.params.id, req.userId, anSekirite]
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
  const wòl = await jwennWòl(req.userId!);
  if (!wòl || !WÒL_KAPAB_DEKLARE_IJANS.includes(wòl)) {
    return res.status(403).json({ erè: "Ou pa gen otorizasyon pou deklare yon ijans." });
  }

  const parsed = deklareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Done envalid pou deklarasyon ijans lan." });
  const { tit, deskripsyon, latitude, longitude, reyonKm } = parsed.data;

  // Ranfòse limit reyon an selon wòl moun nan — egzanp yon "kazèk" pa ka
  // voye yon alèt ki kouvri tout peyi a, sèlman seksyon kominal li a (5-10km).
  const reyonMaks = reyonMaksPouWòl(wòl);
  if (reyonMaks !== null && reyonKm > reyonMaks) {
    return res.status(403).json({
      erè: `Wòl ou (${wòl}) limite a yon reyon maksimòm ${reyonMaks}km. Sèlman "prezidans" ka voye alèt nasyonal.`,
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO ijans_deklare (tit, deskripsyon, lokalizasyon, reyon_km, kreye_pa)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6)
       RETURNING id, tit, deskripsyon, reyon_km AS "reyonKm", kreye_nan AS "kreyeNan"`,
      [tit, deskripsyon ?? null, longitude, latitude, reyonKm, req.userId]
    );
    const ijans = rows[0];

    avizeZònIjans(ijans.id, latitude, longitude, reyonKm, tit).catch((e) => console.error("Erè push ijans:", e));

    res.status(201).json(ijans);
  } catch (e) {
    next(e);
  }
});

router.get("/mwen/wòl", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const wòl = await jwennWòl(req.userId!);
    res.json({ wòl, kapabDeklare: !!wòl && WÒL_KAPAB_DEKLARE_IJANS.includes(wòl), reyonMaks: wòl ? reyonMaksPouWòl(wòl) : null });
  } catch (e) {
    next(e);
  }
});

router.get("/admin/tout", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await jwennWòl(req.userId!);
  if (!wòl || !WÒL_KAPAB_DEKLARE_IJANS.includes(wòl)) return res.status(403).json({ erè: "Aksè refize." });
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.tit, d.deskripsyon, d.reyon_km AS "reyonKm", d.aktif, d.kreye_nan AS "kreyeNan",
              (SELECT COUNT(*) FROM ijans_notifye n WHERE n.ijans_id = d.id)::int AS "konteNotifye",
              (SELECT COUNT(*) FROM ijans_repons r WHERE r.ijans_id = d.id AND r.an_sekirite = true)::int AS "konteAnSekirite",
              (SELECT COUNT(*) FROM ijans_repons r WHERE r.ijans_id = d.id AND r.an_sekirite = false)::int AS "konteBezwenÈd"
       FROM ijans_deklare d ORDER BY d.kreye_nan DESC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// Rapò kategorize an TWA gwoup: "wi" (an sekirite), "non" (bezwen èd — sa a
// pi kritik pase silans), ak "poko reponn" (silans total).
router.get("/:id/rapo", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await jwennWòl(req.userId!);
  if (!wòl || !WÒL_KAPAB_DEKLARE_IJANS.includes(wòl)) return res.status(403).json({ erè: "Aksè refize." });
  try {
    const { rows: anSekirite } = await pool.query(
      `SELECT u.id AS "userId", u.nom, u.telefon, r.kreye_nan AS "kreyeNan"
       FROM ijans_repons r JOIN users u ON u.id = r.user_id
       WHERE r.ijans_id = $1 AND r.an_sekirite = true ORDER BY r.kreye_nan ASC`,
      [req.params.id]
    );
    const { rows: bezwenÈd } = await pool.query(
      `SELECT u.id AS "userId", u.nom, u.telefon, r.kreye_nan AS "kreyeNan"
       FROM ijans_repons r JOIN users u ON u.id = r.user_id
       WHERE r.ijans_id = $1 AND r.an_sekirite = false ORDER BY r.kreye_nan ASC`,
      [req.params.id]
    );
    const { rows: pokoReponn } = await pool.query(
      `SELECT u.id AS "userId", u.nom, u.telefon
       FROM ijans_notifye n JOIN users u ON u.id = n.user_id
       WHERE n.ijans_id = $1
         AND NOT EXISTS (SELECT 1 FROM ijans_repons r WHERE r.ijans_id = n.ijans_id AND r.user_id = n.user_id)
       ORDER BY u.nom ASC`,
      [req.params.id]
    );
    res.json({ anSekirite, bezwenÈd, pokoReponn });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/dezaktive", requireAuth, async (req: AuthedRequest, res, next) => {
  const wòl = await jwennWòl(req.userId!);
  if (!wòl || !WÒL_KAPAB_DEKLARE_IJANS.includes(wòl)) return res.status(403).json({ erè: "Aksè refize." });
  try {
    await pool.query("UPDATE ijans_deklare SET aktif = false WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

async function avizeZònIjans(ijansId: string, lat: number, lng: number, reyonKm: number, tit: string) {
  // Jwenn TOUT itilizatè ki nan zòn nan (ki gen yon pozisyon konni), pou nou
  // ka "fotografye" yo antanke moun ki "notifye" — sa sèvi kòm baz pou rapò
  // "poko reponn" an, kèlkeswa si yo gen yon tokèn push oswa non.
  const { rows: itilizatèYo } = await pool.query(
    `SELECT u.id AS "userId", ft.tokèn
     FROM users u LEFT JOIN fcm_tokens ft ON ft.user_id = u.id
     WHERE u.dènye_pozisyon IS NOT NULL
       AND ST_DWithin(u.dènye_pozisyon, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`,
    [lng, lat, reyonKm * 1000]
  );

  const idIkYo = [...new Set(itilizatèYo.map((r) => r.userId as string))];
  if (idIkYo.length > 0) {
    await Promise.all(
      idIkYo.map((userId) =>
        pool.query(
          `INSERT INTO ijans_notifye (ijans_id, user_id) VALUES ($1, $2) ON CONFLICT (ijans_id, user_id) DO NOTHING`,
          [ijansId, userId]
        )
      )
    );
  }

  const tokèns = [...new Set(itilizatèYo.map((r) => r.tokèn).filter((t): t is string => !!t))];
  if (tokèns.length === 0) return;

  const tokènMouri = await voyeNotifikasyon(tokèns, {
    tit: `🆘 Ijans deklare: ${tit}`,
    kò: "Peze pou make tèt ou an sekirite.",
  });
  if (tokènMouri.length > 0) {
    await pool.query("DELETE FROM fcm_tokens WHERE tokèn = ANY($1)", [tokènMouri]);
  }
}

export default router;

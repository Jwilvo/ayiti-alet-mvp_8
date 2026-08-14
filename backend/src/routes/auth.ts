import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, JWT_SECRET, requireAuth } from "../middleware/auth";
import { voyeSms } from "../sms";
import { chifre, ashDokiman } from "../encryption";

const router = Router();

// Modpas "fòma sekirize": omwen 8 karaktè, yon lèt majiskil, yon chif, e yon
// karaktè espesyal — sa redwi anpil risk yon kont "vinerab" fasil pou devine.
const modPasSchema = z
  .string()
  .min(8, "Modpas la dwe gen omwen 8 karaktè.")
  .regex(/[A-Z]/, "Modpas la dwe gen omwen yon lèt majiskil.")
  .regex(/[0-9]/, "Modpas la dwe gen omwen yon chif.")
  .regex(/[^A-Za-z0-9]/, "Modpas la dwe gen omwen yon karaktè espesyal (egzanp: ! @ # $).");

const registerSchema = z.object({
  nom: z.string().min(2, "Non konplè a dwe gen omwen 2 karaktè."),
  telefon: z.string().min(8, "Bay yon nimewo telefòn valid."),
  email: z.string().email("Adrès imèl la pa valid.").optional().or(z.literal("")),
  motDePasse: modPasSchema,
  komin: z.string().optional(),
  katye: z.string().optional(),
  nonKonplè: z.string().min(3, "Bay non konplè, jan li ekri sou dokiman ofisyèl ou.").optional(),
  dokimanTip: z.enum(["NIF", "CIN", "Paspò"], { errorMap: () => ({ message: "Chwazi yon tip dokiman valid." }) }).optional(),
  dokimanNimewo: z.string().min(4, "Nimewo dokiman an dwe gen omwen 4 karaktè.").optional(),
  adrèsKay: z.string().optional(),
});

router.post("/register", async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const premyèErè = parsed.error.errors[0]?.message ?? "Done yo pa valid.";
    return res.status(400).json({ erè: premyèErè, detay: parsed.error.flatten() });
  }
  const { nom, telefon, email, motDePasse, komin, katye, nonKonplè, dokimanTip, dokimanNimewo, adrèsKay } = parsed.data;

  // Si youn nan (tip, nimewo) bay, tou de dwe bay ansanm.
  if ((dokimanTip && !dokimanNimewo) || (!dokimanTip && dokimanNimewo)) {
    return res.status(400).json({ erè: "Bay tou de tip dokiman an AK nimewo li." });
  }

  try {
    const egziste = await pool.query("SELECT id FROM users WHERE telefon = $1", [telefon]);
    if (egziste.rows.length > 0) {
      return res.status(409).json({ erè: "Yon kont deja itilize nimewo telefòn sa a." });
    }

    let dokimanAsh: string | null = null;
    let dokimanChifre: string | null = null;
    if (dokimanNimewo) {
      dokimanAsh = ashDokiman(dokimanNimewo);
      const dejaGenyen = await pool.query("SELECT id FROM users WHERE dokiman_ash = $1", [dokimanAsh]);
      if (dejaGenyen.rows.length > 0) {
        return res.status(409).json({ erè: "Gen deja yon kont ki itilize menm nimewo dokiman idantite sa a." });
      }
      dokimanChifre = chifre(dokimanNimewo);
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, telefon, email, mot_de_pass, komin, katye, non_konplè, dokiman_tip, dokiman_ash, dokiman_chifre, adrès_kay)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, nom, telefon, komin, katye, wol, niveau_konfyans, foto_pwofil`,
      [nom, telefon, email ?? null, hash, komin ?? null, katye ?? null, nonKonplè ?? null, dokimanTip ?? null, dokimanAsh, dokimanChifre, adrèsKay ?? null]
    );
    const user = rows[0];

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({
      token,
      user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, katye: user.katye, wòl: user.wol, niveauKonfyans: user.niveau_konfyans, fotoPwofil: user.foto_pwofil },
    });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  telefon: z.string(),
  motDePasse: z.string(),
});

router.post("/login", async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erè: "Done yo pa valid." });
  }
  const { telefon, motDePasse } = parsed.data;

  try {
    const { rows } = await pool.query(
      "SELECT id, nom, telefon, komin, katye, wol, mot_de_pass, niveau_konfyans, foto_pwofil FROM users WHERE telefon = $1",
      [telefon]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ erè: "Nimewo oswa modpas la pa kòrèk." });
    }
    const valid = await bcrypt.compare(motDePasse, user.mot_de_pass);
    if (!valid) {
      return res.status(401).json({ erè: "Nimewo oswa modpas la pa kòrèk." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({
      token,
      user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, katye: user.katye, wòl: user.wol, niveauKonfyans: user.niveau_konfyans, fotoPwofil: user.foto_pwofil },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nom, telefon, komin, katye, wol, niveau_konfyans, foto_pwofil FROM users WHERE id = $1",
      [req.userId]
    );
    if (!rows[0]) return res.status(404).json({ erè: "Itilizatè a pa jwenn." });
    const u = rows[0];
    res.json({ id: u.id, nom: u.nom, telefon: u.telefon, komin: u.komin, katye: u.katye, wòl: u.wol, niveauKonfyans: u.niveau_konfyans, fotoPwofil: u.foto_pwofil });
  } catch (e) {
    next(e);
  }
});

const updateMeSchema = z.object({
  komin: z.string().optional(),
  katye: z.string().optional(),
  fotoPwofil: z.string().max(500).optional(),
});

// Pèmèt yon itilizatè chanje komin/katye/foto pwofil li apre enskripsyon —
// komin/katye enpòtan pou zonaj alèt yo, paske se sa nou konpare ak komin
// yon rapò pou deside si yon alèt se "ijans pou ou" oswa jis "enfòmasyon".
router.patch("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Done pa valid." });
  try {
    const { rows } = await pool.query(
      `UPDATE users SET komin = COALESCE($1, komin), katye = COALESCE($2, katye),
              foto_pwofil = COALESCE($3, foto_pwofil)
       WHERE id = $4
       RETURNING id, nom, telefon, komin, katye, wol, niveau_konfyans, foto_pwofil`,
      [parsed.data.komin ?? null, parsed.data.katye ?? null, parsed.data.fotoPwofil ?? null, req.userId]
    );
    const u = rows[0];
    res.json({
      id: u.id, nom: u.nom, telefon: u.telefon, komin: u.komin, katye: u.katye,
      wòl: u.wol, niveauKonfyans: u.niveau_konfyans, fotoPwofil: u.foto_pwofil,
    });
  } catch (e) {
    next(e);
  }
});

const pozisyonSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Mete ajou dènye pozisyon apwoksimatif itilizatè a an silans (aplikasyon an
// rele wout sa a otomatikman lè li jwenn pozisyon telefòn nan — pa gen bouton
// ni aksyon itilizatè a bezwen fè). Sèvi sèlman pou detèmine ki moun ki
// "toupre" yon nouvo rapò pou nou ka voye yo yon notifikasyon push.
router.patch("/pozisyon", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = pozisyonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Pozisyon envalid." });
  try {
    await pool.query(
      `UPDATE users SET dènye_pozisyon = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              dènye_pozisyon_nan = now()
       WHERE id = $3`,
      [parsed.data.longitude, parsed.data.latitude, req.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

// ============ Reyajisman modpas ============

const mandeSchema = z.object({ telefon: z.string().min(8) });

router.post("/mande-reyajisman", async (req, res, next) => {
  const parsed = mandeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Bay yon nimewo telefòn valid." });

  try {
    const { rows } = await pool.query("SELECT id FROM users WHERE telefon = $1", [parsed.data.telefon]);
    // Repons lan menm si kont lan pa egziste — evite konfime/enfime yon
    // nimewo telefòn kòrèk pou moun ki ta eseye "devine" kont ki egziste.
    if (!rows[0]) {
      return res.json({ ok: true, mesaj: "Si kont lan egziste, yon kòd voye pa SMS." });
    }
    const userId = rows[0].id;

    const kòd = Math.floor(100000 + Math.random() * 900000).toString();
    const kòdAsh = crypto.createHash("sha256").update(kòd).digest("hex");
    const ekspireNan = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO reyajisman_modpas (user_id, kòd_ash, ekspire_nan) VALUES ($1, $2, $3)`,
      [userId, kòdAsh, ekspireNan]
    );

    await voyeSms(
      parsed.data.telefon,
      `Ayiti Alèt — Kòd pou reyajiste modpas ou a: ${kòd}. Li ekspire nan 10 minit.`
    );

    res.json({ ok: true, mesaj: "Si kont lan egziste, yon kòd voye pa SMS." });
  } catch (e) {
    next(e);
  }
});

const konfimeSchema = z.object({
  telefon: z.string().min(8),
  kòd: z.string().length(6),
  nouvoModDePasse: z.string().min(6),
});

router.post("/konfime-reyajisman", async (req, res, next) => {
  const parsed = konfimeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Done envalid — modpas dwe gen omwen 6 karaktè." });
  const { telefon, kòd, nouvoModDePasse } = parsed.data;

  try {
    const { rows: userRows } = await pool.query("SELECT id FROM users WHERE telefon = $1", [telefon]);
    if (!userRows[0]) return res.status(400).json({ erè: "Kòd la pa valid oswa li ekspire." });
    const userId = userRows[0].id;

    const kòdAsh = crypto.createHash("sha256").update(kòd).digest("hex");
    const { rows: kòdRows } = await pool.query(
      `SELECT id FROM reyajisman_modpas
       WHERE user_id = $1 AND kòd_ash = $2 AND itilize = false AND ekspire_nan > now()
       ORDER BY kreye_nan DESC LIMIT 1`,
      [userId, kòdAsh]
    );
    if (!kòdRows[0]) return res.status(400).json({ erè: "Kòd la pa valid oswa li ekspire." });

    const hash = await bcrypt.hash(nouvoModDePasse, 10);
    await pool.query("UPDATE users SET mot_de_pass = $1 WHERE id = $2", [hash, userId]);
    await pool.query("UPDATE reyajisman_modpas SET itilize = true WHERE id = $1", [kòdRows[0].id]);

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

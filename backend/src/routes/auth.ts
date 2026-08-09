import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../pg";
import { AuthedRequest, JWT_SECRET, requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  nom: z.string().min(2),
  telefon: z.string().min(8),
  email: z.string().email().optional(),
  motDePasse: z.string().min(6),
  komin: z.string().optional(),
  katye: z.string().optional(),
});

router.post("/register", async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erè: "Done yo pa valid.", detay: parsed.error.flatten() });
  }
  const { nom, telefon, email, motDePasse, komin, katye } = parsed.data;

  try {
    const egziste = await pool.query("SELECT id FROM users WHERE telefon = $1", [telefon]);
    if (egziste.rows.length > 0) {
      return res.status(409).json({ erè: "Yon kont deja itilize nimewo telefòn sa a." });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, telefon, email, mot_de_pass, komin, katye)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nom, telefon, komin, katye, wol`,
      [nom, telefon, email ?? null, hash, komin ?? null, katye ?? null]
    );
    const user = rows[0];

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({
      token,
      user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, katye: user.katye, wòl: user.wol },
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
      "SELECT id, nom, telefon, komin, katye, wol, mot_de_pass FROM users WHERE telefon = $1",
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
      user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, katye: user.katye, wòl: user.wol },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nom, telefon, komin, katye, wol FROM users WHERE id = $1",
      [req.userId]
    );
    if (!rows[0]) return res.status(404).json({ erè: "Itilizatè a pa jwenn." });
    const u = rows[0];
    res.json({ id: u.id, nom: u.nom, telefon: u.telefon, komin: u.komin, katye: u.katye, wòl: u.wol });
  } catch (e) {
    next(e);
  }
});

const updateMeSchema = z.object({
  komin: z.string().optional(),
  katye: z.string().optional(),
});

// Pèmèt yon itilizatè chanje komin/katye li apre enskripsyon — enpòtan pou
// zonaj alèt yo, paske se sa nou konpare ak komin yon rapò pou deside si
// yon alèt se "ijans pou ou" oswa jis "enfòmasyon".
router.patch("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ erè: "Done pa valid." });
  try {
    const { rows } = await pool.query(
      `UPDATE users SET komin = COALESCE($1, komin), katye = COALESCE($2, katye) WHERE id = $3
       RETURNING id, nom, telefon, komin, katye, wol`,
      [parsed.data.komin ?? null, parsed.data.katye ?? null, req.userId]
    );
    const u = rows[0];
    res.json({ id: u.id, nom: u.nom, telefon: u.telefon, komin: u.komin, katye: u.katye, wòl: u.wol });
  } catch (e) {
    next(e);
  }
});

export default router;

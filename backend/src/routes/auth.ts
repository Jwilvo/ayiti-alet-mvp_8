import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../pg";
import { JWT_SECRET } from "../middleware/auth";

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
       RETURNING id, nom, telefon, komin, wol`,
      [nom, telefon, email ?? null, hash, komin ?? null, katye ?? null]
    );
    const user = rows[0];

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({
      token,
      user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, wòl: user.wol },
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
      "SELECT id, nom, telefon, komin, wol, mot_de_pass FROM users WHERE telefon = $1",
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
    res.json({ token, user: { id: user.id, nom: user.nom, telefon: user.telefon, komin: user.komin, wòl: user.wol } });
  } catch (e) {
    next(e);
  }
});

export default router;

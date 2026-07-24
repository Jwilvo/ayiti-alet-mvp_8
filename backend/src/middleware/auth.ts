import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../pg";

export interface AuthedRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-sekrè";

// Egzije yon itilizatè konekte. Itilize sou wout ki bezwen otantifikasyon.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erè: "Ou dwe konekte pou fè aksyon sa a." });
  }
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ erè: "Tokèn pa valid oswa li ekspire." });
  }
}

// Egzije yon itilizatè konekte ki gen wòl "admin" (otorite/administratè).
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, async () => {
    try {
      const { rows } = await pool.query("SELECT wol FROM users WHERE id = $1", [req.userId]);
      if (!rows[0] || rows[0].wol !== "admin") {
        return res.status(403).json({ erè: "Sèl kont otorite/administratè ka fè aksyon sa a." });
      }
      next();
    } catch (e) {
      next(e);
    }
  });
}

// Otantifikasyon opsyonèl — pèmèt rapò anonim men toujou idantifye itilizatè si l konekte.
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.slice("Bearer ".length);
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
    } catch {
      // inyore tokèn ki pa valid pou wout opsyonèl yo
    }
  }
  next();
}

export { JWT_SECRET };

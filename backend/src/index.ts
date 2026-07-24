import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import reportRoutes from "./routes/reports";
import placeRoutes from "./routes/places";
import adminRoutes from "./routes/admin";
import sosRoutes from "./routes/sos";
import uploadRoutes, { UPLOAD_DIR } from "./routes/uploads";

async function main() {
  const app = express();
  app.set("trust proxy", 1); // dèyè yon reverse proxy nan pwodiksyon (Nginx, load balancer)
  app.use(helmet({ crossOriginResourcePolicy: false })); // dezaktive pou imaj yo ka chaje soti lòt orijin
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Limit jeneral: 300 rekèt pa IP chak 15 minit — bon kont bombade debaz
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { erè: "Twòp rekèt — tann yon ti moman epi eseye ankò." },
    })
  );

  // Limit pi sevè sou login/enskripsyon — pwoteje kont tantativ modpas an mas
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erè: "Twòp tantativ koneksyon — tann 15 minit epi eseye ankò." },
  });

  // Limit sou kreyasyon rapò/SOS — anpeche spam san bloke lekti/lis (GET) nòmal
  const kreyasyonLimiterBrit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erè: "Twòp rapò nan yon ti tan — tann yon ti moman." },
  });
  const kreyasyonLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) =>
    req.method === "GET" ? next() : kreyasyonLimiterBrit(req, res, next);

  app.get("/health", (_req, res) => res.json({ statut: "ok", sèvis: "Ayiti Alèt API" }));

  app.use("/auth/login", authLimiter);
  app.use("/auth/register", authLimiter);
  app.use("/reports", kreyasyonLimiter);
  app.use("/sos/trigger", kreyasyonLimiter);
  app.use("/uploads", kreyasyonLimiter);

  app.use("/auth", authRoutes);
  app.use("/reports", reportRoutes);
  app.use("/places", placeRoutes);
  app.use("/admin", adminRoutes);
  app.use("/sos", sosRoutes);
  app.use("/uploads", uploadRoutes);
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.use((_req, res) => res.status(404).json({ erè: "Wout la pa egziste." }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ erè: "Yon erè sèvè rive. Eseye ankò." });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Ayiti Alèt API ap kouri sou pò ${PORT}`);
  });
}

main();

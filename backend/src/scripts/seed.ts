import "dotenv/config";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { pool } from "../pg";

// Sèlman VRÈ enstitisyon PIBLIK, ak adrès/telefòn verifye pa rechèch —
// pa gen okenn biznis prive (famasi, estasyon gaz, elt.). "direktè_non" pa
// ranpli isit la eksprè — se yon chan admin ka mete ajou lè gen konfimasyon
// reyèl, paske non moun ki nan tèt yo chanje souvan (gade nòt nan schema.sql).
const PLACES: [string, string, string | null, string, string, number, number, string][] = [
  // ===== Sante (lopital piblik/inivèsitè) =====
  ["Lopital Général (HUEH)", "sante", "lopital", "Ri Monseigneur Guilloux, Pòtoprens", "2222-1234", 18.5423, -72.3346, "Pòtoprens"],
  ["Lopital Inivèsitè Bernard Mevs", "sante", "lopital", "Site Boyer, Pòtoprens", "", 18.5556, -72.3387, "Pòtoprens"],
  ["Lopital Inivèsitè Justinien", "sante", "lopital", "Ri 17 Q, Okap", "", 19.7626, -72.2058, "Okap"],

  // ===== Sekirite (Polis Nasyonal, Polis Jidisyè) =====
  ["PNH — Dirèksyon Jeneral", "sekirite", "polis", "Ayewopò, Pòtoprens", "114", 18.5800, -72.2925, "Pòtoprens"],
  ["DCPJ — Polis Jidisyè", "sekirite", "polis", "Clercine 6, Boulevard Toussaint Louverture, Pòtoprens", "3835-1111", 18.5700, -72.3100, "Pòtoprens"],
  ["Komisarya Petyonvil", "sekirite", "komisarya", "Petyonvil Santral", "114", 18.5127, -72.2852, "Petyonvil"],
  ["Komisarya Kafou", "sekirite", "komisarya", "Kafou", "114", 18.5392, -72.3572, "Kafou"],
  ["Sant Ponpye Pòtoprens", "sekirite", "ponpye", "Ri Pavée, Pòtoprens", "115", 18.5432, -72.3387, "Pòtoprens"],

  // ===== Pwoteksyon Sivil (DGPC) — plizyè komin =====
  ["Pwoteksyon Sivil — Okap", "sekirite", "pwoteksyon_sivil", "Vaudreuil, Route Nationale #1, Okap", "3170-8525", 19.7500, -72.1900, "Okap"],
  ["Pwoteksyon Sivil — Kayes", "sekirite", "pwoteksyon_sivil", "108, Ri Toussaint Louverture, Kayes", "3701-6186", 18.2000, -73.7500, "Okay"],
  ["Pwoteksyon Sivil — Jeremi", "sekirite", "pwoteksyon_sivil", "Konplèks Administratif Bordes, Jeremi", "3777-3970", 18.6430, -74.1150, "Jeremi"],
  ["Pwoteksyon Sivil — Miragwàn", "sekirite", "pwoteksyon_sivil", "29, Gran Ri, Miragwàn", "3751-7390", 18.4480, -73.0920, "Miragwàn"],
  ["Pwoteksyon Sivil — Ench", "sekirite", "pwoteksyon_sivil", "Ri Paul E. Magloire, Ench", "3605-1747", 19.1500, -72.0100, "Ench"],
  ["Pwoteksyon Sivil — Fòlibète", "sekirite", "pwoteksyon_sivil", "2, Bas-Fonds Limite, Fòlibète", "", 19.6640, -71.8400, "Fòlibète"],

  // ===== Administrasyon (Mairi, DGI) =====
  ["Mairi Pòtoprens", "administrasyon", "mairi", "Channmas, Pòtoprens", "", 18.5392, -72.3364, "Pòtoprens"],
  ["Mairi Okap", "administrasyon", "mairi", "Katedral, Okap", "", 19.7573, -72.2043, "Okap"],
  ["DGI — Pòtoprens", "administrasyon", "dgi", "62, Avni Christophe, Pòtoprens", "2262-1000", 18.5450, -72.3350, "Pòtoprens"],
  ["DGI — Okap", "administrasyon", "dgi", "Ri 18 A, devan Plas Jose Marti, Okap", "2262-1000", 19.7590, -72.2010, "Okap"],
  ["DGI — Gonayiv", "administrasyon", "dgi", "35, Ri Anténor Firmin, Gonayiv", "2262-1000", 19.4460, -72.6880, "Gonayiv"],
  ["DGI — Jakmèl", "administrasyon", "dgi", "Ri Izin yo, devan mache a, Jakmèl", "2262-1000", 18.2340, -72.5350, "Jakmèl"],
  ["DGI — Fòlibète", "administrasyon", "dgi", "Sicar, Route Nationale No 6, Fòlibète", "2262-1000", 19.6640, -71.8400, "Fòlibète"],
  ["DGI — Pòdepè", "administrasyon", "dgi", "161, Ri Kè a, Pòdepè", "2262-1000", 19.9400, -72.8380, "Pòdepè"],
  ["DGI — Jeremi", "administrasyon", "dgi", "102, Ri Sténio Vincent, Jeremi", "2262-1000", 18.6430, -74.1150, "Jeremi"],
  ["DGI — Miragwàn", "administrasyon", "dgi", "Ri Alexandre Pétion, devan BNC, Miragwàn", "2262-1000", 18.4480, -73.0920, "Miragwàn"],
  ["DGI — Kayes", "administrasyon", "dgi", "14, Ri Kè a, Kayes", "2262-1000", 18.2000, -73.7500, "Okay"],

  // ===== Transpò =====
  ["Ayewopò Tousen Louvèti", "transpò", "ayewopò", "Tabak, Pòtoprens", "", 18.5800, -72.2925, "Pòtoprens"],
];

async function main() {
  // 1. Referans depatman/komin (li fichye SQL la epi egzekite l dirèkteman)
  const { rows: existingKomin } = await pool.query("SELECT COUNT(*)::int AS n FROM komin_ayiti");
  if (existingKomin[0].n === 0) {
    const seedPath = path.join(__dirname, "..", "..", "db", "komin_seed.sql");
    if (fs.existsSync(seedPath)) {
      const sql = fs.readFileSync(seedPath, "utf-8");
      await pool.query(sql);
      const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM komin_ayiti");
      console.log(`✔ ${rows[0].n} komin ajoute nan lis referans lan`);
    } else {
      console.log("⚠ db/komin_seed.sql pa jwenn — komin_ayiti rete vid");
    }
  }

  // 2. Kote enpòtan — toujou "rafrechi" lis la (efase ansyen an, mete nouvo a)
  // pou nouvo done verifye yo ka ranplase ansyen yo menm sou yon baz done ki
  // deja gen done ladan l.
  await pool.query("DELETE FROM places");
  for (const [non, kategori, souKategori, adrès, telefon, lat, lng, komin] of PLACES) {
    await pool.query(
      `INSERT INTO places (non, kategori, sou_kategori, adrès, telefon, lokalizasyon, komin)
       VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, $8)`,
      [non, kategori, souKategori || null, adrès, telefon || null, lng, lat, komin]
    );
  }
  console.log(`✔ ${PLACES.length} kote enpòtan (piblik sèlman) ajoute/rafrechi`);

  // 3. Kont demo
  let demoId: string;
  const { rows: demoRows } = await pool.query("SELECT id FROM users WHERE telefon = $1", ["50937000000"]);
  if (demoRows.length === 0) {
    const hash = await bcrypt.hash("demo1234", 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, telefon, mot_de_pass, komin, katye, wol)
       VALUES ($1, $2, $3, $4, $5, 'sitwayen') RETURNING id`,
      ["Itilizatè Demo", "50937000000", hash, "Delmas", "Delmas 33"]
    );
    demoId = rows[0].id;
    console.log("✔ Kont sitwayen demo kreye: 50937000000 / demo1234");
  } else {
    demoId = demoRows[0].id;
  }

  const { rows: adminRows } = await pool.query("SELECT id FROM users WHERE telefon = $1", ["50900000000"]);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash("admin1234", 10);
    await pool.query(
      `INSERT INTO users (nom, telefon, mot_de_pass, komin, niveau_konfyans, wol)
       VALUES ($1, $2, $3, $4, 100, 'admin')`,
      ["Administratè PNH", "50900000000", hash, "Pòtoprens"]
    );
    console.log("✔ Kont admin demo kreye: 50900000000 / admin1234");
  }

  // 4. Rapò demo (de rapò tou pre pou teste deteksyon doub, plis youn nan yon lòt komin
  //    pou teste zonaj alèt yo)
  const { rows: existingReports } = await pool.query("SELECT COUNT(*)::int AS n FROM reports");
  if (existingReports[0].n === 0) {
    await pool.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès, komin)
       VALUES ($1, false, 'wout_bloke', 'Wout bloke sou Delmas 33',
               'Gen yon pyebwa tonbe ki bloke wout la nan de sans.', 'mwayen',
               ST_SetSRID(ST_MakePoint(-72.3011, 18.5392), 4326)::geography, 'Delmas 33', 'Delmas')`,
      [demoId]
    );
    await pool.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès, komin)
       VALUES (NULL, true, 'wout_bloke', 'Gen yon pyebwa ki tonbe Delmas 33',
               'Menm pyebwa a, wout la toujou bloke, machin pa ka pase.', 'mwayen',
               ST_SetSRID(ST_MakePoint(-72.3013, 18.5394), 4326)::geography, 'Delmas 33, toupre kafou a', 'Delmas')`
    );
    await pool.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès, komin)
       VALUES (NULL, true, 'inondasyon', 'Inondasyon nan Okap',
               'Lapli fè lari yo anvayi ak dlo nan katye Katedral la.', 'grav',
               ST_SetSRID(ST_MakePoint(-72.2043, 19.7573), 4326)::geography, 'Katedral, Okap', 'Okap')`
    );
    console.log("✔ 3 rapò demo ajoute (2 tou pre nan Delmas, 1 nan Okap pou teste zonaj)");
  }

  console.log("Seed done ✔");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../pg";

const PLACES: [string, string, string | null, string, string, number, number, string][] = [
  ["Lopital Général (HUEH)", "sante", "lopital", "Ri Monseigneur Guilloux, Pòtoprens", "2222-1234", 18.5423, -72.3346, "Pòtoprens"],
  ["Lopital Bernard Mevs", "sante", "lopital", "Site Boyer, Pòtoprens", "", 18.5556, -72.3387, "Pòtoprens"],
  ["Famasi Marie", "sante", "famasi", "Delmas 33", "", 18.5392, -72.3011, "Delmas"],
  ["Komisarya Petyonvil", "sekirite", "komisarya", "Petyonvil Santral", "114", 18.5127, -72.2852, "Petyonvil"],
  ["Komisarya Kafou", "sekirite", "komisarya", "Kafou", "", 18.5392, -72.3572, "Kafou"],
  ["Sant Ponpye Pòtoprens", "sekirite", "ponpye", "Ri Pavée", "115", 18.5432, -72.3387, "Pòtoprens"],
  ["Mairi Pòtoprens", "administrasyon", "mairi", "Channmas", "", 18.5392, -72.3364, "Pòtoprens"],
  ["Mairi Okap", "administrasyon", "mairi", "Katedral, Okap", "", 19.7573, -72.2043, "Okap"],
  ["Estasyon Total Delmas 65", "transpò", "estasyon_gaz", "Delmas 65", "", 18.5486, -72.2934, "Delmas"],
  ["Ayewopò Tousen Louvèti", "transpò", "ayewopò", "Tabak", "", 18.5800, -72.2925, "Pòtoprens"],
];

async function main() {
  const { rows: existingPlaces } = await pool.query("SELECT COUNT(*)::int AS n FROM places");
  if (existingPlaces[0].n === 0) {
    for (const [non, kategori, souKategori, adrès, telefon, lat, lng, komin] of PLACES) {
      await pool.query(
        `INSERT INTO places (non, kategori, sou_kategori, adrès, telefon, lokalizasyon, komin)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, $8)`,
        [non, kategori, souKategori || null, adrès, telefon || null, lng, lat, komin]
      );
    }
    console.log(`✔ ${PLACES.length} kote enpòtan ajoute`);
  }

  let demoId: string;
  const { rows: demoRows } = await pool.query("SELECT id FROM users WHERE telefon = $1", ["50937000000"]);
  if (demoRows.length === 0) {
    const hash = await bcrypt.hash("demo1234", 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, telefon, mot_de_pass, komin, katye, wol)
       VALUES ($1, $2, $3, $4, $5, 'sitwayen') RETURNING id`,
      ["Itilizatè Demo", "50937000000", hash, "Pòtoprens", "Delmas"]
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

  const { rows: existingReports } = await pool.query("SELECT COUNT(*)::int AS n FROM reports");
  if (existingReports[0].n === 0) {
    await pool.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès)
       VALUES ($1, false, 'wout_bloke', 'Wout bloke sou Delmas 33',
               'Gen yon pyebwa tonbe ki bloke wout la nan de sans.', 'mwayen',
               ST_SetSRID(ST_MakePoint(-72.3011, 18.5392), 4326)::geography, 'Delmas 33')`,
      [demoId]
    );
    await pool.query(
      `INSERT INTO reports (user_id, anonim, kategori, tit, deskripsyon, niveau_ijans, lokalizasyon, adrès)
       VALUES (NULL, true, 'wout_bloke', 'Gen yon pyebwa ki tonbe Delmas 33',
               'Menm pyebwa a, wout la toujou bloke, machin pa ka pase.', 'mwayen',
               ST_SetSRID(ST_MakePoint(-72.3013, 18.5394), 4326)::geography, 'Delmas 33, toupre kafou a')`
    );
    console.log("✔ 2 rapò demo ajoute (tou de tou pre — pou teste deteksyon doub)");
  }

  console.log("Seed done ✔");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

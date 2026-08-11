import { pool } from "./pg";
import { otoritePouKategori } from "./routes/reports";

// Verifye chak 15 segond si gen rapò ki merite konfimasyon otomatik la (1
// minit apre kreyasyon). Nou itilize yon "pwograme_nan" estoke nan baz done
// a (pa yon senp setTimeout an memwa) pou fonksyon an rezisyan menm si sèvè
// a rekòmanse ant tan an.
const ENTÈVAL_MS = 15_000;

async function trete() {
  try {
    const { rows } = await pool.query(
      `SELECT id, kategori FROM reports
       WHERE konfimasyon_voye = false AND konfimasyon_pwograme_nan <= now()
       ORDER BY konfimasyon_pwograme_nan ASC LIMIT 20`
    );

    for (const r of rows) {
      const otorite = otoritePouKategori(r.kategori).join(", ");
      const mesaj = `Administrasyon Ayiti Alèt resevwa rapò sa a. Nou ap transfere l bay ${otorite} pou swiv.`;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO report_kòmantè (report_id, user_id, non_afiche, kò) VALUES ($1, NULL, $2, $3)`,
          [r.id, "Administrasyon Ayiti Alèt", mesaj]
        );
        await client.query(`UPDATE reports SET konfimasyon_voye = true WHERE id = $1`, [r.id]);
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        console.error("Erè pandan konfimasyon otomatik pou rapò", r.id, e);
      } finally {
        client.release();
      }
    }
  } catch (e) {
    console.error("Erè pandan verifikasyon konfimasyon otomatik:", e);
  }
}

export function demareKonfimasyonOtomatikWorker() {
  setInterval(trete, ENTÈVAL_MS);
  trete(); // premye verifikasyon imedyatman lè sèvè a demare
}

import crypto from "crypto";

// Chifreman AES-256-GCM pou nimewo dokiman idantite yo (NIF/CIN/Paspò).
// Kle a soti nan ENCRYPTION_KEY (32 byte, base64).
//
// SEKIRITE ENPÒTAN: an pwodiksyon, si ENCRYPTION_KEY pa konfigire (oswa li
// envalid), nou REFIZE chifre/dechifre olye jenere yon kle tanporè an silans
// — yon kle tanporè ta vle di done ki chifre jodi a vin ilizib pou tout tan
// apre pwochen rekòmansaj sèvè a, san avètisman.
function jwennKle(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
    throw new Error("ENCRYPTION_KEY pa gen bon longè — li dwe yon valè 32 byte an base64.");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ENCRYPTION_KEY pa konfigire an pwodiksyon — nou refize chifre/dechifre done idantite san yon kle valid."
    );
  }

  // Sèlman pou devlopman lokal: kle tanporè, ak yon avètisman klè.
  if (!(global as any).__tanporèKle) {
    (global as any).__tanporèKle = crypto.randomBytes(32);
    console.warn("⚠ ENCRYPTION_KEY pa konfigire — itilize yon kle tanporè (SÈLMAN pou devlopman lokal).");
  }
  return (global as any).__tanporèKle;
}

export function chifre(tèks: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", jwennKle(), iv);
  const chifreData = Buffer.concat([cipher.update(tèks, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, chifreData]).toString("base64");
}

export function dechifre(valèChifre: string): string {
  const done_ = Buffer.from(valèChifre, "base64");
  const iv = done_.subarray(0, 12);
  const tag = done_.subarray(12, 28);
  const chifreData = done_.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", jwennKle(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(chifreData), decipher.final()]).toString("utf8");
}

// Ash SHA-256 fiks (pa gen sèl/IV) — sèvi SÈLMAN pou verifye inisite (yon sèl
// moun pa ka gen 2 kont ak menm dokiman an), pa pou estokaj sekrè li menm.
export function ashDokiman(nimewo: string): string {
  const nòmalize = nimewo.trim().toUpperCase().replace(/[\s-]/g, "");
  return crypto.createHash("sha256").update(nòmalize).digest("hex");
}
